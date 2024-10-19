import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCalendarAlt, faClock, faTimes, faCircleExclamation, faQuestion, faTriangleExclamation, faPhone, faEnvelope, faStar, faCloud, faPaperclip, faNewspaper, faComputer, faBuilding, faPlus } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker CSS

const icons = [
  faBell, faCircleExclamation, faQuestion, faTriangleExclamation, faPhone, faEnvelope, faStar, faCloud, faPaperclip, faNewspaper, faComputer, faBuilding
];

const TodoItem = ({ todo, onToggle, onUpdate, onSave, isEditing, projects, onProjectClick, projectColor }) => {
  const { id = uuidv4(), title = 'New Task', description = 'No description', project = 'No project', dueDate, tags = [], completed = false, icon = null } = todo || {};

  const [editTodo, setEditTodo] = useState({ ...todo, id });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [isEditingDueTime, setIsEditingDueTime] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [editingTagIndex, setEditingTagIndex] = useState(null);
  const [editingTagValue, setEditingTagValue] = useState('');
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(icon);

  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const projectRef = useRef(null);
  const dueDateRef = useRef(null);
  const dueTimeRef = useRef(null);
  const tagsRef = useRef(null);
  const iconMenuRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditTodo({
      ...editTodo,
      [name]: value,
    });
  };

  const handleTagChange = (e) => {
    setNewTag(e.target.value);
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (newTag.trim() !== '') {
        const updatedTodo = {
          ...editTodo,
          tags: [...editTodo.tags, newTag.trim()],
        };
        setEditTodo(updatedTodo);
        setNewTag('');
        onUpdate(updatedTodo);
        onSave(updatedTodo);
      }
    }
  };

  const handleDateChange = (date) => {
    const updatedTodo = {
      ...editTodo,
      dueDate: date,
    };
    setEditTodo(updatedTodo);
    setIsEditingDueDate(false);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
  };

  const handleTimeChange = (time) => {
    const updatedTodo = {
      ...editTodo,
      dueDate: time,
    };
    setEditTodo(updatedTodo);
    setIsEditingDueTime(false);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
  };

  const handleSave = () => {
    onUpdate(editTodo);
    onSave(editTodo);
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setIsEditingProject(false);
    setIsEditingDueDate(false);
    setIsEditingDueTime(false);
    setIsEditingTags(false);
    setEditingTagIndex(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const handleClickOutside = (e) => {
    if (
      titleRef.current && !titleRef.current.contains(e.target) &&
      descriptionRef.current && !descriptionRef.current.contains(e.target) &&
      projectRef.current && !projectRef.current.contains(e.target) &&
      dueDateRef.current && !dueDateRef.current.contains(e.target) &&
      dueTimeRef.current && !dueTimeRef.current.contains(e.target) &&
      tagsRef.current && !tagsRef.current.contains(e.target) &&
      iconMenuRef.current && !iconMenuRef.current.contains(e.target)
    ) {
      handleSave();
      setShowIconMenu(false);
    }
  };

  const handleTagEdit = (index) => {
    setEditingTagIndex(index);
    setEditingTagValue(editTodo.tags[index]);
  };

  const handleTagEditChange = (e) => {
    setEditingTagValue(e.target.value);
  };

  const handleTagEditKeyPress = (e) => {
    if (e.key === 'Enter') {
      const updatedTags = [...editTodo.tags];
      if (editingTagValue.trim() === '') {
        updatedTags.splice(editingTagIndex, 1);
      } else {
        updatedTags[editingTagIndex] = editingTagValue.trim();
      }
      const updatedTodo = {
        ...editTodo,
        tags: updatedTags,
      };
      setEditTodo(updatedTodo);
      setEditingTagIndex(null);
      onUpdate(updatedTodo);
      onSave(updatedTodo);
    }
  };

  const handleTagEditBlur = () => {
    const updatedTags = [...editTodo.tags];
    if (editingTagValue.trim() === '') {
      updatedTags.splice(editingTagIndex, 1);
    } else {
      updatedTags[editingTagIndex] = editingTagValue.trim();
    }
    const updatedTodo = {
      ...editTodo,
      tags: updatedTags,
    };
    setEditTodo(updatedTodo);
    setEditingTagIndex(null);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
  };

  const handleProjectChange = (e) => {
    const updatedTodo = {
      ...editTodo,
      project: e.target.value,
    };
    setEditTodo(updatedTodo);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
  };

  const handleIconSelect = (icon) => {
    setSelectedIcon(icon);
    const updatedTodo = {
      ...editTodo,
      icon,
    };
    setEditTodo(updatedTodo);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
    setShowIconMenu(false);
  };
  const handleRightClick = (e) => {
    e.preventDefault();
    setShowIconMenu(true);
  };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div
      className='flex items-center mb-4 rounded-3xl hover:bg-b-white-200 shadow-b-white-200'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleRightClick}
    >
      {selectedIcon ? (
        <FontAwesomeIcon icon={selectedIcon} className='mx-2 h-4 w-4' style={{ color: projectColor || 'inherit' }} />
      ) : (
        <input
          type='checkbox'
          checked={completed}
          onChange={onToggle}
          className='mx-2 h-4 w-4'
          style={{ color: projectColor || 'inherit' }}
        />
      )}
      <div className='flex flex-col flex-grow'>
        <div className='flex flex-row items-center'>
          {isEditingTitle ? (
            <input
              ref={titleRef}
              type='text'
              name='title'
              value={editTodo.title}
              onChange={handleChange}
              onBlur={handleSave}
              onKeyPress={handleKeyPress}
              className={`text-md ${completed ? 'line-through' : ''} bg-transparent`}
              style={{ color: projectColor || 'inherit' }}
            />
          ) : (
            <span
              className={`text-lg ${completed ? 'line-through' : ''}`}
              onDoubleClick={() => setIsEditingTitle(true)}
              style={{ color: projectColor || 'inherit' }}
            >
              {title}
            </span>
  )}
  {isEditingDueDate ? (
    <>
      <FontAwesomeIcon icon={faCalendarAlt} className='text-gray-500 ml-2 text-sm' />
      <DatePicker
        ref={dueDateRef}
        selected={dueDate ? new Date(dueDate) : null}
        onChange={handleDateChange}
        onBlur={handleSave}
        className='text-sm text-gray-500 mb-2 p-0 bg-transparent ml-2'
        style={{ border: 'none', outline: 'none', color: 'inherit', margin: 0 }}
        autoFocus
      />
    </>
  ) : (
    <>
      <FontAwesomeIcon icon={faCalendarAlt} className='text-gray-500 ml-2 text-sm' />
      <span
        className='text-sm text-gray-500 ml-2'
        onDoubleClick={() => setIsEditingDueDate(true)}
      >
        {dueDate ? new Date(dueDate).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }) : 'No due date'}
      </span>
    </>
  )}
  {isEditingDueTime ? (
    <>
      <FontAwesomeIcon icon={faClock} className='text-gray-500 ml-2 text-sm' />
      <DatePicker
        ref={dueTimeRef}
        selected={dueDate ? new Date(dueDate) : null}
        onChange={handleTimeChange}
        onBlur={handleSave}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="h:mm aa"
        className='text-sm text-gray-500 mb-2 p-0 bg-transparent ml-2'
        style={{ border: 'none', outline: 'none', color: 'inherit', margin: 0 }}
        autoFocus
      />
    </>
  ) : (
    <>
      <FontAwesomeIcon icon={faClock} className='text-gray-500 ml-2 text-sm' />
      <span
        className='text-sm text-gray-500 ml-2'
        onDoubleClick={() => setIsEditingDueTime(true)}
      >
        {dueDate ? new Date(dueDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'No due time'}
      </span>
    </>
  )}
</div>
{isEditingProject ? (
  <select
    ref={projectRef}
    value={editTodo.project}
    onChange={handleProjectChange}
    onBlur={handleSave}
    className='text-sm text-gray-500 mb-2 p-0 bg-transparent w-fit'
    style={{ border: 'none', outline: 'none', color: 'inherit', margin: 0 }}
    autoFocus
  >
    <option value="No project">No project</option> {/* Add No project option */}
    {projects.map((project, index) => (
      <option key={index} value={project.name}> {/* Use project.name */}
        {project.name}
      </option>
    ))}
  </select>
) : (
  <span
    className='text-sm text-gray-500'
    onDoubleClick={() => setIsEditingProject(true)}
  >
    {project}
  </span>
)}
{isEditingDescription ? (
  <textarea
    ref={descriptionRef}
    name='description'
    value={editTodo.description}
    onChange={handleChange}
    onBlur={handleSave}
    onKeyPress={handleKeyPress}
    className='text-sm text-gray-500 mb-2 p-0 bg-transparent'
    style={{ border: 'none', outline: 'none', color: 'inherit', margin: 0 }}
    autoFocus
  />
) : (
  <span
    className='text-sm text-gray-500'
    onDoubleClick={() => setIsEditingDescription(true)}
  >
    {description}
  </span>
        )}
      </div>
      <div className='flex flex-row items-center ml-2'>
        {editTodo.tags.map((tag, index) => (
          editingTagIndex === index ? (
            <input
              key={index}
              type='text'
              value={editingTagValue}
              onChange={handleTagEditChange}
              onKeyPress={handleTagEditKeyPress}
              onBlur={handleTagEditBlur}
              className='text-sm text-gray-500 mb-2 p-0 bg-transparent'
              size={editingTagValue.length || 1}
              style={{ border: 'none', outline: 'none', color: 'inherit', margin: 0 }}
              autoFocus
            />
          ) : (
            <span
              key={index}
              className='text-sm text-b-black-500 mr-2 bg-b-white-400 rounded-xl px-1.5' 
              onClick={() => handleTagEdit(index)}
            >
              #{tag}
            </span>
          )
        ))}
        {isEditingTags ? (
          <input
            ref={tagsRef}
            type='text'
            name='tags'
            value={newTag}
            onChange={handleTagChange}
            onKeyPress={handleTagKeyPress}
            onBlur={handleSave}
            className='text-sm text-gray-500 mb-2 p-0 bg-transparent'
            size={newTag.length || 1}
            style={{ border: 'none', outline: 'none', color: 'inherit', margin: 0 }}
            autoFocus
          />
        ) : (
          isHovered && (
            <span
              className='text-sm text-gray-500 flex items-center cursor-pointer'
              onClick={() => setIsEditingTags(true)}
            >
              <FontAwesomeIcon icon={faPlus} className='mr-1' />
            </span>
          )
        )}
      </div>
      {showIconMenu && (
  <div ref={iconMenuRef} className='absolute bg-b-white-100 border rounded shadow-lg p-2 flex align-middle'>
    <FontAwesomeIcon
      icon={faTimes}
      className='mx-2 h-4 w-4 cursor-pointer'
      onClick={() => {
        setSelectedIcon(null);
        const updatedTodo = { ...editTodo, icon: null };
        setEditTodo(updatedTodo);
        onUpdate(updatedTodo);
        onSave(updatedTodo);
        setShowIconMenu(false); // Close the icon menu
      }}
    />
    <div className='border-l-2 border-gray-300 h-6 mx-2'></div> {/* Vertical Line */}
    {icons.map((icon, index) => (
      <FontAwesomeIcon
        key={index}
        icon={icon}
        className='mx-2 cursor-pointer'
        onClick={() => handleIconSelect(icon)}
      />
    ))}
    
    
  </div>

      )}
    </div>
  );
};

export default TodoItem;