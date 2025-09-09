import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import * as React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useTranslation } from '../../hooks/useTranslation';

const NetworkStatusIndicator: React.FC = () => {
  const isOnline = useNetworkStatus();
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-4 z-[100] p-3 bg-red-900/80 border border-red-700 text-red-300 rounded-lg flex items-center gap-3 shadow-lg backdrop-blur-md"
        >
          <WifiOff className="w-5 h-5" />
          <span className="text-sm font-medium">{t('network.offline')}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatusIndicator;
