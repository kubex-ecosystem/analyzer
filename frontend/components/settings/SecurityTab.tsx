import { Check, Loader2, Shield, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useUser } from '../../contexts/UserContext';
import { testApiKey } from '../../services/gemini/api';
import { UserSettings } from '../../types';

interface SecurityTabProps {
  // Usa contexto diretamente
}

const SecurityTab: React.FC<SecurityTabProps> = () => {
  const { addNotification } = useNotification();
  const { userSettings, updateUserSetting } = useUser();

  const [apiKey, setApiKey] = useState(userSettings.userApiKey || '');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'success' | 'failure' | null>(null);

  const handleFieldChange = (key: keyof UserSettings, value: any) => {
    updateUserSetting(key, value);

    // Feedback para mudanças de configuração
    const feedbackMessages = {
      apiProvider: `API provider changed to ${value}`,
      customApiEndpoint: `Custom API endpoint updated`,
    };

    const message = feedbackMessages[key as keyof typeof feedbackMessages];
    if (message) {
      addNotification({
        message: `🔧 ${message}`,
        type: 'success'
      });
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    updateUserSetting('userApiKey', newKey);
    setTestStatus(null);

    if (newKey.length > 0) {
      addNotification({
        message: '🔑 API key updated',
        type: 'success'
      });
    }
  };

  const handleTestApiKey = async () => {
    setIsTestingKey(true);
    const isValid = await testApiKey(apiKey);
    setTestStatus(isValid ? 'success' : 'failure');
    setIsTestingKey(false);

    // Feedback para teste de API key
    if (isValid) {
      addNotification({
        message: '✅ API key is valid and working correctly',
        type: 'success'
      });
    } else {
      addNotification({
        message: '❌ API key test failed - please verify your key',
        type: 'error'
      });
    }
  };

  const renderTestButton = () => {
    if (isTestingKey) {
      return <div className="flex items-center gap-2 text-blue-400"><Loader2 className="w-4 h-4 animate-spin" /> Testing...</div>;
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
      {/* API Configuration Section */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-400" /> API Configuration
        </h3>
        <div className="space-y-4">
          {/* API Provider */}
          <div className="flex items-start justify-between">
            <div>
              <label htmlFor="apiProvider" className="font-medium text-gray-200">API Provider</label>
              <p className="text-sm text-gray-400">Choose your preferred AI provider.</p>
            </div>
            <select
              id="apiProvider"
              value={userSettings.apiProvider || 'gemini'}
              onChange={(e) => handleFieldChange('apiProvider', e.target.value as UserSettings['apiProvider'])}
              className="mt-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="openai">OpenAI</option>
              <option value="claude">Claude</option>
              <option value="gemini">Google Gemini</option>
              <option value="ollama">Ollama</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Custom API Endpoint */}
          {userSettings.apiProvider === 'custom' && (
            <div className="flex items-start justify-between">
              <div>
                <label htmlFor="customApiEndpoint" className="font-medium text-gray-200">Custom API Endpoint</label>
                <p className="text-sm text-gray-400">URL for your custom API endpoint.</p>
              </div>
              <input
                id="customApiEndpoint"
                type="url"
                value={userSettings.customApiEndpoint || ''}
                onChange={(e) => handleFieldChange('customApiEndpoint', e.target.value)}
                placeholder="https://api.example.com"
                className="mt-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white w-64"
              />
            </div>
          )}

          {/* API Key */}
          <div>
            <label htmlFor="userApiKey" className="text-sm font-medium text-gray-300">Your API Key</label>
            <p className="text-sm text-gray-400 mb-2">Provide your own API key. Stored locally and securely in your browser.</p>
            <div className="flex gap-2">
              <input
                type="password"
                id="userApiKey"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Enter your API key"
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
        </div>
      </section>

      {/* Security Information */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" /> Security & Privacy
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-green-300 mb-2">🔒 Your Data is Secure</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• API keys are stored locally in your browser using encrypted IndexedDB</li>
              <li>• No sensitive data is transmitted to external servers</li>
              <li>• All communications use HTTPS encryption</li>
              <li>• You can clear all data at any time from the Data tab</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-300 mb-2">🛡️ API Key Best Practices</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Use dedicated API keys for this application</li>
              <li>• Set appropriate usage limits in your provider dashboard</li>
              <li>• Regularly rotate your API keys for enhanced security</li>
              <li>• Monitor usage through your provider's console</li>
            </ul>
          </div>

          <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-purple-300 mb-2">📊 Telemetry & Analytics</h4>
            <p className="text-xs text-gray-300">
              When telemetry is enabled, we collect anonymous usage statistics to improve the application.
              No personal data, API keys, or content is ever shared. You can disable this at any time in General settings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecurityTab;
