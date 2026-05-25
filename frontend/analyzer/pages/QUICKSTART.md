
# Quickstart

## 1) Providers

```bash
export OPENAI_API_KEY=sk-...
export GEMINI_API_KEY=...
export ANTHROPIC_API_KEY=...
```

Edite `config/config.example.yml`:

```yaml
providers:
  oai:    { type: openai,   base_url: https://api.openai.com, key_env: OPENAI_API_KEY,    default_model: gpt-4o-mini }
  gemini: { type: gemini,   base_url: https://generativelanguage.googleapis.com, key_env: GEMINI_API_KEY, default_model: gemini-2.5-flash }
  claude: { type: anthropic,base_url: https://api.anthropic.com, key_env: ANTHROPIC_API_KEY, default_model: claude-3-5-sonnet-latest }
  groq:   { type: groq,     base_url: https://api.groq.com, key_env: GROQ_API_KEY, default_model: llama-3.1-70b-versatile }
```

## 2) Subir

```bash
make run
# health
curl -I http://localhost:8080/healthz
```

## 3) Listar providers

```bash
curl http://localhost:8080/v1/providers | jq
```

## 4) Chat streaming

```bash
curl -N -X POST http://localhost:8080/v1/chat \
 -H 'Content-Type: application/json' \
 -H "x-external-api-key: $OPENAI_API_KEY" \
 -d '{"provider":"oai","model":"gpt-4o-mini","messages":[{"role":"user","content":"hello"}],"stream":true}'
```

## 5) Tools & JSON Schema

Enviar em `meta`:

```json
{
  "tools": [
    {"type":"function","function":{"name":"getWeather","parameters":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}}
  ],
  "tool_choice":"auto",
  "response_format":{"type":"json_schema","json_schema":{"name":"analysis","schema":{"type":"object","properties":{"summary":{"type":"string"}},"required":["summary"]}}}
}
```
