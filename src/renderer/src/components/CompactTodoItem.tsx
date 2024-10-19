import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faProjectDiagram, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const CompactTodoItem = ({ todo, onToggle, onUpdate, onSave, selectedIcon }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleIconClick = (type) => {
    // Handle icon click based on type (date, project, description)
    console.log(`Icon clicked: ${type}`);
  };

  // Ensure todo object has default values for missing properties
  const { completed = false, title = 'New Task', dueDate, project = 'No project', description = 'No description', tags = [] } = todo || {};

  return (
    <div
      className='flex items-center mb-2 p-2 rounded-lg hover:bg-b-white-300 hover:text-b-black-400 shadow-b-white-200'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {selectedIcon ? (
        <FontAwesomeIcon icon={selectedIcon} className='mx-2 h-4 w-4' />
      ) : (
        <input
          type='checkbox'
          checked={completed}
          onChange={onToggle}
          className='mx-2 h-4 w-4'
        />
      )}
      <span className={`text-lg ${completed ? 'line-through' : ''} flex-grow`}>
        {title}
      </span>
      <div className='flex items-center ml-1'>
        <Tippy content={dueDate ? new Date(dueDate).toLocaleString() : 'No due date'}>
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className='text-gray-500 mx-1 cursor-pointer'
            onClick={() => handleIconClick('date')}
          />
        </Tippy>
        <Tippy content={project}>
          <FontAwesomeIcon
            icon={faProjectDiagram}
            className='text-gray-500 mx-1 cursor-pointer'
            onClick={() => handleIconClick('project')}
          />
        </Tippy>
        <Tippy content={description}>
          <FontAwesomeIcon
            icon={faStickyNote}
            className='text-gray-500 mx-1 cursor-pointer'
            onClick={() => handleIconClick('description')}
          />
        </Tippy>
      </div>
      <div className='flex items-center ml-2'>
        {tags.map((tag, index) => (
          <span
            key={index}
            className='text-sm text-b-black-500 mr-2 bg-b-white-400 rounded-xl px-1.5'
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CompactTodoItem;