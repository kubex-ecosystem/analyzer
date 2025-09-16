
# Providers – Notas específicas

## OpenAI

* Endpoint: `/v1/chat/completions`
* Ative `stream_options.include_usage` para **usage** no stream.
* Tools: `{"type":"function","function":{name,parameters}}`
* JSON Schema: `response_format: { type: "json_schema", json_schema: {...} }`

## Gemini

* Streaming: `v1beta/models/{model}:streamGenerateContent?alt=sse`
* `systemInstruction` suportado
* Tools: `function_declarations` (mapeamos a partir de `tools`)
* `responseMimeType`/`responseSchema` (pass-through via `meta` do gateway se desejar)

## Anthropic

* Streaming SSE de eventos (`content_block_delta`, `message_delta`)
* Ferramentas: `tools` + `tool_choice` (modelo v1 messages)
* Header `anthropic-version` exigido

## Groq

* Compatível OpenAI (`/openai/v1/chat/completions`) — streaming tipo OpenAI.

## OpenRouter / Ollama (futuros)

* OpenRouter: compat OpenAI (preserva vendor/route no `model`)
* Ollama: `POST /api/chat`/`/api/generate` — mapear em adapter dedicado.
