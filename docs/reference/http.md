# API (HTTP)

## POST /v1/chat (SSE)

Request

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
    "response_format":{"type":"json_schema","json_schema":{}}
  }
}
```

Headers (opcionais)

- `x-external-api-key`: BYOK do usuário
- `X-Tenant-Id`, `X-User-Id`: contexto multi-tenant

Eventos SSE

- `{"content":"..."}`
- `{"toolCall":{"name":"...","args":{...}}}`
- `{"done":true,"usage":{"prompt":..,"completion":..,"tokens":..,"ms":..}}`

## GET /v1/providers

Retorna `{ "providers": [{ "Name": "oai", "Type": "openai" }, ...] }`

## GET /v1/status

Status geral do gateway e produção (com métricas de middleware quando habilitado).

## GET /healthz

Health check simples do serviço.

## Repository Intelligence (prévia)

- `GET /api/v1/scorecard` — status/placeholder
- `POST /api/v1/scorecard/advice` — integração planejada com advise
- `GET /api/v1/metrics/ai` — HIR/AAC/TPH em desenvolvimento
- `GET /api/v1/health` — status do módulo de inteligência

Notas

- `/v1/state/*` e `/v1/advise` fazem parte do design, mas ainda não estão implementados nesta base. Use os endpoints acima e acompanhe o changelog para disponibilidade.
