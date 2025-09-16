import type { NotificationsTranslations } from '../types';

export const notifications: NotificationsTranslations = {
  importSuccess: 'Data imported successfully!',
  analysisImportSuccess: 'Analysis for "{{projectName}}" imported successfully!',
  emptyContext: 'Please add files or project context before analyzing',
  selectTwo: 'Select exactly 2 analyses to compare',
  exampleLoaded: 'Example loaded successfully',
  noAnalysisForChat: 'No analysis available for chat',
  settingsSaved: 'Settings saved successfully',
  profileSaved: 'Profile saved successfully',
  exportSuccess: 'Data exported successfully',
  exportError: 'Error exporting data',
  importError: 'Error importing data',
  importAborted: 'Import cancelled',
  apiKeyTestSuccess: 'API key tested successfully',
  apiKeyTestFailure: 'API key test failed',
  apiKeyTestEmpty: 'Please enter an API key to test',
  chatError: 'Error during conversation',
  lookAtniSuccess: '{{count}} fragments extracted successfully',
  fragmentsSelected: '{{count}} fragments selected',
  fileLoaded: 'File "{{fileName}}" loaded successfully',
  repoImportSuccess: 'Repository imported successfully',
  noGithubPat: 'GitHub token not configured'
};
