import { motion } from 'framer-motion';
import { BookText, Code, FilePlus, FileText, Scaling, Shield, Sparkles, Upload, Wand2 } from 'lucide-react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchRepoForAnalysis } from '../../services/integrations/github';
import { AnalysisType, ProjectFile } from '../../types';
import SubtleTokenUsage from '../common/SubtleTokenUsage';
import TokenUsageAlert from '../common/TokenUsageAlert';
import GitHubSearchModal from './GitHubSearchModal';
import LookAtniDirectExtractor from './LookAtniDirectExtractor';

const ProjectInput: React.FC = () => {
  const {
    projectFiles: files,
    setProjectFiles,
    handleAnalyze,
    handleShowExample,
    isLoading,
    setIsLoading,
    settings,
    usageTracking,
    isExample
  } = useProjectContext();
  const { t } = useTranslation(['input', 'common', 'tokenUsage']);
  const [activeFileId, setActiveFileId] = useState<number | null>(null);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [showLookAtni, setShowLookAtni] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotification();

  // Auto-select first file on load if one exists
  useEffect(() => {
    if (files.length > 0 && activeFileId === null) {
      setActiveFileId(files[0].id);
    }
    if (files.length === 0) {
      setActiveFileId(null);
    }
  }, [files, activeFileId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      Array.from(uploadedFiles).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const newFile: ProjectFile = {
            id: Date.now() + Math.random(),
            name: file.name,
            content: content
          };
          setProjectFiles((prev: any) => [...prev, newFile]);
          setActiveFileId(newFile.id);
        };
        reader.readAsText(file);
        addNotification({ message: t('notifications.fileLoaded', { fileName: file.name }), type: 'info' });
      });
    }
  };

  const handleAddNewFile = () => {
    const newFile: ProjectFile = {
      id: Date.now(),
      name: 'untitled.md',
      content: ''
    };
    setProjectFiles((prev: any) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleUpdateFileContent = (id: number, content: string) => {
    setProjectFiles(files.map(f => f.id === id ? { ...f, content } : f));
  };

  const handleUpdateFileName = (id: number, name: string) => {
    setProjectFiles(files.map(f => f.id === id ? { ...f, name } : f));
  };

  const handleRemoveFile = (id: number) => {
    setProjectFiles(files.filter(f => f.id !== id));
    if (activeFileId === id) {
      setActiveFileId(files.length > 1 ? files.find(f => f.id !== id)!.id : null);
    }
  };

  const handleImportFromGitHub = async (owner: string, repo: string) => {
    if (!settings.githubPat) {
      addNotification({ message: t('notifications.noGithubPat'), type: 'error' });
      return;
    }
    setIsLoading(true);
    try {
      const content = await fetchRepoForAnalysis(owner, repo, settings.githubPat);
      const newFile: ProjectFile = {
        id: Date.now(),
        name: `${owner}_${repo}_context.md`,
        content,
      };
      setProjectFiles([newFile]);
      setActiveFileId(newFile.id);
      addNotification({ message: t('notifications.repoImportSuccess'), type: 'success' });
    } catch (error: any) {
      addNotification({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
      setIsGitHubModalOpen(false);
    }
  };

  const handleLookAtniFilesExtracted = (extractedFiles: any[]) => {
    const newFiles: ProjectFile[] = extractedFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name || file.path?.split('/').pop() || `extracted_${index}.txt`,
      content: file.content || ''
    }));

    setProjectFiles((prev: any) => [...prev, ...newFiles]);
    if (newFiles.length > 0) {
      setActiveFileId(newFiles[0].id);
    }
    setShowLookAtni(false);
    addNotification({
      message: t('notifications.lookAtniSuccess', { count: newFiles.length }),
      type: 'success'
    });
  };

  const handleLookAtniFragmentsSelected = (fragments: any[]) => {
    const fragmentFiles: ProjectFile[] = fragments.map((fragment, index) => ({
      id: Date.now() + index,
      name: `${fragment.name || 'fragment'}_${fragment.type || 'code'}.${fragment.language || 'txt'}`,
      content: `// Fragment: ${fragment.name} (${fragment.type})\n// File: ${fragment.file_path}\n// Lines: ${fragment.start_line}-${fragment.end_line}\n\n${fragment.content}`
    }));

    setProjectFiles((prev: any) => [...prev, ...fragmentFiles]);
    if (fragmentFiles.length > 0) {
      setActiveFileId(fragmentFiles[0].id);
    }
    setShowLookAtni(false);
    addNotification({
      message: t('notifications.fragmentsSelected', { count: fragmentFiles.length }),
      type: 'success'
    });
  };

  // Check if there are any LookAtni blobs in the current files
  const hasLookAtniBlob = files.some(file =>
    file.content.includes('// LookAtni Extraction') ||
    file.content.includes('lookatni') ||
    file.name.toLowerCase().includes('lookatni') ||
    file.name.toLowerCase().includes('extracted') ||
    file.content.includes('Fragment:') ||
    file.content.includes('// Fragment:')
  );

  // Handlers for the LookAtni buttons
  const handleUploadLocalFiles = () => {
    fileInputRef.current?.click();
  };

  const handleExtractFromProject = () => {
    if (!hasLookAtniBlob) {
      addNotification({
        message: 'Você precisa ter um blob do LookAtni carregado antes de extrair fragmentos!',
        type: 'info'
      });
      return;
    }
    setShowLookAtni(true);
  };

  const analysisTypes = [
    { type: AnalysisType.General, label: t('analysisTypes.GENERAL.label'), description: t('analysisTypes.GENERAL.description'), icon: Wand2, color: 'blue' },
    { type: AnalysisType.Security, label: t('analysisTypes.SECURITY.label'), description: t('analysisTypes.SECURITY.description'), icon: Shield, color: 'red' },
    { type: AnalysisType.Scalability, label: t('analysisTypes.SCALABILITY.label'), description: t('analysisTypes.SCALABILITY.description'), icon: Scaling, color: 'purple' },
    { type: AnalysisType.DocsReview, label: t('analysisTypes.DOCUMENTATION_REVIEW.label'), description: t('analysisTypes.DOCUMENTATION_REVIEW.description'), icon: BookText, color: 'amber' },
    { type: AnalysisType.CodeQuality, label: t('analysisTypes.CODE_QUALITY.label'), description: t('analysisTypes.CODE_QUALITY.description'), icon: Code, color: 'teal' }
  ];

  const colorMap = {
    blue: { text: 'text-blue-400', border: 'border-blue-600/60', hoverBg: 'hover:bg-blue-900/40', shadow: 'hover:shadow-blue-500/20' },
    red: { text: 'text-red-400', border: 'border-red-600/60', hoverBg: 'hover:bg-red-900/40', shadow: 'hover:shadow-red-500/20' },
    purple: { text: 'text-purple-400', border: 'border-purple-600/60', hoverBg: 'hover:bg-purple-900/40', shadow: 'hover:shadow-purple-500/20' },
    teal: { text: 'text-teal-400', border: 'border-teal-600/60', hoverBg: 'hover:bg-teal-900/40', shadow: 'hover:shadow-teal-500/20' },
    amber: { text: 'text-amber-400', border: 'border-amber-600/60', hoverBg: 'hover:bg-amber-900/40', shadow: 'hover:shadow-amber-500/20' },
  };

  const activeFileData = files.find(f => f.id === activeFileId);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <TokenUsageAlert limit={settings.tokenLimit} consumed={usageTracking.totalTokens} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: File Management and Editor */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl flex flex-col h-[70vh]">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">{t('title')}</h2>
            <p className="text-sm text-gray-400">{t('subtitle')}</p>
          </div>
          <div className="flex-grow flex">
            {/* File List */}
            <div className="w-1/3 border-r border-gray-700 p-2 space-y-1 overflow-y-auto">
              {files.map(file => (
                <button key={file.id} onClick={() => setActiveFileId(file.id)} className={`w-full text-left p-2 rounded-md text-sm flex items-center justify-between ${activeFileId === file.id ? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>
                  <span className="truncate">{file.name}</span>
                  <span onClick={(e) => { e.stopPropagation(); handleRemoveFile(file.id) }} className="text-gray-500 hover:text-red-400 p-1 rounded-full">&times;</span>
                </button>
              ))}
              <button onClick={handleAddNewFile} className="w-full flex items-center gap-2 p-2 text-sm text-blue-400 hover:bg-blue-900/50 rounded-md">
                <FilePlus className="w-4 h-4" /> {t('addFile')}
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2 p-2 text-sm text-gray-400 hover:bg-gray-700/50 rounded-md">
                <Upload className="w-4 h-4" /> {t('uploadFiles')}
              </button>
              <input title='Upload files' type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
            </div>
            {/* Editor */}
            <div className="w-2/3 flex flex-col">
              {showLookAtni ? (
                <div className="h-full flex flex-col">
                  <div className="p-2 bg-gray-900/50 border-b border-gray-700 text-sm w-full flex items-center justify-between">
                    <span className="text-white font-medium">LookAtni Extractor</span>
                    <button
                      onClick={() => setShowLookAtni(false)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <LookAtniDirectExtractor
                      onFilesExtracted={handleLookAtniFilesExtracted}
                      onFragmentsSelected={handleLookAtniFragmentsSelected}
                    />
                  </div>
                </div>
              ) : activeFileData ? (
                <>
                  <input
                    title='File name'
                    type="text"
                    value={activeFileData.name}
                    onChange={(e) => handleUpdateFileName(activeFileData.id, e.target.value)}
                    className="p-2 bg-gray-900/50 border-b border-gray-700 text-sm w-full focus:outline-none"
                  />
                  <textarea
                    value={activeFileData.content}
                    onChange={(e) => handleUpdateFileContent(activeFileData.id, e.target.value)}
                    placeholder={t('input.fileInput.placeholder')}
                    className="w-full h-full p-3 bg-gray-900/30 text-gray-300 resize-none focus:outline-none font-mono text-sm"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                  <FileText className="w-12 h-12 mb-4" />
                  <h3 className="font-semibold text-lg text-gray-400">{t('noFiles.title')}</h3>
                  <p className="text-sm">{t('noFiles.subtitle')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Analysis Options */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {analysisTypes.map(item => {
              const colors = colorMap[item.color as keyof typeof colorMap];
              return (
                <button
                  key={item.type}
                  onClick={() => handleAnalyze(item.type)}
                  disabled={isLoading || isExample}
                  className={`p-4 flex flex-col text-left rounded-lg border ${colors.border} ${colors.hoverBg} transition-all duration-300 hover:shadow-lg ${colors.shadow} group disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-6 h-6 ${colors.text} transition-transform duration-300 group-hover:scale-110`} />
                    <h3 className={`text-lg font-semibold ${colors.text}`}>{item.label}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 flex-grow">{item.description}</p>
                </button>
              )
            })}
          </div>
          <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-xl">
            <SubtleTokenUsage limit={settings.tokenLimit} consumed={usageTracking.totalTokens} />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsGitHubModalOpen(true)} disabled={isLoading || isExample} className="flex-grow w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700/80 text-gray-200 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50">
              <Code className="w-4 h-4" /> {t('importFromGithub')}
            </button>
            <button onClick={() => handleShowExample()} className="flex-grow w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-purple-600 text-purple-300 rounded-md hover:bg-purple-900/40 transition-colors">
              <Sparkles className="w-4 h-4" /> {t('actions.showExample')}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleUploadLocalFiles}
              disabled={isLoading || isExample}
              className="flex-grow w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-md hover:from-blue-700 hover:to-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" /> Upload Local Files
            </button>
            <button
              onClick={handleExtractFromProject}
              disabled={isLoading || isExample || !hasLookAtniBlob}
              className={`flex-grow w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${hasLookAtniBlob
                ? 'from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
                : 'from-gray-500 to-gray-600'
                }`}
            >
              <Sparkles className="w-4 h-4" /> Extract from Project
            </button>
          </div>
        </div>
      </div>
      <GitHubSearchModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onImport={handleImportFromGitHub}
        githubPat={settings.githubPat}
      />
    </motion.div>
  );
};

export default ProjectInput;
