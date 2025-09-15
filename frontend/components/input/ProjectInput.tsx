import React, { useRef, useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Sparkles, AlertTriangle, ArrowLeft, Github, Package, Loader2, Plus, X, FolderOpen, Search } from 'lucide-react';
import { AnalysisType, AppSettings, UsageTracking, ProjectFile } from '../../types';
import TokenUsageAlert from '../common/TokenUsageAlert';
import SubtleTokenUsage from '../common/SubtleTokenUsage';
import { useTranslation } from '../../hooks/useTranslation';
import { useNotification } from '../../contexts/NotificationContext';
import { fetchRepoContents, fetchRepoForAnalysis } from '../../services/integrations/github';
import { fetchJiraProject } from '../../services/integrations/jira';
import GitHubSearchModal from './GitHubSearchModal';

interface ProjectInputProps {
  files: ProjectFile[];
  onFilesChange: (files: ProjectFile[]) => void;
  onAnalyze: (type: AnalysisType) => void;
  onShowExample: () => void;
  isLoading: boolean;
  settings: AppSettings;
  usageTracking: UsageTracking;
  isExample: boolean;
  onExitExample: () => void;
  hasRealData: boolean;
}

const colorMap = {
    blue: { text: 'text-blue-400', hoverBorder: 'hover:border-blue-500/50' },
    red: { text: 'text-red-400', hoverBorder: 'hover:border-red-500/50' },
    purple: { text: 'text-purple-400', hoverBorder: 'hover:border-purple-500/50' },
    teal: { text: 'text-teal-400', hoverBorder: 'hover:border-teal-500/50' },
};

const AnalysisButton: React.FC<{ 
  type: AnalysisType; 
  label: string; 
  description: string; 
  onAnalyze: (type: AnalysisType) => void; 
  isLoading: boolean;
  color: keyof typeof colorMap;
  icon: React.ElementType;
}> = ({ type, label, description, onAnalyze, isLoading, color, icon: Icon }) => {
  const styles = colorMap[color] || colorMap.blue;
  return (
    <button
      onClick={() => onAnalyze(type)}
      disabled={isLoading}
      className={`group p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-left hover:bg-gray-700/50 ${styles.hoverBorder} transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-start gap-4`}
    >
      <Icon className={`w-6 h-6 shrink-0 mt-1 ${styles.text} transition-transform duration-300 group-hover:scale-110`} />
      <div>
        <p className="font-semibold text-white">{label}</p>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
    </button>
  );
};


