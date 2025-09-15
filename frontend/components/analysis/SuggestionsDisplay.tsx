import { AnimatePresence, motion, Variants } from 'framer-motion';
import { ArrowRight, BarChart, Briefcase, Calculator, CheckCircle, Download, FileText, Info, Lightbulb, LineChart, ListChecks, Star, Target, ThumbsDown, ThumbsUp, TrendingUp, X, Zap } from 'lucide-react';
import * as React from 'react';
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import { HistoryItem, KanbanState, Priority, ProjectAnalysis } from '../../types';
import DifficultyMeter from '../common/DifficultyMeter';
import MaturityKpiCard from '../common/MaturityKpiCard';
import Sparkline from '../common/Sparkline';
import ViabilityScore from '../common/ViabilityScore';

interface SuggestionsDisplayProps {
  analysis: ProjectAnalysis;
  isExample: boolean;
  history?: HistoryItem[];
  onNavigateToKanban: () => void;
  onExitExample: () => void;
  kanbanState: KanbanState | null;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    },
  }),
};

// Markdown renderer component with custom styling for dark theme
const Markdown: React.FC<{ children: string }> = ({ children }) => (
  <div className="prose prose-invert prose-sm max-w-none text-gray-400 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:text-white">
    <ReactMarkdown
      children={children}
      remarkPlugins={[remarkGfm]}
      components={{
        ul: ({ node, ...props }) => <ul className="list-disc list-outside space-y-1 ml-4" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-outside space-y-1 ml-4" {...props} />,
        code: (props: any) => {
          const { node, inline, className, children, ...rest } = props;
          return !inline ? (
            <pre className="bg-gray-900/50 p-3 rounded-md my-2 overflow-x-auto">
              <code className={`font-mono text-sm ${className}`} {...rest}>
                {children}
              </code>
            </pre>
          ) : (
            <code className="bg-gray-700/50 text-purple-300 font-mono text-sm px-1.5 py-0.5 rounded-md" {...rest}>
              {children}
            </code>
          );
        },
        a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
      }}
    />
  </div>
);

const getPriorityClass = (priority: Priority) => {
  switch (priority) {
    case Priority.High: return 'bg-red-900/50 border-red-700 text-red-300';
    case Priority.Medium: return 'bg-yellow-900/50 border-yellow-700 text-yellow-300';
    case Priority.Low: return 'bg-blue-900/50 border-blue-700 text-blue-300';
    default: return 'bg-gray-800 border-gray-700 text-gray-300';
  }
};

const getColorForScore = (s: number) => {
  if (s <= 3) return 'rgb(239 68 68)'; // red-500
  if (s <= 6) return 'rgb(245 158 11)'; // amber-500
  return 'rgb(34 197 94)'; // green-500
};

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; custom: number }> = ({ icon, title, children, custom }) => (
  <motion.div
    className="bg-gradient-to-br from-gray-800 to-gray-900/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm h-full transition-all duration-300 hover:border-blue-500/50 hover:scale-[1.02]"
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    custom={custom}
  >
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h3 className="text-xl font-semibold text-white">{title}</h3>
    </div>
    <div className="space-y-3 text-gray-400">{children}</div>
  </motion.div>
);

