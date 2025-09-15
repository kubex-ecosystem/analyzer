import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { AnalysisFeature } from './LandingPage';

interface FeatureDetailModalProps {
  feature: AnalysisFeature | null;
  onClose: () => void;
}

const colorMap = {
  blue: { text: 'text-blue-400', border: 'border-blue-600/60', shadowRgb: '96, 165, 250' },
  red: { text: 'text-red-400', border: 'border-red-600/60', shadowRgb: '248, 113, 113' },
  purple: { text: 'text-purple-400', border: 'border-purple-600/60', shadowRgb: '192, 132, 252' },
  teal: { text: 'text-teal-400', border: 'border-teal-600/60', shadowRgb: '45, 212, 191' },
};

const FeatureDetailModal: React.FC<FeatureDetailModalProps> = ({ feature, onClose }) => {
  const { t } = useTranslation(['landing', 'input']);

  return (
    <AnimatePresence>
      {feature && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{ '--shadow-rgb': colorMap[feature.color].shadowRgb } as React.CSSProperties}
            className={`bg-gray-800 border ${colorMap[feature.color].border} rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative shadow-[0_4px_30px_rgba(var(--shadow-rgb),0.2)]`}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-gray-900/50 p-3 rounded-full">
                  <feature.icon className={`w-7 h-7 ${colorMap[feature.color].text}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{t(feature.titleKey)}</h2>
                  <p className="text-gray-400">{t(feature.descriptionKey)}</p>
                </div>
              </div>
              <button title={t('common.close')} onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 transition-colors absolute top-4 right-4">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                {t(feature.detailKey)}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeatureDetailModal;
