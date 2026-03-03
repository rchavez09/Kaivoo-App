import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  test?: boolean;
  provider: "openai" | "anthropic" | "ollama";
  apiKey: string;
  model: string;
  ollamaBaseUrl?: string;
  messages?: Array<{ role: string; content: string }>;
  systemPrompt?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as ChatRequest;
    const { test, provider, apiKey, model, ollamaBaseUrl } = body;

    if (test) {
      return await handleTest(provider, apiKey, model, ollamaBaseUrl);
    }

    return await handleChat(
      provider,
      apiKey,
      model,
      ollamaBaseUrl,
      body.messages || [],
      body.systemPrompt || "",
    );
  } catch (e) {
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Unknown error" },
      500,
    );
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
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        return jsonResponse({
          ok: false,
          message: `OpenAI error (${res.status}): Invalid API key or rate limited.`,
        });
      }
      const data = await res.json();
      const found = data.data?.some(
        (m: { id: string }) => m.id === model,
      );
      return jsonResponse({
        ok: true,
        message: found
          ? `Connected! Model "${model}" is available.`
          : `Connected, but model "${model}" was not found in your account.`,
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
      return jsonResponse({
        ok: true,
        message: `Connected! Model "${model}" is responding.`,
      });
    }

    if (provider === "ollama") {
      const base = ollamaBaseUrl || "http://localhost:11434";
      const res = await fetch(`${base}/api/tags`);
      if (!res.ok) {
        return jsonResponse({
          ok: false,
          message: "Cannot reach Ollama server.",
        });
      }
      const data = await res.json();
      const found = data.models?.some(
        (m: { name: string }) =>
          m.name === model || m.name === `${model}:latest`,
      );
      return jsonResponse({
        ok: true,
        message: found
          ? `Connected! Model "${model}" is available.`
          : `Connected to Ollama, but model "${model}" was not found.`,
      });
    }

    return jsonResponse({ ok: false, message: "Unknown provider" });
  } catch (e) {
    return jsonResponse({
      ok: false,
      message: e instanceof Error ? e.message : "Connection failed",
    });
  }
}

// ─── Streaming Chat ───

async function handleChat(
  provider: string,
  apiKey: string,
  model: string,
  ollamaBaseUrl: string | undefined,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
): Promise<Response> {
  let upstream: Response;

  if (provider === "openai") {
    upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });
  } else if (provider === "anthropic") {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages,
        max_tokens: 4096,
        stream: true,
      }),
    });
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

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const text = extractText(provider, line);
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
              );
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (e) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: (e as Error).message })}\n\n`,
          ),
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

// ─── Helpers ───

function extractText(provider: string, line: string): string | null {
  if (provider === "ollama") {
    if (!line.trim()) return null;
    try {
      const data = JSON.parse(line);
      return data.message?.content || null;
    } catch {
      return null;
    }
  }

  // OpenAI / Anthropic use SSE
  if (!line.startsWith("data: ")) return null;
  const raw = line.slice(6).trim();
  if (raw === "[DONE]") return null;

  try {
    const parsed = JSON.parse(raw);
    if (provider === "openai") {
      return parsed.choices?.[0]?.delta?.content || null;
    }
    if (provider === "anthropic" && parsed.type === "content_block_delta") {
      return parsed.delta?.text || null;
    }
  } catch {
    // Skip
  }
  return null;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
