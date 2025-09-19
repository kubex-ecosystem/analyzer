# 🎯 PROMPT OTIMIZADO PARA GROK COM SONNET

**CONTEXTO:** Você está trabalhando no projeto Analyzer (kubex-ecosystem) que possui:

- ✅ **Backend Go completo** com APIs REST, Gateway SSE e integrações
- ✅ **Frontend React TypeScript** com modal settings, contexts e types
- ❌ **Gap crítico:** Frontend não conecta com Backend (usa apenas dados mock)

## 🚀 MISSÃO PRINCIPAL

***Implementar conexão completa Frontend ↔ Backend eliminando TODOS os dados mock***

### APIs Backend Disponíveis (GO)

```plaintext
GET  /api/v1/scorecard             → Análise de repositório
POST /api/v1/scorecard/advice      → Relatórios executivos/técnicos
GET  /api/v1/metrics/ai            → Métricas IA (HIR, TPH, AAC)
POST /v1/chat                      → Chat SSE com provedores IA
GET  /v1/providers                 → Lista provedores disponíveis
```

### Estrutura Frontend Atual

```plaintext
frontend/
├── components/settings/UserSettingsModal.tsx  # Modal completo mas sem backend
├── contexts/UserContext.tsx                   # Contextos funcionando localmente
├── services/gemini/                           # Gemini API direta funciona
├── types/User.tsx                             # Types completos definidos
└── data/exampleAnalysis.ts                   # ❌ DADOS MOCK - ELIMINAR
```

## 📋 TAREFAS ESPECÍFICAS

### **1. CRIAR CLIENT API UNIFICADO** [CRÍTICO]

```typescript
// Criar: frontend/services/analyzer-client.ts
class AnalyzerClient {
  private baseURL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080'

  // Repository Intelligence
  async getScorecard(repo: string): Promise<Scorecard>
  async getScorecardAdvice(scorecard: Scorecard, mode: string): Promise<Report>
  async getAIMetrics(repo: string): Promise<AIMetrics>

  // Provider/Chat
  async streamChat(messages: Message[], provider: string): AsyncIterable<ChatChunk>
  async getProviders(): Promise<Provider[]>

  // Integration Testing
  async testApiKey(provider: string, apiKey: string): Promise<boolean>
  async testGitHubConnection(token: string): Promise<boolean>
  async testJiraConnection(config: JiraConfig): Promise<boolean>
}
```

### **2. CONECTAR SETTINGS COM BACKEND** [ALTO]

```typescript
// Modificar: SecurityTab.tsx
const handleApiKeyTest = async () => {
  // ❌ Remover: simulação local
  // ✅ Implementar: teste real via backend
  const isValid = await analyzerClient.testApiKey(provider, apiKey)
  setTestStatus(isValid ? 'success' : 'failure')
}

// Modificar: IntegrationsTab.tsx
const testConnection = async (service: string) => {
  // ❌ Remover: Math.random() mock
  // ✅ Implementar: teste real de conexão
  const success = await analyzerClient.testIntegration(service, credentials)
}
```

### **3. HOOKS DE DADOS REAIS** [ALTO]

```typescript
// Criar: frontend/hooks/useAnalyzer.ts
export const useScorecard = (repo: string) => useQuery({
  queryKey: ['scorecard', repo],
  queryFn: () => analyzerClient.getScorecard(repo)
})

export const useAIMetrics = (repo: string) => useQuery({
  queryKey: ['ai-metrics', repo],
  queryFn: () => analyzerClient.getAIMetrics(repo)
})
```

### **4. DASHBOARD COM DADOS REAIS** [MÉDIO]

```typescript
// Modificar: Dashboard.tsx, Analytics.tsx
// ❌ Remover: import { exampleAnalysis } from '../data/exampleAnalysis'
// ✅ Implementar: const { data: analysis } = useScorecard(currentRepo)
```

### **5. SISTEMA DE UPLOAD** [BAIXO]

```typescript
// Criar: frontend/services/upload-client.ts
// Implementar upload direto de projetos para análise local
class ProjectUploader {
  async uploadProject(files: FileList): Promise<UploadResult>
  async analyzeProject(projectId: string): Promise<Analysis>
}
```

## 🎯 REGRAS DE IMPLEMENTAÇÃO

### **MANTER INTACTO:**

- ✅ Toda estrutura atual do modal UserSettingsModal.tsx
- ✅ Contexts (UserContext, ProjectContext, NotificationContext)
- ✅ Types TypeScript existentes
- ✅ Sistema de notificações implementado
- ✅ Componentes visuais e estilos

### **ELIMINAR/SUBSTITUIR:**

- ❌ Todas as simulações e Math.random()
- ❌ Dados mock em exampleAnalysis.ts
- ❌ Timeouts artificiais (await new Promise)
- ❌ Hardcoded responses

### **PRIORIDADES:**

1. **Conectividade básica** → analyzer-client.ts funcionando
2. **Settings reais** → testes de API keys e integrações via backend
3. **Dashboard real** → scorecard e métricas do backend
4. **Features avançadas** → upload e chat em tempo real

## 💡 DICAS TÉCNICAS

- Use `VITE_GATEWAY_URL` env var já configurada
- Backend roda em `localhost:8080` por padrão
- APIs seguem padrão REST + alguns endpoints SSE
- Frontend já tem error handling e loading states
- NotificationContext pronto para feedback de API

## 🚀 RESULTADO ESPERADO

Frontend totalmente conectado eliminando 100% dos dados mock, com:

- Settings salvando e testando via backend real
- Dashboard mostrando dados reais de repositórios
- Sistema de upload funcional
- Integrações GitHub/Jira testáveis

**FOCO:** Funcionalidade > Estética. Mantenha visual atual, implemente funcionalidade real.
