import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { ViewType } from '../../types';
import { FileText, ListChecks, Sparkles, Star, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface DashboardEmptyStateProps {
  onNavigate: (view: ViewType | 'history') => void;
}

const HeroBanner: React.FC<{ onNavigate: (view: ViewType | 'history') => void }> = ({ onNavigate }) => {
    const { t, isLoading } = useTranslation(['dashboard', 'common', 'landing']);
    const [dynamicTitle, setDynamicTitle] = useState('');

    useEffect(() => {
        if (!isLoading) {
            const titles = t('landing.dynamicPhrases') as unknown as string[];
            if (Array.isArray(titles) && titles.length > 0) {
                const randomIndex = Math.floor(Math.random() * titles.length);
                setDynamicTitle(titles[randomIndex]);
            }
        }
    }, [t, isLoading]);
    
    return (
        <div className="text-center p-8 bg-gray-900/30 rounded-xl border border-gray-800">
            <div className="inline-flex items-center justify-center gap-3 group h-16 md:h-20">
                <BarChart3 className="w-10 h-10 md:w-12 md:h-12 text-blue-400 transition-transform duration-300 group-hover:rotate-12" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {isLoading ? '...' : dynamicTitle}
                </h1>
                <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-purple-400 transition-transform duration-300 group-hover:-rotate-12" />
            </div>
            <p className="text-gray-400 mt-4 max-w-3xl mx-auto text-lg md:text-xl">
                {isLoading ? '...' : t('header.subtitle')}
            </p>
            <div className="mt-8">
                <button
                    onClick={() => onNavigate(ViewType.Input)}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
                >
                    <span>{isLoading ? '...' : t('dashboard.emptyState.cta')}</span>
                </button>
            </div>
        </div>
    );
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100 }
    }
};

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="group bg-gradient-to-br from-gray-800 to-gray-900/50 border border-gray-700 p-4 rounded-lg flex items-center gap-4 transition-all duration-300">
        <div className="bg-gray-900/50 p-3 rounded-full">{icon}</div>
        <div>
            <p className="font-semibold text-white">{title}</p>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    </div>
);


const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ onNavigate }) => {
    const { t, isLoading } = useTranslation(['dashboard', 'common', 'landing']);
    
    if (isLoading) {
        return (
            <div className="space-y-12 animate-pulse">
                <div className="h-64 bg-gray-900/30 rounded-xl border border-gray-800"></div>
                <div className="h-96 bg-gray-900/30 p-6 rounded-xl border border-gray-800"></div>
            </div>
        );
    }
  
    return (
        <motion.div
            className="space-y-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <HeroBanner onNavigate={onNavigate} />
            </motion.div>

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-gray-900/30 p-6 rounded-xl border border-gray-800"
                variants={itemVariants}
            >
                <div className="lg:col-span-3 bg-gray-800/50 border border-gray-700 p-8 rounded-xl flex flex-col items-center justify-center text-center">
                    <Sparkles className="w-12 h-12 text-purple-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white">{t('dashboard.emptyState.title')}</h3>
                    <p className="text-gray-400 mt-2 max-w-md">
                        {t('dashboard.emptyState.subtitle')}
                    </p>
                </div>
                
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    <InfoCard 
                        icon={<FileText className="w-6 h-6 text-purple-400"/>} 
                        title={t('dashboard.kpi.totalAnalyses')} 
                        description={t('dashboard.emptyState.kpi_total_description')} 
                    />
                    <InfoCard 
                        icon={<Star className="w-6 h-6 text-yellow-400"/>} 
                        title={t('dashboard.kpi.averageScore')} 
                        description={t('dashboard.emptyState.kpi_score_description')} 
                    />
                    <InfoCard 
                        icon={<ListChecks className="w-6 h-6 text-teal-400"/>} 
                        title={t('dashboard.kpi.commonType')} 
                        description={t('dashboard.emptyState.kpi_type_description')} 
                    />
                    <InfoCard 
                        icon={<Zap className="w-6 h-6 text-blue-400"/>} 
                        title={t('dashboard.kpi.tokensThisMonth')} 
                        description={t('dashboard.emptyState.kpi_tokens_description')} 
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DashboardEmptyState;