const ProjectInput: React.FC<ProjectInputProps> = ({
  files,
  onFilesChange,
  onAnalyze,
  onShowExample,
  isLoading,
  settings,
  usageTracking,
  isExample,
  onExitExample,
  hasRealData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation(['input', 'common']);
  const { addNotification } = useNotification();
  
  const [isFetching, setIsFetching] = useState<null | 'github' | 'jira' | 'github-search'>(null);
  const [repoUrl, setRepoUrl] = useState('');
  
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const selectedFile = useMemo(() => files.find(f => f.id === selectedFileId), [files, selectedFileId]);

  useEffect(() => {
    if (!selectedFileId && files.length > 0) {
      setSelectedFileId(files[0].id);
    }
    if (selectedFileId && !files.some(f => f.id === selectedFileId)) {
      setSelectedFileId(files.length > 0 ? files[0].id : null);
    }
  }, [files, selectedFileId]);
  
  const analysisTypes = [
    { type: AnalysisType.General, label: t('analysisTypes.GENERAL.label'), description: t('analysisTypes.GENERAL.description'), color: 'blue', icon: FileText },
    { type: AnalysisType.Security, label: t('analysisTypes.SECURITY.label'), description: t('analysisTypes.SECURITY.description'), color: 'red', icon: Sparkles },
    { type: AnalysisType.Scalability, label: t('analysisTypes.SCALABILITY.label'), description: t('analysisTypes.SCALABILITY.description'), color: 'purple', icon: Sparkles },
    { type: AnalysisType.CodeQuality, label: t('analysisTypes.CODE_QUALITY.label'), description: t('analysisTypes.CODE_QUALITY.description'), color: 'teal', icon: Sparkles },
  ];

  const handleAddNewFile = () => {
    const newFile: ProjectFile = {
      id: Date.now(),
      name: `untitled-${files.length + 1}.txt`,
      content: '',
    };
    onFilesChange([...files, newFile]);
    setSelectedFileId(newFile.id);
  };

  const handleFileSelectedForUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile: ProjectFile = {
          id: Date.now(),
          name: file.name,
          content: event.target?.result as string,
        };
        onFilesChange([...files, newFile]);
        setSelectedFileId(newFile.id);
      };
      reader.readAsText(file);
    }
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = (idToDelete: number) => {
    onFilesChange(files.filter(f => f.id !== idToDelete));
  };

  const handleUpdateFile = (updatedFile: ProjectFile) => {
    onFilesChange(files.map(f => f.id === updatedFile.id ? updatedFile : f));
  };
  
  const handleFetchGitHub = async () => {
      if (!repoUrl) {
          addNotification({ message: t('notifications.emptyRepoUrl'), type: 'error' });
          return;
      }
      if (!settings.githubPat) {
          addNotification({ message: t('notifications.noGithubPat'), type: 'error' });
          return;
      }
      setIsFetching('github');
      try {
          const content = await fetchRepoContents(repoUrl, settings.githubPat);
          const repoName = repoUrl.split('/').pop() || 'github-repo';
          const newFile: ProjectFile = {
            id: Date.now(),
            name: `${repoName}.md`,
            content: content,
          };
          onFilesChange([...files, newFile]);
          setSelectedFileId(newFile.id);
          addNotification({ message: t('notifications.repoDataFetched'), type: 'success' });
      } catch (error: any) {
          addNotification({ message: error.message, type: 'error' });
      } finally {
          setIsFetching(null);
      }
  };
  
  const handleImportRepo = async (owner: string, repo: string) => {
      if (!settings.githubPat) {
          addNotification({ message: t('notifications.noGithubPat'), type: 'error' });
          return;
      }
      setIsFetching('github-search');
      setIsSearchModalOpen(false);
      try {
          const content = await fetchRepoForAnalysis(owner, repo, settings.githubPat);
          const newFile: ProjectFile = {
            id: Date.now(),
            name: `${owner}-${repo}.md`,
            content: content,
          };
          onFilesChange([...files, newFile]);
          setSelectedFileId(newFile.id);
          addNotification({ message: t('notifications.repoImportSuccess'), type: 'success' });
      } catch (error: any) {
          addNotification({ message: error.message, type: 'error' });
      } finally {
          setIsFetching(null);
      }
  };

  // This is still mocked, but adds a file.
  const handleFetchJira = async () => {
      setIsFetching('jira');
      try {
          const content = await fetchJiraProject("MOCK", settings);
          const newFile: ProjectFile = {
            id: Date.now(),
            name: 'jira-project.md',
            content: content
          };
          onFilesChange([...files, newFile]);
          setSelectedFileId(newFile.id);
          addNotification({ message: t('notifications.jiraDataFetched'), type: 'info' });
      } catch (error: any) {
          addNotification({ message: error.message, type: 'error' });
      } finally {
          setIsFetching(null);
      }
  };
  
  const tokenPercentage = settings.tokenLimit > 0 ? (usageTracking.totalTokens / settings.tokenLimit) * 100 : 0;

  return (
    <>
      <div className="space-y-8">
        {isExample && (
          <motion.div 
              className="mb-8 p-4 bg-purple-900/50 border border-purple-700 text-purple-300 rounded-lg flex items-center justify-between gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
          >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{t('exampleMode.notice')}</p>
              </div>
              <button
                onClick={onExitExample}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-200 bg-purple-800/50 border border-purple-600 rounded-md hover:bg-purple-700/50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('exampleMode.exit')}
              </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Left Side: File Management UI */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                  <FolderOpen className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">{t('files.title')}</h2>
              </div>
              <div className="flex-grow flex gap-4 min-h-[450px]">
                  {/* File List */}
                  <div className="w-1/3 border-r border-gray-600 pr-4 flex flex-col">
                      <ul className="space-y-1 flex-grow overflow-y-auto">
                          {files.map(file => (
                              <li key={file.id}>
                                  <button onClick={() => setSelectedFileId(file.id)} className={`w-full flex items-center justify-between gap-2 p-2 rounded-md text-left text-sm transition-colors ${selectedFileId === file.id ? 'bg-blue-600/50 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>
                                      <span className="truncate flex-grow">{file.name}</span>
                                      <X onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }} className="w-4 h-4 text-gray-500 hover:text-red-400 shrink-0"/>
                                  </button>
                              </li>
                          ))}
                      </ul>
                      <div className="space-y-2 pt-2 border-t border-gray-600">
                          <input type="file" ref={fileInputRef} onChange={handleFileSelectedForUpload} className="hidden" accept=".txt,.md,.js,.ts,.jsx,.tsx,.json,.html,.css" />
                          <button onClick={handleAddNewFile} className="w-full text-sm flex items-center gap-2 p-2 justify-center rounded-md bg-gray-700 hover:bg-gray-600"><Plus className="w-4 h-4" /> {t('files.addFile')}</button>
                          <button onClick={() => fileInputRef.current?.click()} className="w-full text-sm flex items-center gap-2 p-2 justify-center rounded-md bg-gray-700 hover:bg-gray-600"><Upload className="w-4 h-4" /> {t('files.addFromUpload')}</button>
                      </div>
                  </div>
                  {/* Editor */}
                  <div className="w-2/3 flex flex-col gap-2">
                      {selectedFile ? (
                          <>
                              <input type="text" value={selectedFile.name} onChange={(e) => handleUpdateFile({...selectedFile, name: e.target.value})} placeholder={t('files.fileName')} className="p-2 bg-gray-900 border border-gray-600 rounded-md text-sm shrink-0"/>
                              <textarea value={selectedFile.content} onChange={(e) => handleUpdateFile({...selectedFile, content: e.target.value})} placeholder={t('files.fileContent')} className="w-full h-full p-2 bg-gray-900 border border-gray-600 rounded-md resize-none text-sm font-mono flex-grow"/>
                          </>
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-lg p-4">
                              {t('files.emptyState')}
                          </div>
                      )}
                  </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                  <div className="flex gap-2">
                      <input type="text" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder={t('dataSources.github.placeholder')} className="flex-grow p-2 bg-gray-900 border border-gray-600 rounded-md text-sm" disabled={!!isFetching}/>
                      <button onClick={handleFetchGitHub} disabled={!!isFetching || !repoUrl} className="p-2 px-3 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 flex items-center gap-2 text-sm"><Github className="w-4 h-4"/>{isFetching === 'github' && <Loader2 className="w-4 h-4 animate-spin"/>}</button>
                      <button onClick={() => setIsSearchModalOpen(true)} disabled={!!isFetching} className="p-2 px-3 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 flex items-center gap-2 text-sm">
                        {isFetching === 'github-search' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        <span className="hidden sm:inline">{t('githubSearch.button')}</span>
                      </button>
                  </div>
                  {!hasRealData && !isExample && (
                      <div className="text-center">
                          <button onClick={onShowExample} disabled={isLoading || !!isFetching} className="text-sm text-purple-400 hover:underline">
                              {t('showExample')}
                          </button>
                      </div>
                  )}
              </div>
          </div>

          {/* Right Side: Analysis Options */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">{t('analysisTitle')}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {analysisTypes.map(at => (
                      <AnalysisButton 
                          key={at.type}
                          type={at.type}
                          label={at.label}
                          description={at.description}
                          onAnalyze={onAnalyze}
                          isLoading={isLoading || files.length === 0 || !!isFetching}
                          color={at.color as any}
                          icon={at.icon}
                      />
                  ))}
              </div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              {tokenPercentage > 70 ? (
                  <TokenUsageAlert limit={settings.tokenLimit} consumed={usageTracking.totalTokens} />
              ) : (
                  <SubtleTokenUsage limit={settings.tokenLimit} consumed={usageTracking.totalTokens} />
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <GitHubSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onImport={handleImportRepo}
        githubPat={settings.githubPat}
      />
    </>
  );
};

export default ProjectInput;