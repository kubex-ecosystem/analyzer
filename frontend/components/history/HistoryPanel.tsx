import { AnimatePresence, motion } from 'framer-motion';
import { Clock, FileText, GitCompareArrows, History as HistoryIcon, Star, Trash2, Upload, X } from 'lucide-react';
import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useTranslation } from '../../hooks/useTranslation';
import { HistoryItem, ProjectAnalysis } from '../../types';

const HistoryItemCard: React.FC<{
  item: HistoryItem;
  isSelected: boolean;
  onSelectToggle: (id: number) => void;
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}> = ({ item, isSelected, onSelectToggle, onLoad, onDelete, isDeleting }) => {
  const { t } = useTranslation(['common', 'input']);

  const typeLabels: Record<string, string> = {
    General: t('input:analysisTypes.GENERAL.label'),
    Security: t('input:analysisTypes.SECURITY.label'),
    Scalability: t('input:analysisTypes.SCALABILITY.label'),
    CodeQuality: t('input:analysisTypes.CODE_QUALITY.label'),
    DocumentationReview: t('input:analysisTypes.DOCUMENTATION_REVIEW.label'),
  };

  const cardVariants = {
    initial: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      exit="exit"
      className={`p-3 bg-gray-800/50 border rounded-lg transition-all duration-300 ${isSelected ? 'border-purple-600 bg-purple-900/30' : 'border-gray-700 hover:bg-gray-700/50'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-grow overflow-hidden">
          <input
            title={t("history:selectItem")}
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectToggle(item.id)}
            className="mt-1 w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500 shrink-0"
          />
          <div className="flex-grow overflow-hidden">
            <p className="font-semibold text-white truncate" title={item.projectName}>{item.projectName}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <FileText className="w-3 h-3" />
              <span>{typeLabels[item.analysisType] || item.analysisType}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <Clock className="w-3 h-3" />
              <span>{item.timestamp}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-lg">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="font-bold text-white">{item.analysis.viability.score}</span>
          </div>
          <button title={t("history:deleteItem")} onClick={() => onDelete(item.id)} className="p-1 text-gray-500 hover:text-red-400 rounded-full">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <button onClick={() => onLoad(item)} className="mt-2 w-full text-center py-1 text-sm font-semibold text-blue-300 bg-blue-900/50 rounded-md hover:bg-blue-800/50 transition-colors">
        {t('actions.view')}
      </button>
    </motion.div>
  );
};

const HistoryPanel: React.FC = () => {
  const { t } = useTranslation(['common', 'history', 'settings']);
  const { showConfirmation } = useConfirmation();
  const { addNotification } = useNotification();
  const {
    isHistoryPanelOpen,
    setIsHistoryPanelOpen,
    history,
    handleLoadHistoryItem,
    handleDeleteHistoryItem,
    handleCompare,
    handleClearHistory,
    deletingHistoryId,
    handleImportAnalysis,
  } = useProjectContext();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const importFileRef = useRef<HTMLInputElement>(null);

  const selectedItems = useMemo(() =>
    history.filter(item => selectedIds.includes(item.id)),
    [history, selectedIds]
  );

  const typesAreDifferent = selectedIds.length === 2 && selectedItems[0].analysisType !== selectedItems[1].analysisType;
  const projectsAreDifferent = selectedIds.length === 2 && selectedItems[0].projectName !== selectedItems[1].projectName;
  const isCompareDisabled = selectedIds.length !== 2 || typesAreDifferent || projectsAreDifferent;

  const handleSelectToggle = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return prev; // Limit selection to 2
    });
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
          addNotification({ message: t('settings:importExport.emptyFile'), type: 'error' });
          return;
        }
        const importedAnalysis: ProjectAnalysis = JSON.parse(content);

        // Basic validation
        if (
          !importedAnalysis.projectName ||
          !importedAnalysis.analysisType ||
          !importedAnalysis.summary ||
          !Array.isArray(importedAnalysis.strengths) ||
          !importedAnalysis.improvements ||
          !importedAnalysis.nextSteps
        ) {
          addNotification({ message: t('history:notifications.invalidFile'), type: 'error' });
          return;
        }

        handleImportAnalysis(importedAnalysis);
      } catch (error) {
        addNotification({ message: t('history:notifications.invalidFile'), type: 'error' });
      } finally {
        if (importFileRef.current) {
          importFileRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    showConfirmation({
      title: t('history:clearConfirm.title'),
      message: t('history:clearConfirm.message'),
      onConfirm: () => {
        handleClearHistory();
        setSelectedIds([]);
      },
    });
  };

  const sortedHistory = [...history].sort((a, b) => b.id - a.id);

  return (
    <AnimatePresence>
      {isHistoryPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsHistoryPanelOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 shrink-0">
              <div className="flex items-center gap-3">
                <HistoryIcon className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">{t('history:title')}</h2>
              </div>
              <button title={t("history:closePanel")} onClick={() => setIsHistoryPanelOpen(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow p-4 overflow-y-auto">
              {history.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {sortedHistory.map(item => (
                      <HistoryItemCard
                        key={item.id}
                        item={item}
                        isSelected={selectedIds.includes(item.id)}
                        onSelectToggle={handleSelectToggle}
                        onLoad={handleLoadHistoryItem}
                        onDelete={handleDeleteHistoryItem}
                        isDeleting={deletingHistoryId === item.id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <HistoryIcon className="w-12 h-12 mb-4" />
                  <h3 className="font-semibold text-lg text-gray-400">{t('history:empty.title')}</h3>
                  <p className="text-sm">{t('history:empty.subtitle')}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-900/50 border-t border-gray-700 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    disabled={history.length === 0}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-400 bg-transparent border border-transparent rounded-md hover:bg-red-900/50 hover:border-red-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" /> {t('history:clearAll')}
                  </button>
                  <input title={t("history:importFile")} type="file" ref={importFileRef} onChange={handleFileImport} className="hidden" accept=".json" />
                  <button
                    onClick={() => importFileRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-400 bg-transparent border border-transparent rounded-md hover:bg-blue-900/50 hover:border-blue-700/50"
                  >
                    <Upload className="w-4 h-4" /> {t('history:importAnalysis')}
                  </button>
                </div>
                <button
                  onClick={() => handleCompare(selectedIds)}
                  disabled={isCompareDisabled}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GitCompareArrows className="w-4 h-4" />
                  {t('history:compare')} ({selectedIds.length}/2)
                </button>
              </div>
              <AnimatePresence>
                {(projectsAreDifferent || typesAreDifferent) && (
                  <motion.p
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '8px' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="text-red-400 text-xs text-center"
                  >
                    {projectsAreDifferent
                      ? t('common:history.compareProjectMismatchError')
                      : t('common:history.compareMismatchError')}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistoryPanel;
