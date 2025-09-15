
# Receitas

## 1) Structured Output (OpenAI)

```json
"meta": {
  "response_format": {
    "type":"json_schema",
    "json_schema":{"name":"analysis","schema":{"type":"object","properties":{"summary":{"type":"string"}},"required":["summary"]}}
  }
}
```

## 2) Function Calling round-trip

1. Gateway emite `{"toolCall":{"name":"getRepo","args":{"id":"..."} }}`
2. Front/CLI executa e envia **mensagem de tool** (seu pipeline)
3. Nova chamada `/v1/chat` com o contexto enriquecido

## 3) “Modo auditoria”

* Sempre roteie via gateway quando quiser **usage + quotas + tools** sob controle do servidor.
