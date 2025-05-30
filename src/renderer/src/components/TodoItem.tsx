import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCalendarAlt, faClock, faTimes, faCircleExclamation, faQuestion, faTriangleExclamation, faPhone, faEnvelope, faStar, faCloud, faPaperclip, faNewspaper, faComputer, faBuilding, faPlus, faPencil } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker CSS

const icons = [
  faBell, faCircleExclamation, faQuestion, faTriangleExclamation, faPhone, faEnvelope, faStar, faCloud, faPaperclip, faNewspaper, faComputer, faBuilding
];

interface TodoItemProps {
  todo: any;
  onToggle: () => void;
  onUpdate: (updatedTodo: any) => void;
  onSave: (updatedTodo: any) => void;
  isEditing: boolean;
  projects: any;
  onProjectClick: (projectName: string) => void;
  projectColor: any;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onUpdate,
  onSave,
  projects,
  projectColor,
}) => {
  const { id = uuidv4(), title = 'New Task', description = '', project = 'No project', dueDate, completed = false, icon = null } = todo || {};

  const [editTodo, setEditTodo] = useState({ ...todo, id });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [isEditingDueTime, setIsEditingDueTime] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editingTagValue, setEditingTagValue] = useState('');
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(icon);

  const titleRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const projectRef = useRef<HTMLSelectElement | null>(null);
  const dueDateRef = useRef<DatePicker | null>(null);
  const dueTimeRef = useRef<DatePicker | null>(null);
  const tagsRef = useRef<HTMLInputElement | null>(null);
  const iconMenuRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditTodo({
      ...editTodo,
      [name]: value,
    });
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTag(e.target.value);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleDateChange = (date: Date | null) => {
    const updatedTodo = {
      ...editTodo,
      dueDate: date,
    };
    setEditTodo(updatedTodo);
    setIsEditingDueDate(false);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
  };

  const handleTimeChange = (time: Date | null) => {
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
    setIsEditing(false);
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setIsEditingProject(false);
    setIsEditingDueDate(false);
    setIsEditingDueTime(false);
    setIsEditingTags(false);
    setEditingTagIndex(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      titleRef.current && !titleRef.current.contains(e.target as Node) &&
      descriptionRef.current && !descriptionRef.current.contains(e.target as Node) &&
      projectRef.current && !projectRef.current.contains(e.target as Node) &&
      dueDateRef.current && !(dueDateRef.current as any).setOpen &&
      dueTimeRef.current && !(dueTimeRef.current as any).setOpen && 
      tagsRef.current && !tagsRef.current.contains(e.target as Node) &&
      iconMenuRef.current && !iconMenuRef.current.contains(e.target as Node)
    ) {
      handleSave();
      setShowIconMenu(false);
    }
  };

  const handleTagEdit = (index: number) => {
    setEditingTagIndex(index);
    setEditingTagValue(editTodo.tags[index]);
  };

  const handleTagEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTagValue(e.target.value);
  };

  const handleTagEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const updatedTags = [...editTodo.tags];
      if (editingTagValue.trim() === '') {
        updatedTags.splice(editingTagIndex!, 1);
      } else {
        updatedTags[editingTagIndex!] = editingTagValue.trim();
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
      updatedTags.splice(editingTagIndex!, 1);
    } else {
      updatedTags[editingTagIndex!] = editingTagValue.trim();
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

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedTodo = {
      ...editTodo,
      project: e.target.value,
    };
    setEditTodo(updatedTodo);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
  };

  const handleIconSelect = (icon: any) => {
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

  const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setShowIconMenu(true);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setIsEditingTitle(true);
    setIsEditingDescription(true);
    setIsEditingProject(true);
    setIsEditingDueDate(true);
    setIsEditingDueTime(true);
    setIsEditingTags(true);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`flex items-center mb-4 rounded-3xl hover:bg-b-white-200 shadow-b-white-200 border-b-2 border-b-white-200 transition-all duration-300 ${isEditing ? 'bg-gray-100 p-4' : ''}`}
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
          {isEditing ? (
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
              autoFocus
            />
          ) : (
            <span
              className={`text-lg ${completed ? 'line-through' : ''}`}
              style={{ color: projectColor || 'inherit' }}
            >
              {title}
            </span>
          )}
          {(isEditing || dueDate) && (
            isEditingDueDate ? (
              <>
                <FontAwesomeIcon icon={faCalendarAlt} className='text-gray-500 ml-2 text-sm' />
                <DatePicker
                  ref={dueDateRef}
                  selected={dueDate ? new Date(dueDate) : null}
                  onChange={handleDateChange}
                  onBlur={handleSave}
                  className='text-sm text-gray-500 mb-2 p-0 bg-transparent ml-2'
                  autoFocus
                />
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCalendarAlt} className='text-gray-500 ml-2 text-sm' />
                <span
                  className='text-sm text-gray-500 ml-2'
                >
                  {dueDate ? new Date(dueDate).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }) : 'Set Date'}
                </span>
              </>
            )
          )}
          {(isEditing || dueDate) && (
            isEditingDueTime ? (
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
                  autoFocus
                />
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faClock} className='text-gray-500 ml-2 text-sm' />
                <span
                  className='text-sm text-gray-500 ml-2'
                >
                  {dueDate ? new Date(dueDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Set Time'}
                </span>
              </>
            )
          )}
          {isHovered && !isEditing && (
            <FontAwesomeIcon
              icon={faPencil}
              className='text-gray-500 ml-2 text-sm cursor-pointer'
              onClick={handleEditClick}
            />
          )}
        </div>
        {isEditing ? (
          <select
            ref={projectRef}
            value={editTodo.project}
            onChange={handleProjectChange}
            onBlur={handleSave}
            className='text-sm text-gray-500 mb-2 p-0 bg-transparent w-fit'
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
          >
            {project}
          </span>
        )}
        {(isEditing || description) && (
          isEditingDescription ? (
            <textarea
              ref={descriptionRef}
              name='description'
              value={editTodo.description}
              onChange={handleChange}
              onBlur={handleSave}
              onKeyPress={handleKeyPress}
              className='text-sm text-gray-500 mb-2 p-0 bg-transparent'
              autoFocus
            />
          ) : (
            <span
              className='text-sm text-gray-500'
            >
              {description || 'Add Description'}
            </span>
          )
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