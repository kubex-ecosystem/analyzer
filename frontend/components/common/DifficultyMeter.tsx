import * as React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Difficulty } from '../../types';

interface DifficultyMeterProps {
  difficulty: Difficulty;
}

const DifficultyMeter: React.FC<DifficultyMeterProps> = ({ difficulty }) => {
  const { t } = useTranslation();

  const config: Record<Difficulty, { colorClass: string; activeBars: number }> = {
    [Difficulty.Low]: { colorClass: 'bg-green-500', activeBars: 1 },
    [Difficulty.Medium]: { colorClass: 'bg-yellow-500', activeBars: 2 },
    [Difficulty.High]: { colorClass: 'bg-red-500', activeBars: 3 },
  };

  const { colorClass, activeBars } = config[difficulty];
  const label = t(`difficulty.${difficulty}`);

  return (
    <div className="flex items-center gap-2 text-xs text-gray-300">
      <span className="font-medium">{t('common.difficulty')}:</span>
      <div className="flex items-center gap-1" title={`${t('common.difficulty')}: ${label}`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-2 rounded-full transition-colors ${i < activeBars ? colorClass : 'bg-gray-600'}`}
          />
        ))}
      </div>
      <span className="w-10 text-left">{label}</span>
    </div>
  );
};

export default DifficultyMeter;
