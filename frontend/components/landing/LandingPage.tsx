import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { FileText, ShieldCheck, Layers3, CodeXml, Star, BarChart3, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import FeatureDetailModal from './FeatureDetailModal';

export interface AnalysisFeature {
    icon: React.ElementType;
    titleKey: string;
    descriptionKey: string;
    detailKey: string;
    color: 'blue' | 'red' | 'purple' | 'teal';
}

const colorMap = {
    blue: { text: 'text-blue-400', hoverBorder: 'hover:border-blue-500/50', hoverShadow: 'hover:shadow-blue-500/20' },
    red: { text: 'text-red-400', hoverBorder: 'hover:border-red-500/50', hoverShadow: 'hover:shadow-red-500/20' },
    purple: { text: 'text-purple-400', hoverBorder: 'hover:border-purple-500/50', hoverShadow: 'hover:shadow-purple-500/20' },
    teal: { text: 'text-teal-400', hoverBorder: 'hover:border-teal-500/50', hoverShadow: 'hover:shadow-teal-500/20' },
};

const features: AnalysisFeature[] = [
    { 
        icon: FileText, 
        titleKey: 'analysisTypes.GENERAL.label',
        descriptionKey: 'analysisTypes.GENERAL.description',
        detailKey: 'landing.featureDetails.GENERAL',
        color: 'blue',
    },
    { 
        icon: ShieldCheck, 
        titleKey: 'analysisTypes.SECURITY.label',
        descriptionKey: 'analysisTypes.SECURITY.description',
        detailKey: 'landing.featureDetails.SECURITY',
        color: 'red',
    },
    { 
        icon: Layers3,
        titleKey: 'analysisTypes.SCALABILITY.label',
        descriptionKey: 'analysisTypes.SCALABILITY.description',
        detailKey: 'landing.featureDetails.SCALABILITY',
        color: 'purple',
    },
    { 
        icon: CodeXml, 
        titleKey: 'analysisTypes.CODE_QUALITY.label',
        descriptionKey: 'analysisTypes.CODE_QUALITY.description',
        detailKey: 'landing.featureDetails.CODE_QUALITY',
        color: 'teal',
    }
];

const FeatureCard: React.FC<{ feature: AnalysisFeature, onClick: () => void }> = ({ feature, onClick }) => {
    const { t } = useTranslation();
    const Icon = feature.icon;
    const styles = colorMap[feature.color];
    return (
        <button 
            onClick={onClick}
            className={`group bg-gradient-to-br from-gray-800 to-gray-900/50 border border-gray-700 p-6 rounded-xl flex flex-col items-start gap-4 text-left transition-all duration-300 hover:scale-[1.03] ${styles.hoverBorder} hover:shadow-2xl ${styles.hoverShadow} cursor-pointer`}
        >
            <div className="bg-gray-900/50 p-3 rounded-full transition-transform duration-300 group-hover:scale-110">
                <Icon className={`w-7 h-7 ${styles.text} transition-transform duration-300 group-hover:-rotate-12`}/>
            </div>
            <div>
                <p className="font-semibold text-white text-lg">{t(feature.titleKey)}</p>
                <p className="text-sm text-gray-400 mt-1">{t(feature.descriptionKey)}</p>
            </div>
        </button>
    );
};


const LandingPage: React.FC = () => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const [selectedFeature, setSelectedFeature] = useState<AnalysisFeature | null>(null);
    const [dynamicTitle, setDynamicTitle] = useState('');

    useEffect(() => {
        const titles = t('landing.dynamicPhrases') as unknown as string[];
        if (Array.isArray(titles) && titles.length > 0) {
            const randomIndex = Math.floor(Math.random() * titles.length);
            setDynamicTitle(titles[randomIndex]);
        }
    }, [t]);


  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans selection:bg-purple-500/30">
        <div className="fixed top-0 left-0 w-full h-full bg-grid-gray-700/[0.05] -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-20">
            
            {/* Hero Section */}
            <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
            >
                {/* Combined Title */}
                <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2 group">
                    <div
                        className="text-3xl md:text-5xl font-bold text-gray-200"
                    >
                        <span>{t('header.title')}</span>
                    </div>
                    
                    <div className="inline-flex items-baseline justify-center gap-3">
                        <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-blue-400 transition-transform duration-300 group-hover:rotate-6" />
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                          {dynamicTitle}
                        </h1>
                        <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-purple-400 transition-transform duration-300 group-hover:-rotate-6" />
                    </div>
                </div>
                
                <p className="text-gray-400 mt-6 max-w-3xl mx-auto text-lg md:text-xl">
                    {t('header.subtitle')}
                </p>
                <div className="mt-10">
                    <button
                        onClick={login}
                        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
                    >
                        <span>{t('landing.cta')}</span>
                        <div className="absolute -right-2 -top-2 w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center animate-pulse">
                            <Star className="w-3 h-3 text-teal-900" />
                        </div>
                    </button>
                </div>
            </motion.div>

            {/* Features Section */}
            <motion.div 
                className="space-y-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">{t('landing.featuresTitle')}</h2>
                    <p className="text-gray-400 mt-2 max-w-2xl mx-auto">{t('landing.featuresSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard 
                            key={index}
                            feature={feature}
                            onClick={() => setSelectedFeature(feature)}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
        <FeatureDetailModal 
            feature={selectedFeature}
            onClose={() => setSelectedFeature(null)}
        />
    </div>
  );
};

export default LandingPage;