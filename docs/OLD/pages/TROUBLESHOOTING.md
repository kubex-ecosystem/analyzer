
# Troubleshooting

**`401 Unauthorized`**

* BYOK inválido/ausente. Cheque `x-external-api-key`.
* Em Direct (front), verifique chave e *scopes*.

**`429 Too Many Requests`**

* Rate limit (se habilitado). Reduza concorrência; aumente bucket.

***SSE “trava/fecha”***

* Proxy/Nginx com `proxy_buffering off;` e `http2_push off`.
* Keep-alive habilitado; timeout adequado.

***CORS***

* Ajuste `Access-Control-Allow-Origin` no gateway para domínio do app.

***JSON Schema sem efeito (OpenAI)***

* Envie via `meta.response_format` no body.

***Tools não disparam***

* `tool_choice: "auto"` ou force `{"type":"function","function":{"name":"..."}}`
* Verifique parâmetros obrigatórios no schema.
