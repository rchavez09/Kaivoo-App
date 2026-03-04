import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * AI Chat Edge Function — Sprint 23 P10, Sprint 24 P14/P19
 *
 * Stateless proxy for LLM API calls. Handles:
 *  - Multiple providers (OpenAI, Anthropic, Google, Groq, Mistral, DeepSeek, Ollama)
 *  - Streaming SSE normalization
 *  - Tool-use: passes tool schemas to LLM, streams tool_call events back to client
 *  - Test connection
 */

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENAI_COMPATIBLE_PROVIDERS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  groq: "https://api.groq.com/openai/v1",
  deepseek: "https://api.deepseek.com/v1",
  mistral: "https://api.mistral.ai/v1",
};

const VALID_PROVIDERS = [
  "openai", "anthropic", "google", "groq", "mistral", "deepseek", "ollama", "openai-compatible",
] as const;

const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 50_000;

// deno-lint-ignore no-explicit-any
type ToolDef = any;

interface ChatMessage {
  role: string;
  content: string;
  tool_call_id?: string;
  // deno-lint-ignore no-explicit-any
  tool_calls?: any[];
}

interface ChatRequest {
  test?: boolean;
  provider: string;
  apiKey: string;
  model: string;
  ollamaBaseUrl?: string;
  customBaseUrl?: string;
  messages?: ChatMessage[];
  systemPrompt?: string;
  tools?: ToolDef[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as ChatRequest;
    const { test, provider, apiKey, model, ollamaBaseUrl } = body;

    if (!VALID_PROVIDERS.includes(provider as typeof VALID_PROVIDERS[number])) {
      return jsonResponse({ error: "Invalid provider" }, 400);
    }

    // Validate Ollama URL — prevent SSRF (localhost only)
    if (provider === "ollama" && ollamaBaseUrl) {
      try {
        const parsed = new URL(ollamaBaseUrl);
        if (!["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
          return jsonResponse({ error: "Ollama URL must target localhost" }, 400);
        }
      } catch {
        return jsonResponse({ error: "Invalid Ollama URL" }, 400);
      }
    }

    // Validate custom base URL — prevent SSRF (block private IPs, require HTTPS)
    if (provider === "openai-compatible" && body.customBaseUrl) {
      try {
        const parsed = new URL(body.customBaseUrl);
        if (parsed.protocol !== "https:") {
          return jsonResponse({ error: "Custom base URL must use HTTPS" }, 400);
        }
        const host = parsed.hostname.toLowerCase();
        if (
          host === "localhost" || host === "127.0.0.1" || host === "::1" ||
          host.startsWith("10.") || host.startsWith("192.168.") ||
          host === "169.254.169.254" || host.startsWith("169.254.") ||
          /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
          host.endsWith(".internal") || host.endsWith(".local")
        ) {
          return jsonResponse({ error: "Custom base URL cannot target private/internal addresses" }, 400);
        }
      } catch {
        return jsonResponse({ error: "Invalid custom base URL" }, 400);
      }
    }

    // Validate messages size
    if (body.messages) {
      if (body.messages.length > MAX_MESSAGES) {
        return jsonResponse({ error: `Too many messages (max ${MAX_MESSAGES})` }, 400);
      }
      for (const msg of body.messages) {
        if (typeof msg.content === "string" && msg.content.length > MAX_MESSAGE_LENGTH) {
          return jsonResponse({ error: "Message content too long" }, 400);
        }
      }
    }

    if (test) {
      return await handleTest(provider, apiKey, model, ollamaBaseUrl);
    }

    return await handleChat(body);
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

// ─── Test Connection ───

async function handleTest(
  provider: string,
  apiKey: string,
  model: string,
  ollamaBaseUrl?: string,
): Promise<Response> {
  try {
    // OpenAI-compatible providers (OpenAI, Groq, DeepSeek, Mistral)
    const openaiBase = OPENAI_COMPATIBLE_PROVIDERS[provider];
    if (openaiBase) {
      const res = await fetch(`${openaiBase}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        return jsonResponse({
          ok: false,
          message: `${provider} error (${res.status}): Invalid API key or rate limited.`,
        });
      }
      return jsonResponse({
        ok: true,
        message: `Connected to ${provider}! Model "${model}" should be available.`,
      });
    }

    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }],
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        return jsonResponse({
          ok: false,
          message: `Anthropic error (${res.status}): ${err.slice(0, 200)}`,
        });
      }
      return jsonResponse({ ok: true, message: `Connected! Model "${model}" is responding.` });
    }

    if (provider === "google") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${apiKey}`,
      );
      if (!res.ok) {
        return jsonResponse({
          ok: false,
          message: `Google AI error (${res.status}): Invalid API key or model.`,
        });
      }
      return jsonResponse({ ok: true, message: `Connected! Model "${model}" is available.` });
    }

    if (provider === "ollama") {
      const base = ollamaBaseUrl || "http://localhost:11434";
      const res = await fetch(`${base}/api/tags`);
      if (!res.ok) {
        return jsonResponse({ ok: false, message: "Cannot reach Ollama server." });
      }
      const data = await res.json();
      const found = data.models?.some(
        (m: { name: string }) => m.name === model || m.name === `${model}:latest`,
      );
      return jsonResponse({
        ok: true,
        message: found
          ? `Connected! Model "${model}" is available.`
          : `Connected to Ollama, but model "${model}" was not found.`,
      });
    }

    if (provider === "openai-compatible") {
      return jsonResponse({ ok: true, message: "Custom provider configured. Send a message to test." });
    }

    return jsonResponse({ ok: false, message: "Unknown provider" });
  } catch (e) {
    return jsonResponse({
      ok: false,
      message: e instanceof Error ? e.message : "Connection failed",
    });
  }
}

// ─── Anthropic Message Transformation ───

/**
 * Convert OpenAI-format messages to Anthropic format.
 * Key differences:
 *  - Assistant messages with tool_calls → content array with tool_use blocks
 *  - Tool result messages (role:"tool") → user messages with tool_result blocks
 *  - Consecutive tool results grouped into a single user message
 */
// deno-lint-ignore no-explicit-any
function transformMessagesForAnthropic(messages: ChatMessage[]): any[] {
  // deno-lint-ignore no-explicit-any
  const result: any[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (msg.role === "assistant" && msg.tool_calls?.length) {
      // Assistant message with tool calls → content array
      // deno-lint-ignore no-explicit-any
      const content: any[] = [];
      if (msg.content) {
        content.push({ type: "text", text: msg.content });
      }
      for (const tc of msg.tool_calls) {
        content.push({
          type: "tool_use",
          id: tc.id,
          name: tc.name,
          input: tc.arguments || {},
        });
      }
      result.push({ role: "assistant", content });
    } else if (msg.role === "tool") {
      // Collect consecutive tool results into one user message
      // deno-lint-ignore no-explicit-any
      const toolResults: any[] = [];
      let j = i;
      while (j < messages.length && messages[j].role === "tool") {
        toolResults.push({
          type: "tool_result",
          tool_use_id: messages[j].tool_call_id,
          content: messages[j].content,
        });
        j++;
      }
      result.push({ role: "user", content: toolResults });
      i = j - 1; // Skip processed messages
    } else {
      // Regular user/assistant message
      result.push({ role: msg.role, content: msg.content });
    }
  }

  return result;
}

// ─── Streaming Chat ───

async function handleChat(body: ChatRequest): Promise<Response> {
  const { provider, apiKey, model, ollamaBaseUrl, customBaseUrl, messages = [], systemPrompt = "", tools } = body;

  // Format tools per provider
  const openaiTools = tools?.length
    ? tools.map((t: ToolDef) => ({
        type: "function",
        function: { name: t.name, description: t.description, parameters: t.parameters },
      }))
    : undefined;

  const anthropicTools = tools?.length
    ? tools.map((t: ToolDef) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }))
    : undefined;

  let upstream: Response;

  // OpenAI-compatible providers
  const openaiBase = OPENAI_COMPATIBLE_PROVIDERS[provider] || (provider === "openai-compatible" ? customBaseUrl : null);
  if (openaiBase) {
    // deno-lint-ignore no-explicit-any
    const requestBody: any = {
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      max_tokens: 4096,
    };
    if (openaiTools) requestBody.tools = openaiTools;

    upstream = await fetch(`${openaiBase}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  } else if (provider === "anthropic") {
    // Transform messages from OpenAI format to Anthropic format
    // (critical for tool-use round-trips where role:"tool" must become tool_result)
    const anthropicMessages = transformMessagesForAnthropic(messages);

    // deno-lint-ignore no-explicit-any
    const requestBody: any = {
      model,
      system: systemPrompt,
      messages: anthropicMessages,
      max_tokens: 4096,
      stream: true,
    };
    if (anthropicTools) requestBody.tools = anthropicTools;

    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  } else if (provider === "google") {
    // Google Gemini uses a different API format — non-streaming for now with tool support
    const geminiMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // deno-lint-ignore no-explicit-any
    const requestBody: any = {
      contents: geminiMessages,
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };
    if (tools?.length) {
      requestBody.tools = [{
        functionDeclarations: tools.map((t: ToolDef) => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        })),
      }];
    }

    upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      },
    );
  } else if (provider === "ollama") {
    const base = ollamaBaseUrl || "http://localhost:11434";
    upstream = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });
  } else {
    return jsonResponse({ error: "Unknown provider" }, 400);
  }

  if (!upstream.ok) {
    const err = await upstream.text();
    return jsonResponse({ error: err }, upstream.status);
  }

  if (!upstream.body) {
    return jsonResponse({ error: "No response body" }, 502);
  }

  // Transform provider-specific stream → normalized SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      // Accumulate tool calls (OpenAI streams them incrementally)
      const pendingToolCalls: Record<number, { id: string; name: string; arguments: string }> = {};

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const event = extractEvent(provider, line, pendingToolCalls);
            if (event) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            }
          }
        }

        // Flush any pending tool calls at stream end
        for (const tc of Object.values(pendingToolCalls)) {
          if (tc.id && tc.name) {
            let args: Record<string, unknown> = {};
            try { args = JSON.parse(tc.arguments || "{}"); } catch { /* empty */ }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ tool_call: { id: tc.id, name: tc.name, arguments: args } })}\n\n`),
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (e) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: (e as Error).message })}\n\n`),
        );
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}

// ─── Event Extraction ───

interface SSEEvent {
  text?: string;
  tool_call?: { id: string; name: string; arguments: Record<string, unknown> };
  error?: string;
}

function extractEvent(
  provider: string,
  line: string,
  pendingToolCalls: Record<number, { id: string; name: string; arguments: string }>,
): SSEEvent | null {
  if (provider === "ollama") {
    if (!line.trim()) return null;
    try {
      const data = JSON.parse(line);
      if (data.message?.content) return { text: data.message.content };
    } catch {
      return null;
    }
    return null;
  }

  if (provider === "google") {
    if (!line.startsWith("data: ")) return null;
    const raw = line.slice(6).trim();
    try {
      const parsed = JSON.parse(raw);
      // Text content
      const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return { text };
      // Tool call
      const fc = parsed.candidates?.[0]?.content?.parts?.[0]?.functionCall;
      if (fc) {
        return { tool_call: { id: `gemini-${Date.now()}`, name: fc.name, arguments: fc.args || {} } };
      }
    } catch {
      return null;
    }
    return null;
  }

  // OpenAI-compatible and Anthropic use SSE format
  if (!line.startsWith("data: ")) return null;
  const raw = line.slice(6).trim();
  if (raw === "[DONE]") return null;

  try {
    const parsed = JSON.parse(raw);

    // OpenAI-compatible format
    if (provider === "openai" || provider === "groq" || provider === "deepseek" || provider === "mistral" || provider === "openai-compatible") {
      const delta = parsed.choices?.[0]?.delta;
      if (!delta) return null;

      // Text content
      if (delta.content) return { text: delta.content };

      // Tool calls (streamed incrementally)
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0;
          if (!pendingToolCalls[idx]) {
            pendingToolCalls[idx] = { id: tc.id || "", name: "", arguments: "" };
          }
          if (tc.id) pendingToolCalls[idx].id = tc.id;
          if (tc.function?.name) pendingToolCalls[idx].name = tc.function.name;
          if (tc.function?.arguments) pendingToolCalls[idx].arguments += tc.function.arguments;
        }

        // Check if finish_reason indicates tool calls are complete
        const finishReason = parsed.choices?.[0]?.finish_reason;
        if (finishReason === "tool_calls") {
          const events: SSEEvent[] = [];
          for (const tc of Object.values(pendingToolCalls)) {
            let args: Record<string, unknown> = {};
            try { args = JSON.parse(tc.arguments || "{}"); } catch { /* empty */ }
            events.push({ tool_call: { id: tc.id, name: tc.name, arguments: args } });
          }
          // Clear pending after emitting
          for (const key of Object.keys(pendingToolCalls)) {
            delete pendingToolCalls[Number(key)];
          }
          // Return the first tool call; rest will be flushed at stream end
          if (events.length > 0) return events[0];
        }
      }

      return null;
    }

    // Anthropic format
    if (provider === "anthropic") {
      if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
        return { text: parsed.delta.text };
      }
      if (parsed.type === "content_block_delta" && parsed.delta?.type === "input_json_delta") {
        // Anthropic streams tool input as JSON deltas — accumulate
        const idx = parsed.index ?? 0;
        if (!pendingToolCalls[idx]) pendingToolCalls[idx] = { id: "", name: "", arguments: "" };
        pendingToolCalls[idx].arguments += parsed.delta.partial_json || "";
      }
      if (parsed.type === "content_block_start" && parsed.content_block?.type === "tool_use") {
        const idx = parsed.index ?? 0;
        pendingToolCalls[idx] = {
          id: parsed.content_block.id,
          name: parsed.content_block.name,
          arguments: "",
        };
      }
      if (parsed.type === "content_block_stop") {
        const idx = parsed.index ?? 0;
        const tc = pendingToolCalls[idx];
        if (tc?.name) {
          let args: Record<string, unknown> = {};
          try { args = JSON.parse(tc.arguments || "{}"); } catch { /* empty */ }
          delete pendingToolCalls[idx];
          return { tool_call: { id: tc.id, name: tc.name, arguments: args } };
        }
      }
    }
  } catch {
    // Skip malformed JSON
  }
  return null;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
