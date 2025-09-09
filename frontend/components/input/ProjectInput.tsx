import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, CodeXml, FileText, FileUp, Info, Layers3, ShieldCheck, Sparkles, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { AnalysisOption, AnalysisType, AppSettings, UsageTracking, ViewType } from '../../types';
import SubtleTokenUsage from '../common/SubtleTokenUsage';
import TokenUsageAlert from '../common/TokenUsageAlert';

interface ProjectInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: (type: AnalysisType) => void;
  onFileChange: (file: File) => void;
  onShowExample: () => void;
  isLoading: boolean;
  onNavigate: (view: ViewType | 'history') => void;
  settings: AppSettings;
  usageTracking: UsageTracking;
  isExample: boolean;
  onExitExample: () => void;
}

const ProjectInput: React.FC<ProjectInputProps> = ({
  value,
  onChange,
  onAnalyze,
  onFileChange,
  onShowExample,
  isLoading,
  settings,
  usageTracking,
  isExample,
  onExitExample,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<AnalysisType>(AnalysisType.General);

  const analysisOptions: AnalysisOption[] = [
    { type: AnalysisType.General, label: t('analysisTypes.GENERAL.label'), description: t('analysisTypes.GENERAL.description'), icon: FileText, color: 'text-blue-400' },
    { type: AnalysisType.Security, label: t('analysisTypes.SECURITY.label'), description: t('analysisTypes.SECURITY.description'), icon: ShieldCheck, color: 'text-red-400' },
    { type: AnalysisType.Scalability, label: t('analysisTypes.SCALABILITY.label'), description: t('analysisTypes.SCALABILITY.description'), icon: Layers3, color: 'text-purple-400' },
    { type: AnalysisType.CodeQuality, label: t('analysisTypes.CODE_QUALITY.label'), description: t('analysisTypes.CODE_QUALITY.description'), icon: CodeXml, color: 'text-teal-400' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const handleAnalyzeClick = () => {
    onAnalyze(selectedType);
  };

  const usageRatio = settings.tokenLimit > 0 ? usageTracking.totalTokens / settings.tokenLimit : 0;
  const showTokenAlert = usageRatio >= 0.7;
  const showSubtleUsage = settings.tokenLimit > 0 && !showTokenAlert;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">{t('input.title')}</h2>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">{t('input.subtitle')}</p>
        <p className="text-gray-500 text-sm mt-1">For example: paste your README.md, architecture diagrams description, release notes, or even pieces of code...</p>
      </div>

      {isExample && (
        <div className="p-4 bg-purple-900/50 border border-purple-700 text-purple-300 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{t('input.exampleMode.notice')}</p>
          </div>
          <button
            onClick={onExitExample}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-200 bg-purple-800/50 border border-purple-600 rounded-md hover:bg-purple-700/50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            {t('actions.exitExample')}
          </button>
        </div>
      )}

      <AnimatePresence>
        {showTokenAlert && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <TokenUsageAlert limit={settings.tokenLimit} consumed={usageTracking.totalTokens} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700 space-y-3">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('input.placeholder')}
          className="w-full h-64 p-4 bg-gray-900/50 border border-gray-700 rounded-lg resize-y focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          disabled={isLoading}
        />
        <div className="flex justify-between items-center pt-2 gap-4">
          <div className="flex-grow">
            {showSubtleUsage && <SubtleTokenUsage limit={settings.tokenLimit} consumed={usageTracking.totalTokens} />}
          </div>
          <div className="flex-shrink-0">
            <input
              title='Upload a file'
              type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".txt,.md,.js,.ts,.jsx,.tsx,.json,.py,.java,.go,.rs" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-300 bg-gray-700/80 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <FileUp className="w-4 h-4" />
              {t('actions.uploadFile')}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white text-center">{t('input.analysisType.title')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {analysisOptions.map(opt => (
            <button
              key={opt.type}
              onClick={() => setSelectedType(opt.type)}
              disabled={isLoading}
              className={`relative p-4 rounded-lg border text-left transition-all duration-200 h-full ${selectedType === opt.type
                  ? 'bg-blue-900/20 border-blue-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
            >
              {selectedType === opt.type && (
                <div className="absolute top-3 right-3 text-blue-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-900/50 rounded-md mt-1">
                  <opt.icon className={`w-6 h-6 shrink-0 ${opt.color}`} />
                </div>
                <div>
                  <p className="font-semibold text-white">{opt.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{opt.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          onClick={onShowExample}
          disabled={isLoading}
          className="px-8 py-3 font-semibold text-purple-300 bg-transparent border border-purple-800 rounded-lg hover:bg-purple-900/30 transition-colors disabled:opacity-50"
        >
          {t('actions.showExample')}
        </button>
        <button
          onClick={handleAnalyzeClick}
          disabled={isLoading || !value.trim()}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span>{t('actions.analyzing')}...</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{t('actions.analyzeProject')}</span>
            </>
          )}
        </button>
      </div>

    </motion.div>
  );
};

export default ProjectInput;
