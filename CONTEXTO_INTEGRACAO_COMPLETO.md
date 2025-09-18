# 🚀 CONTEXTO COMPLETO: INTEGRAÇÃO BACKEND GO ↔ FRONTEND TYPESCRIPT

## 📋 SITUAÇÃO ATUAL

### Backend Go (Analyzer)

**Estrutura Descoberta:**

```plaintext
/srv/apps/LIFE/KUBEX/analyzer/
├── cmd/main.go                        # CLI principal
├── internal/
│   ├── api/server.go                  # ✅ API REST completa
│   ├── gateway/transport/http_sse.go  # ✅ Gateway SSE/WebSocket
│   ├── handlers/lookatni/handler.go   # ✅ Handlers HTTP
│   ├── web/handler.go                 # ✅ Web interface handlers
│   ├── integration/gobe.go            # ✅ GoBE client integration
│   ├── services/github/client.go     # ✅ GitHub service
│   └── repositories/integrations.go  # ✅ Jira, WakaTime, etc.
└── config/.env.example               # ✅ VITE_GATEWAY_URL configurado
```

**APIs Backend Disponíveis:**

```go
// Core Repository Intelligence
GET  /api/v1/scorecard             # Scorecard de repositório
POST /api/v1/scorecard/advice      # Relatórios executivos/técnicos
GET  /api/v1/metrics/ai            # Métricas de IA (HIR, TPH, AAC)
GET  /api/v1/health                # Health check

// Gateway/Chat APIs
POST /v1/chat                      # Chat SSE com provedores IA
GET  /v1/providers                 # Lista provedores disponíveis
GET  /v1/session                   # Gerencia sessões
POST /v1/auth/login                # Autenticação
GET  /v1/state/export              # Export estado
POST /v1/state/import              # Import estado
POST /v1/advise                    # Conselhos/sugestões

// Assets & Static
GET  /api/v1/scorecard/assets/*    # Arquivos estáticos
```

### Frontend TypeScript (React)

**Estrutura Atual:**

```plaintext
frontend/
├── services/
│   ├── gemini/            # ✅ Gemini API direta
│   ├── integrations/      # ✅ GitHub, Jira services
│   └── secureStorage.ts   # ✅ Storage seguro
├── components/settings/   # ✅ Modal settings completo
└── types/                 # ✅ TypeScript types completos
```

**O QUE ESTÁ FALTANDO:**

```typescript
❌ frontend/services/unified-ai.ts        # API unificada mencionada
❌ frontend/services/analyzer-api.ts      # Client para backend Go
❌ frontend/services/gateway-client.ts    # Client para gateway SSE
❌ Conexão com VITE_GATEWAY_URL           # Environment var configurada mas não usada
```

## 🔗 INTEGRAÇÃO NECESSÁRIA

### 1. **Criar Cliente API Unificado**

```typescript
// frontend/services/analyzer-api.ts
interface AnalyzerClient {
  // Repository Intelligence
  getScorecard(repo: string, period?: number): Promise<Scorecard>
  getScorecardAdvice(scorecard: Scorecard, mode: string): Promise<Report>
  getAIMetrics(repo: string, period?: number): Promise<AIMetrics>

  // Chat/Gateway
  streamChat(messages: Message[], provider: string): AsyncIterable<ChatChunk>
  getProviders(): Promise<Provider[]>
  getSession(): Promise<Session>

  // Integrations
  testGitHubConnection(token: string): Promise<boolean>
  testJiraConnection(config: JiraConfig): Promise<boolean>
}
```

### 2. **Conectar Settings Modal com Backend**

```typescript
// Atual: configurações salvas apenas localmente
// Necessário: sincronizar com backend Go

const SecurityTab = () => {
  const handleApiKeyTest = async () => {
    // ❌ Atual: simulação local
    // ✅ Necessário: teste real via backend
    const result = await analyzerAPI.testApiProvider(provider, apiKey)
  }
}
```

### 3. **Implementar Upload de Arquivos/Projetos**

