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
};
