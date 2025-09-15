import { AnimatePresence, motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import * as React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useTranslation } from '../../hooks/useTranslation';

const NetworkStatusIndicator: React.FC = () => {
  const isOnline = useNetworkStatus();
  const { t } = useTranslation('common');

  return (
    <div className="fixed bottom-4 left-4 z-[100]">
      <AnimatePresence mode="wait">
        {isOnline ? (
          <motion.div
            key="online"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="group flex items-center gap-2 h-10 px-3 bg-green-900/80 border border-green-700 text-green-300 rounded-full shadow-lg backdrop-blur-md cursor-default"
          >
            <Wifi className="w-5 h-5 flex-shrink-0" />
            <div className="w-0 group-hover:w-[55px] transition-all duration-300 ease-in-out overflow-hidden">
              <span className="text-sm font-medium whitespace-nowrap">{t('network.online')}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="offline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3 bg-red-900/80 border border-red-700 text-red-300 rounded-lg flex items-center gap-3 shadow-lg backdrop-blur-md"
          >
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">{t('network.offline')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkStatusIndicator;
