'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown as ArrowDownTrayIcon,
  ChartBar as ChartBarIcon,
  Brackets as CodeBracketIcon,
  FileText as DocumentIcon,
  EyeIcon,
  FolderIcon,
  PlayIcon,
  Upload
} from 'lucide-react';
import { useState } from 'react';
import LookAtniDirectExtractor from './LookAtniDirectExtractor';

interface ProjectFile {
  path: string;
  content: string;
  size: number;
  lines: number;
}

interface ProjectStats {
  totalFiles: number;
  totalMarkers: number;
  totalBytes: number;
  errors: Array<{ line: number; message: string }>;
}

interface ProjectExtractorProps {
  projectFile: string;
  projectName: string;
  description?: string;
}

export default function ProjectExtractor({ projectFile, projectName, description }: ProjectExtractorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState<{
    stats: ProjectStats;
    files: ProjectFile[];
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [extractionMode, setExtractionMode] = useState<'preview' | 'download' | 'direct'>('direct');

  const extractProject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/extract-project?project=${projectFile}`);
      const data = await response.json();

      if (data.success) {
        setProjectData(data);
        setSelectedFile(data.files[0] || null);
      } else {
        console.error('Extraction failed:', data.error);
      }
    } catch (error) {
      console.error('Error extracting project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadProject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/extract-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectFile, format: 'zip' })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSourceFile = async () => {
    try {
      const response = await fetch(`/projects/${projectFile}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = projectFile;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Erro ao baixar arquivo:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const isFolder = filename.includes('/') && !filename.split('/').pop()?.includes('.');

    if (isFolder) return <FolderIcon className="w-4 h-4 text-blue-500" />;
    if (['js', 'ts', 'jsx', 'tsx'].includes(ext || '')) return <CodeBracketIcon className="w-4 h-4 text-yellow-500" />;
    return <DocumentIcon className="w-4 h-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => setExtractionMode('direct')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${extractionMode === 'direct'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            Direct Extraction
          </div>
        </button>
        <button
          onClick={() => setExtractionMode('preview')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${extractionMode === 'preview'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
          <div className="flex items-center justify-center gap-2">
            <EyeIcon className="w-4 h-4" />
            Preview Mode
          </div>
        </button>
        <button
          onClick={() => setExtractionMode('download')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${extractionMode === 'download'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Download Mode
          </div>
        </button>
      </div>

      {/* Direct Extraction Mode */}
      {extractionMode === 'direct' && (
        <LookAtniDirectExtractor
          onFilesExtracted={(files) => {
            console.log('Files extracted:', files);
            // Convert to ProjectFile format if needed
          }}
          onFragmentsSelected={(fragments) => {
            console.log('Fragments selected:', fragments);
            // Handle fragment selection for analysis
          }}
        />
      )}

      {/* Legacy Project Extractor */}
      {extractionMode !== 'direct' && (
        <div
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 max-h-[60vh]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{projectName}</h3>
                {description && <p className="text-sm opacity-90">{description}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  title="Ver Estatísticas"
                >
                  <ChartBarIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <AnimatePresence>
            {showStats && projectData && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gray-50 dark:bg-gray-800 p-4 border-b"
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{projectData.stats.totalFiles}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Arquivos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{formatFileSize(projectData.stats.totalBytes)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tamanho</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{projectData.stats.totalMarkers}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Marcadores</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-2 flex-wrap">
              {!projectData ? (
                <>
                  <button
                    onClick={extractProject}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                    {isLoading ? 'Extraindo...' : 'Extrair Projeto'}
                  </button>
                  <button
                    onClick={downloadSourceFile}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <DocumentIcon className="w-4 h-4" />
                    Download .latx
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setExtractionMode('preview')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${extractionMode === 'preview'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                  >
                    <EyeIcon className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={downloadProject}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    )}
                    Download ZIP
                  </button>
                  <button
                    onClick={downloadSourceFile}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <DocumentIcon className="w-4 h-4" />
                    Download .latx
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Master-Detail Content */}
          <AnimatePresence>
            {projectData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: '500px' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-12 h-[500px]"
              >
                {/* Master: File List (Left Panel - 4/12 columns) */}
                <div
                  className="col-span-4 border-r dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800 overflow-y-auto"
                >
                  <div className="p-3 border-b dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <FolderIcon className="w-4 h-4 text-blue-500" />
                      Arquivos ({projectData.files.length})
                    </h4>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {projectData.files.map((file, index) => (
                      <motion.div
                        key={file.path}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`p-3 border-b dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedFile?.path === file.path
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-r-2 border-r-blue-500 shadow-sm'
                          : ''
                          }`}
                        onClick={() => setSelectedFile(file)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getFileIcon(file.path)}
                          <span className={`text-sm font-medium truncate flex-1 ${selectedFile?.path === file.path
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-900 dark:text-white'
                            }`}>
                            {file.path.split('/').pop()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span className="truncate block">{file.path}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span className="bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                            {formatFileSize(file.size)}
                          </span>
                          <span className="bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                            {file.lines}L
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Detail: File Content (Right Panel - 8/12 columns) */}
                <div
                  className="col-span-8 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto"
                >
                  {selectedFile ? (
                    <>
                      {/* File Header */}
                      <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getFileIcon(selectedFile.path)}
                            <span className="font-mono text-sm text-gray-900 dark:text-white truncate">
                              {selectedFile.path}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 ml-4">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                              {selectedFile.lines} linhas
                            </span>
                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                              {formatFileSize(selectedFile.size)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* File Content with Animation */}
                      <div
                        className="flex-1 overflow-hidden overflow-y-auto"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedFile.path}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <pre
                              className="p-4 text-sm font-mono bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-auto whitespace-pre-wrap leading-relaxed overflow-y-auto"
                            >
                              {selectedFile.content}
                            </pre>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </>
                  ) : (
                    /* Empty State */
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400"
                    >
                      <div className="text-center">
                        <DocumentIcon className="w-20 h-20 mx-auto mb-4 opacity-30" />
                        <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Nenhum arquivo selecionado
                        </h3>
                        <p className="text-sm max-w-xs">
                          Clique em um arquivo na lista à esquerda para visualizar seu conteúdo completo
                        </p>
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs">
                          💡 <strong>Novo layout:</strong> Lista à esquerda, conteúdo detalhado à direita para melhor navegação!
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State - No Project Data */}
          {!projectData && !isLoading && (
            <div className="p-8 text-center">
              <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Projeto ainda não extraído
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Clique em "Extrair Projeto" para visualizar os arquivos extraídos dos marcadores LookAtni
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
