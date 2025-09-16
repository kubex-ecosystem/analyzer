import type { NotificationsTranslations } from '../types';

export const notifications: NotificationsTranslations = {
  importSuccess: 'Dados importados com sucesso!',
  analysisImportSuccess: 'Análise para "{{projectName}}" importada com sucesso!',
  emptyContext: 'Por favor, adicione arquivos ou contexto do projeto antes de analisar',
  selectTwo: 'Selecione exatamente 2 análises para comparar',
  exampleLoaded: 'Exemplo carregado com sucesso',
  noAnalysisForChat: 'Nenhuma análise disponível para o chat',
  settingsSaved: 'Configurações salvas com sucesso',
  profileSaved: 'Perfil salvo com sucesso',
  exportSuccess: 'Dados exportados com sucesso',
  exportError: 'Erro ao exportar dados',
  importError: 'Erro ao importar dados',
  importAborted: 'Importação cancelada',
  apiKeyTestSuccess: 'Chave de API testada com sucesso',
  apiKeyTestFailure: 'Falha no teste da chave de API',
  apiKeyTestEmpty: 'Por favor, insira uma chave de API para testar',
  chatError: 'Erro durante a conversa',
  lookAtniSuccess: '{{count}} fragmentos extraídos com sucesso',
  fragmentsSelected: '{{count}} fragmentos selecionados',
  fileLoaded: 'Arquivo "{{fileName}}" carregado com sucesso',
  repoImportSuccess: 'Repositório importado com sucesso',
  noGithubPat: 'Token do GitHub não configurado'
};
