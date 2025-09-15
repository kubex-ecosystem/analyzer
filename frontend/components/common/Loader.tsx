import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

const Loader: React.FC = () => {
  const { t, isLoading } = useTranslation('common');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingSteps: string[] = !isLoading ? (t('loader.steps') as any || []) : [];

  useEffect(() => {
    if (loadingSteps.length > 0) {
      const interval = setInterval(() => {
        setCurrentMessageIndex(prevIndex => (prevIndex + 1) % loadingSteps.length);
      }, 2500); // Change message every 2.5 seconds

      return () => clearInterval(interval);
    }
  }, [loadingSteps.length]);

  if (isLoading) return null; // Or a minimal spinner

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm"
      aria-label={t('loader.ariaLabel')}
    >
      <div className="relative h-16 w-16">
        <div className="absolute h-full w-full rounded-full border-4 border-t-blue-500 border-gray-700 animate-spin"></div>
        <div className="absolute h-full w-full rounded-full border-4 border-t-purple-500 border-gray-700 animate-spin [animation-delay:-0.2s]"></div>
      </div>
      <div className="mt-4 text-center h-12">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="text-lg font-medium text-gray-400"
          >
            {loadingSteps[currentMessageIndex] || t('loader.message')}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="text-sm text-gray-500">{t('loader.subMessage')}</p>
    </motion.div>
  );
};

export default Loader;
