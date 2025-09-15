import React, { useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { HistoryItem, UsageTracking, ViewType, AnalysisType } from '../../types';
import { BarChart3, FileText, Folder, ListChecks, Star, Zap } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import TrendChart from './TrendChart';
import DashboardEmptyState from './DashboardEmptyState';
import { useLanguage } from '../../contexts/LanguageContext';

interface DashboardProps {
  history: HistoryItem[];
  usageTracking: UsageTracking;
  onNavigate: (view: ViewType | 'history') => void;
  onLoadHistoryItem: (item: HistoryItem) => void;
  selectedProject: string | null;
  onSelectProject: (projectName: string | null) => void;
  isExample: boolean;
  showEmptyState?: boolean;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const KPICard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; description: string }> = ({ icon, title, value, description }) => (
    <div className="group bg-gradient-to-br from-gray-800 to-gray-900/50 border border-gray-700 p-4 rounded-lg flex items-center gap-4 transition-all duration-300">
        <div className="bg-gray-900/50 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-xs text-gray-400">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ history, usageTracking, onNavigate, onLoadHistoryItem, selectedProject, onSelectProject, isExample, showEmptyState = false }) => {
  const { t, isLoading } = useTranslation(['dashboard', 'common', 'input']);
  const { locale } = useLanguage();

  const projects = useMemo(() => {
    const projectMap = new Map<string, number>();
    history.forEach(item => {
      projectMap.set(item.projectName, (projectMap.get(item.projectName) || 0) + 1);
    });
    return Array.from(projectMap.entries()).map(([name, count]) => ({ name, count }));
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (!selectedProject) {
      return history;
    }
    return history.filter(item => item.projectName === selectedProject);
  }, [history, selectedProject]);

  const stats = useMemo(() => {
    const source = filteredHistory;
    if (source.length === 0) {
        return {
            totalAnalyses: 0,
            averageScore: 0,
            commonType: 'N/A',
            scoreTrend: [],
        };
    }
    const totalScore = source.reduce((sum, item) => sum + item.analysis.viability.score, 0);
    const typeCounts = source.reduce((acc, item) => {
      acc[item.analysisType] = (acc[item.analysisType] || 0) + 1;
      return acc;
    }, {} as Record<AnalysisType, number>);
    
    const commonType = Object.entries(typeCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || 'N/A';
    const scoreTrend = [...source].reverse().map(item => item.analysis.viability.score);

    return {
      totalAnalyses: source.length,
      averageScore: parseFloat((totalScore / source.length).toFixed(1)),
      commonType,
      scoreTrend,
    };
  }, [filteredHistory]);

  if (showEmptyState) {
    return <DashboardEmptyState onNavigate={onNavigate} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-pulse">
        <div className="lg:col-span-1 bg-gray-900/30 p-4 rounded-xl border border-gray-800 h-64"></div>
        <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                <div className="xl:col-span-3 bg-gray-800/50 border border-gray-700 p-6 rounded-xl h-48"></div>
                <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                    <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg h-20"></div>
                    <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg h-20"></div>
                </div>
            </div>
            <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-800 h-64"></div>
        </div>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    [AnalysisType.General]: t('analysisTypes.GENERAL.label'),
    [AnalysisType.Security]: t('analysisTypes.SECURITY.label'),
    [AnalysisType.Scalability]: t('analysisTypes.SCALABILITY.label'),
    [AnalysisType.CodeQuality]: t('analysisTypes.CODE_QUALITY.label'),
    'N/A': 'N/A'
  };

  const analysesToList = selectedProject ? filteredHistory : [...history].sort((a,b) => b.id - a.id).slice(0, 10);

  return (
    <motion.div
        className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      {/* Project List Sidebar */}
      <motion.div variants={itemVariants} className="lg:col-span-1 bg-gray-900/30 p-4 rounded-xl border border-gray-800 h-fit lg:sticky lg:top-24">
        <h2 className="text-lg font-bold text-white mb-4 px-2">{t('dashboard.projects.title')}</h2>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onSelectProject(null)}
              className={`w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors text-sm font-medium ${!selectedProject ? 'bg-blue-600/50 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
            >
              <BarChart3 className="w-5 h-5 shrink-0" />
              <span className="flex-grow truncate">{t('dashboard.projects.allProjects')}</span>
              <span className="text-xs bg-gray-700/80 px-1.5 py-0.5 rounded">{history.length}</span>
            </button>
          </li>
          {projects.map(project => (
            <li key={project.name}>
              <button
                onClick={() => onSelectProject(project.name)}
                className={`w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors text-sm ${selectedProject === project.name ? 'bg-blue-600/50 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
              >
                <Folder className="w-5 h-5 shrink-0" />
                <span className="flex-grow truncate" title={project.name}>{project.name}</span>
                <span className="text-xs bg-gray-700/80 px-1.5 py-0.5 rounded">{project.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Main Content */}
      <motion.div className="lg:col-span-3 space-y-8">
        {/* KPIs and Chart */}
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 xl:grid-cols-5 gap-8"
        >
            <div className="xl:col-span-3 bg-gray-800/50 border border-gray-700 p-6 rounded-xl flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.scoreEvolution')}</h3>
              <div className="flex-grow h-48">
                <TrendChart data={stats.scoreTrend} />
              </div>
            </div>
            <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                <KPICard icon={<FileText className="w-6 h-6 text-purple-400"/>} title={t('dashboard.kpi.totalAnalyses')} value={stats.totalAnalyses} description={t('dashboard.kpi.totalAnalyses_description')} />
                <KPICard icon={<Star className="w-6 h-6 text-yellow-400"/>} title={t('dashboard.kpi.averageScore')} value={stats.averageScore} description={t('dashboard.kpi.averageScore_description')} />
                <KPICard icon={<ListChecks className="w-6 h-6 text-teal-400"/>} title={t('dashboard.kpi.commonType')} value={typeLabels[stats.commonType]} description={t('dashboard.kpi.commonType_description')} />
                <KPICard icon={<Zap className="w-6 h-6 text-blue-400"/>} title={t('dashboard.kpi.tokensThisMonth')} value={usageTracking.totalTokens.toLocaleString(locale)} description={t('dashboard.kpi.tokensThisMonth_description')} />
            </div>
        </motion.div>

        {/* Analyses List */}
        <motion.div variants={itemVariants} className="bg-gray-900/30 p-6 rounded-xl border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedProject
                ? t('dashboard.projects.analysesFor', { projectName: selectedProject })
                : t('dashboard.projects.recentAnalyses')}
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {analysesToList.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="text-sm flex-grow overflow-hidden">
                      <p className="font-medium text-gray-300 truncate" title={item.projectName}>{item.projectName}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{typeLabels[item.analysisType]}</span>
                        <span className="hidden sm:inline">&bull;</span>
                        <span className="hidden sm:inline">{item.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-white text-lg">{item.analysis.viability.score}</span>
                      </div>
                      <button
                        onClick={() => onLoadHistoryItem(item)}
                        disabled={isExample}
                        className="px-3 py-1 text-xs font-semibold text-blue-300 bg-blue-900/50 border border-blue-700 rounded-md hover:bg-blue-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('actions.view')}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
