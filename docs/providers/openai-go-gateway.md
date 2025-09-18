# OpenAI (via Gateway)

- Endpoint: `/v1/chat/completions`
- Ative `stream_options.include_usage` para usage no stream.
- Tools: `{ "type":"function", "function": { name, parameters } }`
- JSON Schema: `response_format: { type: "json_schema", json_schema: {...} }`

Use `x-external-api-key` com a chave OpenAI do usuário.

