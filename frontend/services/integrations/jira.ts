// services/integrations/jira.ts
import { AppSettings } from "../../types";

const formatMockContext = (projectKey: string, settings: AppSettings): string => {
    return `# Contexto do Projeto Jira (Simulado)\n`;
    // Add more mock data structure as needed
};

/**
 * Fetches project data from Jira.
 * NOTE: This is currently a mock implementation.
 * @param projectKey The Jira project key (e.g., "PROJ").
 * @param settings The app settings containing Jira credentials.
 * @returns A formatted string with mock project data.
 */
export const fetchJiraProject = async (projectKey: string, settings: AppSettings): Promise<string> => {
    console.log("Fetching Jira data for:", projectKey, "with instance:", settings.jiraInstanceUrl);

    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, you would use the credentials to make API calls to the Jira instance.
    // For now, we return a success message with mock data.
    
    const mockData = `
# Contexto do Projeto Jira (Dados Simulados)
## Projeto: ${projectKey} - Análise de Agilidade

### Resumo
Este projeto visa melhorar o fluxo de trabalho de desenvolvimento, com base nos dados extraídos do Jira.

### Épicos Recentes
1.  **[${projectKey}-101] Refatoração da Interface do Usuário (Q3)**
    - **Status:** Em Andamento
    - **Descrição:** Modernizar a UI principal para melhorar a experiência do usuário.

2.  **[${projectKey}-102] Integração de Pagamento via API (Q3)**
    - **Status:** A Fazer
    - **Descrição:** Implementar um novo gateway de pagamento para expandir as opções do cliente.

### Sprint Atual: "Sprint 14 - Finalização"
- **Objetivo:** Concluir as tarefas de alta prioridade para o lançamento da v2.3.
- **Progresso:** 75% concluído.

### Impedimentos Notáveis
- **[${projectKey}-155] API de Terceiros Instável**
    - **Status:** Em Análise
    - **Descrição:** A API de parceiro está apresentando latência, impactando os testes de integração.
    - **Prioridade:** Alta
`;

    return mockData.trim();
};