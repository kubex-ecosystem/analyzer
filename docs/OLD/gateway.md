# Analyzer Gateway

O **analyzer-gw** é um gateway HTTP ultra-enxuto que abstrai múltiplos provedores de IA através de uma interface unificada com Server-Sent Events (SSE).

## ✨ Características

- **Single Binary**: Zero dependências, stateless
- **Multi-Provider**: OpenAI, Anthropic, Groq, OpenRouter, Ollama
- **SSE Streaming**: Respostas em tempo real via Server-Sent Events
- **BYOK Seguro**: Bring Your Own Key sem persistência
- **Usage Metrics**: Transparência total de tokens, latência e custos
- **Config YAML**: Trocar providers sem rebuild

## 🚀 Quick Start

### 1. Configure providers

Edite `config/config.example.yml`:

```yaml
providers:
  openai:
    type: openai
    base_url: https://api.openai.com
    key_env: OPENAI_API_KEY
    default_model: gpt-4o-mini
```

### 2. Execute o gateway

```bash
# Via Makefile
make run-gw

# Ou diretamente
export OPENAI_API_KEY="your-key-here"
./dist/analyzer-gw
```

### 3. Teste a API

```bash
# Health check
curl http://localhost:8080/healthz

# List providers
curl http://localhost:8080/v1/providers

# Chat com SSE
curl -X POST http://localhost:8080/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7
  }'
```

## 📡 API Endpoints

### `POST /v1/chat`

Realiza chat completion com streaming SSE.

**Request:**

```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7
}
```

**Response (SSE):**

```json
data: {"content": "Hello", "done": false}
data: {"content": "! How", "done": false}
data: {"done": true, "usage": {"tokens": 15, "latency_ms": 1200, "cost_usd": 0.00003}}
```

### `GET /v1/providers`

Lista providers disponíveis e suas configurações.

### `GET /healthz`

Health check endpoint.

## 🔐 BYOK (Bring Your Own Key)

Envie sua própria API key via header:

```bash
curl -X POST http://localhost:8080/v1/chat \
  -H "x-external-api-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai", "messages": [...]}'
```

## 📊 Usage Metrics

Cada resposta inclui métricas detalhadas:

- **tokens**: Total de tokens utilizados
- **latency_ms**: Latência da requisição
- **cost_usd**: Custo estimado em USD
- **provider**: Provider utilizado
- **model**: Modelo específico

## 🏗️ Arquitetura

```plaintext
cmd/gw/main.go              # Bootstrap do gateway
internal/gateway/
├── registry/               # Provider registry e interfaces
│   ├── registry.go        # Core registry logic
│   └── openai.go         # OpenAI provider
└── transport/             # HTTP transport layer
    └── http.go           # SSE endpoints
config/config.example.yml       # Provider configuration
```

## 🔧 Build & Deploy

```bash
# Build
make build-gw

# Test
./test_gateway.sh

# Deploy (single binary)
scp dist/analyzer-gw user@server:/usr/local/bin/
```

## 🎯 Por que isso é valioso?

1. **Time-to-Market**: Trocar vendor = editar YAML
2. **Transparência de Custos**: Métricas unificadas
3. **Zero Lock-in**: Mesma interface para todos providers
4. **Deploy Simples**: Single binary, stateless
5. **Escalabilidade**: SSE + stateless = horizontal scaling

## 🛣️ Roadmap

- [ ] Anthropic Provider
- [ ] Groq Provider
- [ ] OpenRouter Provider
- [ ] Ollama Provider
- [ ] Rate Limiting
- [ ] Authentication
- [ ] Metrics Dashboard
