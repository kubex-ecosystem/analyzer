import * as React from 'react';

import { Chat } from '@google/genai';
import { useCallback, useMemo, useState } from 'react';

// Contexts & Hooks
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { ProjectProvider, useProjectContext } from './contexts/ProjectContext';
import { usePersistentState } from './hooks/usePersistentState';
import { useTranslation } from './hooks/useTranslation';

// Components
import EvolutionDisplay from './components/analysis/EvolutionDisplay';
import SuggestionsDisplay from './components/analysis/SuggestionsDisplay';
import ChatPanel from './components/chat/ChatPanel';
import ConfirmationModal from './components/common/ConfirmationModal';
import Loader from './components/common/Loader';
import NetworkStatusIndicator from './components/common/NetworkStatusIndicator';
import NotificationContainer from './components/common/NotificationContainer';
import Dashboard from './components/dashboard/Dashboard';
import HistoryPanel from './components/history/HistoryPanel';
import ProjectInput from './components/input/ProjectInput';
import KanbanBoard from './components/kanban/KanbanBoard';
import LandingPage from './components/landing/LandingPage';
import Header from './components/layout/Header';
import NavigationBar from './components/layout/NavigationBar';
import UserSettingsModal from './components/settings/UserSettingsModal';

// Services & Data
// NEW: Unified AI Service - supports both direct Gemini and Gateway
import { AIProvider, AIService } from './services/unified-ai';

// Types
import {
  AllChatHistories,
  ChatMessage,
  KanbanState,
  ProjectAnalysis,
  ProjectFile,
  ViewType
} from './types';

import './index.css';

const createInitialKanbanState = (analysis: ProjectAnalysis): KanbanState => {
  const backlogCards = analysis.improvements.map((imp, index) => ({
    id: `card-${Date.now()}-${index}`,
    title: imp.title,
    description: imp.description,
    priority: imp.priority,
    difficulty: imp.difficulty,
    tags: [imp.priority],
    notes: '',
  }));

  return {
    projectName: analysis.projectName,
    columns: {
      backlog: { id: 'backlog', title: 'Backlog', cards: backlogCards },
      todo: { id: 'todo', title: 'To Do', cards: [] },
      inProgress: { id: 'inProgress', title: 'In Progress', cards: [] },
      done: { id: 'done', title: 'Done', cards: [] },
    },
  };
};

const parseContextToFiles = (context: string): ProjectFile[] => {
  if (!context) return [];
  // This regex captures filenames like "// / file.js / //"
  const fileRegex = /\/\/ \/ (.*?) \/ \/\//g;
  const parts = context.split(fileRegex);

  if (parts.length <= 1) {
    // No file markers found, treat the whole content as a single file
    return [{ id: Date.now(), name: 'project_context.txt', content: context.trim() }];
  }

  const files: ProjectFile[] = [];
  // Start at 1, because split result starts with content before first match
  // Increment by 2 to get pairs of [filename, content]
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].trim();
    const content = parts[i + 1]?.trim() || '';
    if (name) {
      files.push({ id: Date.now() + i, name, content });
    }
  }
  return files;
};

