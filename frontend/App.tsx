import { useCallback, useEffect, useState } from 'react';
import EvolutionDisplay from './components/analysis/EvolutionDisplay';
import SuggestionsDisplay from './components/analysis/SuggestionsDisplay';
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
import SettingsModal from './components/settings/SettingsModal';
import ProfileModal from './components/user/ProfileModal';
import { initialProjectContext } from './constants';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { useNotification } from './contexts/NotificationContext';
import { exampleAnalysis, exampleHistory } from './data/exampleAnalysis';
import { usePersistentState } from './hooks/usePersistentState';
import { useTranslation } from './hooks/useTranslation';
import { analyzeProject, compareAnalyses } from './services/gemini';
import {
  AnalysisType,
  AppSettings,
  AuthProvider,
  EvolutionAnalysis,
  HistoryItem,
  KanbanCardData,
  KanbanState,
  LanguageProvider,
  NotificationProvider,
  ProjectAnalysis,
  UsageTracking,
  UserProfile,
  ViewType,
} from './types';

const App: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { addNotification } = useNotification();

  // App State
  const [view, setView] = useState<ViewType>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [projectContext, setProjectContext] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<ProjectAnalysis | null>(null);
  const [evolutionAnalysis, setEvolutionAnalysis] = useState<EvolutionAnalysis | null>(null);
  const [isExample, setIsExample] = useState(false);

  // Persistent State
  const [history, setHistory] = usePersistentState<HistoryItem[]>('analysisHistory', []);
  const [settings, setSettings] = usePersistentState<AppSettings>('appSettings', { tokenLimit: 200000 });
  const [userProfile, setUserProfile] = usePersistentState<UserProfile>('userProfile', { name: '', apiKey: '' });
  const [usageTracking, setUsageTracking] = usePersistentState<UsageTracking>('usageTracking', {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    totalTokens: 0,
  });
  const [deletingHistoryId, setDeletingHistoryId] = useState<number | null>(null);

  // Modals and Panels
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Reset usage tracking if the month has changed
  useEffect(() => {
    const now = new Date();
    if (usageTracking.month !== now.getMonth() || usageTracking.year !== now.getFullYear()) {
      setUsageTracking({ month: now.getMonth(), year: now.getFullYear(), totalTokens: 0 });
    }
  }, [usageTracking, setUsageTracking]);

  const updateTokenUsage = useCallback((tokens: number) => {
    setUsageTracking(prev => ({ ...prev, totalTokens: prev.totalTokens + tokens }));
  }, [setUsageTracking]);

  const handleAnalyze = useCallback(async (type: AnalysisType) => {
    if (!userProfile.apiKey) {
      addNotification({ message: t('notifications.error.missingApiKey'), type: 'error' });
      setIsProfileModalOpen(true);
      return;
    }
    if (!projectContext.trim()) {
      addNotification({ message: t('notifications.error.emptyContext'), type: 'error' });
      return;
    }
    setIsLoading(true);
    setIsExample(false);
    try {
      const result = await analyzeProject(projectContext, type, locale as 'en-US' | 'pt-BR', userProfile.apiKey);
      setCurrentAnalysis(result);

      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        projectName: result.projectName,
        analysisType: result.analysisType,
        timestamp: new Date().toLocaleString(locale),
        analysis: result,
        projectContext,
      };
      setHistory(prev => [newHistoryItem, ...prev]);

      if (result.usageMetadata) {
        updateTokenUsage(result.usageMetadata.totalTokenCount);
      }

      setView('results');
    } catch (error: any) {
      addNotification({ message: error.message || t('notifications.error.analysisFailed'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [projectContext, locale, t, addNotification, setHistory, updateTokenUsage, userProfile.apiKey]);

  const handleCompare = useCallback(async (ids: number[]) => {
    if (!userProfile.apiKey) {
      addNotification({ message: t('notifications.error.missingApiKey'), type: 'error' });
      setIsProfileModalOpen(true);
      return;
    }
    const itemsToCompare = history.filter(item => ids.includes(item.id));
    if (itemsToCompare.length !== 2) {
      addNotification({ message: t('notifications.error.compareSelection'), type: 'error' });
      return;
    }

    setIsLoading(true);
    setIsHistoryPanelOpen(false);

    try {
      const [item1, item2] = itemsToCompare;
      const result = await compareAnalyses(item1, item2, locale as 'en-US' | 'pt-BR', userProfile.apiKey);
      setEvolutionAnalysis(result);

      if (result.usageMetadata) {
        updateTokenUsage(result.usageMetadata.totalTokenCount);
      }

      setView('evolution');
    } catch (error: any) {
      addNotification({ message: error.message || t('notifications.error.compareFailed'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [history, locale, t, addNotification, updateTokenUsage, userProfile.apiKey]);

  const handleShowExample = () => {
    const example = exampleAnalysis(t);
    setCurrentAnalysis(example);
    setProjectContext(initialProjectContext);
    setIsExample(true);
    setView('results');
  };

  const handleExitExampleMode = () => {
    setIsExample(false);
    setProjectContext('');
    setCurrentAnalysis(null);
    setView('input');
  };

  const handleDeleteHistory = (id: number) => {
    setDeletingHistoryId(id);
    // Simulate a small delay for UX
    setTimeout(() => {
      setHistory(prev => prev.filter(item => item.id !== id));
      setDeletingHistoryId(null);
    }, 500);
  };

  const handleClearHistory = () => {
    if (window.confirm(t('confirmations.clearHistory'))) {
      setHistory([]);
    }
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setCurrentAnalysis(item.analysis);
    setProjectContext(item.projectContext);
    setIsExample(false);
    setView('results');
    setIsHistoryPanelOpen(false);
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    setIsProfileModalOpen(false);
    addNotification({ message: t('profile.notificationSuccess'), type: 'success' });
  };

  const handleNavigate = (targetView: ViewType | 'history') => {
    if (targetView === 'history') {
      setIsHistoryPanelOpen(true);
    } else {
      // When navigating away from example mode, reset it, but allow it on key views
      if (isExample && targetView !== 'results' && targetView !== 'kanban' && targetView !== 'dashboard') {
        handleExitExampleMode();
        // We set the view directly after exiting
        if (targetView !== 'input') {
          setView(targetView);
        }
        return;
      }
      setView(targetView);
      // Clear specific states when navigating away
      if (targetView !== 'results') setCurrentAnalysis(null);
      if (targetView !== 'evolution') setEvolutionAnalysis(null);
    }
  };

  const createKanbanState = (analysis: ProjectAnalysis): KanbanState => {
    const backlogCards: KanbanCardData[] = [
      ...analysis.improvements.map(i => ({ id: `imp-${i.title}`, title: i.title, difficulty: i.difficulty, priority: i.priority })),
      ...analysis.nextSteps.shortTerm.map(s => ({ id: `st-${s.title}`, title: s.title, difficulty: s.difficulty })),
      ...analysis.nextSteps.longTerm.map(l => ({ id: `lt-${l.title}`, title: l.title, difficulty: l.difficulty })),
    ];

    return {
      backlog: { title: t('kanban.columns.backlog'), cards: backlogCards },
      todo: { title: t('kanban.columns.todo'), cards: [] },
      inProgress: { title: t('kanban.columns.inProgress'), cards: [] },
      done: { title: t('kanban.columns.done'), cards: [] },
    };
  };

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans selection:bg-purple-500/30">
      {isLoading && <Loader />}

      <div className="fixed top-0 left-0 w-full h-full bg-grid-gray-700/[0.05] -z-10"></div>

      <Header
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
        userProfile={userProfile}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <NavigationBar
          activeView={view}
          onNavigate={handleNavigate}
          isKanbanAvailable={!!currentAnalysis}
        />

        {view === 'dashboard' && <Dashboard history={isExample ? exampleHistory(t) : history} usageTracking={usageTracking} onNavigate={handleNavigate} onLoadHistoryItem={handleLoadHistoryItem} onCompare={handleCompare} />}
        {view === 'input' && <ProjectInput value={projectContext} onChange={setProjectContext} onAnalyze={handleAnalyze} onFileChange={(file: File) => file.text().then(setProjectContext)} onShowExample={handleShowExample} isLoading={isLoading} onNavigate={handleNavigate} settings={settings} usageTracking={usageTracking} isExample={isExample} onExitExample={handleExitExampleMode} />}
        {view === 'results' && currentAnalysis && <SuggestionsDisplay analysis={currentAnalysis} isExample={isExample} history={isExample ? exampleHistory(t) : history} onNavigateToKanban={() => setView('kanban')} />}
        {view === 'evolution' && evolutionAnalysis && <EvolutionDisplay analysis={evolutionAnalysis} onNavigate={handleNavigate} />}
        {view === 'kanban' && currentAnalysis && <KanbanBoard initialState={createKanbanState(currentAnalysis)} projectName={currentAnalysis.projectName} onBackToAnalysis={() => setView('results')} />}

      </main>

      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        history={isExample ? exampleHistory(t) : history}
        onLoad={handleLoadHistoryItem}
        onDelete={handleDeleteHistory}
        onClear={handleClearHistory}
        onCompare={handleCompare}
        isExampleView={isExample}
        deletingHistoryId={deletingHistoryId}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        usageTracking={usageTracking}
        onSave={setSettings}
        onResetUsage={() => setUsageTracking(prev => ({ ...prev, totalTokens: 0 }))}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSave={handleSaveProfile}
      />

      <NotificationContainer />
      <NetworkStatusIndicator />
    </div>
  );
};

// Main export with providers
const Root = () => (
  <LanguageProvider>
    <NotificationProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </NotificationProvider>
  </LanguageProvider>
);

export default Root;
