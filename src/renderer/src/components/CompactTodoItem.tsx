import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faProjectDiagram,
  faStickyNote,
  faArrowLeftLong
} from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

interface CompactTodoItemProps {
  title: string;
  description: string;
  project: string;
  dueDate: string;
  tags?: string[];
  completed: boolean;
  onToggle: () => void;
  onSave: () => void;
  selectedIcon: any;
  projectColor: string;
  onNavigate: (destination: string) => void; // Added prop callback
}

const CompactTodoItem: React.FC<CompactTodoItemProps> = ({
  title,
  description,
  project,
  dueDate,
  tags = [],
  completed,
  onToggle,
  onSave,
  selectedIcon,
  projectColor,
  onNavigate,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleIconClick = (type: string) => {
    // Additional icon click handling if needed
  };

  return (
    <div
      className="flex items-center p-2 my-2 rounded shadow bg-b-black-300 hover:bg-b-black-400 cursor-pointer transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ borderLeft: `4px solid ${projectColor}`, backgroundColor: projectColor }}
    >
      {selectedIcon ? (
        <FontAwesomeIcon
          icon={selectedIcon}
          onClick={() => onNavigate('Todo')}
        />
      ) : (
        <button onClick={() => onNavigate('Todo')}>
          <FontAwesomeIcon
            icon={faArrowLeftLong}
            className="text-xl text-b-blue-300 pr-2"
          />
        </button>
      )}
      <div className="flex-grow">
        <div className="flex flex-row justify-between">
          <div className="text-b-white-300">{title}</div>
          <div className="text-sm text-b-white-600 text-right pr-4">
            #{tags.join(', #')}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Tippy content={dueDate}>
          <FontAwesomeIcon
            className="text-b-white-600"
            icon={faCalendarAlt}
            onClick={() => handleIconClick('date')}
          />
        </Tippy>
        <Tippy content={project}>
          <FontAwesomeIcon
            className="text-b-white-600"
            icon={faProjectDiagram}
            onClick={() => handleIconClick('project')}
          />
        </Tippy>
        <Tippy content={description}>
          <FontAwesomeIcon
            className="text-b-white-600"
            icon={faStickyNote}
            onClick={() => handleIconClick('description')}
          />
        </Tippy>
      </div>
    </div>
  );
};

export default CompactTodoItem;