import React, { useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useTranslation } from '../../hooks/useTranslation';

import { defaultSettings, defaultUserProfile } from '../../constants';
import { get, set } from '../../lib/idb';
import { clearAllAppData } from '../../lib/storage';
import { AllChatHistories, AppSettings, HistoryItem, KanbanState, UserProfile } from '../../types';


interface DataTabProps {
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

const DataTab: React.FC<DataTabProps> = ({ isExample }) => {
  const { t } = useTranslation(['settings', 'common']);
  const { addNotification } = useNotification();
  const { showConfirmation } = useConfirmation();
  const { resetApplication } = useAppContext();
  const { settings, userProfile: profile } = useProjectContext();
  const importFileRef = useRef<HTMLInputElement>(null);

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

              const finalSettings = { ...defaultSettings, ...importedData.settings };
              const finalProfile = { ...defaultUserProfile, ...importedData.profile };

              await set('appSettings', finalSettings);
              await set('userProfile', finalProfile);
              await set('analysisHistory', importedData.history);
              await set('kanbanState', importedData.kanban);
              await set('allChatHistories', importedData.chats || {});

              addNotification({ message: t('notifications.importSuccess'), type: 'success' });
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">{t('importExport.title')}</h3>
      <p className="text-sm text-gray-400">{t('importExport.description')}</p>
      <div className="p-4 bg-yellow-900/30 border border-yellow-700/50 text-yellow-300 rounded-lg text-sm">
        {t('importExport.warning')}
      </div>
      <div className="flex gap-4">
        <label className="flex-1 flex flex-col items-center px-4 py-6 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:border-gray-400">
          <input type="file" ref={importFileRef} onChange={(e) => e.target.files && handleImport(e.target.files[0])} className="hidden" accept=".json" />
          <button onClick={() => importFileRef.current?.click()} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            {t('importExport.importLabel')}
          </button>
          <button onClick={handleExport} disabled={isExample} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
            {t('importExport.exportLabel')}
          </button>
        </label>
      </div>
    </div>
  );
};

export default DataTab;
