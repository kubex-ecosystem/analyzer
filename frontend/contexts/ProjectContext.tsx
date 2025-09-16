import { Chat } from '@google/genai';
import * as React from 'react';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { defaultSettings, defaultUserProfile, initialProjectContext } from '../constants';
import { exampleAnalysis, exampleHistory } from '../data/exampleAnalysis';
import { usePersistentState } from '../hooks/usePersistentState';
import { useTranslation } from '../hooks/useTranslation';
import { analyzeProject, compareAnalyses, createChatSession, generateDashboardInsight, generateSuggestedQuestions } from '../services/gemini';
import {
  AllChatHistories,
  AnalysisType,
  AppSettings,
  ChatMessage,
  DashboardInsight,
  EvolutionAnalysis, HistoryItem, KanbanState,
  ProjectAnalysis,
  ProjectFile,
  UsageTracking, UserProfile,
  ViewType
} from '../types';
import { useLanguage } from './LanguageContext';
import { useNotification } from './NotificationContext';

// Helper functions
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
  const fileRegex = /\/\/ \/ (.*?) \/ \/\//g;
  const parts = context.split(fileRegex);
  if (parts.length <= 1) {
    return [{ id: Date.now(), name: 'project_context.txt', content: context.trim() }];
  }
  const files: ProjectFile[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].trim();
    const content = parts[i + 1]?.trim() || '';
    if (name) files.push({ id: Date.now() + i, name, content });
  }
  return files;
};

// State backup type for example mode
interface PreExampleState {
  history: HistoryItem[];
  kanbanState: KanbanState | null;
  projectFiles: ProjectFile[];
}