const SuggestionsDisplay: React.FC<SuggestionsDisplayProps> = ({ analysis, isExample, history, onNavigateToKanban, onExitExample, kanbanState }) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const { t } = useTranslation(['analysis', 'common']);
  const { locale } = useLanguage();

  const scoreHistory = useMemo(() => {
    if (!history || isExample) return [];
    return history
      .filter(item =>
        item.projectName === analysis.projectName &&
        item.analysisType === analysis.analysisType
      )
      .sort((a, b) => a.id - b.id)
      .map(item => item.analysis.viability.score);
  }, [history, analysis, isExample]);

  const kanbanForProjectExists = !isExample && kanbanState?.projectName === analysis.projectName;

  const handleFeedback = (vote: 'up' | 'down') => {
    setFeedback(vote);
    try {
      const feedbackCounts = JSON.parse(localStorage.getItem('analysisFeedback') || '{"up": 0, "down": 0}');
      feedbackCounts[vote]++;
      localStorage.setItem('analysisFeedback', JSON.stringify(feedbackCounts));
    } catch (error) {
      console.error("Failed to save feedback to localStorage:", error);
    }
  };

  const handleExportJson = () => {
    if (!analysis) return;
    const jsonString = JSON.stringify(analysis, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_${analysis.projectName.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportLog = () => {
    if (!analysis) return;

    const sections: string[] = [];
    sections.push(`${t('export.logContent.mainTitle')}: ${analysis.projectName}`);
    sections.push('=================================================');
    sections.push('');

    sections.push(t('results.summary.title'));
    sections.push('-------');
    sections.push(analysis.summary);
    sections.push('');

    sections.push(t('results.viability.title'));
    sections.push('----------------------');
    sections.push(`${t('results.viability.scoreLabel')}: ${analysis.viability.score}/10`);
    sections.push(`${t('results.viability.assessmentLabel')}: ${analysis.viability.assessment}`);
    sections.push('');

    sections.push(t('results.roi.title'));
    sections.push('----------------');
    sections.push(`${t('results.roi.assessmentLabel')}: ${analysis.roiAnalysis.assessment}`);
    sections.push(`${t('results.roi.effortLabel')}: ${t(`effort.${analysis.roiAnalysis.estimatedEffort}`)}`);
    sections.push(t('results.roi.gainsLabel'));
    analysis.roiAnalysis.potentialGains.forEach(g => sections.push(`- ${g}`));
    sections.push('');

    sections.push(t('results.strengths.title'));
    sections.push('-------------');
    analysis.strengths.forEach(s => sections.push(`- ${s}`));
    sections.push('');

    sections.push(t('results.improvements.title'));
    sections.push('------------------');
    analysis.improvements.forEach(i => {
      sections.push(`${i.title} (${t('common.priority')}: ${t(`priority.${i.priority}`)}, ${t('common.difficulty')}: ${t(`difficulty.${i.difficulty}`)})`);
      sections.push(`  ${t('results.improvements.businessImpact')}: ${i.businessImpact}`);
      sections.push(`  ${t('common.description')}: ${i.description}`);
      sections.push('');
    });

    sections.push(t('results.nextSteps.title'));
    sections.push('---------------');
    sections.push(`${t('results.nextSteps.shortTerm')}:`);
    analysis.nextSteps.shortTerm.forEach(step => sections.push(`- ${step.title} (${t('common.difficulty')}: ${t(`difficulty.${step.difficulty}`)}): ${step.description}`));
    sections.push('');
    sections.push(`${t('results.nextSteps.longTerm')}:`);
    analysis.nextSteps.longTerm.forEach(step => sections.push(`- ${step.title} (${t('common.difficulty')}: ${t(`difficulty.${step.difficulty}`)}): ${step.description}`));

    const logContent = sections.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_${analysis.projectName.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportButtonClass = "flex items-center shrink-0 gap-2 px-4 py-2 bg-gray-700/50 text-gray-300 border border-gray-600 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200";

  return (
    <AnimatePresence>
      <div className="mt-12">
        {isExample && (
          <motion.div
            className="mb-8 p-4 bg-purple-900/50 border border-purple-700 text-purple-300 rounded-lg flex items-center justify-between gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{t('results.exampleModeNotice')}</p>
            </div>
            <button
              onClick={onExitExample}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-200 bg-purple-800/50 border border-purple-600 rounded-md hover:bg-purple-700/50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              {t('actions.exitExample')}
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Header: Project Name, Summary, Exports */}
          <motion.div
            className="lg:col-span-2 p-6 bg-gray-900/30 rounded-xl border border-gray-800 flex flex-col"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {t('results.title', { projectName: analysis.projectName })}
            </h2>
            <div className="mt-2 text-gray-400 max-w-3xl"><Markdown>{analysis.summary}</Markdown></div>
            <div className="flex flex-wrap items-center gap-3 mt-auto pt-4">
              <button
                onClick={onNavigateToKanban}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300"
              >
                <ListChecks className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
                {kanbanForProjectExists ? t('actions.viewKanbanBoard') : t('actions.createKanbanBoard')}
              </button>
              <button onClick={handleExportJson} className={exportButtonClass} aria-label={t('export.jsonAriaLabel')}>
                <Download className="w-4 h-4" />
                <span>{t('export.json')}</span>
              </button>
              <button onClick={handleExportLog} className={exportButtonClass} aria-label={t('export.logAriaLabel')}>
                <FileText className="w-4 h-4" />
                <span>{t('export.log')}</span>
              </button>
              {analysis.usageMetadata && (
                <motion.div
                  className="group relative flex items-center gap-3 text-xs text-gray-400 p-2 pr-3 bg-gradient-to-r from-gray-800 to-gray-900/50 border border-gray-700 rounded-lg transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  aria-label={t('results.usageMetadata.ariaLabel')}
                >
                  <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" aria-hidden="true"></div>
                  <Calculator className="w-4 h-4 text-gray-500 shrink-0" />
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 z-10">
                    <span><strong>{t('results.usageMetadata.total')}:</strong> {analysis.usageMetadata.totalTokenCount.toLocaleString(locale)} {t('results.usageMetadata.tokens')}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {analysis.maturity && (
            <MaturityKpiCard maturity={analysis.maturity} />
          )}
        </div>


        {/* Main Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <InfoCard icon={<BarChart className="w-6 h-6 text-blue-400" />} title={t('results.viability.title')} custom={1}>
            <div className="flex flex-col items-center text-center">
              <ViabilityScore score={analysis.viability.score} />
              {scoreHistory.length > 1 && (
                <div className="mt-4 w-full">
                  <p className="text-xs text-gray-500 mb-1">{t('results.viability.scoreEvolution')}</p>
                  <div className="flex justify-center">
                    <Sparkline
                      data={scoreHistory}
                      width={120}
                      height={25}
                      stroke={getColorForScore(analysis.viability.score)}
                    />
                  </div>
                </div>
              )}
              <div className="mt-4 text-sm"><Markdown>{analysis.viability.assessment}</Markdown></div>
            </div>
          </InfoCard>

          <InfoCard icon={<LineChart className="w-6 h-6 text-teal-400" />} title={t('results.roi.title')} custom={2}>
            <div className="text-sm italic">"<Markdown>{analysis.roiAnalysis.assessment}</Markdown>"</div>
            <div className="mt-4 space-y-2">
              <div>
                <h4 className="font-semibold text-teal-300 mb-1">{t('results.roi.gainsLabel')}</h4>
                <ul className="list-inside space-y-1">
                  {analysis.roiAnalysis.potentialGains.map((gain, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Target className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                      <span><Markdown>{gain}</Markdown></span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-teal-300">{t('results.roi.effortLabel')}</h4>
                <p className="text-sm">{t(`effort.${analysis.roiAnalysis.estimatedEffort}`)}</p>
              </div>
            </div>
          </InfoCard>

          <InfoCard icon={<CheckCircle className="w-6 h-6 text-green-400" />} title={t('results.strengths.title')} custom={3}>
            <ul className="list-inside space-y-2">
              {analysis.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span><Markdown>{strength}</Markdown></span>
                </li>
              ))}
            </ul>
          </InfoCard>

          <div className="lg:col-span-2">
            <InfoCard icon={<Lightbulb className="w-6 h-6 text-yellow-400" />} title={t('results.improvements.title')} custom={4}>
              <div className="space-y-4">
                {analysis.improvements.map((item, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${getPriorityClass(item.priority)}`}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                        <span className="text-xs font-mono px-2 py-1 rounded-full">{t(`priority.${item.priority}`)}</span>
                      </div>
                    </div>
                    <div className="mt-1 text-sm"><Markdown>{item.description}</Markdown></div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <DifficultyMeter difficulty={item.difficulty} />
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                        <span className="font-medium">{t('results.improvements.impact')}:</span>
                        <span><Markdown>{item.businessImpact}</Markdown></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>

          <div className="lg:col-span-1">
            <InfoCard icon={<TrendingUp className="w-6 h-6 text-purple-400" />} title={t('results.nextSteps.title')} custom={5}>
              <div>
                <h4 className="font-semibold text-purple-300 mb-2">{t('results.nextSteps.shortTerm')}</h4>
                <ul className="space-y-3">
                  {analysis.nextSteps.shortTerm.map((step, i) => (
                    <li key={i} className="flex flex-col items-start gap-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <strong>{step.title}</strong>
                      </div>
                      <div className="pl-6">
                        <div><Markdown>{step.description}</Markdown></div>
                        <div className="mt-1"><DifficultyMeter difficulty={step.difficulty} /></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="font-semibold text-purple-300 mb-2">{t('results.nextSteps.longTerm')}</h4>
                <ul className="space-y-3">
                  {analysis.nextSteps.longTerm.map((step, i) => (
                    <li key={i} className="flex flex-col items-start gap-1 text-sm">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <strong>{step.title}</strong>
                      </div>
                      <div className="pl-6">
                        <div><Markdown>{step.description}</Markdown></div>
                        <div className="mt-1"><DifficultyMeter difficulty={step.difficulty} /></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </InfoCard>
          </div>
        </div>

        {/* Feedback Section */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div
                key="feedback-question"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-lg font-medium text-gray-300">{t('feedback.question')}</h4>
                <div className="mt-4 flex justify-center gap-4">
                  <button
                    onClick={() => handleFeedback('up')}
                    className="p-3 bg-gray-700/50 border border-gray-600 rounded-full text-gray-400 hover:text-green-400 hover:border-green-500 transition-colors duration-200"
                    aria-label={t('feedback.useful')}
                  >
                    <ThumbsUp className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleFeedback('down')}
                    className="p-3 bg-gray-700/50 border border-gray-600 rounded-full text-gray-400 hover:text-red-400 hover:border-red-500 transition-colors duration-200"
                    aria-label={t('feedback.notUseful')}
                  >
                    <ThumbsDown className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="feedback-thanks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-2 text-green-400"
              >
                <CheckCircle className="w-6 h-6" />
                <p className="text-lg font-medium">{t('feedback.thanks')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SuggestionsDisplay;
