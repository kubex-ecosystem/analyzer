import React, { useState } from 'react';
// FIX: Corrected import path for types
import { Check, Key, Loader2, Settings as SettingsIcon, X } from 'lucide-react';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useNotification } from '../../contexts/NotificationContext';
import { testApiKey } from '../../services/gemini/api';
import { AppSettings } from '../../types';
// FIX: Corrected import path for ProjectContext
import { useProjectContext } from '../../contexts/ProjectContext';

interface PreferencesTabProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

const PreferencesTab: React.FC<PreferencesTabProps> = ({ settings, onSettingsChange }) => {
  const { addNotification } = useNotification();
  const { showConfirmation } = useConfirmation();
  // FIX: handleClearHistory is now available on the context
  const { handleClearHistory } = useProjectContext();

  const [apiKey, setApiKey] = useState(settings.userApiKey || '');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'success' | 'failure' | null>(null);

  const handleFieldChange = (key: keyof AppSettings, value: any) => {
    if (key === 'saveHistory' && value === false && settings.saveHistory === true) {
      showConfirmation({
        title: 'Disable History Saving',
        message: 'Disabling this option will also clear the current analysis history for this project. Are you sure you want to continue?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => {
          onSettingsChange({ ...settings, saveHistory: false });
          handleClearHistory();
          addNotification({ message: 'History saving disabled and history cleared.', type: 'info' });
        },
        // onCancel, do nothing, the switch visually reverts because state wasn't changed.
      });
    } else {
      onSettingsChange({ ...settings, [key]: value });
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    onSettingsChange({ ...settings, userApiKey: newKey });
    setTestStatus(null);
  };

  const handleTestApiKey = async () => {
    setIsTestingKey(true);
    setTestStatus(null);
    try {
      await testApiKey(apiKey);
      setTestStatus('success');
      addNotification({ message: 'API key is valid and working!', type: 'success' });
    } catch (error: any) {
      setTestStatus('failure');
      const errorMessage = error.message === "API_KEY_EMPTY"
        ? 'API key field cannot be empty.'
        : 'API key test failed. Please check the key and try again.';
      addNotification({ message: errorMessage, type: 'error' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const renderTestButton = () => {
    if (isTestingKey) {
      return <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Testing...</div>;
    }
    if (testStatus === 'success') {
      return <div className="flex items-center gap-2 text-green-400"><Check className="w-4 h-4" /> Valid</div>;
    }
    if (testStatus === 'failure') {
      return <div className="flex items-center gap-2 text-red-400"><X className="w-4 h-4" /> Invalid</div>;
    }
    return 'Test Key';
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-gray-400" /> Preferences</h3>
        <div className="space-y-4">
          {/* Save History Button */}
          <div className="flex items-start justify-between">
            <div>
              <label htmlFor="saveHistory" className="font-medium text-gray-200">Save Analysis History</label>
              <p className="text-sm text-gray-400">Automatically save each analysis to the project's history.</p>
            </div>
            <input
              id="saveHistory"
              type="checkbox"
              checked={settings.saveHistory}
              onChange={(e) => handleFieldChange('saveHistory', e.target.checked)}
              className="mt-1 w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
            />
          </div>
          {/* Enable Dashboard Insights Button */}
          <div className="flex items-start justify-between">
            <div>
              <label htmlFor="enableDashboardInsights" className="font-medium text-gray-200">Enable Dashboard Insights</label>
              <p className="text-sm text-gray-400">Allow the AI to generate a personalized insight on your dashboard based on recent activity.</p>
            </div>
            <input
              id="enableDashboardInsights"
              type="checkbox"
              checked={settings.enableDashboardInsights}
              onChange={(e) => handleFieldChange('enableDashboardInsights', e.target.checked)}
              className="mt-1 w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-gray-400" /> Gemini API Key</h3>
        <p className="text-sm text-gray-400 mb-4">Provide your own Google Gemini API key to use the tool. Your key is stored locally in your browser.</p>
        <div>
          <label htmlFor="geminiApiKey" className="text-sm font-medium text-gray-300">Your API Key</label>
          <div className="flex gap-2 mt-1">
            <input
              type="password"
              id="geminiApiKey"
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="Enter your Google Gemini API key"
              className="flex-grow p-2 bg-gray-900 border border-gray-600 rounded-md"
            />
            <button
              onClick={handleTestApiKey}
              disabled={isTestingKey}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600"
            >
              {renderTestButton()}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PreferencesTab;
