// FIX: Added full content for types/index.ts to resolve module errors.
import { Content } from "@google/genai";

export enum ViewType {
  Dashboard = 'DASHBOARD',
  Input = 'INPUT',
  Analysis = 'ANALYSIS',
  Evolution = 'EVOLUTION',
  Kanban = 'KANBAN',
  Chat = 'CHAT',
}

export enum AnalysisType {
  Architecture = 'Architecture',
  CodeQuality = 'Code Quality',
  Security = 'Security Analysis',
  Scalability = 'Scalability Analysis',
  Compliance = 'Compliance & Best Practices',
  DocumentationReview = 'Documentation Review',
  SelfCritique = 'Self-Critique',
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

export interface ProjectViability {
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
  totalTokenCount: number;
  promptTokenCount: number;
  candidatesTokenCount: number;
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
  viability: ProjectViability;
  roiAnalysis: RoiAnalysis;
  maturity: ProjectMaturity;
  architectureDiagram?: string;
  suggestedQuestions?: string[];
  suggestedKanbanTasks?: KanbanTaskSuggestion[];
  usageMetadata?: UsageMetadata;
}

export interface SelfCritiqueAnalysis {
    confidenceScore: number;
    overallAssessment: string;
    positivePoints: string[];
    areasForRefinement: string[];
    usageMetadata?: UsageMetadata;
}

export interface EvolutionAnalysis {
    projectName: string;
    analysisType: AnalysisType;
    evolutionSummary: string;
    keyMetrics: {
        previousScore: number;
        currentScore: number;
        previousStrengths: number;
        currentStrengths: number;
        previousImprovements: number;
        currentImprovements: number;
    };
    resolvedImprovements: Improvement[];
    newImprovements: Improvement[];
    persistentImprovements: Improvement[];
    usageMetadata?: UsageMetadata;
}

export interface DashboardInsight {
    title: string;
    summary: string;
    usageMetadata?: UsageMetadata;
}

// Kanban Types
export type KanbanColumnId = 'backlog' | 'todo' | 'inProgress' | 'done';

export interface KanbanCard {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    difficulty: Difficulty;
    tags?: string[];
    notes?: string;
}

export interface KanbanColumn {
    id: KanbanColumnId;
    title: string;
    cardIds: string[];
}

export interface KanbanState {
    cards: Record<string, KanbanCard>;
    columns: Record<KanbanColumnId, KanbanColumn>;
    columnOrder: KanbanColumnId[];
}

export interface KanbanTaskSuggestion {
    title: string;
    description: string;
    priority: Priority;
    difficulty: Difficulty;
    tags: string[];
}

// Project & History Types
export interface HistoryItem {
    id: number;
    timestamp: string;
    analysis: ProjectAnalysis;
}

export interface Project {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    history: HistoryItem[];
    kanban: KanbanState | null;
    chatHistories: Record<number, Content[]>; // key is history item ID
    critiques?: Record<number, SelfCritiqueAnalysis>; // key is history item ID
    contextFiles: string[];
}


// Settings and User Profile
export interface AppSettings {
    saveHistory: boolean;
    theme: 'light' | 'dark';
    tokenLimit: number;
    userApiKey: string;
    githubPat: string;
    jiraInstanceUrl: string;
    jiraUserEmail: string;
    jiraApiToken: string;
    enableDashboardInsights: boolean;
}

export interface UserProfile {
    name: string;
    email: string;
    avatar: string;
}

// Notifications
export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  duration?: number;
}

// GitHub API Types
export interface GitHubRepoListItem {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  description: string | null;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
}
