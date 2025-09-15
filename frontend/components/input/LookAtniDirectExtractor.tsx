import { motion } from 'framer-motion';
import lookatni from 'lookatni-core';
import {
  Archive,
  Code,
  Eye,
  Folder,
  Loader2,
  Package,
  Search,
  Sparkles,
  Upload
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from '../../hooks/useTranslation';

// Import lookatni-core directly
// Note: This will work in browser environment with proper bundling
interface LookAtniCore {
  extractProject: (path: string, dest: string, options?: lookatni.ExtractionOptions) => Promise<ExtractedProject>;
  generateNavigation: (project: ExtractedProject) => string;
  createArchive: (project: ExtractedProject) => Promise<Blob>;
}

interface LookAtniDirectExtractorProps {
  onFilesExtracted?: (files: ExtractedFile[]) => void;
  onFragmentsSelected?: (fragments: CodeFragment[]) => void;
}

interface ProjectFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
}

interface ExtractedProject {
  name: string;
  path: string;
  metadata: ProjectMetadata;
  structure: ProjectStructure;
  files: ExtractedFile[];
  fragments: CodeFragment[];
  git_info?: GitInfo;
  navigation_html?: string;
}

interface ProjectStructure {
  root: DirectoryNode;
  total_files: number;
  total_directories: number;
  languages: Record<string, number>;
  file_types: Record<string, number>;
}

interface DirectoryNode {
  name: string;
  path: string;
  type: 'directory';
  children: (DirectoryNode | FileNode)[];
  size: number;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file';
  extension: string;
  size: number;
  language?: string;
}

interface ExtractedFile {
  path: string;
  name: string;
  extension: string;
  language: string;
  content: string;
  size: number;
  lines: number;
  fragments: CodeFragment[];
}

interface CodeFragment {
  id: string;
  type: 'function' | 'class' | 'interface' | 'component' | 'module' | 'import' | 'export' | 'constant' | 'variable' | 'comment';
  name: string;
  signature?: string;
  content: string;
  file_path: string;
  start_line: number;
  end_line: number;
  language: string;
  complexity?: number;
  dependencies?: string[];
  documentation?: string;
}

interface ProjectMetadata {
  name: string;
  version?: string;
  description?: string;
  created_at: string;
  total_size: number;
  file_count: number;
  language_stats: Record<string, number>;
}

interface GitInfo {
  branch?: string;
  commit?: string;
  remote_url?: string;
  is_dirty?: boolean;
}

interface FragmentFilter {
  type: string;
  language: string;
  search: string;
}