```typescript
// Novo sistema de upload mencionado pelo usuário
interface ProjectUpload {
  uploadProject(files: FileList): Promise<UploadResult>
  analyzeUploadedProject(projectId: string): Promise<Analysis>
  exportAnalysis(format: 'json' | 'zip'): Promise<Blob>
}
```

### 4. **Conectar Dashboard com Dados Reais**

```typescript
// ❌ Atual: dados mock em exampleAnalysis.ts
// ✅ Necessário: dados reais do backend

const Dashboard = () => {
  const { data: scorecard } = useScorecard(currentRepo)
  const { data: aiMetrics } = useAIMetrics(currentRepo)
  const { data: insights } = useScorecardAdvice(scorecard, 'executive')
}
```

## 🎯 PRÓXIMOS PASSOS PRIORITÁRIOS

### **1. API Client Base (CRITICAL)**

```typescript
// frontend/services/analyzer-client.ts
export class AnalyzerClient {
  private baseURL: string = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080'

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options
    })
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`)
    return response.json()
  }
}
```

### **2. Contexts Integration (HIGH)**

```typescript
// Conectar UserContext com backend para persistência
// Conectar ProjectContext com scorecard API
// Conectar NotificationContext com erros de API
```

### **3. Real-time Features (MEDIUM)**

```typescript
// SSE connection para chat em tempo real
// WebSocket para atualizações de análise
// Live status de integrações
```

### **4. Upload System (LOW)**

```typescript
// Sistema de upload direto mencionado
// Análise de arquivos locais sem GitHub
```

## 🛠 IMPLEMENTAÇÃO SUGERIDA

### **Fase 1: Conectividade Básica**

1. Criar `analyzer-client.ts` com métodos básicos
2. Conectar `SecurityTab` com testes reais de API
3. Implementar `useScorecard()` hook para dados reais

### **Fase 2: Settings Integration**

1. Sincronizar configurações do modal com backend
2. Implementar feedback real para integrações
3. Conectar provider selection com gateway

### **Fase 3: Dashboard Real Data**

1. Substituir mocks por dados reais do scorecard
2. Implementar métricas AI em tempo real
3. Conectar insights com scorecard advice API

### **Fase 4: Advanced Features**

1. Sistema de upload de projetos
2. Chat em tempo real via SSE
3. Export/import de configurações

## 💡 INSIGHTS ARQUITETURAIS

### **Backend Go está PRONTO** ✅

- API completa implementada
- Integrações com GitHub, Jira, WakaTime
- Gateway SSE funcionando
- Scorecard engine implementado

### **Frontend tem ESTRUTURA** ✅

- Modal de settings completo
- Types TypeScript definidos
- Contexts funcionando
- Sistema de notificações

### **GAP é a CONEXÃO** ❌

- Nenhum cliente API implementado
- VITE_GATEWAY_URL não utilizado
- Dados mock em vez de reais
- Settings não persistem no backend

## 🚀 PROMPT PARA GROK COM SONNET

**INSTRUÇÃO PARA IA:**
"Você deve implementar a conexão completa entre o frontend React TypeScript e o backend Go do Analyzer. O backend já tem APIs prontas em `/api/v1/*` e gateway SSE em `/v1/*`. Foque em:

1. **Criar** `frontend/services/analyzer-client.ts` com client completo para todas as APIs
2. **Conectar** `SecurityTab.tsx` com testes reais de API keys via backend
3. **Implementar** hooks `useScorecard()`, `useAIMetrics()` para dados reais
4. **Adicionar** sistema de upload de projetos direto
5. **Substituir** todos os dados mock por calls reais do backend

**Prioridade:** Conectividade > Settings > Dashboard > Upload

**Mantenha:** Toda a estrutura atual do frontend (modal, contexts, tipos)"

---

**🎯 RESULTADO ESPERADO:** Frontend totalmente conectado com backend Go, eliminando mocks e implementando funcionalidades reais de Repository Intelligence.
