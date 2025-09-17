// Enums
export enum AnalysisType {
  General = 'General',
  Security = 'Security',
  Scalability = 'Scalability',
  CodeQuality = 'CodeQuality',
  DocsReview = 'DocumentationReview',
  DocumentationReview = "DocumentationReview",
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
  Prototype = 'PROTOTYPE',
  MVP = 'MVP',
  Production = 'PRODUCTION',
  Optimized = 'OPTIMIZED',
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


