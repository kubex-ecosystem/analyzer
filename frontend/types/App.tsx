import { ProjectAnalysis } from "./Analysis";
import { AnalysisType, NotificationType, Theme } from "./Enums";
import { IntegrationSettings } from "./Integrations";

// Interfaces for App state
export interface ProjectFile {
  id: number;
  name: string;
  content: string;
  isFragment?: boolean;
}

export interface HistoryItem {
  id: number;
  projectName: string;
  analysisType: AnalysisType;
  timestamp: string;
  analysis: ProjectAnalysis;
  projectContext: string;
}

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface FeatureFlags {
  enableExperimentalFeatures: boolean;
  enableBetaFeatures: boolean;
}

export interface AIUsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface AppSettings {
  [x: string]: any;
  // UI settings
  theme: Theme;

  // General settings
  enableTelemetry: boolean;
  autoAnalyze: boolean;
  saveHistory: boolean;
  tokenLimit: number;
  userApiKey?: string;

  // Dashboard settings

  // IntegrationsTabProps
  integrations: IntegrationSettings;
}

export interface UsageTracking {
  totalTokens: number;
  monthlyTokens: number;
}

export interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
}
