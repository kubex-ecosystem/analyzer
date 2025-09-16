import { KanbanTranslations } from '../types';

export const kanbanPtBR: KanbanTranslations = {
  title: "Quadro Kanban",
  columns: {
    todo: "A Fazer",
    inProgress: "Em Progresso",
    done: "Concluído",
    blocked: "Bloqueado"
  },
  actions: {
    addCard: "Adicionar Cartão",
    editCard: "Editar Cartão",
    deleteCard: "Excluir Cartão",
    moveCard: "Mover Cartão"
  },
  card: {
    title: "Título",
    description: "Descrição",
    priority: "Prioridade",
    difficulty: "Dificuldade",
    assignee: "Responsável",
    dueDate: "Data de Vencimento",
    tags: "Etiquetas"
  },
  filters: {
    all: "Todos",
    byPriority: "Por Prioridade",
    byAssignee: "Por Responsável",
    byTag: "Por Etiqueta"
  }
};
