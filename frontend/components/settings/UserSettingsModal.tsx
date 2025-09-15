import { AnimatePresence, motion } from 'framer-motion';
import { Database, GitBranch, Save, Settings, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from '../../hooks/useTranslation';

import ProfileTab from '../user/ProfileModal';
import SettingsTabs from './SettingsModal';

import { defaultSettings, defaultUserProfile } from '../../constants';
import { get, set } from '../../lib/idb';
import { clearAllAppData } from '../../lib/storage';
import { AllChatHistories, AppSettings, HistoryItem, KanbanState, UserProfile } from '../../types';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  isExample: boolean;
}

interface BackupData {
  timestamp: string;
  version: string;
  settings: AppSettings;
  profile: UserProfile;
  history: HistoryItem[];
  kanban: KanbanState | null;
  chats: AllChatHistories;
}

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

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, settings, onSaveSettings, profile, onSaveProfile, isExample }) => {
  const { t } = useTranslation(['settings', 'common']);
  const { addNotification } = useNotification();
  const { showConfirmation } = useConfirmation();
  const { resetApplication } = useAppContext();
  const importFileRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [currentSettings, setCurrentSettings] = useState(settings);
  const [currentProfile, setCurrentProfile] = useState(profile);

  // Reset local state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setCurrentSettings(settings);
      setCurrentProfile(profile);
    }
  }, [isOpen, settings, profile]);

  const handleSaveProfile = () => {
    onSaveProfile(currentProfile);
    addNotification({ message: t('notifications.profileSaved'), type: 'success' });
  };

  const handleSaveSettings = () => {
    onSaveSettings(currentSettings);
    addNotification({ message: t('notifications.settingsSaved'), type: 'success' });
  };

  const handleSave = () => {
    if (activeTab === 'profile') {
      handleSaveProfile();
    } else {
      handleSaveSettings();
    }
    onClose();
  };

  const handleExport = async () => {
    try {
      const history = await get<HistoryItem[]>('analysisHistory') || [];
      const kanban = await get<KanbanState | null>('kanbanState') || null;
      const chats = await get<AllChatHistories>('allChatHistories') || {};

      if (history.length === 0 && !kanban && Object.keys(chats).length === 0) {
        addNotification({ message: t('importExport.noData'), type: 'info' });
        return;
      }

      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0', // Basic versioning
        settings: settings,
        profile: profile,
        history: history,
        kanban: kanban,
        chats: chats,
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `gemx_backup_${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addNotification({ message: t('notifications.exportSuccess'), type: 'success' });
    } catch (error: any) {
      console.error('Export failed:', error);
      addNotification({ message: t('notifications.exportError'), type: 'error' });
    }
  };

  const handleImport = async (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) {
          throw new Error(t('importExport.emptyFile'));
        }
        const importedData: BackupData = JSON.parse(content);

        // Basic validation
        if (!importedData.version || !importedData.settings || !importedData.profile || !Array.isArray(importedData.history)) {
          throw new Error(t('importExport.invalidFile'));
        }

        showConfirmation({
          title: t('importExport.confirm.title'),
          message: t('importExport.confirm.message'),
          confirmText: t('importExport.importLabel'),
          onConfirm: async () => {
            try {
              await clearAllAppData();

              // Merge imported settings with defaults to ensure compatibility
              const finalSettings = { ...defaultSettings, ...importedData.settings };
              const finalProfile = { ...defaultUserProfile, ...importedData.profile };

              await set('appSettings', finalSettings);
              await set('userProfile', finalProfile);
              await set('analysisHistory', importedData.history);
              await set('kanbanState', importedData.kanban);
              await set('allChatHistories', importedData.chats);

              addNotification({ message: t('notifications.importSuccess'), type: 'success' });

              // Use the context to trigger a "hard reset" without a full page reload
              resetApplication();

            } catch (error: any) {
              addNotification({ message: error.message, type: 'error' });
            }
          },
          onCancel: () => {
            addNotification({ message: t('notifications.importAborted'), type: 'info' });
          }
        });

      } catch (error: any) {
        console.error('Import failed:', error);
        addNotification({ message: error.message || t('notifications.importError'), type: 'error' });
      } finally {
        if (importFileRef.current) importFileRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'profile', label: t('tabs.profile'), icon: User },
    { id: 'preferences', label: t('tabs.preferences'), icon: Settings },
    { id: 'integrations', label: t('tabs.integrations'), icon: GitBranch },
    { id: 'data', label: t('tabs.data'), icon: Database },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab profile={currentProfile} onProfileChange={setCurrentProfile} />;
      case 'preferences':
      case 'integrations':
        return <SettingsTabs settings={currentSettings} onSettingsChange={setCurrentSettings} />;
      case 'data':
        return (
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">{t('importExport.title')}</h3>
            <p className="text-sm text-gray-400">{t('importExport.description')}</p>
            <div className="p-4 bg-yellow-900/30 border border-yellow-700/50 text-yellow-300 rounded-lg text-sm">
              {t('importExport.warning')}
            </div>
            <div className="flex gap-4">
              <input title='Import JSON file' type="file" ref={importFileRef} onChange={(e) => e.target.files && handleImport(e.target.files[0])} className="hidden" accept=".json" />
              <button onClick={() => importFileRef.current?.click()} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                {t('importExport.importLabel')}
              </button>
              <button onClick={handleExport} disabled={isExample} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                {t('importExport.exportLabel')}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
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

            <div className="overflow-y-auto grow p-4">
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
