<!-- markdownlint-disable MD033 -->
# KUBEX Guard Rails - Demo Mode and Onboarding System

import React, { useState, useEffect } from 'react';
import { Trash2, Edit3, Plus, Wand2, Sun, Moon, Copy, Check, Info, Play, BookOpen } from 'lucide-react';

// =============================================================================
// 🎯 SINGLE SOURCE OF TRUTH - Demo Mode Controller
// =============================================================================

const DemoMode = {
  // 🎛️ MASTER SWITCH - Single source of truth for all demo behavior
  isActive: true, // Set to false for production mode

  // 🎪 Demo Modes - Different types of demo experiences
  modes: {
    SIMPLE: 'simple',           // Basic demo labels
    ONBOARDING: 'onboarding',   // Guided tour for new users
    EDUCATIONAL: 'educational', // Detailed explanations
    PREVIEW: 'preview'          // Coming soon previews
  },

  currentMode: 'onboarding', // Can be changed based on user preference

  // 🔧 Production Features Status
  features: {
    ollama: { ready: false, eta: 'Q2 2024' },
    openai: { ready: false, eta: 'Q1 2024' },
    gemini: { ready: false, eta: 'Q2 2024' },
    mcp_real: { ready: false, eta: 'Q1 2024' },
    agent_execution: { ready: false, eta: 'Q3 2024' },
    copilot: { ready: false, eta: 'Q2 2024' }
  },

  // 🎓 Educational Content
  education: {
    mcp: {
      title: "Model Context Protocol (MCP)",
      description: "Protocolo que permite que modelos de IA se conectem com sistemas externos de forma padronizada",
      benefits: [
        "🔌 Conecta IA com ferramentas reais",
        "🛡️ Segurança e controle de acesso",
        "🔄 Reutilização entre diferentes modelos",
        "⚡ Performance otimizada"
      ]
    },
    agents: {
      title: "Agents de IA",
      description: "Sistemas autônomos que podem usar ferramentas e tomar decisões para completar tarefas",
      benefits: [
        "🤖 Automação inteligente",
        "🧠 Tomada de decisão contextual",
        "🔧 Uso de ferramentas múltiplas",
        "📈 Escalabilidade de tarefas"
      ]
    }
  },

  // 🎨 Get demo label for UI elements
  getLabel(feature, defaultLabel) {
    if (!this.isActive) return defaultLabel;

    const featureStatus = this.features[feature];

    switch (this.currentMode) {
      case 'simple':
        return `${defaultLabel} 🎪`;
      case 'onboarding':
        return featureStatus ? `${defaultLabel} (${featureStatus.eta})` : `${defaultLabel} 🎪`;
      case 'educational':
        return featureStatus ? `${defaultLabel} - Chegando em ${featureStatus.eta}` : `${defaultLabel} 🎪`;
      case 'preview':
        return `${defaultLabel} - Preview`;
      default:
        return defaultLabel;
    }
  },

  // 🚫 Handle demo feature calls
  handleDemoCall(feature, action = 'use') {
    if (!this.isActive) return null;

    const messages = {
      ollama: `🦙 Ollama será integrado na versão completa! Conecte modelos locais diretamente.`,
      openai: `🧠 OpenAI GPT-4 em breve! Múltiplos providers em um só lugar.`,
      gemini: `💎 Google Gemini chegando! Diversidade de modelos para diferentes tarefas.`,
      mcp_real: `🔌 Servidores MCP reais em desenvolvimento! Conecte com qualquer sistema.`,
      copilot: `🚁 GitHub Copilot API será integrada! Agents com capacidades de código avançadas.`
    };

    return {
      success: false,
      message: messages[feature] || `🎪 Feature "${feature}" em modo demo`,
      eta: this.features[feature]?.eta || 'Em breve'
    };
  }
};

// =============================================================================
// 🎓 ONBOARDING SYSTEM - Guided Demo Experience
// =============================================================================

const OnboardingSteps = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Agent Crafter! 🎉',
    content: 'Esta ferramenta transforma suas ideias em prompts profissionais e agents inteligentes.',
    target: 'header',
    action: 'highlight'
  },
  {
    id: 'ideas',
    title: 'Comece adicionando suas ideias 💡',
    content: 'Cole notas, pensamentos ou requisitos. A IA organizará tudo para você!',
    target: 'ideas-input',
    action: 'focus'
  },
  {
    id: 'output-type',
    title: 'Escolha o que criar 🎯',
    content: 'Prompt = Instruções estruturadas | Agent = Código Python funcional',
    target: 'output-selector',
    action: 'highlight'
  },
  {
    id: 'mcp',
    title: 'Poder do MCP 🔌',
    content: 'Model Context Protocol conecta IA com ferramentas reais. Revolucionário!',
    target: 'mcp-section',
    action: 'explain'
  }
];

