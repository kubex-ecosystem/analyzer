import * as React from 'react';

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

export enum AnalysisType {
  General = 'General',
  Security = 'Security',
  Scalability = 'Scalability',
  CodeQuality = 'CodeQuality',
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

export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface ProjectMaturity {
  level: MaturityLevel;
  assessment: string;
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
  viability: {
    score: number;
    assessment: string;
  };
  roiAnalysis: {
    assessment: string;
    potentialGains: string[];
    estimatedEffort: Effort;
  };
  maturity: ProjectMaturity;
  usageMetadata?: UsageMetadata;
}

export interface HistoryItem {
  id: number;
  projectName: string;
  analysisType: AnalysisType;
  timestamp: string;
  analysis: ProjectAnalysis;
  projectContext: string;
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

export type ViewType = 'dashboard' | 'input' | 'results' | 'kanban' | 'evolution';

export interface AppSettings {
  tokenLimit: number; // 0 for no limit
}

export interface UsageTracking {
  month: number;
  year: number;
  totalTokens: number;
}

export interface UserProfile {
  name: string;
  apiKey?: string;
}

export interface AnalysisOption {
  type: AnalysisType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export interface KanbanCardData {
  id: string;
  title: string;
  difficulty: Difficulty;
  priority?: Priority;
}

export type KanbanColumnId = 'backlog' | 'todo' | 'inProgress' | 'done';

export interface KanbanColumn {
  title: string;
  cards: KanbanCardData[];
}

// FIX: Corrected typo from KanbonColumnId to KanbanColumnId.
export type KanbanState = Record<KanbanColumnId, KanbanColumn>;

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  duration?: number;
}

// Re-exporting providers for convenience from App.tsx
export { AuthProvider } from '../contexts/AuthContext';
export { LanguageProvider } from '../contexts/LanguageContext';
export { NotificationProvider } from '../contexts/NotificationContext';
