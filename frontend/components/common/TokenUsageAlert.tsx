import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import * as React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

interface TokenUsageAlertProps {
  limit: number;
  consumed: number;
}

const TokenUsageAlert: React.FC<TokenUsageAlertProps> = ({ limit, consumed }) => {
  const { t } = useTranslation('common');
  const { locale } = useLanguage();

  if (limit <= 0) {
    return null;
  }

  const percentage = Math.round((consumed / limit) * 100);

  let progressBarColor = 'bg-green-500';
  let textColor = 'text-green-300';
  let borderColor = 'border-green-700/50';
  let bgColor = 'bg-green-900/20';

  if (percentage >= 90) {
    progressBarColor = 'bg-red-500';
    textColor = 'text-red-300';
    borderColor = 'border-red-700/50';
    bgColor = 'bg-red-900/20';
  } else if (percentage >= 70) {
    progressBarColor = 'bg-yellow-500';
    textColor = 'text-yellow-300';
    borderColor = 'border-yellow-700/50';
    bgColor = 'bg-yellow-900/20';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg border ${borderColor} ${bgColor} ${textColor}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold">{t('tokenUsage.title')}</span>
        </div>
        <p>
          {t('tokenUsage.usageText', {
            consumed: consumed.toLocaleString(locale),
            limit: limit.toLocaleString(locale),
            percentage
          })}
        </p>
      </div>
      <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
        <motion.div
          className={`h-1.5 rounded-full ${progressBarColor}`}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
};

export default TokenUsageAlert;
