import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useSettings } from '../context/SettingsContext';
import { formatTaskDate } from '../utils/formatDate';


interface MiniCompactTodoItemProps {
  title: string;
  completed: boolean;
  onToggle: () => void;
  projectColor?: string;
  description?: string;
  project?: string;
  dueDate?: string | Date;
  tags?: string[];
}
const MiniCompactTodoItem: React.FC<MiniCompactTodoItemProps> = ({
  title,
  completed,
  onToggle,
  projectColor,
  description,
  project,
  dueDate,
  tags,
}) => {
  const { dateFormat } = useSettings(); // ✅ Now inside the component

  return (
    <Tippy
      content={
        <div className="tooltip-content">
          <strong>{title}</strong>
          {project && (
            <div className="text-[.7rem] text-b-blue-400">
              <i className="pr-1 fas fa-project-diagram"></i> {project}
            </div>
          )}
          {dueDate && (
            <div className="text-[.7rem] text-b-blue-400">
              <i className="pr-1 fas fa-calendar"></i>{' '}
              {formatTaskDate(dueDate, dateFormat)}
            </div>
          )}
          {description && <div className="mt-1">{description}</div>}
          {tags && tags.length > 0 && (
            <div className="mt-1 text-xs text-b-blue-400">
              Tags: {tags.map((tag) => `#${tag}`).join(', ')}
            </div>
          )}
        </div>
      }
      arrow={true}
      delay={[500, 0]}
    >
      <div
        className="flex items-center rounded-lg px-2 py-1 text-xs bg-b-black-200"
        style={{ minWidth: 0, maxWidth: '100%' }}
      >
        <button
          onClick={onToggle}
          className="mr-2 focus:outline-none"
          style={{ color: projectColor || '#ccc' }}
          aria-label="Toggle complete"
        >
          <FontAwesomeIcon
            icon={faCheckCircle}
            className={completed ? 'opacity-100' : 'opacity-30'}
          />
        </button>
        <span
          className={`truncate ${completed ? 'line-through text-b-white-400' : 'text-b-white-100'}`}
          style={{ flex: 1 }}
          title={title}
        >
          {title}
        </span>
      </div>
    </Tippy>
  );
};

export default MiniCompactTodoItem;