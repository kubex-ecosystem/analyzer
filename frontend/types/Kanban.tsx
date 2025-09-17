import { Difficulty, Priority } from "./Enums";

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
