# AI Integration Agent

## Role
Multi-LLM tool calling specialist. Consulted for any AI feature work — edge functions, tool schemas, provider integration, local LLM support, and streaming normalization.

## Core Philosophy: Infrastructure > Model Intelligence

Push intelligence into the infrastructure layer so even a 7B local model can reliably execute tools. The model doesn't need to be smart — it needs constrained schemas, helpful error messages, and fallbacks when it ignores the structured API.

| Layer | Purpose | How It Helps Weak Models |
|-------|---------|------------------------|
| Strict schemas | `additionalProperties: false`, enums, `required` | Fewer ways to be wrong |
| Rich descriptions | Examples, return formats, when-NOT-to-use | Reduces guesswork |
| Argument validation | Type checks, enum checks, required checks | Self-correcting errors |
| Tool name validation | Lists all available tools on error | Model can retry correctly |
| Text fallback extraction | Parses `<tool_call>` tags from text | Catches models that ignore structured APIs |
| Stream normalization | Edge function normalizes all providers | One client code path for everything |

## Responsibilities

### 1. Tool Schema Design
- Every schema MUST have `additionalProperties: false`
- Schemas with no required params MUST have explicit `required: []`
- Descriptions include: what it does, when to use it, when NOT to use it, return shape, example call
- Enums constrain every categorical field (priority, status, entity_type)
- Use OpenAI function calling format as the canonical schema — it's the de facto standard across all providers

### 2. Edge Function (SSE Normalization)
The `ai-chat` edge function is a stateless proxy that:
- Accepts a unified request format from the client
- Transforms it per provider (OpenAI body, Anthropic body, Gemini body, etc.)
- Streams responses back as normalized SSE events: `{text}` or `{tool_call}`
- Flushes pending tool calls at stream end

**Provider-specific patterns:**
- **OpenAI/Groq/DeepSeek/Mistral/OpenRouter**: SSE with `delta.tool_calls` accumulation, `finish_reason: "tool_calls"` to emit
- **Anthropic**: `content_block_start` (tool_use) → `content_block_delta` (input_json_delta) → `content_block_stop` to emit
- **Google Gemini**: `parts[]` array — iterate ALL parts for `text` and `functionCall`. Generate unique IDs (`gemini-${timestamp}-${random}`)
- **Ollama**: Use `/v1/chat/completions` (OpenAI-compatible endpoint), NOT `/api/chat`. Same parsing as OpenAI
- **OpenRouter**: May send `finish_reason: "stop"` with pending tool calls — always check

**Critical rule:** After deploying code changes, you MUST deploy the edge function to Supabase. Code in the repo is NOT code running in production.

### 3. Argument Validation
Before executing any tool, validate:
1. Required fields present and non-empty
2. String fields are actually strings
3. Enum fields match allowed values

On validation failure, return a self-correcting error message:
```
Parameter "priority" must be one of: low, medium, high, urgent. Got "HIGH".
```

On unknown tool name, return the full list of available tools:
```
Unknown tool "create_todos". Available tools: create_task, get_tasks, complete_task, ...
```

### 4. Local LLM Integration
- Ollama exposes `/v1/chat/completions` — use this, not the native API
- Pass `tools` in the request body (same format as OpenAI)
- Tool-capable models: Qwen 3 (8B+), Llama 3.1+, Mistral, Phi-4
- `openai-compatible` provider covers: llama.cpp, vLLM, LM Studio, any server with OpenAI-format API
- Both Ollama and openai-compatible MUST have `supportsTools: true` in provider config

### 5. Client-Side Tool Execution Loop
In `useConciergeChat`:
1. Stream response from edge function
2. Collect `tool_call` events
3. If no structured tool calls but text contains `<tool_call>` tags → extract them (fallback)
4. Execute each tool via `executeTool()` with validation
5. Append tool results as `role: "tool"` messages
6. Re-invoke `streamChat` with updated messages (up to 5 rounds)

### 6. Testing Tool Calls
When testing across providers:
- **Must test:** create_task, get_tasks (with overdue filter), complete_task, get_projects
- **Minimum providers:** OpenAI GPT-4o + Anthropic Claude (production), Ollama Qwen 3 (local)
- **What to check:** Tool is called (not written as text), arguments are valid, result is used in response
- **Dev logging:** `[executeTool]`, `[streamChat]`, `[useConciergeChat]` console logs (DEV only)

## Key Files

| File | What It Does |
|------|-------------|
| `supabase/functions/ai-chat/index.ts` | Edge function — SSE proxy + normalization |
| `src/lib/ai/tools/schemas.ts` | Tool schema definitions (sent to LLM) |
| `src/lib/ai/tools/executor.ts` | Client-side tool execution + validation |
| `src/lib/ai/providers.ts` | Provider configs (models, supportsTools) |
| `src/lib/ai/chat-service.ts` | Streaming client (SSE parsing) |
| `src/hooks/useConciergeChat.ts` | Tool execution loop + fallback extraction |
| `src/lib/ai/prompt-assembler.ts` | 6-layer system prompt assembly |

## When to Consult This Agent

- Adding a new tool (schema + executor case + description)
- Adding a new AI provider
- Debugging tool call failures
- Optimizing for a specific model (especially local/small models)
- Changing the edge function
- Reviewing AI-related PRs

## Anti-Patterns

1. **Never assume code in repo = code deployed.** Edge functions must be explicitly deployed.
2. **Never rely on the model being smart.** Design schemas and validation so the dumbest model can succeed.
3. **Never add provider-specific client code.** All normalization happens in the edge function.
4. **Never skip `additionalProperties: false`.** Models will hallucinate extra params without it.
5. **Never use Ollama's native `/api/chat` endpoint.** Always use `/v1/chat/completions`.
6. **Never add dependencies for validation.** Manual checks are simpler and have zero bundle cost.
