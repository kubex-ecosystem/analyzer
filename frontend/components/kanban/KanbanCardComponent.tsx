import { motion, PanInfo } from 'framer-motion';
import { StickyNote } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { KanbanCard, Priority } from '../../types';
import DifficultyMeter from '../common/DifficultyMeter';

interface KanbanCardComponentProps {
  card: KanbanCard;
  onEdit: () => void;
  onDragStart?: () => void;
  onDrag: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  onDragEnd: () => void;
}

const getPriorityClass = (priority: Priority) => {
  switch (priority) {
    case Priority.High: return 'bg-red-500';
    case Priority.Medium: return 'bg-yellow-500';
    case Priority.Low: return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

const KanbanCardComponent: React.FC<KanbanCardComponentProps> = ({ card, onEdit, onDragStart = () => { }, onDrag, onDragEnd }) => {
  const { t } = useTranslation('common');
  const cursorClass = 'cursor-grab active:cursor-grabbing';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      drag={true}
      dragElastic={0.8}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)", zIndex: 50 }}
      onClick={onEdit}
      data-kanban-card="true"
      className={`p-3 bg-gray-900/70 border border-gray-700 rounded-lg transition-all relative hover:bg-gray-800/80 hover:border-gray-600 ${cursorClass}`}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-sm font-semibold text-white pr-2">{card.title}</p>
        <div className="flex items-center gap-2 shrink-0">
          {card.notes && <span title={t('kanban.notes')!}><StickyNote className="w-4 h-4 text-gray-500" /></span>}
          <div className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${getPriorityClass(card.priority)}`} title={`${t('common.priority')}: ${t(`priority.${card.priority}`)}`}></div>
        </div>
      </div>
      <div className="mt-2">
        <DifficultyMeter difficulty={card.difficulty} />
      </div>
    </motion.div>
  );
};

export default KanbanCardComponent;
