import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Save, AlertTriangle, RefreshCw } from 'lucide-react';
import { AppSettings, UsageTracking } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  usageTracking: UsageTracking;
  onSave: (newSettings: AppSettings) => void;
  onResetUsage: () => void;
}

const MAX_TOKEN_LIMIT = 1000000;

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  usageTracking,
  onSave,
  onResetUsage,
}) => {
  const [localLimit, setLocalLimit] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { locale } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      setLocalLimit(settings.tokenLimit);
      setValidationError(null);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    if (validationError) return;
    onSave({ tokenLimit: localLimit });
    onClose();
  };
  
  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueStr = e.target.value;
    if (valueStr === '') {
        setLocalLimit(0);
        setValidationError(null);
        return;
    }

    const value = parseInt(valueStr, 10);
    
    if (isNaN(value) || value < 0) {
      setLocalLimit(0);
      setValidationError(null);
    } else {
      setLocalLimit(value);
      if (value > MAX_TOKEN_LIMIT) {
        setValidationError(t('settings.tokenLimitError', { limit: MAX_TOKEN_LIMIT.toLocaleString(locale) }));
      } else {
        setValidationError(null);
      }
    }
  };
  
  const currentMonthName = new Date(usageTracking.year, usageTracking.month).toLocaleString(locale, { month: 'long' });

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
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800/80 border border-gray-700 rounded-xl w-full max-w-lg flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">{t('settings.title')}</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">

              <div>
                <label htmlFor="token-limit" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('settings.monthlyTokenLimit')}
                </label>
                <input
                  id="token-limit"
                  type="number"
                  value={localLimit}
                  onChange={handleLimitChange}
                  className={`w-full p-2 bg-gray-900 border ${validationError ? 'border-red-500' : 'border-gray-600'} rounded-md focus:ring-2 ${validationError ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent`}
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">{t('settings.limitDescription')}</p>
                {validationError && (
                  <p className="text-xs text-red-400 mt-1">{validationError}</p>
                )}
              </div>

              <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-200">{t('settings.currentUsage')}</h3>
                <p className="text-sm text-gray-400">
                  {t('settings.usageForMonth', { month: currentMonthName })}:
                </p>
                <p className="text-2xl font-bold text-white mt-2">
                  {usageTracking.totalTokens.toLocaleString(locale)}
                  {settings.tokenLimit > 0 && (
                    <span className="text-base text-gray-400"> / {settings.tokenLimit.toLocaleString(locale)}</span>
                  )}
                  <span className="text-base text-gray-400"> {t('results.usageMetadata.tokens')}</span>
                </p>
                 <button
                    onClick={onResetUsage}
                    className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-yellow-400 bg-yellow-900/50 border border-yellow-700 rounded-md hover:bg-yellow-800/50 transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> {t('settings.resetUsage')}
                </button>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-900/30 border border-yellow-800/50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-300">
                    {t('settings.disclaimer')}
                  </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end">
              <button
                onClick={handleSave}
                disabled={!!validationError}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" /> {t('settings.saveAndClose')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;