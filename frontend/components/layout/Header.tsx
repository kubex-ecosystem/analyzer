import { BarChart3, LogOut, Settings, Sparkles, UserCircle } from 'lucide-react';
import * as React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { UserProfile } from '../../types';

interface HeaderProps {
  onSettingsClick: () => void;
  onProfileClick: () => void;
  userProfile: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick, onProfileClick, userProfile }) => {
  const { t } = useTranslation();
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
          <button onClick={onSettingsClick} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors" aria-label={t('settings.title')}>
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors" aria-label={t('auth.logout')}>
            <LogOut className="w-5 h-5" />
          </button>
          <button onClick={onProfileClick} className="flex items-center gap-2 p-1.5 pr-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors" aria-label={t('profile.title')}>
            <UserCircle className="w-7 h-7 text-gray-500" />
            {userProfile.name && <span className="text-sm font-medium">{userProfile.name}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
