import * as React from 'react';

import { useEffect, useMemo } from 'react';
// FIX: Import `Variants` type from framer-motion to fix type inference issues.
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Clock, FileText, ListChecks, Star, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useTranslation } from '../../hooks/useTranslation';
import { AnalysisType, ViewType } from '../../types';
import DashboardEmptyState from './DashboardEmptyState';
import DashboardInsightCard from './DashboardInsightCard';
import TrendChart from './TrendChart';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

// FIX: Explicitly type variants with `Variants` to ensure correct type inference for transition properties like `type: 'spring'`.
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const KpiCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; custom: number }> = ({ icon, title, value, custom }) => (
  <motion.div
    variants={itemVariants}
    custom={custom}
    className="bg-gradient-to-br from-gray-800 to-gray-900/50 border border-gray-700 p-4 rounded-lg flex items-center gap-4 transition-all duration-300"
  >
    <div className="bg-gray-900/50 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const {
    history,
    setView,
    settings,
    fetchDashboardInsight,
    selectedProject,
    setSelectedProject,
    handleLoadHistoryItem,
    usageTracking,
  } = useProjectContext();
  const { t } = useTranslation(['dashboard', 'common', 'input']);
  const { locale } = useLanguage();

  useEffect(() => {
    if (settings.enableDashboardInsights) {
      fetchDashboardInsight();
    }
  }, [settings.enableDashboardInsights, fetchDashboardInsight]);

  const projects = useMemo(() => {
    const projectNames = [...new Set(history.map(item => item.projectName))];
    return projectNames.map(name => {
      const projectHistory = history.filter(item => item.projectName === name);
      const latestItem = projectHistory.sort((a, b) => b.id - a.id)[0];
      const scores = projectHistory.map(h => h.analysis.viability.score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        name,
        analysisCount: projectHistory.length,
        latestAnalysisTimestamp: latestItem.timestamp,
        averageScore: avgScore,
        scoreHistory: scores.slice().reverse(), // For sparkline, oldest to newest
      };
    });
  }, [history]);

  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0].name);
    }
    if (selectedProject && !projects.find(p => p.name === selectedProject)) {
      setSelectedProject(projects.length > 0 ? projects[0].name : null);
    }
  }, [projects, selectedProject, setSelectedProject]);

  const selectedProjectData = useMemo(() => {
    if (!selectedProject) return null;
    return projects.find(p => p.name === selectedProject);
  }, [selectedProject, projects]);

  const selectedProjectHistory = useMemo(() => {
    if (!selectedProject) return [];
    return history
      .filter(item => item.projectName === selectedProject)
      .sort((a, b) => b.id - a.id);
  }, [selectedProject, history]);

  const globalKpis = useMemo(() => {
    const totalAnalyses = history.length;
    const allScores = history.map(h => h.analysis.viability.score);
    const avgScore = totalAnalyses > 0 ? (allScores.reduce((a, b) => a + b, 0) / totalAnalyses).toFixed(1) : 'N/A';

    const typeCounts: Record<string, number> = {};
    history.forEach(h => {
      typeCounts[h.analysisType] = (typeCounts[h.analysisType] || 0) + 1;
    });
    const commonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { totalAnalyses, avgScore, commonType };
  }, [history]);

  const analysisTypeLabels: Record<string, string> = {
    [AnalysisType.General]: t('input:analysisTypes.GENERAL.label'),
    [AnalysisType.Security]: t('input:analysisTypes.SECURITY.label'),
    [AnalysisType.Scalability]: t('input:analysisTypes.SCALABILITY.label'),
    [AnalysisType.CodeQuality]: t('input:analysisTypes.CODE_QUALITY.label'),
    [AnalysisType.DocumentationReview]: t('input:analysisTypes.DOCUMENTATION_REVIEW.label'),
  };

  if (history.length === 0) {
    return <DashboardEmptyState onNavigate={(view) => setView(view as ViewType)} />;
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {settings.enableDashboardInsights && <DashboardInsightCard />}

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
        <KpiCard icon={<FileText className="w-6 h-6 text-purple-400" />} title={t('dashboard:kpi.totalAnalyses')} value={globalKpis.totalAnalyses} custom={1} />
        <KpiCard icon={<Star className="w-6 h-6 text-yellow-400" />} title={t('dashboard:kpi.averageScore')} value={globalKpis.avgScore} custom={2} />
        <KpiCard icon={<ListChecks className="w-6 h-6 text-teal-400" />} title={t('dashboard:kpi.commonType')} value={analysisTypeLabels[globalKpis.commonType] || globalKpis.commonType} custom={3} />
        <KpiCard icon={<Zap className="w-6 h-6 text-blue-400" />} title={t('dashboard:kpi.tokensThisMonth')} value={usageTracking.totalTokens.toLocaleString(locale)} custom={4} />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={itemVariants}
      >
        <div className="lg:col-span-1 bg-gray-800/50 border border-gray-700 rounded-xl flex flex-col h-full">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">{t('dashboard:projects.title')}</h3>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto">
            {projects.map(project => (
              <button
                key={project.name}
                onClick={() => setSelectedProject(project.name)}
                className={`w-full text-left p-3 rounded-md transition-colors ${selectedProject === project.name ? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold truncate">{project.name}</span>
                  <span className="text-sm font-mono bg-gray-700/80 text-gray-300 px-2 py-0.5 rounded-md shrink-0">{project.analysisCount}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{t('dashboard:projects.lastAnalyzed')}: {project.latestAnalysisTimestamp}</p>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedProjectData && (
            <motion.div
              key={selectedProjectData.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Project Overview Card */}
              {selectedProjectHistory.length > 0 && (
                <motion.div
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-xl font-bold text-white mb-4">{t('dashboard:overview.title')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex flex-col items-center justify-center text-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400">{t('dashboard:overview.latestScore')}</p>
                      <p className="text-6xl font-bold text-white my-2">{selectedProjectHistory[0].analysis.viability.score}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{selectedProjectHistory[0].timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">({analysisTypeLabels[selectedProjectHistory[0].analysisType] || selectedProjectHistory[0].analysisType})</p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-200 mb-2">{t('dashboard:overview.keyStrengths')}</h4>
                      <ul className="space-y-2">
                        {selectedProjectHistory[0].analysis.strengths.slice(0, 3).map((strength, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                            <Star className="w-4 h-4 text-green-400 shrink-0 mt-1" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold text-white">{selectedProjectData.name}</h3>
                  <p className="text-sm text-gray-400">{t('dashboard:projects.averageScore')}: <span className="font-bold text-white">{selectedProjectData.averageScore.toFixed(1)}</span></p>
                </div>
                <div className="mt-4 h-24">
                  <TrendChart data={selectedProjectData.scoreHistory} />
                </div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-semibold text-white">{t('dashboard:projects.recentAnalyses')}</h3>
                </div>
                <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                  {selectedProjectHistory.map(item => (
                    <div key={item.id} className="p-3 rounded-md flex justify-between items-center hover:bg-gray-700/50">
                      <div>
                        <p className="font-medium text-gray-300">{analysisTypeLabels[item.analysisType] || item.analysisType}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-lg">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold text-white">{item.analysis.viability.score}</span>
                        </div>
                        <button onClick={() => handleLoadHistoryItem(item)} className="px-3 py-1 text-sm font-semibold text-blue-300 bg-blue-900/50 rounded-md hover:bg-blue-800/50 transition-colors">
                          {t('common:actions.view')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
