import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Edit, Info, Save, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Difficulty, KanbanCard, Priority } from '../../types';

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: KanbanCard | Omit<KanbanCard, 'id'> | null;
  onSave: (card: KanbanCard | Omit<KanbanCard, 'id'>) => void;
  onDelete: (cardId: string) => void;
  isExample?: boolean;
}

const EditCardModal: React.FC<EditCardModalProps> = ({ isOpen, onClose, card, onSave, onDelete, isExample = false }) => {
  const { t } = useTranslation(['kanban', 'common']);
  const [formData, setFormData] = useState<Partial<KanbanCard>>({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (card) {
      setFormData(card);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: Priority.Medium,
        difficulty: Difficulty.Medium,
        tags: [],
        notes: '',
      });
    }
  }, [card]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (isExample) return;
    if (formData.title) {
      onSave(formData as KanbanCard | Omit<KanbanCard, 'id'>);
    }
  };

  const handleDelete = () => {
    if (isExample) return;
    if ('id' in formData && formData.id) {
      onDelete(formData.id);
    }
    setIsDeleteConfirmOpen(false);
  };

  const isNewCard = !('id' in formData) || !formData.id;

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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg flex flex-col shadow-2xl max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Edit className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">
                  {isNewCard ? t('kanban.addCard') : t('kanban.editCard')}
                </h2>
              </div>
              <button title={t('common.close')} onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {isExample && (
                <div className="p-3 mb-2 bg-purple-900/50 border border-purple-700 text-purple-300 rounded-lg flex items-center gap-3 text-sm">
                  <Info className="w-5 h-5 shrink-0" />
                  <p>{t('kanban.exampleModeNotice')}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-300">{t('common.title')}</label>
                <input
                  title={t('common.title')}
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 bg-gray-900 border border-gray-600 rounded-md"
                />
              </div>

              {!isNewCard && (
                <div>
                  <label className="text-sm font-medium text-gray-400">{t('kanban.originalDescription')}</label>
                  <div className="w-full p-2 mt-1 bg-gray-900/50 border border-gray-700 rounded-md text-sm text-gray-400 max-h-28 overflow-y-auto">
                    {formData.description || ''}
                  </div>
                </div>
              )}

              {isNewCard && (
                <div>
                  <label className="text-sm font-medium text-gray-300">{t('common.description')}</label>
                  <textarea
                    title={t('common.description')}
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 mt-1 bg-gray-900 border border-gray-600 rounded-md resize-y"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-300">{t('kanban.notes')}</label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder={t('kanban.notesPlaceholder')}
                  className="w-full p-2 mt-1 bg-gray-900 border border-gray-600 rounded-md resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">{t('common.priority')}</label>
                  <select
                    title={t('common.priority')}
                    name="priority"
                    value={formData.priority || Priority.Medium}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 bg-gray-900 border border-gray-600 rounded-md"
                  >
                    {Object.values(Priority).map(p => <option key={p} value={p}>{t(`priority.${p}`)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">{t('common.difficulty')}</label>
                  <select
                    title={t('common.difficulty')}
                    name="difficulty"
                    value={formData.difficulty || Difficulty.Medium}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 bg-gray-900 border border-gray-600 rounded-md"
                  >
                    {Object.values(Difficulty).map(d => <option key={d} value={d}>{t(`difficulty.${d}`)}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-between items-center">
              {!isNewCard ? (
                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  disabled={isExample}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 bg-transparent border border-transparent rounded-md hover:bg-red-900/50 hover:border-red-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" /> {t('common.delete')}
                </button>
              ) : <div />}
              <button
                onClick={handleSave}
                disabled={isExample}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" /> {t('common.save')}
              </button>
            </div>

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
              {isDeleteConfirmOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm z-10 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gray-900 border border-red-700 rounded-xl p-6 max-w-sm text-center"
                  >
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                    <h3 className="mt-4 text-lg font-bold text-white">{t('kanban.deleteConfirm.title')}</h3>
                    <p className="mt-2 text-sm text-gray-400">{t('kanban.deleteConfirm.message')}</p>
                    <div className="mt-6 flex justify-center gap-4">
                      <button onClick={() => setIsDeleteConfirmOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">{t('common.cancel')}</button>
                      <button onClick={handleDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">{t('kanban.deleteConfirm.confirm')}</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditCardModal;
