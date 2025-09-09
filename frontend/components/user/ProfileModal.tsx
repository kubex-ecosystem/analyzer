import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, Save } from 'lucide-react';
import { UserProfile } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (newProfile: UserProfile) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [localName, setLocalName] = useState('');
  const [localApiKey, setLocalApiKey] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      setLocalName(profile.name || '');
      setLocalApiKey(profile.apiKey || '');
    }
  }, [isOpen, profile]);

  const handleSave = () => {
    onSave({ name: localName, apiKey: localApiKey });
  };

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
            className="bg-gray-800/80 border border-gray-700 rounded-xl w-full max-w-md flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">{t('profile.title')}</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="user-name" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('profile.nameLabel')}
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={t('profile.namePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('profile.apiKeyLabel')}
                </label>
                <input
                  id="api-key"
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  placeholder={t('profile.apiKeyPlaceholder')}
                />
              </div>
               <div className="text-xs text-gray-400 p-3 bg-gray-900/50 border border-dashed border-gray-600 rounded-md">
                {t('profile.apiKeyNotice')}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
              >
                <Save className="w-4 h-4" /> {t('profile.save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;