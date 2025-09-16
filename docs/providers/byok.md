# Providers & BYOK

Suporte multi-provider com Bring Your Own Key por requisição.

## Variáveis de ambiente

- `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`
- `PROVIDERS_CFG` (default `config/config.example.yml`)

## Defaults recomendados

- OpenAI: `gpt-4o-mini`
- Gemini: `gemini-2.5-flash`
- Anthropic: `claude-3-5-sonnet-latest`
- Groq: `llama-3.1-70b-versatile`

## BYOK

Envie a chave do usuário via header `x-external-api-key`.
Combine com `X-Tenant-Id` e `X-User-Id` para multi-tenant/auditoria.

