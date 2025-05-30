import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faProjectDiagram, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

interface CompactTodoItemProps {
  title: string;
  description: string;
  project: string;
  dueDate: string;
  tags?: string[]; // Make tags optional
  completed: boolean;
  onToggle: () => void;
  onSave: () => void;
  selectedIcon: any;
  projectColor: string;
}

const CompactTodoItem: React.FC<CompactTodoItemProps> = ({
  title,
  description,
  project,
  dueDate,
  tags = [], // Default value for tags
  completed,
  onToggle,
  onSave,
  selectedIcon,
  projectColor,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleIconClick = (type: string) => {
    // Handle icon click logic here
  };

  return (
    <div
      className="flex items-center p-2 my-2 rounded shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ borderLeft: `4px solid ${projectColor}`, backgroundColor: projectColor }} // Add project color border and background
    >
      {selectedIcon ? (
        <FontAwesomeIcon icon={selectedIcon} className="mr-2" />
      ) : (
        <input
          type="checkbox"
          checked={completed}
          onChange={onToggle}
          className="mr-2"
        />
      )}
      <div className="flex-grow">
        <div className='flex flex-row justify-between'>
          <div className="font-bold">{title}</div>
          <div className="text-sm text-gray-500 text-right pr-4">#{tags.join(', #')}</div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Tippy content={dueDate}>
          <FontAwesomeIcon icon={faCalendarAlt} onClick={() => handleIconClick('date')} />
        </Tippy>
        <Tippy content={project}>
          <FontAwesomeIcon icon={faProjectDiagram} onClick={() => handleIconClick('project')} />
        </Tippy>
        <Tippy content={description}>
          <FontAwesomeIcon icon={faStickyNote} onClick={() => handleIconClick('description')} />
        </Tippy>
      </div>
    </div>
  );
};

export default CompactTodoItem;