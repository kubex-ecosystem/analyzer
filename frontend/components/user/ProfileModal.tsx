import { Mail, User } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { UserProfile } from '../../types';

interface ProfileTabProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onProfileChange }) => {
  const { t } = useTranslation(['common', 'settings']);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onProfileChange({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {profile.avatar ? (
          <img src={profile.avatar} alt="User Avatar" className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-400" />
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-white">{profile.name}</h3>
          <p className="text-gray-400">{profile.email}</p>
          <button className="mt-2 text-sm text-blue-400 hover:underline">{t('profile.avatar.change')}</button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('profile.nameLabel')}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            placeholder={t('profile.namePlaceholder')}
            className="w-full p-2 mt-1 bg-gray-900 border border-gray-600 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {t('profile.emailLabel')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email || ''}
            onChange={handleChange}
            placeholder={t('profile.emailPlaceholder')}
            className="w-full p-2 mt-1 bg-gray-900 border border-gray-600 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
