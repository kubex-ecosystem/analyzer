import { motion } from 'framer-motion';
import {
  Archive,
  Code,
  Eye,
  FileText,
  FolderTree,
  Loader2,
  Package,
  Search,
  Sparkles
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from '../../hooks/useTranslation';

interface LookAtniExtractorProps {
  onFilesExtracted: (files: ProjectFile[]) => void;
}

interface ProjectFile {
  id: number;
  name: string;
  content: string;
}

interface ExtractedProject {
  project_name: string;
  structure: ProjectStructure;
  files: ExtractedFile[];
  fragments: CodeFragment[];
  metadata: ProjectMetadata;
  download_url?: string;
  extracted_at: string;
}

interface ProjectStructure {
  root: string;
  directories: DirectoryNode[];
  total_files: number;
  total_size: number;
}

interface DirectoryNode {
  name: string;
  path: string;
  files: FileNode[];
  children: DirectoryNode[];
}

interface FileNode {
  name: string;
  path: string;
  size: number;
  type: string;
  language: string;
}

interface ExtractedFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  size: number;
  line_count: number;
  fragments: CodeFragment[];
  metadata: Record<string, string>;
}

interface CodeFragment {
  id: string;
  type: string;
  name: string;
  file_path: string;
  start_line: number;
  end_line: number;
  content: string;
  language: string;
  complexity?: number;
  dependencies?: string[];
  metadata: Record<string, string>;
}

interface ProjectMetadata {
  languages: Record<string, number>;
  total_lines: number;
  total_files: number;
  total_fragments: number;
  extraction_time: string;
  git_info?: GitInfo;
}

interface GitInfo {
  branch: string;
  last_commit: string;
  last_commit_at: string;
  contributors: string[];
  remote_url: string;
}