const LookAtniDirectExtractor: React.FC<LookAtniDirectExtractorProps> = ({
  onFilesExtracted,
  onFragmentsSelected
}) => {
  const { t } = useTranslation(['input', 'common']);
  const { addNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safety constants for preventing memory issues
  const DANGEROUS_FOLDERS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'out',
    'target',
    'bin',
    'obj',
    'Debug',
    'Release',
    '.next',
    '.nuxt',
    '.vscode',
    '.idea',
    'coverage',
    '.nyc_output',
    'tmp',
    'temp',
    'cache',
    '.cache',
    'logs',
    'log',
    '.DS_Store',
    'Thumbs.db',
    '__pycache__',
    '.pytest_cache',
    'vendor',
    'public/build',
    'static/build',
    'assets/build',
    'embedded/guiweb',
    'docs-site',
    'storybook-static',
    '.expo',
    '.metro',
    'android/build',
    'ios/build',
    'web-build'
  ];

  const MAX_FILE_SIZE = 1024 * 1024; // 1MB per file
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total
  const MAX_FILES = 1000; // Maximum number of files

  // State
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCreatingArchive, setIsCreatingArchive] = useState(false);
  const [extractedProject, setExtractedProject] = useState<ExtractedProject | null>(null);
  const [selectedFragments, setSelectedFragments] = useState<Set<string>>(new Set());
  const [showFragments, setShowFragments] = useState(false);
  const [fragmentFilter, setFragmentFilter] = useState<FragmentFilter>({
    type: '',
    language: '',
    search: ''
  });
  const [previewFiles, setPreviewFiles] = useState<{ file: File; path: string; shouldInclude: boolean; reason?: string; size: number }[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Utility functions for safety checks
  const isDangerousPath = (path: string): boolean => {
    const normalizedPath = path.toLowerCase();
    return DANGEROUS_FOLDERS.some(folder =>
      normalizedPath.includes(`/${folder.toLowerCase()}/`) ||
      normalizedPath.includes(`\\${folder.toLowerCase()}\\`) ||
      normalizedPath.endsWith(`/${folder.toLowerCase()}`) ||
      normalizedPath.endsWith(`\\${folder.toLowerCase()}`) ||
      normalizedPath.startsWith(`${folder.toLowerCase()}/`) ||
      normalizedPath.startsWith(`${folder.toLowerCase()}\\`)
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const shouldIncludeFile = (file: File, path: string): { include: boolean; reason?: string } => {
    // Check if path is dangerous
    if (isDangerousPath(path)) {
      return { include: false, reason: 'Dangerous folder detected' };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { include: false, reason: `File too large (${formatFileSize(file.size)})` };
    }

    // Check file extensions that are typically not needed
    const dangerousExtensions = ['.exe', '.dll', '.so', '.dylib', '.bin', '.img', '.iso', '.tar', '.gz', '.zip', '.rar'];
    const extension = path.toLowerCase().split('.').pop();
    if (extension && dangerousExtensions.includes(`.${extension}`)) {
      return { include: false, reason: 'Binary/archive file' };
    }

    return { include: true };
  };

  // Lazy load lookatni-core
  const loadLookAtniCore = useCallback(async (): Promise<LookAtniCore> => {
    try {
      // Dynamic import for lookatni-core (commented out for now)
      // const lookatni = await import('lookatni-core');
      // return lookatni.default || lookatni;

      // Placeholder implementation for now
      return {
        extractProject: async (path: string, options?: any) => {
          throw new Error('LookAtni core not implemented yet');
        },
        generateNavigation: (project: ExtractedProject) => {
          return generateNavigationHTML(project);
        },
        createArchive: async (project: ExtractedProject) => {
          return createProjectArchive(project);
        }
      } as LookAtniCore;
    } catch (error) {
      console.error('Failed to load lookatni-core:', error);
      throw new Error('LookAtni core library not available in browser environment');
    }
  }, []);

  // Handle folder/file selection with preview
  const handleFileSelection = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // First, analyze all files and show preview
    const fileAnalysis: { file: File; path: string; shouldInclude: boolean; reason?: string; size: number }[] = [];
    let totalSize = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = file.webkitRelativePath || file.name;
      const analysis = shouldIncludeFile(file, relativePath);

      fileAnalysis.push({
        file,
        path: relativePath,
        shouldInclude: analysis.include,
        reason: analysis.reason,
        size: file.size
      });

      if (analysis.include) {
        totalSize += file.size;
      }
    }

    const includedFiles = fileAnalysis.filter(f => f.shouldInclude);
    const excludedFiles = fileAnalysis.filter(f => !f.shouldInclude);

    // Safety checks
    if (includedFiles.length > MAX_FILES) {
      addNotification({
        type: 'error',
        message: `Too many files selected (${includedFiles.length}). Maximum allowed: ${MAX_FILES}`
      });
      return;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      addNotification({
        type: 'error',
        message: `Total file size too large (${formatFileSize(totalSize)}). Maximum allowed: ${formatFileSize(MAX_TOTAL_SIZE)}`
      });
      return;
    }

    // Show preview if there are exclusions or if it's a large project
    if (excludedFiles.length > 0 || includedFiles.length > 100 || totalSize > 10 * 1024 * 1024) {
      setPreviewFiles(fileAnalysis);
      setShowPreview(true);
      addNotification({
        type: 'info',
        message: `Found ${includedFiles.length} files to process (${excludedFiles.length} excluded). Review the preview before continuing.`
      });
      return;
    }

    // If no issues, proceed directly
    await processSelectedFiles(includedFiles.map(f => ({ file: f.file, path: f.path })));
  }, [addNotification]);

  // Process the actual files after preview confirmation
  const processSelectedFiles = async (filesToProcess: { file: File; path: string }[]) => {
    setIsExtracting(true);
    setShowPreview(false);

    try {
      // Create a virtual filesystem from selected files
      const fileData = new Map<string, File>();

      filesToProcess.forEach(({ file, path }) => {
        fileData.set(path, file);
      });

      // Extract project data directly in browser
      const project = await extractProjectFromFiles(fileData);

      setExtractedProject(project);

      if (onFilesExtracted) {
        onFilesExtracted(project.files);
      }

      addNotification({
        type: 'success',
        message: `Project extracted successfully! Found ${project.files.length} files and ${project.fragments.length} code fragments.`
      });

    } catch (error) {
      console.error('Extraction error:', error);
      addNotification({
        type: 'error',
        message: `Failed to extract project: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Extract project from FileList (browser-native)
  const extractProjectFromFiles = async (fileData: Map<string, File>): Promise<ExtractedProject> => {
    const files: ExtractedFile[] = [];
    const allFragments: CodeFragment[] = [];
    const languageStats: Record<string, number> = {};
    const fileTypes: Record<string, number> = {};
    let totalSize = 0;

    // Process each file
    for (const [path, file] of fileData.entries()) {
      if (file.type && !file.type.startsWith('text/') && !isCodeFile(file.name)) {
        continue; // Skip binary files
      }

      try {
        const content = await readFileAsText(file);
        const extension = getFileExtension(file.name);
        const language = getLanguageFromExtension(extension);

        // Extract fragments from content
        const fragments = extractFragmentsFromContent(content, path, language);

        const extractedFile: ExtractedFile = {
          path,
          name: file.name,
          extension,
          language,
          content,
          size: file.size,
          lines: content.split('\n').length,
          fragments
        };

        files.push(extractedFile);
        allFragments.push(...fragments);

        // Update stats
        languageStats[language] = (languageStats[language] || 0) + 1;
        fileTypes[extension] = (fileTypes[extension] || 0) + 1;
        totalSize += file.size;

      } catch (error) {
        console.warn(`Failed to process file ${path}:`, error);
      }
    }

    // Build project structure
    const structure = buildProjectStructure(files);

    const project: ExtractedProject = {
      name: 'Local Project',
      path: '/local',
      metadata: {
        name: 'Local Project',
        description: 'Project extracted from local files',
        created_at: new Date().toISOString(),
        total_size: totalSize,
        file_count: files.length,
        language_stats: languageStats
      },
      structure,
      files,
      fragments: allFragments
    };

    return project;
  };

  // Utility functions
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const isCodeFile = (filename: string): boolean => {
    const codeExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.go', '.py', '.java', '.cpp', '.c', '.h',
      '.php', '.rb', '.rs', '.swift', '.kt', '.scala', '.cs', '.vb', '.fs',
      '.clj', '.elm', '.dart', '.lua', '.pl', '.sh', '.bat', '.ps1', '.sql',
      '.html', '.css', '.scss', '.less', '.sass', '.json', '.xml', '.yaml',
      '.yml', '.toml', '.ini', '.cfg', '.conf', '.md', '.txt', '.rst', '.adoc'
    ];

    return codeExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const getFileExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot);
  };

  const getLanguageFromExtension = (extension: string): string => {
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'javascript',
      '.tsx': 'typescript',
      '.go': 'go',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.h': 'c',
      '.php': 'php',
      '.rb': 'ruby',
      '.rs': 'rust',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.cs': 'csharp',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.json': 'json',
      '.md': 'markdown',
      '.sql': 'sql',
      '.sh': 'bash',
      '.yml': 'yaml',
      '.yaml': 'yaml'
    };

    return languageMap[extension.toLowerCase()] || 'text';
  };

  const extractFragmentsFromContent = (content: string, filePath: string, language: string): CodeFragment[] => {
    const fragments: CodeFragment[] = [];
    const lines = content.split('\n');

    // Simple pattern-based extraction (can be enhanced with proper parsers)
    const patterns = {
      function: /(?:function|def|func)\s+(\w+)/g,
      class: /(?:class|interface|type)\s+(\w+)/g,
      component: /(?:const|let|var)\s+(\w+)\s*=.*(?:React\.FC|FC|function)/g,
      import: /import\s+.*from\s+['"]([^'"]+)['"]/g,
      export: /export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g
    };

    let lineNumber = 0;
    for (const line of lines) {
      lineNumber++;

      for (const [type, pattern] of Object.entries(patterns)) {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);

        while ((match = regex.exec(line)) !== null) {
          const name = match[1] || 'anonymous';

          fragments.push({
            id: `${filePath}:${lineNumber}:${type}:${name}`,
            type: type as CodeFragment['type'],
            name,
            signature: line.trim(),
            content: line.trim(),
            file_path: filePath,
            start_line: lineNumber,
            end_line: lineNumber,
            language
          });
        }
      }
    }

    return fragments;
  };

  const buildProjectStructure = (files: ExtractedFile[]): ProjectStructure => {
    const languages: Record<string, number> = {};
    const fileTypes: Record<string, number> = {};

    files.forEach(file => {
      languages[file.language] = (languages[file.language] || 0) + 1;
      fileTypes[file.extension] = (fileTypes[file.extension] || 0) + 1;
    });

    return {
      root: {
        name: 'root',
        path: '/',
        type: 'directory',
        children: [],
        size: files.reduce((sum, f) => sum + f.size, 0)
      },
      total_files: files.length,
      total_directories: 1,
      languages,
      file_types: fileTypes
    };
  };

  // Handle archive creation
  const handleCreateArchive = useCallback(async () => {
    if (!extractedProject) return;

    setIsCreatingArchive(true);

    try {
      // Create a ZIP archive of the project
      const archiveData = await createProjectArchive(extractedProject);

      // Download the archive
      const url = URL.createObjectURL(archiveData);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${extractedProject.name}-lookatni-archive.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        message: 'Archive created and downloaded successfully!'
      });

    } catch (error) {
      console.error('Archive creation error:', error);
      addNotification({
        type: 'error',
        message: `Failed to create archive: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsCreatingArchive(false);
    }
  }, [extractedProject, addNotification]);

  const createProjectArchive = async (project: ExtractedProject): Promise<Blob> => {
    // Simple implementation - in a real scenario, you'd use JSZip or similar
    const archiveContent = {
      project: project,
      navigation: generateNavigationHTML(project),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(archiveContent, null, 2)], {
      type: 'application/json'
    });

    return blob;
  };

  const generateNavigationHTML = (project: ExtractedProject): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${project.name} - LookAtni Navigation</title>
    <style>
        body { font-family: monospace; background: #1a1a1a; color: #fff; }
        .fragment { margin: 10px 0; padding: 10px; background: #2a2a2a; border-radius: 5px; }
        .file-path { color: #888; font-size: 0.9em; }
        .fragment-name { color: #4CAF50; font-weight: bold; }
        .fragment-type { color: #2196F3; text-transform: uppercase; font-size: 0.8em; }
    </style>
</head>
<body>
    <h1>🔍 ${project.name}</h1>
    <p>Generated by LookAtni on ${new Date().toLocaleString()}</p>

    <h2>📊 Project Statistics</h2>
    <ul>
        <li>Files: ${project.files.length}</li>
        <li>Fragments: ${project.fragments.length}</li>
        <li>Languages: ${Object.keys(project.metadata.language_stats).join(', ')}</li>
    </ul>

    <h2>🧩 Code Fragments</h2>
    ${project.fragments.map(fragment => `
        <div class="fragment">
            <div class="fragment-type">${fragment.type}</div>
            <div class="fragment-name">${fragment.name}</div>
            <div class="file-path">${fragment.file_path}:${fragment.start_line}</div>
            <pre><code>${fragment.content}</code></pre>
        </div>
    `).join('')}
</body>
</html>
    `;
  };

  // Handle fragment selection
  const handleFragmentToggle = useCallback((fragmentId: string) => {
    setSelectedFragments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fragmentId)) {
        newSet.delete(fragmentId);
      } else {
        newSet.add(fragmentId);
      }
      return newSet;
    });
  }, []);

  const handleFragmentSelectionSubmit = useCallback(() => {
    if (!extractedProject || !onFragmentsSelected) return;

    const selectedFragmentObjects = extractedProject.fragments.filter(f =>
      selectedFragments.has(f.id)
    );

    onFragmentsSelected(selectedFragmentObjects);

    addNotification({
      type: 'success',
      message: `Selected ${selectedFragmentObjects.length} fragments for analysis`
    });
  }, [extractedProject, selectedFragments, onFragmentsSelected, addNotification]);

  // Filter fragments
  const filteredFragments = extractedProject?.fragments.filter(fragment => {
    if (fragmentFilter.type && fragment.type !== fragmentFilter.type) return false;
    if (fragmentFilter.language && fragment.language !== fragmentFilter.language) return false;
    if (fragmentFilter.search && !fragment.name.toLowerCase().includes(fragmentFilter.search.toLowerCase())) return false;
    return true;
  }) || [];

  const fragmentTypes = [...new Set(extractedProject?.fragments.map(f => f.type) || [])];
  const languages = [...new Set(extractedProject?.fragments.map(f => f.language) || [])];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-700 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl font-semibold text-white">LookAtni Direct Extractor</h2>
        <Code className="w-5 h-5 text-blue-400" />
      </div>

      {/* File Selection */}
      <div className="space-y-4 mb-6">
        <div className="text-sm text-gray-400 mb-3">
          Select a folder or multiple files to extract code structure and fragments
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          // @ts-ignore - webkitdirectory is not in types but works in browsers
          webkitdirectory=""
          onChange={handleFileSelection}
          className="hidden"
          aria-label="File selection input"
          title="Select files or folder for extraction"
        />

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (fileInputRef.current) {
                // @ts-ignore
                fileInputRef.current.webkitdirectory = true;
                fileInputRef.current.click();
              }
            }}
            disabled={isExtracting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Folder className="w-4 h-4" />
                Select Folder
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (fileInputRef.current) {
                // @ts-ignore
                fileInputRef.current.webkitdirectory = false;
                fileInputRef.current.click();
              }
            }}
            disabled={isExtracting}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Select Files
              </>
            )}
          </button>
        </div>
      </div>

      {/* Project Overview */}
      {extractedProject && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          {/* Project Info */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">{extractedProject.name}</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Files</div>
                <div className="text-white font-medium">{extractedProject.files.length}</div>
              </div>
              <div>
                <div className="text-gray-400">Fragments</div>
                <div className="text-white font-medium">{extractedProject.fragments.length}</div>
              </div>
              <div>
                <div className="text-gray-400">Languages</div>
                <div className="text-white font-medium">{Object.keys(extractedProject.metadata.language_stats).length}</div>
              </div>
              <div>
                <div className="text-gray-400">Size</div>
                <div className="text-white font-medium">{(extractedProject.metadata.total_size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCreateArchive}
              disabled={isCreatingArchive}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {isCreatingArchive ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  Download Archive
                </>
              )}
            </button>
            <button
              onClick={() => setShowFragments(!showFragments)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showFragments ? 'Hide' : 'Show'} Fragments
            </button>
          </div>

          {/* Fragment Browser */}
          {showFragments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={fragmentFilter.type}
                  onChange={(e) => setFragmentFilter(prev => ({ ...prev, type: e.target.value }))}
                  className="p-2 bg-gray-900 border border-gray-600 rounded-lg text-sm"
                  title="Filter by fragment type"
                >
                  <option value="">All Types</option>
                  {fragmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  value={fragmentFilter.language}
                  onChange={(e) => setFragmentFilter(prev => ({ ...prev, language: e.target.value }))}
                  className="p-2 bg-gray-900 border border-gray-600 rounded-lg text-sm"
                  title="Filter by programming language"
                >
                  <option value="">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={fragmentFilter.search}
                    onChange={(e) => setFragmentFilter(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search fragments..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Fragments List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredFragments.map(fragment => (
                  <div
                    key={fragment.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedFragments.has(fragment.id)
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-800 hover:bg-gray-750'
                      }`}
                    onClick={() => handleFragmentToggle(fragment.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                          {fragment.type}
                        </span>
                        <span className="font-medium text-white">{fragment.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{fragment.language}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">{fragment.file_path}:{fragment.start_line}</div>
                    <div className="text-sm text-gray-300 font-mono truncate">{fragment.signature}</div>
                  </div>
                ))}
              </div>

              {/* Selection Actions */}
              {selectedFragments.size > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <span className="text-sm text-blue-300">
                    {selectedFragments.size} fragment{selectedFragments.size !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleFragmentSelectionSubmit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Use Selected for Analysis
                  </button>
                  <button
                    onClick={() => setSelectedFragments(new Set())}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* File Preview Modal */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                🛡️ Review Files Before Processing
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {previewFiles.length > 0 && (
              <>
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Safety Summary:</strong>
                    <br />
                    • {previewFiles.filter(f => f.shouldInclude).length} files will be processed
                    <br />
                    • {previewFiles.filter(f => !f.shouldInclude).length} files will be excluded (dangerous/too large)
                    <br />
                    • Total size: {formatFileSize(previewFiles.filter(f => f.shouldInclude).reduce((sum, f) => sum + f.size, 0))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {previewFiles.map((fileInfo, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded border text-sm ${fileInfo.shouldInclude
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {fileInfo.shouldInclude ? '✅' : '❌'} {fileInfo.path}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(fileInfo.size)}
                        </span>
                      </div>
                      {!fileInfo.shouldInclude && fileInfo.reason && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Excluded: {fileInfo.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      const filesToProcess = previewFiles
                        .filter(f => f.shouldInclude)
                        .map(f => ({ file: f.file, path: f.path }));
                      processSelectedFiles(filesToProcess);
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    🚀 Process {previewFiles.filter(f => f.shouldInclude).length} Safe Files
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LookAtniDirectExtractor;