function DashboardWrapper() {
  const {
    view, setView,
    isLoading, setIsLoading,
    projectFiles, setProjectFiles,
    currentAnalysis,
    evolutionAnalysis,
    history,
    kanbanState, setKanbanState,
    settings, setSettings,
    userProfile, setUserProfile,
    usageTracking,
    isExample,
    selectedProject, setSelectedProject,
    isHistoryPanelOpen, setIsHistoryPanelOpen,
    isUserSettingsModalOpen, setIsUserSettingsModalOpen,
    deletingHistoryId,
    handleLoadHistoryItem,
    handleDeleteHistoryItem,
    handleClearHistory,
    handleCompare,
    handleAnalyze,
    handleShowExample,
    handleExitExample,
    handleNavigateToKanban
  } = useProjectContext();

  // AI Provider Selection State - NEW!
  const [aiProvider, setAiProvider] = usePersistentState<AIProvider>('aiProvider', 'gemini-direct');

  // AI Service Instance - NEW!
  const aiService = useMemo(() => new AIService({
    provider: aiProvider,
    userApiKey: settings.userApiKey,
    gatewayUrl: 'http://localhost:8080'
  }), [aiProvider, settings.userApiKey]);

  // Chat State - Updated to support unified interface
  const [chatSession, setChatSession] = useState<Chat | { sendMessage: (message: string) => Promise<string> } | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null);
  const [allChatHistories, setAllChatHistories] = usePersistentState<AllChatHistories>('allChatHistories', {});

  const chatHistory = useMemo(() => {
    return currentHistoryId ? allChatHistories[currentHistoryId] || [] : [];
  }, [allChatHistories, currentHistoryId]);

  const projectContext = useMemo(() => {
    if (projectFiles.length === 0) return '';
    return projectFiles
      .map(file => `// / ${file.name} / //\n${file.content}`)
      .join('\n\n---\n\n');
  }, [projectFiles]);

  const setChatHistoryForCurrentId = useCallback((updater: React.SetStateAction<ChatMessage[]>) => {
    if (!currentHistoryId) return;
    setAllChatHistories(prev => {
      const currentMessages = prev[currentHistoryId] || [];
      const newMessages = typeof updater === 'function' ? updater(currentMessages) : updater;
      return {
        ...prev,
        [currentHistoryId]: newMessages,
      };
    });
  }, [currentHistoryId, setAllChatHistories]);


  const { addNotification } = useNotification();
  const { locale } = useLanguage();
  const { t } = useTranslation(['common', 'input', 'example']);

  // VAMOS TRAZER DO CONTEXTO DO PROJETO

  const handleNavigate = (targetView: ViewType | 'history') => {
    if (targetView === 'history') {
      setIsHistoryPanelOpen(true);
    } else if (targetView === ViewType.Chat) {
      if (!currentAnalysis || !currentHistoryId) {
        addNotification({ message: t('notifications.noAnalysisForChat'), type: 'error' });
        return;
      }
      if (!chatSession) {
        const createSystemInstruction = (analysis: ProjectAnalysis): string => {
          const formatImprovements = (improvements: ProjectAnalysis['improvements']) =>
            improvements.map(imp => `- ${imp.title} (Priority: ${imp.priority}, Difficulty: ${imp.difficulty}): ${imp.description}`).join('\n');

          const formatNextSteps = (steps: ProjectAnalysis['nextSteps']['shortTerm']) =>
            steps.map(step => `- ${step.title} (Difficulty: ${step.difficulty}): ${step.description}`).join('\n');

          return `
You are a helpful and knowledgeable project assistant. Your purpose is to answer questions about a specific project analysis that has been performed.

Here is the full context of the project analysis you must use to answer all questions. Do not invent information outside of this context.

**Project Name:** ${analysis.projectName}
**Analysis Type:** ${analysis.analysisType}

**Executive Summary:**
${analysis.summary}

**Key Strengths:**
${analysis.strengths.map(s => `- ${s}`).join('\n')}

**Suggested Improvements:**
${formatImprovements(analysis.improvements)}

**Next Steps:**
  **Short-Term:**
  ${formatNextSteps(analysis.nextSteps.shortTerm)}

  **Long-Term:**
  ${formatNextSteps(analysis.nextSteps.longTerm)}

**Viability Assessment:**
- **Score:** ${analysis.viability.score}/10
- **Assessment:** ${analysis.viability.assessment}

**Return on Investment (ROI) Analysis:**
- **Assessment:** ${analysis.roiAnalysis.assessment}
- **Potential Gains:**
${analysis.roiAnalysis.potentialGains.map(g => `  - ${g}`).join('\n')}
- **Estimated Effort:** ${analysis.roiAnalysis.estimatedEffort}

**Project Maturity:**
- **Level:** ${analysis.maturity.level}
- **Assessment:** ${analysis.maturity.assessment}

Based *only* on the information provided above, please answer the user's questions about the project "${analysis.projectName}". Be concise and direct.
                    `.trim();
        };

        const systemInstruction = createSystemInstruction(currentAnalysis);
        const newChat = aiService.createChatSession(systemInstruction);
        setChatSession(newChat);
      }
      setView(ViewType.Chat);
    } else {
      setView(targetView);
    }
  };


  const handleSendChatMessage = async (message: string) => {
    if (!chatSession || isChatLoading || !currentHistoryId) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    setChatHistoryForCurrentId(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      // Check if it's the old Gemini Chat with streaming
      if ('sendMessageStream' in chatSession) {
        const stream = await chatSession.sendMessageStream({ message });
        let modelResponse = '';

        // Add an empty placeholder for the model's response
        setChatHistoryForCurrentId(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

        for await (const chunk of stream) {
          modelResponse += chunk.text;
          setChatHistoryForCurrentId(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: modelResponse }] };
            return newHistory;
          });
        }
      } else {
        // New unified interface - simple sendMessage
        const response = await chatSession.sendMessage(message);
        setChatHistoryForCurrentId(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
      }
    } catch (error: any) {
      addNotification({ message: error.message || t('notifications.chatError'), type: 'error' });
      // Remove user message and empty model message on error
      setChatHistoryForCurrentId(prev => prev.slice(0, -2));
    } finally {
      setIsChatLoading(false);
    }
  };

  const renderContent = () => {
    switch (view) {
      case ViewType.Dashboard:
        return <Dashboard
          history={history}
          usageTracking={usageTracking}
          onNavigate={handleNavigate}
          onLoadHistoryItem={handleLoadHistoryItem}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          isExample={isExample}
          showEmptyState={history.length === 0 && !isExample}
        />;
      case ViewType.Input:
        return <ProjectInput />;
      case ViewType.Analysis:
        if (currentAnalysis) {
          return <SuggestionsDisplay
            analysis={currentAnalysis}
            isExample={isExample}
            history={history}
            onNavigateToKanban={handleNavigateToKanban}
            onExitExample={handleExitExample}
            kanbanState={kanbanState}
          />;
        }
        return null;
      case ViewType.Evolution:
        if (evolutionAnalysis) {
          return <EvolutionDisplay analysis={evolutionAnalysis} onNavigate={setView} />;
        }
        return null;
      case ViewType.Kanban:
        if (kanbanState) {
          return <KanbanBoard initialState={kanbanState} onStateChange={setKanbanState} isExample={isExample} />;
        }
        return null;
      case ViewType.Chat:
        return <ChatPanel />;
      default:
        return <Dashboard history={history} usageTracking={usageTracking} onNavigate={handleNavigate} onLoadHistoryItem={handleLoadHistoryItem} selectedProject={selectedProject} onSelectProject={setSelectedProject} isExample={isExample} showEmptyState={history.length === 0 && !isExample} />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans selection:bg-purple-500/30">
      <div className="fixed top-0 left-0 w-full h-full bg-grid-gray-700/[0.05] -z-10"></div>
      {isLoading && <Loader />}

      <Header
        onProviderChange={setAiProvider}
        currentProvider={aiProvider}
        onUserMenuClick={() => setIsUserSettingsModalOpen(true)}
        onHistoryClick={() => setIsHistoryPanelOpen(true)}
        historyCount={history.length}
        userProfile={userProfile}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NavigationBar
          currentView={view}
          onNavigate={handleNavigate as (v: ViewType) => void}
          hasAnalysis={!!currentAnalysis}
          isAnalysisOpen={!currentAnalysis}
        />
        <div className="mt-8">
          {renderContent()}
        </div>
      </main>

      <HistoryPanel />

      <UserSettingsModal
        isOpen={isUserSettingsModalOpen}
        onClose={() => setIsUserSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        profile={userProfile}
        onSaveProfile={setUserProfile}
        isExample={isExample}
      />

      <ConfirmationModal />
      <NotificationContainer />
      <NetworkStatusIndicator />
    </div>
  );
}

const App: React.FC = () => (
  <LanguageProvider>
    <NotificationProvider>
      <AuthProvider>
        <ConfirmationProvider>
          <AppProvider>
            <ProjectProvider>
              <MainApp />
            </ProjectProvider>
          </AppProvider>
        </ConfirmationProvider>
      </AuthProvider>
    </NotificationProvider>
  </LanguageProvider>
);

const MainApp: React.FC = () => {
  const { user } = useAuth();

  // A little trick to use hooks from LanguageProvider
  const { translations } = useLanguage();

  if (!user) {
    // Render landing page only after essential translations are loaded
    return Object.keys(translations).length > 0 ? <LandingPage /> : null;
  }
  return <DashboardWrapper />;
};

export default App;
