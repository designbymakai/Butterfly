import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faCalendarAlt, 
  faTimes, 
  faCircleExclamation, 
  faQuestion, 
  faTriangleExclamation, 
  faPhone, 
  faEnvelope, 
  faStar, 
  faCloud, 
  faPaperclip, 
  faNewspaper, 
  faComputer, 
  faBuilding, 
  faPlus, 
  faProjectDiagram,
  faCircleChevronDown,
  faCircleChevronRight,
  faCircleChevronUp,
  faStop,
  faSpinner,
  faHourglassHalf,
  faMagnifyingGlassChart,
  faFlagCheckered
} from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { formatTaskDate } from '../utils/formatDate';
import { useSettings } from '../context/SettingsContext';

const getPastelColorForTag = (tag: string): string => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 85%)`;
};

const CustomInput = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { value, style, ...rest } = props;
  return (
    <input
      ref={ref}
      value={value}
      size={value ? value.length : 1}
      style={style}
      {...rest}
    />
  );
});

const icons = [
  faBell, faCircleExclamation, faQuestion, faTriangleExclamation, faPhone, 
  faEnvelope, faStar, faCloud, faPaperclip, faNewspaper, faComputer, faBuilding
];

interface TodoItemProps {
  todo: any;
  onToggle: () => void;
  onUpdate: (updatedTodo: any) => void;
  onSave: (updatedTodo: any) => void;
  projects: any;
  onProjectClick: (projectName: string) => void;
  projectColor: any;
  tagColors?: Record<string, string>;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onUpdate,
  onSave,
  projects,
  onProjectClick,
  projectColor,
  tagColors,
}) => {
  if (!todo) return null;
  const initialTodo = todo || { tags: [] };
  const { 
    id = uuidv4(), 
    title = 'New Task', 
    description = '', 
    project = 'Unassigned', 
    dueDate, 
    completed = false, 
    icon = null, 
    tags = [],
    progress = 'Not Started',    // New field with a default
    priority = 'Medium'          // New field with a default
  } = initialTodo;
  
  // Local state for editing the todo object.
    const { dateFormat } = useSettings();

  const [editTodo, setEditTodo] = useState(initialTodo);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editingTagValue, setEditingTagValue] = useState('');
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const deadlineRef = useRef<DatePicker | null>(null);

  const titleRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const projectRef = useRef<HTMLSelectElement | null>(null);
  const dueDateRef = useRef<DatePicker | null>(null);
  const tagsRef = useRef<HTMLInputElement | null>(null);

  
  useEffect(() => {
    setEditTodo(todo);
  }, [todo]);

  const handleToggle = () => {
    if (!editTodo.completed) {
      // Mark as completed, save previous progress and set completedAt
      const updatedTodo = {
        ...editTodo,
        completed: true,
        previousProgress: editTodo.progress,
        progress: "Completed",
        completedAt: new Date().toISOString(), // <-- set completion date
      };
      setEditTodo(updatedTodo);
      onUpdate(updatedTodo);
      onSave(updatedTodo);
    } else {
      // Unmark as completed, restore previous progress (keep completedAt for history)
      const updatedTodo = {
        ...editTodo,
        completed: false,
        progress: editTodo.previousProgress || "Not Started",
        // Optionally: completedAt: undefined,
      };
      setEditTodo(updatedTodo);
      onUpdate(updatedTodo);
      onSave(updatedTodo);
    }
  };

  // Existing handlers for title, description, project, date, and tags...
  const handleTitleDoubleClick = () => setIsEditingTitle(true);
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTodo({ ...editTodo, title: e.target.value });
  };
  const handleTitleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
      onUpdate({ ...editTodo, title: editTodo.title });
      onSave({ ...editTodo, title: editTodo.title });
    }
  };
  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    onUpdate(editTodo);
    onSave(editTodo);
  };

  const handleDeadlineIconClick = () => {
    if (editTodo.deadline) setIsEditingDeadline(true);
  };
  const handleDeadlineChange = (date: Date | null) => {
    const updatedTodo = { ...editTodo, deadline: date ? date.toISOString() : null };
    setEditTodo(updatedTodo);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
    setIsEditingDeadline(false);
  };
  const handleDeadlineBlur = () => {
    setIsEditingDeadline(false);
    onUpdate(editTodo);
    onSave(editTodo);
  };

  const handleDescriptionDoubleClick = () => setIsEditingDescription(true);
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditTodo({ ...editTodo, description: e.target.value });
  };
  const handleDescriptionKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      setIsEditingDescription(false);
      onUpdate({ ...editTodo, description: editTodo.description });
      onSave({ ...editTodo, description: editTodo.description });
    }
  };
  const handleDescriptionBlur = () => {
    setIsEditingDescription(false);
    onUpdate(editTodo);
    onSave(editTodo);
  };

  const handleProjectIconClick = () => setIsEditingProject(!isEditingProject);
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedTodo = { ...editTodo, project: e.target.value };
    setEditTodo(updatedTodo);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
    setIsEditingProject(false);
  };
  const handleProjectBlur = () => {
    setIsEditingProject(false);
    onUpdate(editTodo);
    onSave(editTodo);
  };

  const handleDateIconClick = () => setIsEditingDueDate(!isEditingDueDate);
  const handleDateChange = (date: Date | null) => {
    const updatedTodo = { ...editTodo, dueDate: date };
    setEditTodo(updatedTodo);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
    setIsEditingDueDate(false);
  };
  const handleDateBlur = () => {
    setIsEditingDueDate(false);
    onUpdate(editTodo);
    onSave(editTodo);
  };

  // New handlers for progress.
  const handleProgressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedTodo = { ...editTodo, progress: e.target.value };
    setEditTodo(updatedTodo);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
  };

  // New handlers for priority.
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedTodo = { ...editTodo, priority: e.target.value };
    setEditTodo(updatedTodo);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value);
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim() !== '') {
      const updatedTodo = { ...editTodo, tags: [...(editTodo.tags || []), newTag.trim()] };
      setEditTodo(updatedTodo);
      setNewTag('');
      onUpdate(updatedTodo);
      onSave(updatedTodo);
    }
  };
  const handleTagEdit = (index: number) => {
    setEditingTagIndex(index);
    setEditingTagValue(editTodo.tags[index]);
  };
  const handleTagEditChange = (e: React.ChangeEvent<HTMLInputElement>) => setEditingTagValue(e.target.value);
  const handleTagEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const updatedTags = [...(editTodo.tags || [])];
      if (editingTagValue.trim() === '') {
        updatedTags.splice(editingTagIndex!, 1);
      } else {
        updatedTags[editingTagIndex!] = editingTagValue.trim();
      }
      const updatedTodo = { ...editTodo, tags: updatedTags };
      setEditTodo(updatedTodo);
      setEditingTagIndex(null);
      onUpdate(updatedTodo);
      onSave(updatedTodo);
    }
  };
  const handleTagEditBlur = () => {
    const updatedTags = [...(editTodo.tags || [])];
    if (editingTagValue.trim() === '') {
      updatedTags.splice(editingTagIndex!, 1);
    } else {
      updatedTags[editingTagIndex!] = editingTagValue.trim();
    }
    const updatedTodo = { ...editTodo, tags: updatedTags };
    setEditTodo(updatedTodo);
    setEditingTagIndex(null);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
  };

  const progressOptions = ["Not Started", "In Progress", "Waiting", "Needs Review"];
  const priorityOptions = ["Low", "Medium", "High"];

  const getProgressIcon = (progress: string) => {
    switch (progress) {
      case "Not Started":
        return faStop;
      case "In Progress":
        return faSpinner;
      case "Waiting":
        return faHourglassHalf;
      case "Needs Review":
        return faMagnifyingGlassChart;
      case "Completed":
        return faFlagCheckered;
      default:
        return faStop;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Low":
        return faCircleChevronDown;
      case "Medium":
        return faCircleChevronRight;
      case "High":
        return faCircleChevronUp;
      default:
        return faCircleChevronRight;
    }
  };

  const handleProgressCycle = () => {
    if (editTodo.completed) return; // Don't cycle if completed
    const currentIndex = progressOptions.indexOf(editTodo.progress);
    const nextIndex = (currentIndex + 1) % progressOptions.length;
    const newProgress = progressOptions[nextIndex];
    const updatedTodo = { ...editTodo, progress: newProgress };
    setEditTodo(updatedTodo);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
  };

  const handlePriorityCycle = () => {
    const currentIndex = priorityOptions.indexOf(editTodo.priority);
    const nextIndex = (currentIndex + 1) % priorityOptions.length;
    const newPriority = priorityOptions[nextIndex];
    const updatedTodo = { ...editTodo, priority: newPriority };
    setEditTodo(updatedTodo);
    onUpdate(updatedTodo);
    onSave(updatedTodo);
  };

  return (
    <div className="flex items-center mb-2 rounded-3xl hover:bg-b-black-300 shadow-b-white-200 transition-all duration-300 p-2">
      {icon ? (
        <FontAwesomeIcon
          icon={icon}
          className="mx-2 h-4 w-4"
          style={{ color: projectColor || 'inherit' }}
        />
      ) : (
        <input
          type="checkbox"
          checked={completed}
          onChange={handleToggle}
          className="ml-2 mr-4 h-4 w-4 appearance-none rounded-md border-2 border-b-blue-400 cursor-pointer bg-b-white-300 checked:bg-b-blue-100"
        />
      )}

      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {isEditingTitle ? (
              <CustomInput
                ref={titleRef}
                type="text"
                name="title"
                value={editTodo.title}
                onChange={handleTitleChange}
                onKeyPress={handleTitleKeyPress}
                onBlur={handleTitleBlur}
                className={`text-lg bg-transparent ${completed ? 'line-through' : ''} ${!projectColor ? 'text-b-white-100' : ''}`}
                style={{ color: projectColor || undefined }}
                autoFocus
              />
            ) : (
              <span
                className="text-lg inline-block"
                style={{ color: projectColor || undefined }}
                onDoubleClick={handleTitleDoubleClick}
              >
                {title}
              </span>
            )}

            {/* Progress Icon */}
            <Tippy content="Progress" delay={[500, 0]}>
              <span onClick={handleProgressCycle} className="ml-2 cursor-pointer flex items-center">
                <FontAwesomeIcon
                  icon={getProgressIcon(editTodo.progress)}
                  className="text-b-white-500"
                />
                <span className="ml-1 text-sm text-b-white-500">{editTodo.progress}</span>
              </span>
            </Tippy>

            {/* Priority Icon */}
            <Tippy content="Priority" delay={[500, 0]}>
              <span onClick={handlePriorityCycle} className="ml-2 cursor-pointer flex items-center">
                <FontAwesomeIcon
                  icon={getPriorityIcon(editTodo.priority)}
                  className="text-b-white-500"
                />
                <span className="ml-1 text-sm text-b-white-500">{editTodo.priority}</span>
              </span>
            </Tippy>

            {/* Due Date Icon */}
            <Tippy content="Due Date" delay={[500, 0]}>
              <div className="flex items-center px-1">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-b-white-500 text-sm cursor-pointer pr-1"
                  onClick={handleDateIconClick}
                />
                {isEditingDueDate ? (
                  <DatePicker
                    ref={dueDateRef}
                    selected={dueDate ? new Date(dueDate) : null}
                    onChange={handleDateChange}
                    onBlur={handleDateBlur}
                    customInput={<CustomInput />}
                    className="text-sm text-b-white-500 bg-transparent"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm text-b-white-500 inline-block">
                    {formatTaskDate(dueDate, dateFormat) || 'Set Date'}
                  </span>
                )}
              </div>
            </Tippy>

            {/* Project Icon */}
            <Tippy content="Project" delay={[500, 0]}>
              <div className="flex items-center px-1">
                <FontAwesomeIcon
                  icon={faProjectDiagram}
                  className="text-b-white-500 text-sm cursor-pointer pr-1"
                  onClick={handleProjectIconClick}
                />
                {isEditingProject ? (
                  <select
                    ref={projectRef}
                    value={editTodo.project}
                    onChange={handleProjectChange}
                    onBlur={handleProjectBlur}
                    className="text-sm text-b-white-500 bg-transparent"
                    autoFocus
                  >
                    <option value="Unassigned">Unassigned</option>
                    {projects.map((proj: any, index: number) => (
                      <option key={index} value={proj.name}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-b-white-500 inline-block">
                    {project}
                  </span>
                )}
              </div>
            </Tippy>
            
            {/* Deadline Icon */}
            {editTodo.deadline && (
              <Tippy content="Deadline" delay={[500, 0]}>
                <span className="ml-2 text-b-orange-300 text-sm font-bold flex items-center">
                  <FontAwesomeIcon
                    icon={faFlagCheckered}
                    className="mr-1 cursor-pointer"
                    onClick={handleDeadlineIconClick}
                  />
                  {isEditingDeadline ? (
                    <DatePicker
                      ref={deadlineRef}
                      selected={editTodo.deadline ? new Date(editTodo.deadline) : null}
                      onChange={handleDeadlineChange}
                      onBlur={handleDeadlineBlur}
                      customInput={<CustomInput />}
                      className="text-sm text-b-orange-400 bg-transparent"
                      autoFocus
                    />
                  ) : (
                    <span>
                      {formatTaskDate(editTodo.deadline, dateFormat)}
                    </span>
                  )}
                </span>
              </Tippy>
            )}

          </div>
          <div className="flex items-center">
            {(editTodo.tags || []).map((tag: string, index: number) =>
              editingTagIndex === index ? (
                <CustomInput
                  key={index}
                  type="text"
                  value={editingTagValue}
                  onChange={handleTagEditChange}
                  onKeyPress={handleTagEditKeyPress}
                  onBlur={handleTagEditBlur}
                  className="text-sm text-b-white-500 bg-transparent"
                  autoFocus
                />
              ) : (
                <span
                  key={index}
                  className="text-sm mr-2 rounded-xl px-1.5 cursor-pointer inline-block text-b-white-500"
                  onClick={() => handleTagEdit(index)}
                >
                  #{tag}
                </span>
              )
            )}
            {isEditingTags ? (
              <CustomInput
                ref={tagsRef}
                type="text"
                name="tags"
                value={newTag}
                onChange={handleTagChange}
                onKeyPress={handleTagKeyPress}
                onBlur={() => setIsEditingTags(false)} // <-- Add this line
                className="text-sm text-b-blue-300 bg-transparent"
                autoFocus
              />
            ) : (
              <span
                className="text-sm text-b-black-600 flex items-center cursor-pointer"
                onClick={() => setIsEditingTags(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" />
              </span>
            )}
          </div>
        </div>
        {isEditingDescription ? (
          <CustomInput
            ref={descriptionRef}
            as="textarea"
            name="description"
            value={editTodo.description}
            onChange={handleDescriptionChange}
            onKeyPress={handleDescriptionKeyPress}
            onBlur={handleDescriptionBlur}
            className="text-sm text-b-black-500 bg-transparent"
            style={{ height: 'fit' }}
            autoFocus
          />
        ) : (
          <span
            className="text-sm text-b-white-500 inline-block"
            onDoubleClick={handleDescriptionDoubleClick}
            style={{ height: 'fit' }}
          >
            {description || 'Add Description'}
          </span>
        )}
      </div>
    </div>
  );
};

export default TodoItem;