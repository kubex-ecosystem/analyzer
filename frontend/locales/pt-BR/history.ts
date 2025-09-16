import type { HistoryTranslations } from '../types';

export const historyPtBR: HistoryTranslations = {
  title: 'Histórico de Análises',
  clearAll: 'Limpar Tudo',
  compare: 'Comparar',
  importAnalysis: 'Importar Análise',
  empty: {
    title: 'Nenhum Histórico Ainda',
    subtitle: 'Suas análises concluídas aparecerão aqui.',
  },
  clearConfirm: {
    title: 'Limpar Histórico?',
    message: 'Tem certeza de que deseja excluir permanentemente todo o histórico de análises? Esta ação não pode ser desfeita.',
  },
  notifications: {
    invalidFile: 'Arquivo de análise inválido. Certifique-se de que é um JSON válido exportado do GemX.',
  },
  importFile: {
    label: 'Arquivo de Análise',
    placeholder: 'Selecione o arquivo JSON exportado do GemX...',
    description: 'Importe um arquivo de análise previamente exportado para visualizar seus dados aqui.',
  },
  closePanel: 'Fechar Painel',
  selectItem: 'Selecionar Item',
  deleteItem: 'Excluir Item',
  itemSelected: 'Item Selecionado',
  itemsSelected: 'Itens Selecionados',
};
