
# Segurança & BYOK

* **BYOK nunca é persistido**: só vive no ciclo da request (`x-external-api-key`).
* **Logs sanitizados**: não logar cabeçalho de key.
* **Multi-tenant**: sempre propague `X-Tenant-Id` e `X-User-Id`.
* **Rate-limit**: bucket por `tenant:user` no `/v1/chat` (recomendado).
* **CORS**: restrinja em prod aos domínios do app.
* **Auditoria de Tools**: no gateway é possível negar/permitir tool por lista.
