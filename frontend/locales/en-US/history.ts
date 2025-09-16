import type { HistoryTranslations } from '../types';

export const historyEnUS: HistoryTranslations = {
  title: 'Analysis History',
  clearAll: 'Clear All',
  compare: 'Compare',
  importAnalysis: 'Import Analysis',
  empty: {
    title: 'No History Yet',
    subtitle: 'Your completed analyses will appear here.',
  },
  clearConfirm: {
    title: 'Clear History?',
    message: 'Are you sure you want to permanently delete all analysis history? This action cannot be undone.',
  },
  notifications: {
    invalidFile: 'Invalid analysis file. Please ensure it\'s a valid JSON exported from GemX.',
  },
  importFile: {
    label: 'Analysis File',
    placeholder: 'Select the JSON file exported from GemX...',
    description: 'Import a previously exported analysis file to view your data here.',
  },
  closePanel: 'Close Panel',
  selectItem: 'Select Item',
  deleteItem: 'Delete Item',
  itemSelected: 'Item Selected',
  itemsSelected: 'Items Selected',
};
