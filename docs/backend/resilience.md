# Resilience (Rate/Circuit/Retry)

Recomendações de produção:

- Rate limiting por tenant/usuário e provider.
- Circuit breaker para erros consecutivos de provider.
- Retry exponencial para falhas transitórias (HTTP 429/5xx).

SSE exige keep-alive, timeouts ajustados e proxy com `proxy_buffering off;`.

