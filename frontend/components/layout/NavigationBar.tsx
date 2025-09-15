import { BarChart3, FilePlus, KanbanSquare, LayoutDashboard, MessageSquare } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ViewType } from '../../types';

interface NavigationBarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  hasAnalysis: boolean;
  isAnalysisOpen: boolean;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  hidden?: boolean;
}> = ({ label, icon: Icon, isActive, onClick, disabled = false, hidden = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 px-2 text-sm font-medium border-b-2 transition-all duration-200
      ${isActive
        ? 'text-white border-purple-500'
        : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${hidden ? 'hidden' : ''}
    `}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

const NavigationBar: React.FC<NavigationBarProps> = ({ currentView, onNavigate, hasAnalysis, isAnalysisOpen }) => {
  const { t } = useTranslation('common');

  const navItems = [
    { view: ViewType.Dashboard, label: t('navigation.dashboard'), icon: LayoutDashboard, disabled: false },
    { view: ViewType.Input, label: t('navigation.newAnalysis'), icon: FilePlus, disabled: false },
    { view: ViewType.Analysis, label: t('navigation.currentAnalysis'), icon: BarChart3, hidden: !hasAnalysis },
    { view: ViewType.Kanban, label: t('navigation.kanban'), icon: KanbanSquare, hidden: !hasAnalysis },
    { view: ViewType.Chat, label: t('navigation.chat'), icon: MessageSquare, disabled: !hasAnalysis },
  ];

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl flex items-center justify-around p-1">
      {navItems.map(item => (
        <NavButton
          key={item.view}
          label={item.label}
          icon={item.icon}
          isActive={currentView === item.view}
          onClick={() => onNavigate(item.view)}
          disabled={item.disabled}
          hidden={item.hidden}
        />
      ))}
    </div>
  );
};

export default NavigationBar;
