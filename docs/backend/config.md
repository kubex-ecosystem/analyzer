# Config (YAML)

## config.example.yml

```yaml
providers:
  <name>:
    type: openai|gemini|anthropic|groq|openrouter|ollama
    base_url: https://api...
    key_env: ENV_VAR_NAME
    default_model: name-or-path
```

## Variáveis de ambiente

- `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`
- `PROVIDERS_CFG` (default `config/config.example.yml`)
- `ADDR` (default `:8080`)
- `GOBE_BASE_URL` (opcional; habilita `/v1/auth/*` passthrough)

## CORS

Padrão liberal em dev. Em prod, fixe origem/domínios confiáveis.

