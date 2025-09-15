// Unified AI service - allows switching between direct Gemini and Gateway
import { AnalysisType, EvolutionAnalysis, HistoryItem, ProjectAnalysis } from "../types";

// Direct Gemini imports (existing functionality)
import {
  analyzeProject as analyzeProjectDirect,
  compareAnalyses as compareAnalysesDirect,
  createChatSession as createChatSessionDirect,
  testApiKey as testApiKeyDirect
} from "./gemini/api";

// Gateway imports (new functionality)
import {
  analyzeProjectViaGateway,
  compareAnalysesViaGateway,
  createChatSessionViaGateway,
  testGatewayConnection
} from "./gateway/api";

export type AIProvider = 'gemini-direct' | 'gateway-gemini' | 'gateway-openai' | 'gateway-anthropic';

interface AIServiceConfig {
  provider: AIProvider;
  userApiKey?: string;
  gatewayUrl?: string;
}

/**
 * Unified AI Service - abstracts different providers behind a common interface
 */
export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  /**
   * Test the configured provider
   */
  async testConnection(): Promise<void> {
    switch (this.config.provider) {
      case 'gemini-direct':
        if (!this.config.userApiKey) {
          throw new Error('API key required for direct Gemini access');
        }
        return testApiKeyDirect(this.config.userApiKey);

      case 'gateway-gemini':
      case 'gateway-openai':
      case 'gateway-anthropic':
        const gatewayProvider = this.config.provider.split('-')[1]; // Extract 'gemini', 'openai', etc.
        return testGatewayConnection(gatewayProvider);

      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * Analyze a project using the configured provider
   */
  async analyzeProject(
    projectContext: string,
    analysisType: AnalysisType,
    locale: 'pt-BR' | 'en-US'
  ): Promise<ProjectAnalysis> {

    switch (this.config.provider) {
      case 'gemini-direct':
        return analyzeProjectDirect(projectContext, analysisType, locale, this.config.userApiKey);

      case 'gateway-gemini':
        return analyzeProjectViaGateway(projectContext, analysisType, locale, this.config.userApiKey, 'gemini');

      case 'gateway-openai':
        return analyzeProjectViaGateway(projectContext, analysisType, locale, this.config.userApiKey, 'openai');

      case 'gateway-anthropic':
        return analyzeProjectViaGateway(projectContext, analysisType, locale, this.config.userApiKey, 'anthropic');

      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * Compare analyses using the configured provider
   */
  async compareAnalyses(
    item1: HistoryItem,
    item2: HistoryItem,
    locale: 'pt-BR' | 'en-US'
  ): Promise<EvolutionAnalysis> {

    switch (this.config.provider) {
      case 'gemini-direct':
        return compareAnalysesDirect(item1, item2, locale, this.config.userApiKey);

      case 'gateway-gemini':
        return compareAnalysesViaGateway(item1, item2, locale, this.config.userApiKey, 'gemini');

      case 'gateway-openai':
        return compareAnalysesViaGateway(item1, item2, locale, this.config.userApiKey, 'openai');

      case 'gateway-anthropic':
        return compareAnalysesViaGateway(item1, item2, locale, this.config.userApiKey, 'anthropic');

      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * Create a chat session using the configured provider
   */
  createChatSession(systemInstruction: string) {
    switch (this.config.provider) {
      case 'gemini-direct':
        return createChatSessionDirect(systemInstruction, this.config.userApiKey);

      case 'gateway-gemini':
        return createChatSessionViaGateway(systemInstruction, this.config.userApiKey, 'gemini');

      case 'gateway-openai':
        return createChatSessionViaGateway(systemInstruction, this.config.userApiKey, 'openai');

      case 'gateway-anthropic':
        return createChatSessionViaGateway(systemInstruction, this.config.userApiKey, 'anthropic');

      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * Get provider-specific information
   */
  getProviderInfo() {
    switch (this.config.provider) {
      case 'gemini-direct':
        return {
          name: 'Google Gemini (Direct)',
          type: 'direct',
          supportsStreaming: false,
          requiresApiKey: true,
          description: 'Direct connection to Google Gemini API'
        };

      case 'gateway-gemini':
        return {
          name: 'Google Gemini (Gateway)',
          type: 'gateway',
          supportsStreaming: true,
          requiresApiKey: false, // Can use server-side key
          description: 'Gemini via analyzer gateway with streaming support'
        };

      case 'gateway-openai':
        return {
          name: 'OpenAI (Gateway)',
          type: 'gateway',
          supportsStreaming: true,
          requiresApiKey: false,
          description: 'OpenAI via analyzer gateway with streaming support'
        };

      case 'gateway-anthropic':
        return {
          name: 'Anthropic Claude (Gateway)',
          type: 'gateway',
          supportsStreaming: true,
          requiresApiKey: false,
          description: 'Anthropic Claude via analyzer gateway with streaming support'
        };

      default:
        return {
          name: 'Unknown Provider',
          type: 'unknown',
          supportsStreaming: false,
          requiresApiKey: true,
          description: 'Unknown provider configuration'
        };
    }
  }
}

/**
 * Factory function to create AI service instances
 */
export const createAIService = (config: AIServiceConfig): AIService => {
  return new AIService(config);
};

/**
 * Helper to get available providers
 */
export const getAvailableProviders = (): Array<{ value: AIProvider, label: string, description: string }> => {
  return [
    {
      value: 'gemini-direct',
      label: 'Gemini (Direct)',
      description: 'Direct connection to Google Gemini - current stable implementation'
    },
    {
      value: 'gateway-gemini',
      label: 'Gemini (Gateway)',
      description: 'Gemini via gateway with streaming and cost tracking'
    },
    {
      value: 'gateway-openai',
      label: 'OpenAI (Gateway)',
      description: 'OpenAI GPT models with streaming and cost tracking'
    },
    {
      value: 'gateway-anthropic',
      label: 'Anthropic (Gateway)',
      description: 'Claude models with streaming and cost tracking (coming soon)'
    }
  ];
};

// Re-export specific functions for backward compatibility
export { testGatewayConnection } from "./gateway/api";
export { testApiKey as testGeminiApiKey } from "./gemini/api";
