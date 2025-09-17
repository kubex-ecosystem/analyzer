import { AnimatePresence, motion } from 'framer-motion';
import { Database, GitBranch, Save, Settings, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useTranslation } from '../../hooks/useTranslation';

import ProfileTab from '../user/ProfileModal';
import DataTab from './DataTab';
import IntegrationsTab from './IntegrationsTab';
import PreferencesTab from './PreferencesTab';


const TabButton: React.FC<{ label: string; icon: React.ElementType; isActive: boolean; onClick: () => void }> = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium border-b-2 transition-all duration-200
        ${isActive
        ? 'text-white border-purple-500'
        : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const UserSettingsModal: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const {
    isUserSettingsModalOpen,
    setIsUserSettingsModalOpen,
    settings,
    setSettings,
    userProfile: profile,
    setUserProfile,
    isExample
  } = useProjectContext();

  const [activeTab, setActiveTab] = useState('profile');
  const [currentSettings, setCurrentSettings] = useState(settings);
  const [currentProfile, setCurrentProfile] = useState(profile);

  // Reset local state when modal opens or props change
  useEffect(() => {
    if (isUserSettingsModalOpen) {
      setCurrentSettings(settings);
      setCurrentProfile(profile);
    }
  }, [isUserSettingsModalOpen, settings, profile]);

  const handleSave = () => {
    if (activeTab === 'profile') {
      setUserProfile(currentProfile);
      addNotification({ message: t('notifications.profileSaved'), type: 'success' });
    } else {
      setSettings(currentSettings);
      addNotification({ message: t('notifications.settingsSaved'), type: 'success' });
    }
    setIsUserSettingsModalOpen(false);
  };

  const tabs = [
    { id: 'profile', label: t('tabs.profile'), icon: User },
    { id: 'preferences', label: t('tabs.preferences'), icon: Settings },
    { id: 'integrations', label: t('tabs.integrations'), icon: GitBranch },
    { id: 'data', label: t('tabs.data'), icon: Database },
  ];

  const { addNotification } = useNotification();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab profile={currentProfile} onProfileChange={setCurrentProfile} />;
      case 'preferences':
        return <PreferencesTab settings={currentSettings} onSettingsChange={setCurrentSettings} />;
      case 'integrations':
        return <IntegrationsTab settings={currentSettings} onSettingsChange={setCurrentSettings} />;
      case 'data':
        return <DataTab isExample={isExample} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isUserSettingsModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsUserSettingsModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-4xl flex flex-col shadow-2xl h-[680px]"
          >
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white text-center">{t('title')}</h2>
            </div>

            <div className="flex border-b border-gray-700">
              {tabs.map(tab => (
                <TabButton
                  key={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>

            <div className="overflow-y-auto grow p-6">
              {renderTabContent()}
            </div>

            <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isExample && activeTab !== 'data'}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {activeTab === 'profile' ? t('profile.save') : t('save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserSettingsModal;
