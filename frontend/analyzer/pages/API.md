
# API (HTTP)

## `POST /v1/chat` (SSE)

***Request***

```json
{
  "provider":"oai|gemini|claude|groq",
  "model":"<string>",
  "messages":[{"role":"system|user|assistant","content":"..."}],
  "temperature":0.2,
  "stream":true,
  "meta":{
    "tools":[{"type":"function","function":{"name":"...","parameters":{}}}],
    "tool_choice":"auto",
    "response_format":{"type":"json_schema","json_schema":{}}    // OpenAI
  }
}
```

**Headers** (opcionais)

* `x-external-api-key`: BYOK do usuário
* `X-Tenant-Id`, `X-User-Id`: contexto multi-tenant

***Eventos SSE***

* `{"content":"..."}`
* `{"toolCall":{"name":"...","args":{...}}}`
* `{"done":true,"usage":{"prompt":..,"completion":..,"tokens":..,"ms":..}}`

## `GET /v1/providers`

Retorna `{ "providers": [{ "Name": "oai", "Type": "openai" }, ...] }`

## `POST /v1/state/export` / `GET /v1/state/import`

* Body: `{ "version": N, "etag": "sha256:...", "payload": { ... } }`
* Conflito: HTTP 409 com `server_version`, `server_etag` e `server_payload`.

## `POST /v1/auth/login`

Passthrough pro GoBE (se `GOBE_BASE_URL` setado).
