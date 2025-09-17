import React from 'react';
import { AppSettings } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Github } from 'lucide-react';

interface IntegrationsTabProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ settings, onSettingsChange }) => {
    const { t } = useTranslation(['settings']);

    const handleFieldChange = (key: keyof AppSettings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <section>
            <p className="text-sm text-gray-400 mb-4">{t('integrations.description')}</p>
            
            <div className="space-y-6">
                {/* GitHub */}
                <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                    <h4 className="text-md font-semibold text-white mb-2 flex items-center gap-2"><Github className="w-5 h-5 text-gray-400"/> {t('integrations.github.title')}</h4>
                    <p className="text-sm text-gray-400 mb-4">{t('integrations.github.description')}</p>
                    <div>
                        <label htmlFor="githubPat" className="text-sm font-medium text-gray-300">{t('integrations.github.patLabel')}</label>
                        <input
                            type="password"
                            id="githubPat"
                            value={settings.githubPat || ''}
                            onChange={(e) => handleFieldChange('githubPat', e.target.value)}
                            placeholder={t('integrations.github.patPlaceholder')}
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-600 rounded-md"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default IntegrationsTab;
