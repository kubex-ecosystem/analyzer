import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Settings as SettingsIcon, Database, Link as LinkIcon } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import ProfileModal from '../user/ProfileModal';
import PreferencesTab from './PreferencesTab';
import IntegrationsTab from './IntegrationsTab';
import DataTab from './DataTab';

type Tab = 'profile' | 'preferences' | 'integrations' | 'data';

const UserSettingsModal: React.FC = () => {
    const { isUserSettingsModalOpen, setIsUserSettingsModalOpen, settings, setSettings, isExample } = useProjectContext();
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
        { id: 'integrations', label: 'Integrations', icon: LinkIcon },
        { id: 'data', label: 'Data', icon: Database },
    ];

    return (
        <AnimatePresence>
            {isUserSettingsModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsUserSettingsModalOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-3xl flex flex-col shadow-2xl h-[80vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">Settings</h2>
                            <button onClick={() => setIsUserSettingsModalOpen(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-grow overflow-hidden">
                            {/* Sidebar */}
                            <div className="w-1/4 p-4 border-r border-gray-700">
                                <nav className="space-y-1">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as Tab)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                                                activeTab === tab.id
                                                    ? 'bg-purple-900/50 text-white'
                                                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                            }`}
                                        >
                                            <tab.icon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Content */}
                            <div className="w-3/4 p-6 overflow-y-auto">
                                {activeTab === 'profile' && <ProfileModal />}
                                {activeTab === 'preferences' && <PreferencesTab settings={settings} onSettingsChange={setSettings} />}
                                {activeTab === 'integrations' && <IntegrationsTab settings={settings} onSettingsChange={setSettings} />}
                                {activeTab === 'data' && <DataTab isExample={isExample} />}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserSettingsModal;