# Security & BYOK

- Nunca exponha chaves no frontend; use o gateway.
- BYOK via `x-external-api-key` por requisição.
- Multi-tenant: `X-Tenant-Id`, `X-User-Id` para auditoria e quotas.
- Configure CORS/TLS e rate limiting em produção.

Consulte também SECURITY.md (raiz) para política de vulnerabilidades.

