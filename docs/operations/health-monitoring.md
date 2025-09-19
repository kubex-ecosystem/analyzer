# Health Monitoring

Sistema automático de verificação de saúde dos providers AI com cache inteligente e escalação de tiers.

## Endpoints

### GET /health

Status geral de todos os providers. Retorna HTTP 200 (ok), 206 (parcial) ou 503 (crítico).

```json
{
  "status": "ok|partial|critical",
  "providers": {
    "groq": {
      "provider": "groq",
      "status": "ok|suspect|degraded|down",
      "tier": 1,
      "details": "handshake ok",
      "http_code": 204,
      "latency_ms": 142,
      "ttl_seconds": 600,
      "checked_at": "2025-09-18T10:30:00Z"
    }
  },
  "summary": {"ok": 2, "down": 1},
  "checked_at": "2025-09-18T10:30:00Z"
}
```

### GET /health/{provider}

Status específico de um provider com controle de tier.

Query params:

- `tier=1|2|3`: força tier específico (padrão: automático)
- `force=true`: ignora cache e força nova verificação

Headers de automação:

- `X-Health-Status`: ok/suspect/degraded/down
- `X-Health-Counts`: {"ok":2,"down":1}
- `Retry-After`: segundos até próxima verificação sugerida

## Tiers de Verificação

### Tier 1: Key Validation (15min TTL)

- **Groq**: `GET /models?limit=1`
- **Gemini**: `GET /models`
- Verifica validade da API key sem gastar tokens
- Cache: 30min quando saudável, 5min quando problemático

### Tier 2: Handshake (5min TTL)

- **Groq**: `OPTIONS /chat/completions`
- **Gemini**: `HEAD /generateContent`
- Confirma conectividade básica do endpoint
- Cache: 10min quando saudável, 2min quando problemático

### Tier 3: Real Request (30min TTL)

- Micro-request controlada (pode consumir tokens mínimos)
- Valida funcionalidade completa do provider
- Cache: 1h quando saudável, 10min quando problemático

## Status Classification

- **ok**: Funcionando perfeitamente
- **suspect**: Comportamento anômalo (404, timeouts)
- **degraded**: Funcionando com limitações (rate limits baixos)
- **down**: Indisponível (401, 403, 500+)

## Scheduler Automático

Execução em background com intervalos configuráveis:

```yaml
# Configuração interna (não editável)
intervals:
  tier1: 15m    # Key validation
  tier2: 5m     # Handshake check
  tier3: 30m    # Real requests
```

Logs estruturados:

```text
[HealthScheduler] Tier 1 groq: ok - chave válida
[HealthScheduler] Tier 2 groq: suspect - timeout de handshake
```

## Cache & TTL Strategy

Cache inteligente baseado no status:

- **Status OK**: TTL máximo (até 1h)
- **Status Suspect/Degraded**: TTL reduzido (2-10min)
- **Status Down**: TTL mínimo (5min para retry rápido)

Force check via `?force=true` ignora cache e atualiza imediatamente.

## Error Handling

### Groq Specifics

- 401/403: `down` - "chave inválida ou sem permissão"
- 404: `suspect` - "endpoint não encontrado"
- 405: `ok` - "rota existe" (tolerado em OPTIONS)
- 429: `degraded` - "rate limit atingido"
- Timeout: `suspect` - "timeout de conectividade"

### Gemini Specifics

- 400: `down` - "chave inválida"
- 403: `degraded` - "quota excedida"
- 404: `suspect` - "modelo não encontrado"

## Integration

Use health status para:

- **Circuit breaker**: evite providers `down`
- **Load balancing**: prefira providers `ok`
- **Fallback logic**: escalação automática por status
- **Monitoring alerts**: 503 indica problema sistêmico

```go
// Exemplo de uso
result, _ := healthEngine.Check("groq", Tier1Key, false)
if result.Status == StatusDown {
    // Evitar provider ou usar fallback
}
```

## Monitoring & Alerts

```go
// Exemplo de uso
result, _ := healthEngine.Check("groq", Tier1Key, false)
if result.Status == StatusDown {
    // Evitar provider ou usar fallback
}
```

- Integre com Prometheus/Grafana para dashboards
- Alertas via email/Slack para status `critical` ou múltiplos `down`
- Logs estruturados para auditoria e debugging
- Métricas de latência e taxa de erro por provider
- Health checks periódicos para garantir alta disponibilidade
- Alertas configuráveis para mudanças de status críticas
- Relatórios de SLA baseados em histórico de saúde dos providers
<!-- Isso a gnte naõ tem ainda.. hehehe   -->
<!-- - Dashboards em Grafana para visualização em tempo real
- Logs detalhados para auditoria e troubleshooting
- Métricas de latência, taxa de erro e uso por tenant/provider -->