// Context Types
interface ProjectContextType {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isChatLoading: boolean;
  projectFiles: ProjectFile[];
  setProjectFiles: React.Dispatch<React.SetStateAction<ProjectFile[]>>;
  currentAnalysis: ProjectAnalysis | null;
  evolutionAnalysis: EvolutionAnalysis | null;
  history: HistoryItem[];
  kanbanState: KanbanState | null;
  setKanbanState: React.Dispatch<React.SetStateAction<KanbanState | null>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  usageTracking: UsageTracking;
  isExample: boolean;
  selectedProject: string | null;
  setSelectedProject: React.Dispatch<React.SetStateAction<string | null>>;
  deletingHistoryId: number | null;
  isHistoryPanelOpen: boolean;
  setIsHistoryPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUserSettingsModalOpen: boolean;
  setIsUserSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatHistory: ChatMessage[];
  suggestedQuestions: string[];
  isSuggestionsLoading: boolean;
  dashboardInsight: DashboardInsight | null;
  isInsightLoading: boolean;
  view: ViewType;
  setView: React.Dispatch<React.SetStateAction<ViewType>>;
  handleAnalyze: (analysisType: AnalysisType) => Promise<ProjectAnalysis | void>;
  handleCompare: (ids: number[]) => Promise<EvolutionAnalysis | void>;
  handleShowExample: () => void;
  handleExitExample: () => void;
  handleLoadHistoryItem: (item: HistoryItem) => void;
  handleDeleteHistoryItem: (id: number) => void;
  handleClearHistory: () => void;
  handleSendChatMessage: (message: string) => Promise<void>;
  handleNavigateToKanban: () => void;
  handleImportAnalysis: (analysis: ProjectAnalysis) => void;
  fetchDashboardInsight: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectFiles, setProjectFiles] = usePersistentState<ProjectFile[]>('projectFiles', []);
  const [currentAnalysis, setCurrentAnalysis] = useState<ProjectAnalysis | null>(null);
  const [evolutionAnalysis, setEvolutionAnalysis] = useState<EvolutionAnalysis | null>(null);
  const [history, setHistory] = usePersistentState<HistoryItem[]>('analysisHistory', []);
  const [kanbanState, setKanbanState] = usePersistentState<KanbanState | null>('kanbanState', null);
  const [settings, setSettings] = usePersistentState<AppSettings>('appSettings', defaultSettings);
  const [userProfile, setUserProfile] = usePersistentState<UserProfile>('userProfile', defaultUserProfile);
  const [usageTracking, setUsageTracking] = usePersistentState<UsageTracking>('usageTracking', { totalTokens: 0, monthlyTokens: 0 });
  const [isExample, setIsExample] = useState(false);
  const [preExampleState, setPreExampleState] = useState<PreExampleState | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isUserSettingsModalOpen, setIsUserSettingsModalOpen] = useState(false);
  const [deletingHistoryId, setDeletingHistoryId] = useState<number | null>(null);
  const [view, setView] = useState<ViewType>(ViewType.Dashboard);

  // Chat State
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null);
  const [allChatHistories, setAllChatHistories] = usePersistentState<AllChatHistories>('allChatHistories', {});
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  // Dashboard State
  const [dashboardInsight, setDashboardInsight] = useState<DashboardInsight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  const chatHistory = useMemo(() => currentHistoryId ? allChatHistories[currentHistoryId] || [] : [], [allChatHistories, currentHistoryId]);
  const projectContext = useMemo(() => projectFiles.map(file => `// / ${file.name} / //\n${file.content}`).join('\n\n---\n\n'), [projectFiles]);

  const { addNotification } = useNotification();
  const { locale } = useLanguage();
  const { t } = useTranslation(['common', 'input', 'example', 'notifications', 'analysis']);

  const setChatHistoryForCurrentId = useCallback((updater: React.SetStateAction<ChatMessage[]>) => {
    if (!currentHistoryId) return;
    setAllChatHistories(prev => {
      const currentMessages = prev[currentHistoryId] || [];
      const newMessages = typeof updater === 'function' ? updater(currentMessages) : updater;
      return { ...prev, [currentHistoryId]: newMessages };
    });
  }, [currentHistoryId, setAllChatHistories]);

  const fetchSuggestedQuestions = useCallback(async (analysis: ProjectAnalysis) => {
    if (!analysis) return;
    setIsSuggestionsLoading(true);
    setSuggestedQuestions([]);
    try {
      const questions = await generateSuggestedQuestions(analysis, locale, settings.userApiKey);
      setSuggestedQuestions(questions);
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, [locale, settings.userApiKey]);

  const fetchDashboardInsight = useCallback(async () => {
    if (history.length < 3 || isInsightLoading) return;
    setIsInsightLoading(true);
    try {
      const insight = await generateDashboardInsight(history, userProfile, locale, settings.userApiKey);
      setDashboardInsight(insight);
    } finally {
      setIsInsightLoading(false);
    }
  }, [history, userProfile, locale, settings.userApiKey, isInsightLoading]);

  const handleAnalyze = useCallback(async (analysisType: AnalysisType) => {
    if (projectFiles.length === 0) {
      addNotification({ message: t('notifications.emptyContext'), type: 'error' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await analyzeProject(projectContext, analysisType, locale, settings.userApiKey);
      const newId = Date.now();
      const newHistoryItem: HistoryItem = { id: newId, projectName: result.projectName, analysisType: result.analysisType, timestamp: new Date().toLocaleString(locale), analysis: result, projectContext };
      setCurrentAnalysis(result);
      setCurrentHistoryId(newId);
      if (settings.saveHistory) setHistory(prev => [...prev, newHistoryItem]);
      if (result.usageMetadata) setUsageTracking(prev => ({ ...prev, totalTokens: prev.totalTokens + result.usageMetadata!.totalTokenCount }));
      setIsExample(false);
      setView(ViewType.Analysis);
      fetchSuggestedQuestions(result);
      return result; // To allow setting view in caller
    } catch (error: any) {
      addNotification({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [projectContext, locale, settings.userApiKey, settings.saveHistory, addNotification, setHistory, setUsageTracking, t, fetchSuggestedQuestions]);

  const handleCompare = useCallback(async (ids: number[]) => {
    if (ids.length !== 2) {
      addNotification({ message: t('notifications.selectTwo'), type: 'error' });
      return;
    }
    const itemsToCompare = history.filter(h => ids.includes(h.id));
    if (itemsToCompare.length !== 2) return;

    setIsLoading(true);
    setIsHistoryPanelOpen(false);
    try {
      const [item1, item2] = itemsToCompare;
      const result = await compareAnalyses(item1, item2, locale, settings.userApiKey);
      setEvolutionAnalysis(result);
      if (result.usageMetadata) setUsageTracking(prev => ({ ...prev, totalTokens: prev.totalTokens + result.usageMetadata!.totalTokenCount }));
      setView(ViewType.Evolution);
      return result;
    } catch (error: any) {
      addNotification({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [history, locale, settings.userApiKey, addNotification, setUsageTracking]);

  const handleShowExample = () => {
    // 1. Backup user's current state before loading the example.
    setPreExampleState({
      history: history,
      kanbanState: kanbanState,
      projectFiles: projectFiles,
    });

    // 2. Load example data into the state.
    setProjectFiles(parseContextToFiles(initialProjectContext));
    const example = exampleAnalysis(t as any);
    setCurrentAnalysis(example);
    setHistory(exampleHistory(t as any, locale));
    setKanbanState(createInitialKanbanState(example));
    setIsExample(true);
    setView(ViewType.Analysis);
    addNotification({ message: t('notifications.exampleLoaded'), type: 'info' });
    fetchSuggestedQuestions(example);
  };

  const handleExitExample = () => {
    setIsExample(false);
    setCurrentAnalysis(null);
    setCurrentHistoryId(null);
    setSuggestedQuestions([]);

    // Restore the user's state from the backup.
    if (preExampleState) {
      setHistory(preExampleState.history);
      setKanbanState(preExampleState.kanbanState);
      setProjectFiles(preExampleState.projectFiles);
      setPreExampleState(null); // Clear the backup.
    } else {
      // Fallback just in case, though this path shouldn't be taken in normal flow.
      setHistory([]);
      setKanbanState(null);
      setProjectFiles([]);
    }

    setView(ViewType.Input);
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setProjectFiles(parseContextToFiles(item.projectContext));
    setCurrentAnalysis(item.analysis);
    setCurrentHistoryId(item.id);
    setIsHistoryPanelOpen(false);
    setIsExample(false);
    setChatSession(null);
    setSuggestedQuestions([]);
    setView(ViewType.Analysis);
    fetchSuggestedQuestions(item.analysis);
  };

  const handleDeleteHistoryItem = (id: number) => {
    setDeletingHistoryId(id);
    setTimeout(() => {
      setHistory(prev => prev.filter(item => item.id !== id));
      setAllChatHistories(prev => {
        const newHistories = { ...prev };
        delete newHistories[id];
        return newHistories;
      });
      setDeletingHistoryId(null);
    }, 500);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setAllChatHistories({});
  };

  const handleSendChatMessage = useCallback(async (message: string) => {
    if (!currentAnalysis || !currentHistoryId) {
      addNotification({ message: t('notifications.noAnalysisForChat'), type: 'error' });
      return;
    }

    let session = chatSession;
    if (!session) {
      const createSystemInstruction = (analysis: ProjectAnalysis): string => {
        const formatImprovements = (improvements: ProjectAnalysis['improvements']) =>
          improvements.map(imp => `- ${imp.title} (Priority: ${imp.priority}, Difficulty: ${imp.difficulty}): ${imp.description}`).join('\n');
        const formatNextSteps = (steps: ProjectAnalysis['nextSteps']['shortTerm']) =>
          steps.map(step => `- ${step.title} (Difficulty: ${step.difficulty}): ${step.description}`).join('\n');
        return `You are a helpful and knowledgeable project assistant. Your purpose is to answer questions about a specific project analysis that has been performed. Here is the full context of the project analysis you must use to answer all questions. Do not invent information outside of this context. **Project Name:** ${analysis.projectName}. **Analysis Type:** ${analysis.analysisType}. **Executive Summary:** ${analysis.summary}. **Key Strengths:** ${analysis.strengths.map(s => `- ${s}`).join('\n')}. **Suggested Improvements:** ${formatImprovements(analysis.improvements)}. **Next Steps:** Short-Term: ${formatNextSteps(analysis.nextSteps.shortTerm)}, Long-Term: ${formatNextSteps(analysis.nextSteps.longTerm)}. **Viability Assessment:** Score: ${analysis.viability.score}/10, Assessment: ${analysis.viability.assessment}. **ROI Analysis:** Assessment: ${analysis.roiAnalysis.assessment}, Potential Gains: ${analysis.roiAnalysis.potentialGains.map(g => `  - ${g}`).join('\n')}, Estimated Effort: ${analysis.roiAnalysis.estimatedEffort}. **Project Maturity:** Level: ${analysis.maturity.level}, Assessment: ${analysis.maturity.assessment}. Based *only* on the information provided above, please answer the user's questions about the project "${analysis.projectName}". Be concise and direct.`.trim();
      };
      const systemInstruction = createSystemInstruction(currentAnalysis);
      session = createChatSession(systemInstruction, settings.userApiKey);
      setChatSession(session);
    }

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    setChatHistoryForCurrentId(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const stream = await session.sendMessageStream({ message });
      let modelResponse = '';
      setChatHistoryForCurrentId(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);
      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setChatHistoryForCurrentId(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: modelResponse }] };
          return newHistory;
        });
      }
    } catch (error: any) {
      addNotification({ message: error.message || t('notifications.chatError'), type: 'error' });
      setChatHistoryForCurrentId(prev => prev.slice(0, -1));
    } finally {
      setIsChatLoading(false);
    }
  }, [chatSession, currentAnalysis, currentHistoryId, settings.userApiKey, addNotification, setChatHistoryForCurrentId, t]);

  const handleNavigateToKanban = () => {
    if (currentAnalysis) {
      if (isExample) {
        setView(ViewType.Kanban);
        return;
      }
      if (kanbanState && kanbanState.projectName === currentAnalysis.projectName) {
        setView(ViewType.Kanban);
      } else {
        setKanbanState(createInitialKanbanState(currentAnalysis));
        setView(ViewType.Kanban);
      }
    }
  };

  const handleImportAnalysis = (analysis: ProjectAnalysis) => {
    // Debug: Ensure enum values are properly formatted
    const sanitizeEnumValue = (value: any) => {
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && value !== null) {
        // If we receive an enum object, get the first value
        const keys = Object.keys(value);
        return keys.length > 0 ? value[keys[0]] : 'Medium';
      }
      return 'Medium'; // Default fallback
    };

    // Sanitize the analysis object
    const sanitizedAnalysis = {
      ...analysis,
      improvements: analysis.improvements?.map(imp => ({
        ...imp,
        priority: sanitizeEnumValue(imp.priority),
        difficulty: sanitizeEnumValue(imp.difficulty)
      })) || [],
      nextSteps: {
        ...analysis.nextSteps,
        shortTerm: analysis.nextSteps?.shortTerm?.map(step => ({
          ...step,
          difficulty: sanitizeEnumValue(step.difficulty)
        })) || [],
        longTerm: analysis.nextSteps?.longTerm?.map(step => ({
          ...step,
          difficulty: sanitizeEnumValue(step.difficulty)
        })) || []
      }
    };

    const newId = Date.now();
    const newHistoryItem: HistoryItem = {
      id: newId,
      projectName: sanitizedAnalysis.projectName,
      analysisType: sanitizedAnalysis.analysisType,
      timestamp: new Date().toLocaleString(locale),
      analysis: sanitizedAnalysis,
      projectContext: `// Imported Analysis: ${sanitizedAnalysis.projectName} on ${new Date().toLocaleDateString(locale)}`
    };
    setHistory(prev => [...prev, newHistoryItem]);
    addNotification({ message: t('notifications.analysisImportSuccess', { projectName: sanitizedAnalysis.projectName }), type: 'success' });
  };

  const value = {
    isLoading, setIsLoading, isChatLoading, projectFiles, setProjectFiles, currentAnalysis, evolutionAnalysis, history, kanbanState, setKanbanState, settings, setSettings, userProfile, setUserProfile, usageTracking, isExample, selectedProject, setSelectedProject, deletingHistoryId, isHistoryPanelOpen, setIsHistoryPanelOpen, isUserSettingsModalOpen, setIsUserSettingsModalOpen, chatHistory, suggestedQuestions, isSuggestionsLoading, dashboardInsight, isInsightLoading, view, setView,
    handleAnalyze,
    handleCompare, handleShowExample, handleExitExample, handleLoadHistoryItem, handleDeleteHistoryItem, handleClearHistory, handleSendChatMessage, handleNavigateToKanban, handleImportAnalysis, fetchDashboardInsight,
  };

  return <ProjectContext.Provider value={value as ProjectContextType}>{children}</ProjectContext.Provider>;
};

export const useProjectContext = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjectContext must be used within a ProjectProvider');
  return context;
};
