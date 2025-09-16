# Resumo do Projeto: GemX Analyzer

## 1. Visão Geral

O **GemX Analyzer** é uma aplicação web de página única (SPA) projetada para atuar como uma ferramenta de análise de projetos de software. Utilizando a API do Google Gemini, a aplicação recebe documentação de projeto (como `READMEs`, notas de lançamento, etc.) e gera insights estruturados e acionáveis. O objetivo é fornecer aos desenvolvedores e gerentes de projeto uma avaliação rápida e inteligente sobre a viabilidade, maturidade, pontos fortes e áreas de melhoria de um projeto.

---

## 2. Arquitetura e Stack Tecnológica

A aplicação é construída com uma arquitetura moderna de frontend, priorizando a reatividade, a persistência de dados no lado do cliente e uma experiência de usuário fluida.

### Stack Principal

- **Framework:** React 19
- **Linguagem:** TypeScript
- **Build Tool:** Vite
- **Estilização:** Tailwind CSS
- **Animações:** Framer Motion
- **Ícones:** Lucide React

### Gerenciamento de Estado

- **Estado Global:** O estado global (autenticação, notificações, idioma) é gerenciado através da **React Context API**, com provedores dedicados (`AuthProvider`, `NotificationProvider`, `LanguageProvider`).
- **Persistência de Dados:** O estado crítico e os dados do usuário (histórico de análises, configurações, quadro Kanban) são persistidos no cliente usando um hook customizado `usePersistentState`.
  - **Estratégia de Armazenamento:** A implementação prioriza o **IndexedDB** por sua capacidade de armazenamento assíncrono e maior. Ele possui um fallback gracioso para o **localStorage** caso o IndexedDB não esteja disponível, garantindo robustez.

### Integração com a IA (Gemini API)

- A comunicação com a API Gemini é abstraída em uma camada de serviço (`services/gemini/`).
- A aplicação utiliza o modelo `gemini-2.5-flash` para as análises.
- Para garantir respostas estruturadas e consistentes, a aplicação define um `responseSchema` no formato JSON para as chamadas à API, o que minimiza a necessidade de parsing complexo de texto no cliente.

### Internacionalização (i18n)

- A aplicação suporta múltiplos idiomas (atualmente `en-US` e `pt-BR`).
- A tradução é gerenciada por um `LanguageContext` e um hook customizado `useTranslation`.
- Os textos são armazenados em módulos TypeScript localizados em `locales/`, organizados por namespace (ex: `common.ts`, `dashboard.ts`) com type safety completo.

### Estrutura de Diretórios

```
/
├── components/     # Componentes React reutilizáveis, organizados por feature
├── contexts/       # Provedores de contexto para estado global
├── data/           # Dados estáticos, como o modo de exemplo
├── docs/           # Documentação do projeto
├── hooks/          # Hooks customizados (usePersistentState, useTranslation, etc.)
├── lib/            # Utilitários de baixo nível (ex: idb.ts)
├── public/         # Assets públicos, incluindo os arquivos de tradução
├── services/       # Lógica de comunicação com APIs externas (Gemini)
└── types/          # Definições de tipos e interfaces TypeScript
```

---

## 3. Funcionalidades Implementadas

- **Análise de Projetos com IA:**
  - O usuário pode colar texto ou carregar um arquivo.
  - Quatro tipos de análise estão disponíveis: Viabilidade Geral, Auditoria de Segurança, Revisão de Escalabilidade e Qualidade de Código.
  - A resposta da IA é exibida em um formato rico e estruturado, incluindo:
    - Resumo executivo, pontos fortes, melhorias sugeridas.
    - Pontuação de viabilidade com gráfico de rosca.
    - Análise de ROI e maturidade do projeto.

- **Dashboard de Métricas:**
  - Exibe um painel de controle com estatísticas agregadas de todas as análises.
  - KPIs incluem: total de análises, pontuação média de viabilidade, tipo de análise mais comum e uso de tokens.
  - Apresenta um gráfico de tendência da evolução da pontuação de viabilidade.
  - Permite filtrar as métricas por projeto.

- **Histórico e Comparação:**
  - Todas as análises (se habilitado) são salvas localmente no IndexedDB.
  - Um painel de histórico permite visualizar, carregar, excluir ou limpar análises passadas.
  - Funcionalidade de **comparação** que permite selecionar duas análises do mesmo projeto e gerar um "relatório de evolução" via IA.

- **Quadro Kanban:**
  - A partir de uma análise, o usuário pode gerar um quadro Kanban pré-populado.
  - As colunas (Backlog, To Do, etc.) são preenchidas com base nas melhorias e próximos passos sugeridos pela IA.
  - Os cards podem ser editados, e novas anotações podem ser adicionadas.

- **Modo de Exemplo:**
  - Para novos usuários ou para aqueles sem dados, a aplicação oferece um "Modo Exemplo" completo.
  - Este modo é estritamente **somente leitura** e carrega dados de demonstração para todas as funcionalidades (Análise, Dashboard, Kanban, Histórico), permitindo uma exploração segura da ferramenta.

- **Gerenciamento de Estado do Usuário:**
  - Uma flag global `hasRealData` persistida no IndexedDB controla a experiência do usuário. Se `false`, a aplicação exibe prompts para o modo de exemplo. Uma vez que uma análise real é feita, a flag se torna `true`, e a UI se adapta para um usuário com dados.
  - Configurações da aplicação (limite de tokens, salvar histórico) e perfil do usuário são persistidos.
  - Funcionalidade de **importar/exportar** o estado completo da aplicação (em JSON) para backup e migração.

- **UI/UX:**
  - Tema escuro consistente e esteticamente agradável.
  - Animações fluidas em toda a interface.
  - Notificações de feedback para ações do usuário (sucesso, erro, etc.).
  - Design responsivo.
