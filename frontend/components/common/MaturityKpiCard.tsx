import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { MaturityLevel, ProjectMaturity } from '../../types';

interface MaturityKpiCardProps {
  maturity: ProjectMaturity;
}

const maturityConfig: Record<MaturityLevel, { labelKey: string; color: string; width: string }> = {
  [MaturityLevel.Prototype]: { labelKey: 'maturityLevels.PROTOTYPE', color: 'bg-red-500', width: '25%' },
  [MaturityLevel.MVP]: { labelKey: 'maturityLevels.MVP', color: 'bg-yellow-500', width: '50%' },
  [MaturityLevel.Production]: { labelKey: 'maturityLevels.PRODUCTION', color: 'bg-green-500', width: '75%' },
  [MaturityLevel.Optimized]: { labelKey: 'maturityLevels.OPTIMIZED', color: 'bg-blue-500', width: '100%' },
};

const MaturityKpiCard: React.FC<MaturityKpiCardProps> = ({ maturity }) => {
  const { t } = useTranslation();
  const config = maturityConfig[maturity.level];

  if (!config) {
    console.warn(`Unknown maturity level: ${maturity.level}`);
    return null;
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-800 to-gray-900/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm h-full transition-all duration-300 hover:border-purple-500/50 hover:scale-[1.02] flex flex-col justify-between"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Rocket className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">{t('results.maturity.title')}</h3>
        </div>
        <p className="text-sm text-gray-400 italic">"{maturity.assessment}"</p>
      </div>

      <div className="mt-4">
        <div className="relative w-full bg-gray-700 rounded-full h-2.5">
          <motion.div
            className={`h-2.5 rounded-full ${config.color}`}
            initial={{ width: '0%' }}
            animate={{ width: config.width }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1.5 px-1">
          <span>{t('maturityLevels.PROTOTYPE')}</span>
          <span>{t('maturityLevels.MVP')}</span>
          <span>{t('maturityLevels.PRODUCTION')}</span>
          <span>{t('maturityLevels.OPTIMIZED')}</span>
        </div>
        <div className="text-center mt-2">
          <span className={`text-lg font-bold ${config.color.replace('bg-', 'text-')}`}>
            {t(config.labelKey)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MaturityKpiCard;
