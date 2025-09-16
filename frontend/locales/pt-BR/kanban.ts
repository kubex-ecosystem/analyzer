import { KanbanTranslations } from '../types';

export const kanbanPtBR: KanbanTranslations = {
  title: "Quadro Kanban",
  projectHeader: "Projeto",
  addCard: "Adicionar Novo Card",
  editCard: "Editar Card",
  originalDescription: "Descrição Original (Gerada por IA)",
  notes: "Notas",
  notesPlaceholder: "Adicione suas notas de implementação ou comentários aqui...",
  exampleModeNotice: "Você está no modo exemplo. As alterações não serão salvas.",
  deleteConfirm: {
    title: "Excluir Card?",
    message: "Tem certeza de que deseja excluir permanentemente este card? Esta ação não pode ser desfeita.",
    confirm: "Excluir"
  },
  columns: {
    todo: "A Fazer",
    inProgress: "Em Progresso",
    done: "Concluído",
    blocked: "Bloqueado"
  },
  actions: {
    addCard: "Adicionar Card",
    editCard: "Editar Card",
    deleteCard: "Excluir Card",
    moveCard: "Mover Card"
  },
  card: {
    title: "Título",
    description: "Descrição",
    priority: "Prioridade",
    difficulty: "Dificuldade",
    assignee: "Responsável",
    dueDate: "Data de Vencimento",
    tags: "Tags"
  },
  filters: {
    all: "Todos",
    byPriority: "Por Prioridade",
    byAssignee: "Por Responsável",
    byTag: "Por Tag"
  }
};