// =============================================================================
// 🎨 MAIN COMPONENT - Demo Mode Aware
// =============================================================================

const PromptCrafter = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [currentInput, setCurrentInput] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [purpose, setPurpose] = useState('Outros');
  const [customPurpose, setCustomPurpose] = useState('');
  const [maxLength, setMaxLength] = useState(5000);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [outputType, setOutputType] = useState('prompt');
  const [agentFramework, setAgentFramework] = useState('crewai');
  const [agentRole, setAgentRole] = useState('');
  const [agentTools, setAgentTools] = useState([]);
  const [agentProvider, setAgentProvider] = useState('claude');
  const [mcpServers, setMcpServers] = useState([]);
  const [customMcpServer, setCustomMcpServer] = useState('');

  // 🎓 Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showEducational, setShowEducational] = useState(false);
  const [educationalTopic, setEducationalTopic] = useState(null);

  useEffect(() => {
    document.documentElement.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  const addIdea = () => {
    if (currentInput.trim()) {
      const newIdea = {
        id: Date.now(),
        text: currentInput.trim()
      };
      setIdeas([...ideas, newIdea]);
      setCurrentInput('');
    }
  };

  const removeIdea = (id) => {
    setIdeas(ideas.filter(idea => idea.id !== id));
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = () => {
    setIdeas(ideas.map(idea =>
      idea.id === editingId
        ? { ...idea, text: editingText }
        : idea
    ));
    setEditingId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const generatePrompt = async () => {
    if (ideas.length === 0) return;

    setIsGenerating(true);

    const purposeText = purpose === 'Outros' && customPurpose
      ? customPurpose
      : purpose;

    let engineeringPrompt = '';

    if (outputType === 'prompt') {
      engineeringPrompt = `
Você é um especialista em engenharia de prompts com conhecimento profundo em técnicas de prompt engineering. Sua tarefa é transformar ideias brutas e desorganizadas em um prompt estruturado, profissional e eficaz.

CONTEXTO: O usuário inseriu as seguintes notas/ideias brutas:
${ideas.map((idea, index) => `${index + 1}. "${idea.text}"`).join('\n')}

PROPÓSITO DO PROMPT: ${purposeText}
TAMANHO MÁXIMO: ${maxLength} caracteres

INSTRUÇÕES PARA ESTRUTURAÇÃO:

1. Analise todas as ideias e identifique o objetivo principal
2. Organize as informações de forma lógica e hierárquica
3. Aplique técnicas de engenharia de prompt como:
   - Definição clara de contexto e papel
   - Instruções específicas e mensuráveis
   - Exemplos quando apropriado
   - Formato de saída bem definido
   - Chain-of-thought se necessário
4. Use markdown para estruturação clara
5. Seja preciso, objetivo e profissional
6. Mantenha o escopo dentro do limite de caracteres

IMPORTANTE: Responda APENAS com o prompt estruturado em markdown, sem explicações adicionais ou texto introdutório. O prompt deve ser completo e pronto para uso.
`;
    } else if (outputType === 'agent') {
      const toolsList = agentTools.length > 0 ? agentTools.join(', ') : 'ferramentas padrão';
      const mcpServersList = mcpServers.length > 0 ? mcpServers.join(', ') : 'nenhum servidor MCP configurado';

      engineeringPrompt = `
Você é um especialista em desenvolvimento de agents de IA com conhecimento avançado em Model Context Protocol (MCP), arquitetura de sistemas multi-agent e integração com diversos provedores de LLM.

CONTEXTO: O usuário inseriu as seguintes notas/ideias brutas para o agent:
${ideas.map((idea, index) => `${index + 1}. "${idea.text}"`).join('\n')}

CONFIGURAÇÕES DO AGENT:

- Framework: ${agentFramework}
- Provider LLM: ${agentProvider}
- Papel/Role: ${agentRole || 'A ser definido baseado nas ideias'}
- Ferramentas Tradicionais: ${toolsList}
- Servidores MCP: ${mcpServersList}
- Propósito: ${purposeText}

INSTRUÇÕES PARA CRIAÇÃO DO AGENT COM MCP:

1. Analise as ideias e defina claramente o papel e objetivo do agent
2. Crie um agent ${agentFramework} completo e funcional
3. Configure integração com ${agentProvider} via API ou MCP
4. Inclua configurações MCP detalhadas:
   - Cliente MCP para conectar com servidores
   - Configuração de transporte (stdio, sse, websocket)
   - Mapeamento de ferramentas MCP para o agent
   - Tratamento de erros e reconexão
5. Implemente configurações específicas do provider:
   - Claude: Anthropic API + MCP
   - Codex: OpenAI API + MCP personalizado
   - Gemini: Google AI API + MCP
   - Copilot: GitHub Copilot API + MCP
6. Adicione exemplos de:
   - Configuração do servidor MCP
   - Implementação do cliente
   - Uso das ferramentas MCP
   - Integração com o framework escolhido
7. Inclua código para MCP servers "caseiros" se necessário
8. Considere segurança, rate limiting e fallbacks

ESTRUTURA ESPERADA:

- Código Python completo com imports
- Configuração do client MCP
- Definição do agent com provider específico
- Implementação de ferramentas MCP
- Configuração de servidores MCP (se necessário)
- Exemplo de execução completo
- Requirements.txt sugerido
- Comentários explicativos detalhados

IMPORTANTE:

- Use as bibliotecas MCP mais atuais (mcp, anthropic-mcp, etc.)
- Inclua configurações para desenvolvimento E produção
- Adicione tratamento robusto de erros
- Considere escalabilidade e performance
- Responda APENAS com código estruturado e comentado, pronto para uso em um ambiente real.

EXEMPLO DE ESTRUTURA MCP:

## Configuração MCP + Agent integrado

## Provider: ${agentProvider}

## Framework: ${agentFramework}

## Ferramentas: ${toolsList}

## Servidores MCP: ${mcpServersList}

## Código Python completo aqui

    {/* Onboarding Overlay */}
    `;
    }
      // Only Claude is functional - others trigger demo mode
      if (agentProvider !== 'claude' && DemoMode.isActive) {
        const demoResult = DemoMode.handleDemoCall(agentProvider);
        setGeneratedPrompt(`# 🎪 Demo Mode\n\n${demoResult.message}\n\n**ETA:** ${demoResult.eta}\n\n---\n\n*Configurações salvas:*\n- Framework: ${agentFramework}\n- Provider: ${agentProvider}\n- Ferramentas: ${agentTools.join(', ') || 'Nenhuma'}\n- Servidores MCP: ${mcpServers.join(', ') || 'Nenhum'}\n\nEssas configurações serão aplicadas quando o provider estiver disponível!`);
        setIsGenerating(false);
        return;
      }

      // Real Claude API call
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: engineeringPrompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const result = data.content[0].text;

      setGeneratedPrompt(result);
    } catch (error) {
      console.error('Erro ao gerar:', error);
      setGeneratedPrompt(`Erro ao gerar o ${outputType === 'prompt' ? 'prompt' : 'agent'}. ${error.message}`);
    }

    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const handleFeatureClick = (feature) => {
    if (DemoMode.isActive && !DemoMode.features[feature]?.ready) {
      const demoResult = DemoMode.handleDemoCall(feature);
      alert(\`${demoResult.message}\n\nETA: ${demoResult.eta}\\`);
      return false;
    }
    return true;
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
    setCurrentStep(0);
  };

  const nextOnboardingStep = () => {
    if (currentStep < OnboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowOnboarding(false);
    }
  };

  const showEducation = (topic) => {
    setEducationalTopic(topic);
    setShowEducational(true);
  };

  const theme = {
    dark: {
      bg: 'bg-gray-900',
      cardBg: 'bg-gray-800',
      text: 'text-gray-100',
      textSecondary: 'text-gray-300',
      border: 'border-gray-700',
      input: 'bg-gray-700 border-gray-600 text-gray-100',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonSecondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
      accent: 'text-blue-400'
    },
    light: {
      bg: 'bg-gray-50',
      cardBg: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-300',
      input: 'bg-white border-gray-300 text-gray-900',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonSecondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
      accent: 'text-blue-600'
    }
  };

  const currentTheme = darkMode ? theme.dark : theme.light;

  return (
    <div className={\`min-h-screen ${currentTheme.bg} ${currentTheme.text} p-4 transition-colors duration-300\`}>
      <div className="max-w-7xl mx-auto">
        {/*Header*/}
        <div className="flex justify-between items-center mb-8" id="header">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className={currentTheme.accent}>Agent</span> & <span className={currentTheme.accent}>Prompt</span> Crafter
              <span className="text-lg ml-2 px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full">
                +MCP
              </span>
              {DemoMode.isActive && (
                <span className="text-xs ml-2 px-2 py-1 bg-blue-500 text-blue-100 rounded-full">
                  DEMO v1.0.0
                </span>
              )}
            </h1>
            <p className={currentTheme.textSecondary}>
              Crie prompts profissionais e agents inteligentes com Model Context Protocol
            </p>
          </div>
          <div className="flex items-center gap-4">
            {DemoMode.isActive && (
              <div className="flex gap-2">
                <button
                  onClick={startOnboarding}
                  className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <Play size={16} />
                  Tour
                </button>
                <button
                  onClick={() => showEducation('mcp')}
                  className="px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2 text-sm"
                >
                  <BookOpen size={16} />
                  O que é MCP?
                </button>
              </div>
            )}
            <select
              value="claude"
              className={\`px-3 py-2 rounded-lg ${currentTheme.input} border focus:ring-2 focus:ring-blue-500\`}
            >
              <option value="claude">Claude API ✅</option>
              <option disabled>Outros providers em breve...</option>
            </select>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={\`p-2 rounded-lg ${currentTheme.buttonSecondary} transition-colors\`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Onboarding Overlay */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className={`${currentTheme.cardBg} rounded-xl p-6 max-w-md border ${currentTheme.border} shadow-xl`}>
              <h3 className="text-xl font-bold mb-4">{OnboardingSteps[currentStep].title}</h3>
              <p className={`${currentTheme.textSecondary} mb-6`}>{OnboardingSteps[currentStep].content}</p>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  {currentStep + 1} de {OnboardingSteps.length}
                </span>
                <button
                  onClick={nextOnboardingStep}
                  className={`px-4 py-2 rounded-lg ${currentTheme.button}`}
                >
                  {currentStep < OnboardingSteps.length - 1 ? 'Próximo' : 'Finalizar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Educational Modal */}
        {showEducational && educationalTopic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className={`${currentTheme.cardBg} rounded-xl p-6 max-w-lg border ${currentTheme.border} shadow-xl`}>
              <h3 className="text-xl font-bold mb-4">{DemoMode.education[educationalTopic].title}</h3>
              <p className={`${currentTheme.textSecondary} mb-4`}>{DemoMode.education[educationalTopic].description}</p>
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Benefícios:</h4>
                <ul className="space-y-1">
                  {DemoMode.education[educationalTopic].benefits.map((benefit, index) => (
                    <li key={index} className={currentTheme.textSecondary}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setShowEducational(false)}
                className={`px-4 py-2 rounded-lg ${currentTheme.button} w-full`}
              >
                Entendi!
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className={`${currentTheme.cardBg} rounded-xl p-6 border ${currentTheme.border} shadow-lg`} id="ideas-input">
            <h2 className="text-xl font-semibold mb-4">📝 Adicionar Ideias</h2>
            <div className="space-y-4">
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Cole suas notas, ideias brutas ou pensamentos desorganizados aqui..."
                className={`w-full h-32 px-4 py-3 rounded-lg border ${currentTheme.input} focus:ring-2 focus:ring-blue-500 resize-none`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    addIdea();
                  }
                }}
              />
              <button
                onClick={addIdea}
                disabled={!currentInput.trim()}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${currentTheme.button} disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
              >
                <Plus size={20} />
                Incluir (Ctrl+Enter)
              </button>
            </div>

            {/* Configuration */}
            <div className="mt-6 space-y-4">
              <div id="output-selector">
                <label className="block text-sm font-medium mb-2">Tipo de Saída</label>
                <div className="flex gap-2">
                  {[
                    { value: 'prompt', label: '📝 Prompt', icon: '📝' },
                    { value: 'agent', label: '🤖 Agent', icon: '🤖' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setOutputType(option.value)}
                      className={`flex-1 px-4 py-3 rounded-lg text-sm border transition-all ${
                        outputType === option.value
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                          : `${currentTheme.buttonSecondary} ${currentTheme.border}`
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{option.icon}</div>
                        <div>{option.label.split(' ')[1]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {outputType === 'agent' && (
                <div className="space-y-4 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5" id="mcp-section">
                  <div>
                    <label className="block text-sm font-medium mb-2">Framework do Agent</label>
                    <select
                      value={agentFramework}
                      onChange={(e) => setAgentFramework(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${currentTheme.input} focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="crewai">{DemoMode.getLabel('crewai', 'CrewAI')}</option>
                      <option value="autogen">{DemoMode.getLabel('autogen', 'AutoGen')}</option>
                      <option value="langchain">{DemoMode.getLabel('langchain', 'LangChain Agents')}</option>
                      <option value="semantic-kernel">{DemoMode.getLabel('semantic-kernel', 'Semantic Kernel')}</option>
                      <option value="custom">{DemoMode.getLabel('custom', 'Agent Customizado')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      🤖 Provider LLM
                      {DemoMode.isActive && (
                        <button
                          onClick={() => showEducation('agents')}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Info size={16} />
                        </button>
                      )}
                    </label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {DemoMode.mcpServices.availableServers.map((server) => (
                          <button
                            key={server.name}
                            onClick={() => {
                              if (DemoMode.isActive) {
                                const demoResult = DemoMode.handleDemoCall('mcp_real');
                                alert(`🔌 ${server.desc}\n\n${demoResult.message}\n\nETA: ${demoResult.eta}`);
                                return;
                              }
                              setMcpServers(prev =>
                                prev.includes(server.name)
                                  ? prev.filter(s => s !== server.name)
                                  : [...prev, server.name]
                              );
                            }}
                            className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                              mcpServers.includes(server.name)
                                ? 'bg-purple-600 text-white border-purple-600'
                                : `${currentTheme.buttonSecondary} ${currentTheme.border}`
                            }`}
                            title={`${server.desc} (${server.status})`}
                          >
                            {server.desc} {server.status === 'demo' ? '🎪' : '✅'}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customMcpServer}
                          onChange={(e) => setCustomMcpServer(e.target.value)}
                          placeholder="Servidor MCP customizado (ex: meu-servidor-personalizado)"
                          className={`flex-1 px-3 py-2 rounded-lg border ${currentTheme.input} focus:ring-2 focus:ring-blue-500 text-xs`}
                        />
                        <button
                          onClick={() => {
                            if (customMcpServer.trim()) {
                              if (DemoMode.isActive) {
                                const demoResult = DemoMode.handleDemoCall('mcp_real');
                                alert(`🔌 Servidor MCP Customizado\n\n${demoResult.message}\n\nETA: ${demoResult.eta}`);
                                return;
                              }
                              setMcpServers(prev => [...prev, customMcpServer.trim()]);
                              setCustomMcpServer('');
                            }
                          }}
                          className={`px-3 py-2 rounded-lg ${currentTheme.buttonSecondary} text-xs`}
                        >
                          + Adicionar 🎪
                        </button>
                      </div>

                      {mcpServers.length > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <p className="text-xs font-medium text-purple-800 dark:text-purple-200 mb-2">
                            Servidores MCP selecionados:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {mcpServers.map((server) => (
                              <span
                                key={server}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-full text-xs"
                              >
                                {server} 🎪
                                <button
                                  onClick={() => setMcpServers(prev => prev.filter(s => s !== server))}
                                  className="hover:bg-purple-700 rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  {outputType === 'prompt' ? 'Propósito do Prompt' : 'Área de Atuação do Agent'}
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    {(outputType === 'prompt'
                      ? ['Código', 'Imagem', 'Análise', 'Escrita', 'Outros']
                      : ['Automação', 'Análise', 'Suporte', 'Pesquisa', 'Outros']
                    ).map((option) => (
                      <button
                        key={option}
                        onClick={() => setPurpose(option)}
                        className={`+"`"+`px-3 py-2 rounded-lg text-sm border transition-colors ${
                          purpose === option
                            ? 'bg-blue-600 text-white border-blue-600'
                            : `${currentTheme.buttonSecondary} ${currentTheme.border}`
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {purpose === 'Outros' && (
                    <input
                      type="text"
                      value={customPurpose}
                      onChange={(e) => setCustomPurpose(e.target.value)}
                      placeholder={outputType === 'prompt'
                        ? "Descreva o objetivo do prompt..."
                        : "Descreva a área de atuação do agent..."
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${currentTheme.input} focus:ring-2 focus:ring-blue-500`}
                    />
                  )}
                </div>
              </div>

              {outputType === 'prompt' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tamanho Máximo: {maxLength.toLocaleString()} caracteres
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="130000"
                    step="500"
                    value={maxLength}
                    onChange={(e) => setMaxLength(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Ideas List */}
          <div className={`${currentTheme.cardBg} rounded-xl p-6 border ${currentTheme.border} shadow-lg`}>
            <h2 className="text-xl font-semibold mb-4">💡 Suas Ideias ({ideas.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ideas.length === 0 ? (
                <p className={`${currentTheme.textSecondary} text-center py-8`}>
                  Adicione suas primeiras ideias ao lado ←
                </p>
              ) : (
                ideas.map((idea) => (
                  <div key={idea.id} className={`p-3 rounded-lg border ${currentTheme.border} bg-opacity-50`}>
                    {editingId === idea.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className={`w-full px-2 py-1 rounded border ${currentTheme.input} text-sm`}
                          rows="2"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={saveEdit}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className={`px-2 py-1 rounded text-xs ${currentTheme.buttonSecondary}`}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm mb-2">{idea.text}</p>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => startEditing(idea.id, idea.text)}
                            className={`p-1 rounded ${currentTheme.buttonSecondary} hover:bg-opacity-80`}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => removeIdea(idea.id)}
                            className="p-1 rounded bg-red-600 text-white hover:bg-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {ideas.length > 0 && (
              <button
                onClick={generatePrompt}
                disabled={isGenerating}
                className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r ${
                  outputType === 'prompt'
                    ? 'from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    : 'from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                } text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105`}
              >
                <Wand2 size={20} className={isGenerating ? 'animate-spin' : ''} />
                {isGenerating
                  ? `Gerando ${outputType === 'prompt' ? 'prompt' : 'agent'}...`
                  : `Criar ${outputType === 'prompt' ? 'Prompt' : 'Agent'} 🚀`
                }
              </button>
            )}
          </div>

          {/* Generated Prompt */}
          <div className={`${currentTheme.cardBg} rounded-xl p-6 border ${currentTheme.border} shadow-lg ${generatedPrompt ? 'lg:col-span-1' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {outputType === 'prompt' ? '🚀 Prompt Estruturado' : '🤖 Agent Gerado'}
              </h2>
              {generatedPrompt && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    outputType === 'prompt'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {outputType === 'prompt' ? 'Prompt' : agentFramework} {DemoMode.isActive ? '🎪' : ''}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentTheme.buttonSecondary} hover:bg-opacity-80 transition-colors`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              )}
            </div>

            {generatedPrompt ? (
              <div className="space-y-4">
                <div className={`text-xs ${currentTheme.textSecondary} flex justify-between items-center`}>
                  <span>Caracteres: {generatedPrompt.length.toLocaleString()}</span>
                  <div className="flex items-center gap-4">
                    {outputType === 'agent' && (
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                        {agentFramework} + {agentProvider} + MCP
                      </span>
                    )}
                    {outputType === 'prompt' && (
                      <span>Limite: {maxLength.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className={`max-h-96 overflow-y-auto p-4 rounded-lg border ${currentTheme.border} bg-opacity-50`}>
                  <pre className="whitespace-pre-wrap text-sm font-mono">{generatedPrompt}</pre>
                </div>

                {outputType === 'agent' && (
                  <div className={`p-3 rounded-lg border ${currentTheme.border} bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20`}>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      🚀 <strong>Agent Avançado:</strong> Integração com {agentProvider} + MCP
                      {mcpServers.length > 0 && (
                        <span className="block mt-1">
                          🔌 <strong>Servidores MCP:</strong> {mcpServers.slice(0, 3).join(', ')}
                          {mcpServers.length > 3 && ` +${mcpServers.length - 3} mais`}
                        </span>
                      )}
                      {DemoMode.isActive && (
                        <span className="block mt-1 text-blue-700 dark:text-blue-300">
                          🎪 <strong>Demo:</strong> Código gerado, MCP em breve na versão completa
                        </span>
                      )}
                    </p>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                        pip install crewai mcp anthropic
                        {agentProvider === 'claude' && ' anthropic-mcp'}
                        {agentProvider === 'gemini' && ' google-generativeai'}
                        {agentProvider === 'copilot' && ' github-copilot-api'}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`${currentTheme.textSecondary} text-center py-12`}>
                {outputType === 'prompt' ? (
                  <>
                    <Wand2 size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Seu prompt estruturado aparecerá aqui</p>
                    <p className="text-sm mt-2">Adicione ideias e clique em "Criar Prompt 🚀"</p>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-4">🤖</div>
                    <p>Seu agent será gerado aqui</p>
                    <p className="text-sm mt-2">Configure o agent e clique em "Criar Agent 🚀"</p>
                    {DemoMode.isActive && (
                      <p className="text-xs mt-4 text-blue-600 dark:text-blue-400">
                        🎪 Versão Demo: Gera código, versão completa executa agents
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Demo Status Footer - Only in Development */}
        {DemoMode.isActive && (
          <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎪</span>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Versão Demo - Powered by Grompt Engine
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">✅ Funcionais:</h4>
                    <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Claude API</li>
                      <li>• Interface React</li>
                      <li>• Geração de código</li>
                      <li>• Engine Grompt</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">🎪 Em Breve:</h4>
                    <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Ollama Local</li>
                      <li>• Servidores MCP</li>
                      <li>• Multi-Providers</li>
                      <li>• Execução de Agents</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">🏗️ Arquitetura:</h4>
                    <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• DemoMode System</li>
                      <li>• Single Source Truth</li>
                      <li>• Onboarding Ready</li>
                      <li>• Grompt Backend</li>
                    </ul>
                  </div>
                  <div>
                    <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Grompt CLI v2.0</li>
                      <li>• Kubex Ecosystem</li>
                      <li>• No Lock-in</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    💡 <strong>Inspirado no Grompt:</strong> Esta interface web é uma evolução do Grompt CLI.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-200 dark:bg-blue-700 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                      CLI: grompt generate --ideas "..." --provider claude
                    </span>
                    <span className="bg-purple-200 dark:bg-purple-700 px-2 py-1 rounded text-purple-800 dark:text-purple-200">
                      Web: Mesmo poder, interface visual
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

                        ## Exportação do Componente

                        export default PromptCrafter;
                        <button>
                          <Info size={16} />
                        </button>
                      )}
                    </label>
                    <select
                      value={agentProvider}
                      onChange={(e) => {
                        if (e.target.value !== 'claude' && DemoMode.isActive) {
                          handleFeatureClick(e.target.value);
                          return;
                        }
                        setAgentProvider(e.target.value);
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${currentTheme.input} focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="claude">🎭 Claude (Anthropic) ✅</option>
                      <option value="codex">{DemoMode.getLabel('openai', '💻 Codex (OpenAI)')}</option>
                      <option value="gpt4">{DemoMode.getLabel('openai', '🧠 GPT-4 (OpenAI)')}</option>
                      <option value="gemini">{DemoMode.getLabel('gemini', '💎 Gemini (Google)')}</option>
                      <option value="copilot">{DemoMode.getLabel('copilot', '🚁 GitHub Copilot')}</option>
                      <option value="ollama">{DemoMode.getLabel('ollama', '🦙 Ollama (Local)')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Papel do Agent</label>
                    <input
                      type="text"
                      value={agentRole}
                      onChange={(e) => setAgentRole(e.target.value)}
                      placeholder="Ex: Especialista em Marketing Digital, Analista de Dados..."
                      className={`w-full px-3 py-2 rounded-lg border ${currentTheme.input} focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">🔧 Ferramentas Tradicionais</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {['web_search', 'file_handler', 'calculator', 'email_sender', 'database', 'api_caller', 'code_executor', 'image_generator'].map((tool) => (
                        <button
                          key={tool}
                          onClick={() => {
                            setAgentTools(prev =>
                              prev.includes(tool)
                                ? prev.filter(t => t !== tool)
                                : [...prev, tool]
                            );
                          }}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            agentTools.includes(tool)
                              ? 'bg-green-600 text-white border-green-600'
                              : `${currentTheme.buttonSecondary} ${currentTheme.border}`
                          }`}
                        >
                          {tool}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-blue-500/20 pt-4">
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      🔌 Servidores MCP (Model Context Protocol)
                      {DemoMode.isActive && (
                        <button
                          onClick={() => showEducation('mcp')}
                          className="text-blue-500
