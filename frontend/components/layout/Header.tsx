import { BarChart3, History, LogOut, Sparkles, User } from 'lucide-react';
import * as React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { AIProvider } from '../../services/unified-ai';
import { UserProfile } from '../../types';
import ProviderSelector from '../settings/ProviderSelector';

interface HeaderProps {
  onUserMenuClick: () => void;
  onHistoryClick: () => void;
  historyCount: number;
  userProfile: UserProfile;
  // NEW: Provider selection
  currentProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

const Header: React.FC<HeaderProps> = ({
  onUserMenuClick,
  onHistoryClick,
  historyCount,
  userProfile,
  currentProvider,
  onProviderChange
}) => {
  const { t } = useTranslation('common');
  const { logout } = useAuth();

  return (
    <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 group">
          <BarChart3 className="w-7 h-7 text-blue-400 transition-transform duration-300 group-hover:rotate-12" />
          <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 hidden sm:block">
            {t('header.title')}
          </h1>
          <Sparkles className="w-7 h-7 text-purple-400 transition-transform duration-300 group-hover:-rotate-12" />
        </div>

        <div className="flex items-center gap-3">
          {/* NEW: AI Provider Selector */}
          <ProviderSelector
            currentProvider={currentProvider}
            onProviderChange={onProviderChange}
          />

          <button onClick={onHistoryClick} className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors" aria-label={t('history.title')}>
            <History className="w-5 h-5" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors" aria-label={t('auth.logout')}>
            <LogOut className="w-5 h-5" />
          </button>
          <button
            onClick={onUserMenuClick}
            className="flex items-center gap-2 p-1 pr-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors"
            aria-label={t('profile.title')}
          >
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt="User Avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
            )}
            {userProfile.name && <span className="text-sm font-medium">{userProfile.name}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
