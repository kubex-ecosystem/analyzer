// Example: How to integrate the unified AI service in the React app
import React, { useState } from 'react';
import { createAIService, getAvailableProviders, type AIProvider } from '../../services/unified-ai';
import { AnalysisType } from '../../types';

interface AIProviderSelectorProps {
  onProviderChange: (provider: AIProvider) => void;
  currentProvider: AIProvider;
}

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  onProviderChange,
  currentProvider
}) => {
  const providers = getAvailableProviders();

  return (
    <div className="ai-provider-selector">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        AI Provider
      </label>
      <select
        title='Select AI Provider'
        value={currentProvider}
        onChange={(e) => onProviderChange(e.target.value as AIProvider)}
        className="w-full p-2 border border-gray-300 rounded-md"
      >
        {providers.map((provider) => (
          <option key={provider.value} value={provider.value}>
            {provider.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 mt-1">
        {providers.find(p => p.value === currentProvider)?.description}
      </p>
    </div>
  );
};

// Example usage in main component
export const ExampleUsage: React.FC = () => {
  const [provider, setProvider] = useState<AIProvider>('gemini-direct');
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTestConnection = async () => {
    try {
      const aiService = createAIService({
        provider,
        userApiKey: apiKey
      });

      await aiService.testConnection();
      setIsConnected(true);
      console.log('✅ Connection successful!');
    } catch (error) {
      setIsConnected(false);
      console.error('❌ Connection failed:', error);
    }
  };

  const handleAnalyzeProject = async () => {
    if (!isConnected) return;

    setIsAnalyzing(true);
    try {
      const aiService = createAIService({
        provider,
        userApiKey: apiKey
      });

      const analysis = await aiService.analyzeProject(
        "# Example Project\nThis is a test project...",
        AnalysisType.General,
        'en-US'
      );

      console.log('📊 Analysis result:', analysis);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const providerInfo = createAIService({ provider, userApiKey: apiKey }).getProviderInfo();

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">AI Provider Demo</h2>

      <AIProviderSelector
        currentProvider={provider}
        onProviderChange={setProvider}
      />

      {providerInfo.requiresApiKey && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter your API key..."
          />
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
        <h3 className="font-medium">Provider Info:</h3>
        <p><strong>Name:</strong> {providerInfo.name}</p>
        <p><strong>Type:</strong> {providerInfo.type}</p>
        <p><strong>Streaming:</strong> {providerInfo.supportsStreaming ? '✅' : '❌'}</p>
        <p><strong>Description:</strong> {providerInfo.description}</p>
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={handleTestConnection}
          disabled={providerInfo.requiresApiKey && !apiKey}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          Test Connection
        </button>

        {isConnected && (
          <button
            onClick={handleAnalyzeProject}
            disabled={isAnalyzing}
            className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : 'Test Analysis'}
          </button>
        )}
      </div>

      <div className="mt-4">
        <div className={`w-3 h-3 rounded-full inline-block mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm">
          {isConnected ? 'Connected' : 'Not connected'}
        </span>
      </div>
    </div>
  );
};

/**
 * Integration guide for existing App.tsx:
 *
 * 1. Add AI provider selection to settings:
 *    - Import AIProviderSelector
 *    - Add provider state to AppSettings
 *    - Add provider selector to UserSettingsModal
 *
 * 2. Replace direct Gemini calls:
 *    - Import createAIService instead of direct imports
 *    - Create AI service instance with selected provider
 *    - Replace analyzeProject calls with aiService.analyzeProject
 *
 * 3. Maintain backward compatibility:
 *    - Default to 'gemini-direct' for existing users
 *    - Gradual migration - add new providers as options
 *    - Keep existing UI/UX exactly the same
 *
 * Example migration in App.tsx:
 *
 * // OLD:
 * import { analyzeProject } from './services/gemini';
 * const analysis = await analyzeProject(context, type, locale, apiKey);
 *
 * // NEW:
 * import { createAIService } from './services/unified-ai';
 * const aiService = createAIService({ provider: settings.aiProvider, userApiKey: apiKey });
 * const analysis = await aiService.analyzeProject(context, type, locale);
 */
