# Auth & Tenancy

O gateway suporta multi-tenant e auditoria via headers:

- `X-Tenant-Id`: identificador do tenant/organização
- `X-User-Id`: identificador do usuário

Combine com BYOK por requisição usando `x-external-api-key`.

Quando configurado `GOBE_BASE_URL`, endpoints `/v1/auth/*` fazem passthrough para o GoBE.

