# Troubleshooting

- 401 Unauthorized: cheque `x-external-api-key` (BYOK) e escopos.
- 429 Too Many Requests: reduza concorrência; ajuste rate limit.
- SSE fecha/trava: `proxy_buffering off;`, keep-alive e timeouts adequados.
- CORS: ajuste `Access-Control-Allow-Origin` no gateway.
- JSON Schema (OpenAI): envie em `meta.response_format`.
- Tools não disparam: `tool_choice: "auto"` e verifique parâmetros obrigatórios.
