import { KanbanTranslations } from '../types';

export const kanbanEnUS: KanbanTranslations = {
  title: "Kanban Board",
  projectHeader: "Project",
  addCard: "Add New Card",
  editCard: "Edit Card",
  originalDescription: "Original Description (AI Generated)",
  notes: "Notes",
  notesPlaceholder: "Add your implementation notes or comments here...",
  exampleModeNotice: "You are in example mode. Changes will not be saved.",
  deleteConfirm: {
    title: "Delete Card?",
    message: "Are you sure you want to permanently delete this card? This action cannot be undone.",
    confirm: "Delete"
  },
  columns: {
    todo: "TODO",
    inProgress: "In Progress",
    done: "Done",
    blocked: "Blocked"
  },
  actions: {
    addCard: "Add Card",
    editCard: "Edit Card",
    deleteCard: "Delete Card",
    moveCard: "Move Card"
  },
  card: {
    title: "Title",
    description: "Description",
    priority: "Priority",
    difficulty: "Difficulty",
    assignee: "Assignee",
    dueDate: "Due Date",
    tags: "Tags"
  },
  filters: {
    all: "All",
    byPriority: "By Priority",
    byAssignee: "By Assignee",
    byTag: "By Tag"
  }
};