const LookAtniExtractor: React.FC<LookAtniExtractorProps> = ({ onFilesExtracted }) => {
  const { t } = useTranslation(['input', 'common']);
  const { addNotification } = useNotification();

  const [isExtracting, setIsExtracting] = useState(false);
  const [isCreatingArchive, setIsCreatingArchive] = useState(false);
  const [extractedProject, setExtractedProject] = useState<ExtractedProject | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [selectedFragments, setSelectedFragments] = useState<Set<string>>(new Set());
  const [showFragments, setShowFragments] = useState(false);
  const [fragmentFilter, setFragmentFilter] = useState({
    type: '',
    language: '',
    search: ''
  });

  // Extract project using LookAtni
  const handleExtractProject = useCallback(async () => {
    if (!repoUrl) {
      addNotification({ message: 'Please enter a repository URL', type: 'error' });
      return;
    }

    setIsExtracting(true);
    try {
      const request = {
        repo_url: repoUrl,
        include_patterns: [
          '*.js', '*.ts', '*.jsx', '*.tsx', '*.go', '*.py', '*.java',
          '*.cpp', '*.c', '*.h', '*.php', '*.rb', '*.rs', '*.swift',
          '*.kt', '*.scala', '*.cs', '*.vb', '*.fs', '*.clj', '*.elm',
          '*.dart', '*.lua', '*.pl', '*.sh', '*.bat', '*.ps1', '*.sql',
          '*.html', '*.css', '*.scss', '*.less', '*.sass', '*.json',
          '*.xml', '*.yaml', '*.yml', '*.toml', '*.ini', '*.cfg',
          '*.conf', '*.md', '*.txt', '*.rst', '*.adoc'
        ],
        exclude_patterns: [
          'node_modules/**', '.git/**', 'dist/**', 'build/**',
          'target/**', '*.min.js', '*.bundle.js', 'vendor/**',
          '.vscode/**', '.idea/**', '*.log', '*.tmp', '*.cache'
        ],
        max_file_size: 1024 * 1024, // 1MB
        include_hidden: false,
        context_depth: 3,
        fragment_by: 'function'
      };

      const response = await fetch('/api/v1/lookatni/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Extraction failed: ${response.statusText}`);
      }

      const extracted: ExtractedProject = await response.json();
      setExtractedProject(extracted);
      setShowFragments(true);

      addNotification({
        message: `✅ Extracted ${extracted.files.length} files with ${extracted.fragments.length} code fragments`,
        type: 'success'
      });

    } catch (error: any) {
      addNotification({
        message: `Extraction failed: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsExtracting(false);
    }
  }, [repoUrl, addNotification]);

  // Add selected fragments as files
  const handleAddSelectedFragments = useCallback(() => {
    if (!extractedProject || selectedFragments.size === 0) return;

    const fragmentFiles: ProjectFile[] = [];

    extractedProject.fragments
      .filter(fragment => selectedFragments.has(fragment.id))
      .forEach((fragment, index) => {
        fragmentFiles.push({
          id: Date.now() + index,
          name: `${fragment.name}.${fragment.language}`,
          content: `// Fragment: ${fragment.name} (${fragment.type})\n// File: ${fragment.file_path}\n// Lines: ${fragment.start_line}-${fragment.end_line}\n\n${fragment.content}`
        });
      });

    onFilesExtracted(fragmentFiles);
    setSelectedFragments(new Set());

    addNotification({
      message: `✅ Added ${fragmentFiles.length} code fragments to analysis`,
      type: 'success'
    });
  }, [extractedProject, selectedFragments, onFilesExtracted, addNotification]);

  // Add entire files
  const handleAddEntireFiles = useCallback(() => {
    if (!extractedProject) return;

    const projectFiles: ProjectFile[] = extractedProject.files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      content: file.content
    }));

    onFilesExtracted(projectFiles);

    addNotification({
      message: `✅ Added ${projectFiles.length} complete files to analysis`,
      type: 'success'
    });
  }, [extractedProject, onFilesExtracted, addNotification]);

  // Create downloadable archive
  const handleCreateArchive = useCallback(async () => {
    if (!extractedProject) return;

    setIsCreatingArchive(true);
    try {
      const response = await fetch('/api/v1/lookatni/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extractedProject),
      });

      if (!response.ok) {
        throw new Error(`Archive creation failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Download the archive
      const downloadLink = document.createElement('a');
      downloadLink.href = result.download_url;
      downloadLink.download = result.file_name;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      addNotification({
        message: '✅ Navigable archive created and downloaded!',
        type: 'success'
      });

    } catch (error: any) {
      addNotification({
        message: `Archive creation failed: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsCreatingArchive(false);
    }
  }, [extractedProject, addNotification]);

  // Toggle fragment selection
  const toggleFragmentSelection = useCallback((fragmentId: string) => {
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
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <FolderTree className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">LookAtni Code Extractor</h2>
        <Sparkles className="w-5 h-5 text-yellow-400" />
      </div>

      {/* Extraction Form */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-3">
          <div className="flex-grow">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-sm"
              disabled={isExtracting}
            />
          </div>
          <button
            onClick={handleExtractProject}
            disabled={isExtracting || !repoUrl}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Code className="w-4 h-4" />
                Extract
              </>
            )}
          </button>
        </div>
      </div>

      {/* Project Overview */}
      {extractedProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Files</span>
              </div>
              <span className="text-xl font-bold text-white">{extractedProject.files.length}</span>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-gray-300">Fragments</span>
              </div>
              <span className="text-xl font-bold text-white">{extractedProject.fragments.length}</span>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">Lines</span>
              </div>
              <span className="text-xl font-bold text-white">{extractedProject.metadata.total_lines.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddEntireFiles}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              Add All Files
            </button>
            <button
              onClick={handleAddSelectedFragments}
              disabled={selectedFragments.size === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <Package className="w-4 h-4" />
              Add Selected ({selectedFragments.size})
            </button>
            <button
              onClick={handleCreateArchive}
              disabled={isCreatingArchive}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
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
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Fragment List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredFragments.map(fragment => (
                  <div
                    key={fragment.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedFragments.has(fragment.id)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                      }`}
                    onClick={() => toggleFragmentSelection(fragment.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{fragment.name}</span>
                          <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                            {fragment.type}
                          </span>
                          <span className="px-2 py-1 text-xs bg-blue-900 text-blue-300 rounded">
                            {fragment.language}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{fragment.file_path}</p>
                        <p className="text-xs text-gray-500">
                          Lines {fragment.start_line}-{fragment.end_line}
                          {fragment.complexity && ` • Complexity: ${fragment.complexity}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredFragments.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No fragments match the current filters</p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {!extractedProject && (
        <div className="text-center py-8 text-gray-400">
          <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="mb-2">Extract code structure from any repository</p>
          <p className="text-sm">Navigate, fragment, and analyze code with precision</p>
        </div>
      )}
    </motion.div>
  );
};

export default LookAtniExtractor;
