import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, PlusCircle, LayoutGrid, History, X, Menu } from 'lucide-react';
import { ViewType } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface NavigationBarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType | 'history') => void;
  isKanbanAvailable: boolean;
}

interface NavItemProps {
  view: ViewType;
  label: string;
  icon: React.ElementType;
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  disabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ view, label, icon: Icon, activeView, onNavigate, disabled }) => {
    const isActive = activeView === view;
    return (
        <li className="flex-1">
            <button
                onClick={() => onNavigate(view)}
                disabled={disabled}
                className={`relative flex flex-col items-center gap-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full ${
                    isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {isActive && (
                    <motion.div 
                        className="absolute bottom-0 h-0.5 w-8 bg-purple-500 rounded-full"
                        layoutId="active-nav-indicator"
                    />
                )}
            </button>
        </li>
    );
};

// Mobile Nav Item is slightly different
const MobileNavItem: React.FC<Omit<NavItemProps, 'activeView'>> = ({ view, label, icon: Icon, onNavigate, disabled }) => {
    return (
         <li>
            <button
                onClick={() => onNavigate(view)}
                disabled={disabled}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-gray-300 hover:bg-gray-700/50 hover:text-white
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
            </button>
        </li>
    )
}


const NavigationBar: React.FC<NavigationBarProps> = ({ activeView, onNavigate, isKanbanAvailable }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { view: 'dashboard' as ViewType, label: t('nav.dashboard'), icon: LayoutDashboard },
    { view: 'input' as ViewType, label: t('nav.newAnalysis'), icon: PlusCircle },
    { view: 'kanban' as ViewType, label: t('nav.kanban'), icon: LayoutGrid, disabled: !isKanbanAvailable },
  ];
  
  const handleHistoryClick = () => {
    onNavigate('history'); 
    setIsMobileMenuOpen(false);
  }

  const handleNavigation = (view: ViewType) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-gray-800/60 backdrop-blur-lg border border-gray-700 rounded-xl p-1.5 max-w-md mx-auto sticky top-4 z-40">
        <ul className="flex items-center justify-center gap-2 w-full">
          {navItems.map(item => (
            <NavItem 
                key={item.view} 
                {...item} 
                activeView={activeView} 
                onNavigate={handleNavigation} 
            />
          ))}
          <li className="flex-1">
            <button
                onClick={handleHistoryClick}
                className="relative flex flex-col items-center gap-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full text-gray-400 hover:bg-gray-700/50 hover:text-white"
            >
                <History className="w-5 h-5" />
                <span>{t('nav.history')}</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden flex justify-end">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-gray-800/60 backdrop-blur-lg border border-gray-700 rounded-full text-white"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-0 right-0 h-full w-64 bg-gray-800 border-l border-gray-700 p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-end mb-4">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1" aria-label="Close navigation menu">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <ul className="space-y-2">
                 {navItems.map(item => (
                  <MobileNavItem 
                    key={item.view}
                    view={item.view}
                    label={item.label}
                    icon={item.icon}
                    onNavigate={handleNavigation}
                    disabled={item.disabled}
                  />
                ))}
                <li>
                    <button
                        onClick={handleHistoryClick}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    >
                        <History className="w-5 h-5" />
                        <span>{t('nav.history')}</span>
                    </button>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavigationBar;