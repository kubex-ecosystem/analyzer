import { ProjectAnalysis, SelfCritiqueAnalysis } from "./Analysis";
import { KanbanState } from "./Kanban";

// FIX: Added import from google/genai for Content type
import { Content } from "@google/genai";

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
