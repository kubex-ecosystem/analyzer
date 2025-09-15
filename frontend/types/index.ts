// Enums
export enum AnalysisType {
  General = 'General',
  Security = 'Security',
  Scalability = 'Scalability',
  CodeQuality = 'CodeQuality',
}

export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum Difficulty {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum Effort {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum MaturityLevel {
  Prototype = 'Prototype',
  MVP = 'MVP',
  Production = 'Production',
  Optimized = 'Optimized',
}

export type NotificationType = 'success' | 'error' | 'info';

export enum DataSourceType {
  Manual = 'MANUAL',
  GitHub = 'GITHUB',
  Jira = 'JIRA',
}

export enum ViewType {
  Dashboard = 'DASHBOARD',
  Input = 'INPUT',
  Analysis = 'ANALYSIS',
  Kanban = 'KANBAN',
  Evolution = 'EVOLUTION',
  Chat = 'CHAT',
}

export type Theme = 'light' | 'dark' | 'system';

// Interfaces for Analysis
export interface Improvement {
  title: string;
  description: string;
  priority: Priority;
  difficulty: Difficulty;
  businessImpact: string;
}

export interface NextStep {
  title: string;
  description: string;
  difficulty: Difficulty;
}

export interface Viability {
  score: number;
  assessment: string;
}

export interface RoiAnalysis {
  assessment: string;
  potentialGains: string[];
  estimatedEffort: Effort;
}

export interface ProjectMaturity {
  level: MaturityLevel;
  assessment: string;
}

export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface ProjectAnalysis {
  projectName: string;
  analysisType: AnalysisType;
  summary: string;
  strengths: string[];
  improvements: Improvement[];
  nextSteps: {
    shortTerm: NextStep[];
    longTerm: NextStep[];
  };
  viability: Viability;
  roiAnalysis: RoiAnalysis;
  maturity: ProjectMaturity;
  usageMetadata?: UsageMetadata;
}

export interface KeyMetrics {
  previousScore: number;
  currentScore: number;
  scoreChange: number;
  previousStrengths: number;
  currentStrengths: number;
  previousImprovements: number;
  currentImprovements: number;
}

export interface EvolutionAnalysis {
  projectName: string;
  analysisType: AnalysisType;
  evolutionSummary: string;
  keyMetrics: KeyMetrics;
  resolvedImprovements: Improvement[];
  newImprovements: Improvement[];
  persistentImprovements: Improvement[];
  usageMetadata?: UsageMetadata;
}


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

export interface AppSettings {
  saveHistory: boolean;
  theme: Theme;
  tokenLimit: number;
  userApiKey?: string;
  // Integration settings
  githubPat?: string;
  jiraInstanceUrl?: string;
  jiraUserEmail?: string;
  jiraApiToken?: string;
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

// Kanban types
export type KanbanColumnId = 'backlog' | 'todo' | 'inProgress' | 'done';

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  difficulty: Difficulty;
  tags: string[];
  notes: string;
}

export interface KanbanColumn {
  id: KanbanColumnId;
  title: string;
  cards: KanbanCard[];
}

export interface KanbanState {
  projectName: string;
  columns: {
    [key in KanbanColumnId]: KanbanColumn;
  };
}

// Interfaces for Chat
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export type AllChatHistories = Record<number, ChatMessage[]>;

// Interfaces for Integrations
export interface GitHubRepoListItem {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
  owner: {
    login: string;
  };
}
