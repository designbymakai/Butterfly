import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faProjectDiagram,
  faStickyNote,
} from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import moment from 'moment';
import { useSettings } from '../context/SettingsContext';
import { formatTaskDate } from '../utils/formatDate';



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
  onNavigate: (destination: string) => void;
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
  const { dateFormat } = useSettings(); // <-- Move here

  const handleIconClick = (type: string) => {


    // Additional icon click handling if needed
  };

  return (
    <div
      className="flex items-center p-2 my-2 rounded shadow bg-b-black-300 hover:bg-b-black-400 cursor-pointer transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ borderLeft: `4px solid ${projectColor}` }}
    >
      {/* Checkbox styled like TodoItem */}
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggle}
        className="ml-2 mr-4 h-4 w-4 appearance-none rounded-md border-2 border-b-blue-400 cursor-pointer bg-b-white-300 checked:bg-b-blue-100"
      />

      <div className="flex-grow">
        <div className="flex flex-row justify-between">
          {/* Title as link */}
          <span
            className="text-b-white-300 font-semibold cursor-pointer hover:underline"
            style={{ color: projectColor }}
            onClick={() => onNavigate('Todo')}
          >
            {title}
          </span>
          <div className="text-sm text-b-white-600 text-right pr-4">
            #{tags.join(', #')}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Tippy content={formatTaskDate(dueDate, dateFormat)}>
          <FontAwesomeIcon
            className="text-b-white-500"
            icon={faCalendarAlt}
            onClick={() => handleIconClick('date')}
          />
        </Tippy>
        <Tippy content={project}>
          <FontAwesomeIcon
            className="text-b-white-500"
            icon={faProjectDiagram}
            onClick={() => handleIconClick('project')}
          />
        </Tippy>
        <Tippy content={description}>
          <FontAwesomeIcon
            className="text-b-white-500"
            icon={faStickyNote}
            onClick={() => handleIconClick('description')}
          />
        </Tippy>
      </div>
    </div>
  );
};

export default CompactTodoItem;