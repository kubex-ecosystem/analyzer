import { AnimatePresence, motion } from 'framer-motion';
import { GitBranch, Loader2, Search, Star, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from '../../hooks/useTranslation';
import { listUserRepos } from '../../services/integrations/github';
import { GitHubRepoListItem } from '../../types';

interface GitHubSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (owner: string, repo: string) => void;
  githubPat?: string;
}

const GitHubSearchModal: React.FC<GitHubSearchModalProps> = ({ isOpen, onClose, onImport, githubPat }) => {
  const { t } = useTranslation(['input', 'common']);
  const { addNotification } = useNotification();
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState<GitHubRepoListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedUsername, setSearchedUsername] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!githubPat) {
      addNotification({ message: t('notifications.noGithubPat'), type: 'error' });
      return;
    }
    if (!username) {
      addNotification({ message: t('input:githubSearch.emptyUsername'), type: 'error' });
      return;
    }
    setIsLoading(true);
    setSearchedUsername(username);
    try {
      const results = await listUserRepos(username, githubPat);
      setRepos(results);
    } catch (error: any) {
      addNotification({ message: error.message, type: 'error' });
      setRepos([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl h-[80vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">{t('input:githubSearch.title')}</h2>
              </div>
              <button title={t('common:close')} onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={t('input:githubSearch.placeholder')}
                  className="flex-grow p-2 bg-gray-900 border border-gray-600 rounded-md text-sm"
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading} className="p-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 flex items-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  <span>{t('input:githubSearch.searchButton')}</span>
                </button>
              </form>
            </div>

            {/* Results */}
            <div className="flex-grow p-4 pt-0 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
              ) : searchedUsername && repos.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-300">{t('input:githubSearch.resultsTitle', { username: searchedUsername })}</h3>
                  {repos.map(repo => (
                    <div key={repo.id} className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg flex items-center justify-between gap-4">
                      <div className="flex-grow overflow-hidden">
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline truncate">{repo.name}</a>
                        <p className="text-xs text-gray-400 truncate mt-1">{repo.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{repo.stargazers_count.toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onImport(repo.owner.login, repo.name)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        <span>{t('input:githubSearch.importButton')}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchedUsername && repos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <GitBranch className="w-12 h-12 mb-4" />
                  <p className="font-semibold">{t('input:githubSearch.noReposFound')}</p>
                  <p className="text-sm">Please check the username or organization and try again.</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GitHubSearchModal;
