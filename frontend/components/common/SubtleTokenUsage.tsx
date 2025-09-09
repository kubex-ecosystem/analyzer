import { motion } from 'framer-motion';
import * as React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

interface SubtleTokenUsageProps {
  limit: number;
  consumed: number;
}

const SubtleTokenUsage: React.FC<SubtleTokenUsageProps> = ({ limit, consumed }) => {
  const { t } = useTranslation();
  const { locale } = useLanguage();

  if (limit <= 0) {
    return null; // Don't show if there's no limit
  }

  const percentage = Math.round((consumed / limit) * 100);

  let progressBarColor = 'bg-green-500';
  if (percentage >= 90) {
    progressBarColor = 'bg-red-500';
  } else if (percentage >= 70) {
    progressBarColor = 'bg-yellow-500';
  }

  return (
    <div className="w-full text-xs text-gray-400">
      <div className="flex justify-between mb-1">
        <span>{t('tokenUsage.monthlyUsage')}</span>
        <span>{`${consumed.toLocaleString(locale)} / ${limit.toLocaleString(locale)}`}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <motion.div
          className={`h-1.5 rounded-full ${progressBarColor}`}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default SubtleTokenUsage;
