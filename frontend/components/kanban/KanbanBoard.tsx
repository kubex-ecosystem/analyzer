import React, { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { KanbanSquare, Plus } from 'lucide-react';
import { KanbanState, KanbanCard, KanbanColumnId, Priority, Difficulty, KanbanColumn } from '../../types';
import KanbanCardComponent from './KanbanCardComponent';
import EditCardModal from './EditCardModal';
import { useTranslation } from '../../hooks/useTranslation';

interface KanbanBoardProps {
  initialState: KanbanState;
  onStateChange: (state: KanbanState) => void;
  isExample?: boolean;
}

const DropIndicator = () => (
    <div className="my-1 h-1 w-full bg-blue-500 rounded-full" />
);

const KanbanBoard: React.FC<KanbanBoardProps> = ({ initialState, onStateChange, isExample = false }) => {
  const { t } = useTranslation(['kanban', 'common']);
  const [boardState, setBoardState] = useState(initialState);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [targetColumn, setTargetColumn] = useState<KanbanColumnId | null>(null);

  const [draggedCard, setDraggedCard] = useState<{ card: KanbanCard, sourceColumnId: KanbanColumnId } | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ columnId: KanbanColumnId; index: number } | null>(null);

  const columnRefs = {
    backlog: useRef<HTMLDivElement>(null),
    todo: useRef<HTMLDivElement>(null),
    inProgress: useRef<HTMLDivElement>(null),
    done: useRef<HTMLDivElement>(null),
  };
  
  const { projectName, columns } = boardState;

  const updateAndPersistState = (newState: KanbanState) => {
    setBoardState(newState); // Always update local state for immediate feedback
    if (!isExample) {
      onStateChange(newState); // Only persist changes if not in example mode
    }
  };

  const handleDragStart = (card: KanbanCard, sourceColumnId: KanbanColumnId) => {
    setDraggedCard({ card, sourceColumnId });
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!draggedCard) return;

    const { point } = info;
    let dropColumnId: KanbanColumnId | null = null;

    for (const [id, ref] of Object.entries(columnRefs)) {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            if (point.x > rect.left && point.x < rect.right && point.y > rect.top && point.y < rect.bottom) {
                dropColumnId = id as KanbanColumnId;
                break;
            }
        }
    }

    if (dropColumnId) {
        const columnEl = columnRefs[dropColumnId].current!;
        const cards = Array.from(columnEl.querySelectorAll('[data-kanban-card="true"]')) as HTMLElement[];
        
        let closest = { offset: Number.NEGATIVE_INFINITY, index: cards.length };

        cards.forEach((card, index) => {
            const box = card.getBoundingClientRect();
            const offset = point.y - (box.top + box.height / 2);
            if (offset < 0 && offset > closest.offset) {
                closest = { offset, index };
            }
        });
        setDropIndicator({ columnId: dropColumnId, index: closest.index });
    } else {
        setDropIndicator(null);
    }
  };
  
  const handleDragEnd = () => {
    if (!draggedCard || !dropIndicator) {
      setDraggedCard(null);
      setDropIndicator(null);
      return;
    }

    const { card, sourceColumnId } = draggedCard;
    const { columnId: destColumnId, index: destIndex } = dropIndicator;
    
    const newColumns = JSON.parse(JSON.stringify(boardState.columns));
    
    const sourceCards = newColumns[sourceColumnId].cards;
    const sourceIndex = sourceCards.findIndex((c: KanbanCard) => c.id === card.id);
    
    if (sourceIndex > -1) {
      const [removedCard] = sourceCards.splice(sourceIndex, 1);
      
      let adjustedDestIndex = destIndex;
      if (sourceColumnId === destColumnId && sourceIndex < destIndex) {
        adjustedDestIndex--;
      }
      
      const destCards = newColumns[destColumnId].cards;
      destCards.splice(adjustedDestIndex, 0, removedCard);
      
      updateAndPersistState({ ...boardState, columns: newColumns });
    }
    
    setDraggedCard(null);
    setDropIndicator(null);
  };

  const handleUpdateCard = (updatedCard: KanbanCard) => {
    const newColumns = { ...columns };
    for (const columnId in newColumns) {
      const col = newColumns[columnId as KanbanColumnId];
      const cardIndex = col.cards.findIndex(c => c.id === updatedCard.id);
      if (cardIndex > -1) {
        col.cards[cardIndex] = updatedCard;
        updateAndPersistState({ ...boardState, columns: newColumns });
        setEditingCard(null);
        return;
      }
    }
  };

  const handleAddCard = (newCard: Omit<KanbanCard, 'id'>) => {
    if (!targetColumn) return;
    const cardWithId: KanbanCard = { ...newCard, id: `card-${Date.now()}` };
    const newColumns = { ...columns };
    newColumns[targetColumn].cards.unshift(cardWithId);
    updateAndPersistState({ ...boardState, columns: newColumns });
    setEditingCard(null);
    setTargetColumn(null);
  };
  
  const handleSaveCard = (card: KanbanCard | Omit<KanbanCard, 'id'>) => {
    if ('id' in card && card.id) {
      handleUpdateCard(card);
    } else {
      handleAddCard(card);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    const newColumns = { ...columns };
    for (const columnId in newColumns) {
        const col = newColumns[columnId as KanbanColumnId];
        col.cards = col.cards.filter(c => c.id !== cardId);
    }
    updateAndPersistState({ ...boardState, columns: newColumns });
    setEditingCard(null);
  };
  
  const handleOpenAddModal = (columnId: KanbanColumnId) => {
    setTargetColumn(columnId);
    setEditingCard({
        id: '', // Temporary, indicates a new card
        title: '',
        description: '',
        priority: Priority.Medium,
        difficulty: Difficulty.Medium,
        tags: [],
        notes: '',
    });
  };

  return (
    <>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-baseline gap-3">
            <KanbanSquare className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">{t('kanban.title')}</h1>
              {projectName && <p className="text-lg text-gray-400">{t('kanban.projectHeader')}: {projectName}</p>}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {Object.values(columns).map((column) => {
            const isDropTargetColumn = dropIndicator?.columnId === column.id;
            return (
              <div 
                key={column.id}
                ref={columnRefs[column.id]}
                className={`bg-gray-800/50 border border-gray-700 rounded-xl flex flex-col h-full transition-colors duration-300 ${isDropTargetColumn ? 'bg-blue-900/30 border-blue-500' : ''}`}
              >
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-white">{column.title}</h3>
                  <span className="text-sm font-mono bg-gray-700/80 text-gray-300 px-2 py-0.5 rounded-md">{column.cards.length}</span>
                </div>
                <div className="p-4 space-y-3 flex-grow min-h-[200px]">
                  {column.cards.map((card, index) => (
                    <React.Fragment key={card.id}>
                      {isDropTargetColumn && dropIndicator.index === index && <DropIndicator />}
                      <KanbanCardComponent 
                        card={card} 
                        onEdit={() => setEditingCard(card)} 
                        onDragStart={() => handleDragStart(card, column.id)}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                      />
                    </React.Fragment>
                  ))}
                  {isDropTargetColumn && dropIndicator.index === column.cards.length && <DropIndicator />}
                  <button 
                    onClick={() => handleOpenAddModal(column.id)}
                    className="w-full flex items-center justify-center gap-2 p-2 text-sm text-gray-400 border-2 border-dashed border-gray-600 rounded-lg hover:bg-gray-700/50 hover:text-white hover:border-solid hover:border-gray-500 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    {t('kanban.addCard')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <EditCardModal 
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        card={editingCard}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        isExample={isExample}
      />
    </>
  );
};

export default KanbanBoard;