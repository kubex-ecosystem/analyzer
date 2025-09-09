import React, { useState, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KanbanState, KanbanColumnId, KanbanCardData, Priority } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import DifficultyMeter from '../common/DifficultyMeter';
import { LayoutGrid, ArrowLeft } from 'lucide-react';

interface KanbanBoardProps {
  initialState: KanbanState;
  projectName: string;
  onBackToAnalysis: () => void;
}

const PriorityTag: React.FC<{ priority: Priority }> = ({ priority }) => {
    const { t } = useTranslation();
    const priorityConfig: Record<Priority, { classes: string }> = {
        [Priority.High]: { classes: 'bg-red-900/80 text-red-300' },
        [Priority.Medium]: { classes: 'bg-yellow-900/80 text-yellow-300' },
        [Priority.Low]: { classes: 'bg-blue-900/80 text-blue-300' },
    };
    const config = priorityConfig[priority];
    const label = t(`priority.${priority}`);
    return <span className={`px-2 py-0.5 rounded-full font-mono text-xs ${config.classes}`}>{label}</span>;
};

const Card: React.FC<{ card: KanbanCardData; onDragStart: (e: DragEvent<HTMLDivElement>) => void }> = ({ card, onDragStart }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div
                draggable="true"
                onDragStart={onDragStart}
                className="bg-gray-800 border border-gray-700 p-3 rounded-lg cursor-grab active:cursor-grabbing hover:border-blue-500/50 transition-colors"
            >
                <p className="font-semibold text-gray-200 text-sm leading-snug">{card.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {card.priority && <PriorityTag priority={card.priority} />}
                    <DifficultyMeter difficulty={card.difficulty} />
                </div>
            </div>
        </motion.div>
    );
};


const KanbanBoard: React.FC<KanbanBoardProps> = ({ initialState, projectName, onBackToAnalysis }) => {
    const [boardState, setBoardState] = useState(initialState);
    const [draggedCardInfo, setDraggedCardInfo] = useState<{ cardId: string; sourceColumnId: KanbanColumnId } | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<KanbanColumnId | null>(null);
    const { t } = useTranslation();

    const handleDragStart = (card: KanbanCardData, sourceColumnId: KanbanColumnId) => {
        setDraggedCardInfo({ cardId: card.id, sourceColumnId });
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragEnter = (targetColumnId: KanbanColumnId) => {
        if (targetColumnId !== draggedCardInfo?.sourceColumnId) {
            setDragOverColumn(targetColumnId);
        }
    };
    
    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (targetColumnId: KanbanColumnId) => {
        if (!draggedCardInfo) return;
    
        const { cardId, sourceColumnId } = draggedCardInfo;
    
        if (sourceColumnId === targetColumnId) {
            setDraggedCardInfo(null);
            setDragOverColumn(null);
            return;
        }
    
        setBoardState(prevState => {
            const newSourceCards = [...prevState[sourceColumnId].cards];
            const cardIndex = newSourceCards.findIndex(c => c.id === cardId);
            
            if (cardIndex === -1) return prevState;

            const [movedCard] = newSourceCards.splice(cardIndex, 1);
            
            const newTargetCards = [...prevState[targetColumnId].cards, movedCard];
            
            return {
                ...prevState,
                [sourceColumnId]: { ...prevState[sourceColumnId], cards: newSourceCards },
                [targetColumnId]: { ...prevState[targetColumnId], cards: newTargetCards },
            };
        });

        setDraggedCardInfo(null);
        setDragOverColumn(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
             <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div>
                    <div className="flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-teal-400"/>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">
                             {t('kanban.title')}
                        </h2>
                    </div>
                    <p className="text-gray-400 mt-1">{t('kanban.subtitle')}</p>
                </div>
                <button
                    onClick={onBackToAnalysis}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('actions.backToAnalysis')}
                </button>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(Object.keys(initialState) as KanbanColumnId[]).map(columnId => {
                    const column = boardState[columnId];
                    return (
                        <div
                            key={columnId}
                            onDrop={() => handleDrop(columnId)}
                            onDragOver={handleDragOver}
                            onDragEnter={() => handleDragEnter(columnId)}
                            onDragLeave={handleDragLeave}
                            className={`p-4 rounded-xl bg-gray-900/30 border border-gray-800 transition-colors duration-300 ${dragOverColumn === columnId ? 'bg-blue-900/20 border-blue-700' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-white">{column.title}</h3>
                                <span className="text-sm font-mono bg-gray-700/50 text-gray-300 px-2 py-1 rounded-md">
                                    {column.cards.length}
                                </span>
                            </div>
                            <div className="space-y-3 min-h-[200px]">
                                <AnimatePresence>
                                    {column.cards.map(card => (
                                        <Card
                                            key={card.id}
                                            card={card}
                                            onDragStart={(e) => handleDragStart(card, columnId)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default KanbanBoard;