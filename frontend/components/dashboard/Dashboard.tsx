import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { HistoryItem, UsageTracking, ViewType, AnalysisType } from '../../types';
import DashboardEmptyState from './DashboardEmptyState';
import { BarChart3, FileText, ListChecks, Sparkles, Star, Zap } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import TrendChart from './TrendChart';

interface DashboardProps {
  history: HistoryItem[];
  usageTracking: UsageTracking;
  onNavigate: (view: ViewType | 'history') => void;
  onLoadHistoryItem: (item: HistoryItem) => void;
  onCompare: (ids: number[]) => void;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const KPICard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; description: string }> = ({ icon, title, value, description }) => (
    <div className="group bg-gradient-to-br from-gray-800 to-gray-900/50 border border-gray-700 p-4 rounded-lg flex items-center gap-4 transition-all duration-300 hover:border-blue-500/50 hover:scale-[1.02]">
        <div className="bg-gray-900/50 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-xs text-gray-400">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ history, usageTracking, onNavigate, onLoadHistoryItem }) => {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        totalAnalyses: 0,
        averageScore: 0,
        commonType: 'N/A',
        scoreTrend: []
      };
    }
    const totalScore = history.reduce((sum, item) => sum + item.analysis.viability.score, 0);
    const typeCounts = history.reduce((acc, item) => {
      acc[item.analysisType] = (acc[item.analysisType] || 0) + 1;
      return acc;
    }, {} as Record<AnalysisType, number>);

    // FIX: Explicitly cast sort values to Number to prevent TypeScript arithmetic errors.
    const commonType = Object.entries(typeCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || 'N/A';
    
    const scoreTrend = [...history].reverse().map(item => item.analysis.viability.score);

    return {
      totalAnalyses: history.length,
      averageScore: parseFloat((totalScore / history.length).toFixed(1)),
      commonType,
      scoreTrend,
    };
  }, [history]);

  const projects = useMemo(() => {
    const projectMap = new Map<string, HistoryItem[]>();
    history.forEach(item => {
      if (!projectMap.has(item.projectName)) {
        projectMap.set(item.projectName, []);
      }
      projectMap.get(item.projectName)!.push(item);
    });
    return Array.from(projectMap.entries()).map(([name, items]) => ({
      name,
      items: items.sort((a, b) => b.id - a.id),
    }));
  }, [history]);

  if (history.length === 0) {
    return <DashboardEmptyState onNavigate={onNavigate} />;
  }

  const typeLabels: Record<string, string> = {
    [AnalysisType.General]: t('analysisTypes.GENERAL.label'),
    [AnalysisType.Security]: t('analysisTypes.SECURITY.label'),
    [AnalysisType.Scalability]: t('analysisTypes.SCALABILITY.label'),
    [AnalysisType.CodeQuality]: t('analysisTypes.CODE_QUALITY.label'),
    'N/A': 'N/A'
  };

  return (
    <motion.div
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* KPIs and Chart */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-gray-900/30 p-6 rounded-xl border border-gray-800"
        variants={itemVariants}
      >
        <div className="lg:col-span-3 bg-gray-800/50 border border-gray-700 p-6 rounded-xl flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.scoreEvolution')}</h3>
          <div className="flex-grow h-48">
            <TrendChart data={stats.scoreTrend} />
          </div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <KPICard icon={<FileText className="w-6 h-6 text-purple-400"/>} title={t('dashboard.kpi.totalAnalyses')} value={stats.totalAnalyses} description={t('dashboard.kpi.totalAnalyses_description')} />
            <KPICard icon={<Star className="w-6 h-6 text-yellow-400"/>} title={t('dashboard.kpi.averageScore')} value={stats.averageScore} description={t('dashboard.kpi.averageScore_description')} />
            <KPICard icon={<ListChecks className="w-6 h-6 text-teal-400"/>} title={t('dashboard.kpi.commonType')} value={typeLabels[stats.commonType]} description={t('dashboard.kpi.commonType_description')} />
            <KPICard icon={<Zap className="w-6 h-6 text-blue-400"/>} title={t('dashboard.kpi.tokensThisMonth')} value={usageTracking.totalTokens.toLocaleString(t('localeCode'))} description={t('dashboard.kpi.tokensThisMonth_description')} />
        </div>
      </motion.div>

      {/* Project List */}
      <motion.div className="space-y-8" variants={itemVariants}>
        <div className="text-center">
            <h2 className="text-3xl font-bold text-white">{t('dashboard.projects.title')}</h2>
            <p className="text-gray-400 mt-1">{t('dashboard.projects.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(project => (
                <motion.div key={project.name} variants={itemVariants} className="bg-gradient-to-br from-gray-800 to-gray-900/50 border border-gray-700 rounded-xl p-6 transition-all duration-300 hover:border-purple-500/50">
                    <h3 className="text-xl font-semibold text-white truncate" title={project.name}>{project.name}</h3>
                    <p className="text-sm text-gray-500">{t('dashboard.projects.analysisCount', { count: project.items.length })}</p>
                    <ul className="mt-4 space-y-3">
                        {project.items.slice(0, 3).map(item => (
                            <li key={item.id} className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-gray-700/50">
                                <div className="text-sm">
                                    <p className="font-medium text-gray-300">{typeLabels[item.analysisType]}</p>
                                    <p className="text-xs text-gray-500">{item.timestamp}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-lg">{item.analysis.viability.score}</span>
                                    <button onClick={() => onLoadHistoryItem(item)} className="px-3 py-1 text-xs font-semibold text-blue-300 bg-blue-900/50 border border-blue-700 rounded-md hover:bg-blue-800/50 transition-colors">
                                        {t('actions.view')}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;