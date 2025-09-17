import React, { useState } from 'react';
import { AppSettings } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import { testApiKey } from '../../services/gemini/api';
import { useNotification } from '../../contexts/NotificationContext';
import { Check, Loader2, X, Key, Settings as SettingsIcon } from 'lucide-react';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useProjectContext } from '../../contexts/ProjectContext';

interface PreferencesTabProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

const PreferencesTab: React.FC<PreferencesTabProps> = ({ settings, onSettingsChange }) => {
    const { t } = useTranslation(['settings', 'common']);
    const { locale, setLocale } = useLanguage();
    const { addNotification } = useNotification();
    const { showConfirmation } = useConfirmation();
    const { handleClearHistory } = useProjectContext();

    const [apiKey, setApiKey] = useState(settings.userApiKey || '');
    const [isTestingKey, setIsTestingKey] = useState(false);
    const [testStatus, setTestStatus] = useState<'success' | 'failure' | null>(null);

    const handleFieldChange = (key: keyof AppSettings, value: any) => {
        if (key === 'saveHistory' && value === false && settings.saveHistory === true) {
            showConfirmation({
                title: t('clearHistoryOnDisable.title'),
                message: t('clearHistoryOnDisable.message'),
                confirmText: t('common:common.confirm'),
                cancelText: t('common:common.cancel'),
                onConfirm: () => {
                    onSettingsChange({ ...settings, saveHistory: false });
                    handleClearHistory();
                    addNotification({ message: t('clearHistoryOnDisable.cleared'), type: 'info' });
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
            addNotification({ message: t('notifications.apiKeyTestSuccess'), type: 'success' });
        } catch (error: any) {
            setTestStatus('failure');
            const errorMessage = error.message === "API_KEY_EMPTY" 
                ? t('notifications.apiKeyTestEmpty') 
                : t('notifications.apiKeyTestFailure');
            addNotification({ message: errorMessage, type: 'error' });
        } finally {
            setIsTestingKey(false);
        }
    };

    const renderTestButton = () => {
        if (isTestingKey) {
            return <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {t('apiKeys.gemini.testing')}</div>;
        }
        if (testStatus === 'success') {
            return <div className="flex items-center gap-2 text-green-400"><Check className="w-4 h-4" /> {t('apiKeys.gemini.testSuccess')}</div>;
        }
        if (testStatus === 'failure') {
            return <div className="flex items-center gap-2 text-red-400"><X className="w-4 h-4" /> {t('apiKeys.gemini.testFailure')}</div>;
        }
        return t('apiKeys.gemini.testButton');
    };

    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-gray-400"/> {t('tabs.preferences')}</h3>
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <label htmlFor="saveHistory" className="font-medium text-gray-200">{t('saveHistory.label')}</label>
                            <p className="text-sm text-gray-400">{t('saveHistory.description')}</p>
                        </div>
                        <input
                            id="saveHistory"
                            type="checkbox"
                            checked={settings.saveHistory}
                            onChange={(e) => handleFieldChange('saveHistory', e.target.checked)}
                            className="mt-1 w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                        />
                    </div>
                     <div className="flex items-start justify-between">
                        <div>
                            <label htmlFor="enableDashboardInsights" className="font-medium text-gray-200">{t('dashboardInsights.label')}</label>
                            <p className="text-sm text-gray-400">{t('dashboardInsights.description')}</p>
                        </div>
                        <input
                            id="enableDashboardInsights"
                            type="checkbox"
                            checked={settings.enableDashboardInsights}
                            onChange={(e) => handleFieldChange('enableDashboardInsights', e.target.checked)}
                            className="mt-1 w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="language" className="text-sm font-medium text-gray-300">{t('language.label')}</label>
                        <select
                            id="language"
                            value={locale}
                            onChange={(e) => setLocale(e.target.value as 'en-US' | 'pt-BR')}
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-600 rounded-md"
                        >
                            <option value="en-US">English (US)</option>
                            <option value="pt-BR">Português (Brasil)</option>
                        </select>
                    </div>
                </div>
            </section>
            
            <section>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-gray-400"/> {t('apiKeys.gemini.title')}</h3>
                <p className="text-sm text-gray-400 mb-4">{t('apiKeys.gemini.description')}</p>
                <div>
                    <label htmlFor="geminiApiKey" className="text-sm font-medium text-gray-300">{t('apiKeys.gemini.label')}</label>
                    <div className="flex gap-2 mt-1">
                        <input
                            type="password"
                            id="geminiApiKey"
                            value={apiKey}
                            onChange={handleApiKeyChange}
                            placeholder={t('apiKeys.gemini.placeholder')}
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