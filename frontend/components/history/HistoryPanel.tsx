import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, FileUp, GitCompareArrows, History, Info, Loader2, Trash2, X, Zap } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import { AnalysisType, HistoryItem } from '../../types';
import Sparkline from '../common/Sparkline';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: number) => void;
  onClear: () => void;
  onCompare: (ids: number[]) => void;
  isExampleView: boolean;
  deletingHistoryId: number | null;
}

const ITEMS_PER_PAGE = 10;

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onLoad, onDelete, onClear, onCompare, isExampleView, deletingHistoryId }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { t } = useTranslation(['common', 'settings', 'input']);
  const { locale } = useLanguage();
  const { showConfirmation } = useConfirmation();

  const typeLabels: Record<AnalysisType, string> = {
    [AnalysisType.General]: t('input:analysisTypes.GENERAL.label'),
    [AnalysisType.Security]: t('input:analysisTypes.SECURITY.label'),
    [AnalysisType.Scalability]: t('input:analysisTypes.SCALABILITY.label'),
    [AnalysisType.CodeQuality]: t('input:analysisTypes.CODE_QUALITY.label')
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
      setVisibleCount(ITEMS_PER_PAGE);
    }
  }, [isOpen]);

  const handleSelect = (id: number) => {
    if (isExampleView) return;
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return prev; // No more than 2 selections
    });
  };

  const handleConfirmClear = () => {
    showConfirmation({
      title: t('history:clearConfirm.title'),
      message: t('history:clearConfirm.message'),
      confirmText: t('common.delete'),
      onConfirm: onClear,
    });
  };

  const historyWithSparklines = useMemo(() => {
    const projectGroups = new Map<string, HistoryItem[]>();

    // Group history by project and analysis type
    history.forEach(item => {
      const key = `${item.projectName}::${item.analysisType}`;
      if (!projectGroups.has(key)) {
        projectGroups.set(key, []);
      }
      projectGroups.get(key)!.push(item);
    });

    // Create data for each item, sorted chronologically
    return history.map(item => {
      const key = `${item.projectName}::${item.analysisType}`;
      const group = projectGroups.get(key)!.sort((a, b) => a.id - b.id);

      const scoreData = group.map(h => h.analysis.viability.score);
      const tokenData = group.map(h => h.analysis.usageMetadata?.totalTokenCount || 0);

      return {
        ...item,
        sparkline: {
          scoreData,
          tokenData,
        }
      };
    }).sort((a, b) => b.id - a.id); // sort final list to show newest first
  }, [history]);

  const historyToShow = historyWithSparklines.slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const comparableItems = useMemo(() => {
    if (selectedIds.length !== 2) return null;
    const items = history.filter(item => selectedIds.includes(item.id));
    if (items.length === 2 && items[0].analysisType === items[1].analysisType) {
      return items;
    }
    return null;
  }, [selectedIds, history]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800/80 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 shrink-0">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">{t('history.title')}</h2>
              </div>
              {isExampleView && (
                <div className="text-xs font-medium px-2 py-1 bg-purple-900/50 border border-purple-700 text-purple-300 rounded-md">
                  {t('history.exampleMode')}
                </div>
              )}
              <button title={t('common.close')} onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto grow">
              {historyWithSparklines.length > 0 ? (
                <>
                  <div className="text-center mb-4 p-2 bg-gray-900/50 border border-gray-700 rounded-md text-sm text-gray-400">
                    <p>{t('history.compareInstruction')}</p>
                  </div>
                  <ul className="space-y-3">
                    {historyToShow.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      const isDeleting = deletingHistoryId === item.id;
                      const isSelectionDisabled = (selectedIds.length >= 2 && !isSelected) || isExampleView;
                      const isDisabled = isDeleting || isSelectionDisabled;

                      return (
                        <motion.li
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          className={`p-3 rounded-lg border flex items-start gap-3 transition-all duration-200 ${isSelected ? 'bg-blue-900/50 border-blue-600' : 'bg-gray-900/50 border-gray-700'} ${isExampleView ? 'opacity-70' : ''}`}
                        >
                          <input
                            title='Select for comparison'
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => handleSelect(item.id)}
                            className={`mt-1 shrink-0 w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600 focus:ring-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                          <div className="flex-grow flex flex-col justify-between gap-2" onClick={() => !isDisabled && handleSelect(item.id)}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex-grow">
                                <p className="font-semibold text-white truncate" title={item.projectName}>{item.projectName}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
                                  <span>
                                    <strong className="text-gray-300">{t('history.typeLabel')}:</strong> {typeLabels[item.analysisType] || item.analysisType}
                                  </span>
                                  <span>
                                    <strong className="text-gray-300">{t('history.dateLabel')}:</strong> {item.timestamp}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  disabled={isDeleting || isExampleView}
                                  onClick={(e) => { e.stopPropagation(); onLoad(item); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-300 bg-blue-900/50 border border-blue-700 rounded-md hover:bg-blue-800/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  <FileUp className="w-3.5 h-3.5" /> {t('actions.load')}
                                </button>
                                <button
                                  disabled={isDeleting || isExampleView}
                                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                  className="p-2 w-8 h-8 flex items-center justify-center text-red-400 bg-red-900/30 border border-red-800/50 rounded-md hover:bg-red-900/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                  aria-label={t('history.deleteAriaLabel')}
                                >
                                  {isDeleting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-2 text-xs text-gray-400" title={t('history.scoreTrendTitle')}>
                                <BarChart3 className="w-4 h-4 text-blue-400 shrink-0" />
                                <Sparkline data={item.sparkline.scoreData} stroke="rgb(96 165 250)" />
                                <span className="font-semibold text-white w-4 text-right">{item.analysis.viability.score}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400" title={t('history.tokenUsageTitle')}>
                                <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                                <Sparkline data={item.sparkline.tokenData} stroke="rgb(192 132 252)" />
                                <span className="font-semibold text-white w-12 text-right">
                                  {item.analysis.usageMetadata?.totalTokenCount.toLocaleString(locale) || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      )
                    })}
                  </ul>
                  {historyWithSparklines.length > visibleCount && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={handleShowMore}
                        className="px-4 py-2 text-sm font-semibold text-blue-300 bg-blue-900/50 border border-blue-700 rounded-md hover:bg-blue-800/50 transition-colors"
                      >
                        {t('actions.showMore')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10">
                  <Info className="w-10 h-10 mx-auto text-gray-600" />
                  <p className="mt-4 font-medium text-gray-400">{t('history.empty.title')}</p>
                  <p className="text-sm text-gray-500">{t('history.empty.subtitle')}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 shrink-0 flex justify-between items-center">
              <button
                onClick={handleConfirmClear}
                disabled={history.length === 0 || isExampleView}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-900/50 border border-red-700 rounded-md hover:bg-red-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t('history.clear')}
              </button>
              <button
                onClick={() => onCompare(selectedIds)}
                disabled={!comparableItems || isExampleView}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GitCompareArrows className="w-4 h-4" /> {t('history.compare')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HistoryPanel;
