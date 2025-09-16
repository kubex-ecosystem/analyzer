import { KanbanTranslations } from '../types';

export const kanbanEnUS: KanbanTranslations = {
  title: "Kanban Board",
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
