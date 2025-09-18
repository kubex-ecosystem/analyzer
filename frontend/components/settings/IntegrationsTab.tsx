import React from 'react';
// FIX: Corrected import path for types
import { AppSettings } from '../../types';
import { Github } from 'lucide-react';

interface IntegrationsTabProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ settings, onSettingsChange }) => {

    const handleFieldChange = (key: keyof AppSettings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <section>
            <p className="text-sm text-gray-400 mb-4">Connect your accounts to enable additional features, like importing from private GitHub repositories.</p>
            
            <div className="space-y-6">
                {/* GitHub */}
                <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                    <h4 className="text-md font-semibold text-white mb-2 flex items-center gap-2"><Github className="w-5 h-5 text-gray-400"/> GitHub</h4>
                    <p className="text-sm text-gray-400 mb-4">Provide a Personal Access Token (PAT) to access private repositories and increase API rate limits.</p>
                    <div>
                        <label htmlFor="githubPat" className="text-sm font-medium text-gray-300">Personal Access Token (PAT)</label>
                        <input
                            type="password"
                            id="githubPat"
                            value={settings.githubPat || ''}
                            onChange={(e) => handleFieldChange('githubPat', e.target.value)}
                            placeholder="Enter your GitHub PAT"
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-600 rounded-md"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default IntegrationsTab;