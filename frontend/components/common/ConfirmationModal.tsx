import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import * as React from 'react';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useTranslation } from '../../hooks/useTranslation';

const ConfirmationModal: React.FC = () => {
  const { isOpen, options, hideConfirmation } = useConfirmation();
  const { t } = useTranslation('common');

  if (!options) return null;

  const handleConfirm = () => {
    options.onConfirm();
    hideConfirmation();
  };

  const handleCancel = () => {
    if (options.onCancel) {
      options.onCancel();
    }
    hideConfirmation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 border border-red-700/80 rounded-xl w-full max-w-md flex flex-col shadow-2xl"
          >
            {/* Content */}
            <div className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="mt-4 text-xl font-bold text-white">{options.title}</h2>
              <p className="mt-2 text-sm text-gray-400">{options.message}</p>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-end gap-3">
              <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">
                {options.cancelText || t('common.cancel')}
              </button>
              <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">
                {options.confirmText || t('common.confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
