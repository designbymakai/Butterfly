import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPencil, 
  faPlus, 
  faTrash, 
  faSearch,
  faCircleExclamation, 
  faCircleChevronDown,
  faCircleChevronRight,
  faCircleChevronUp,
  faStop,
  faSpinner,
  faHourglassHalf,
  faMagnifyingGlassChart,
  faFlagCheckered, 
  faFlag
} from '@fortawesome/free-solid-svg-icons'
import TodoItem from '../components/TodoItem'
import EditProjectsModal from '../components/EditProjectsModal'
import { v4 as uuidv4 } from 'uuid'
import { useTasks } from '../context/TaskContext'
import {
  loadProjectsFromLocalStorage,
  saveProjectsToLocalStorage
} from '../utils/localStorageUtils'
import { getPastelColorForTag, adjustLightness } from '../utils/colorUtils'
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const Todo = forwardRef((props, ref) => {
  // Get tasks from context.
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  
  // State for projects, modal, new task staging and filtering.
  const [projects, setProjects] = useState(loadProjectsFromLocalStorage())
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [stagedTodo, setStagedTodo] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState('todo') // not used further but preserved for potential use
  const [filterProject, setFilterProject] = useState('')
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [filterProgress, setFilterProgress] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [showProgressOptions, setShowProgressOptions] = useState(false);
  const [selectedProgressIcon, setSelectedProgressIcon] = useState(faFlag);
  const [selectedPriorityIcon, setSelectedPriorityIcon] = useState(faCircleExclamation);
  const [editMode] = useState(false) // preserved if needed later
  const [searchTerm, setSearchTerm] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, todo: any } | null>(null);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [deadlineTodoId, setDeadlineTodoId] = useState<string | null>(null);
  const deadlineTask = tasks.find(t => t.id === deadlineTodoId);




  const stagedTodoRef = useRef<HTMLDivElement>(null);
  const stagedTodoMatchesFilters = stagedTodo && (() => {
      const matchesProject = filterProject ? stagedTodo.project === filterProject : true;
      const matchesTags =
        filterTags.length > 0
          ? filterTags.every((tag) => stagedTodo.tags.includes(tag))
          : true;
      const matchesSearch = searchTerm
        ? (stagedTodo.title && stagedTodo.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (stagedTodo.description && stagedTodo.description.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      const matchesProgress = filterProgress ? stagedTodo.progress === filterProgress : true;
      const matchesPriority = filterPriority ? stagedTodo.priority === filterPriority : true;
      return (
        matchesProject &&
        matchesTags &&
        matchesSearch &&
        matchesProgress &&
        matchesPriority
      );
    })();

  const now = new Date();
const weekAgo = new Date(now);
weekAgo.setDate(now.getDate() - 6); // 7 days including today

// Group completed tasks by day label
const completedThisWeekByDay: Record<string, any[]> = {};

tasks.forEach(todo => {
  if (!todo.completed || !todo.completedAt) return;
  const completedDate = new Date(todo.completedAt);
  if (completedDate >= weekAgo && completedDate <= now) {
    const dayLabel = moment(completedDate).format('dddd'); // e.g. "Saturday"
    if (!completedThisWeekByDay[dayLabel]) completedThisWeekByDay[dayLabel] = [];
    completedThisWeekByDay[dayLabel].push(todo);
  }
});

// To display days in order from today backwards:
const daysWithTasks = [];
for (let i = 0; i < 7; i++) {
  const day = moment(now).subtract(i, 'days').format('dddd');
  if (completedThisWeekByDay[day]) {
    daysWithTasks.push(day);
  }
}

const showCompletedSection =
  !filterProgress && !filterPriority;

// Tag color state and helper.
const [tagColors, setTagColors] = useState<Record<string, string>>(() => {
  const stored = localStorage.getItem('tagColors')
  return stored ? JSON.parse(stored) : {}
})
const assignColorToTag = (tag: string) => {
  if (tagColors[tag]) return
  const newColor = getPastelColorForTag(tag)
  const newMapping = { ...tagColors, [tag]: newColor }
  setTagColors(newMapping)
  localStorage.setItem('tagColors', JSON.stringify(newMapping))
}

// Get color for a given project.
const getProjectColorForTask = (projectName: string) => {
  if (projectName === 'Unassigned' || projectName === '') return '#FAF9F9'
  const project = projects.find((p) => p.name === projectName)
  return project ? project.color : '#FAF9F9'
}

  useEffect(() => {
    if (!stagedTodo) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        stagedTodoRef.current &&
        !stagedTodoRef.current.contains(event.target as Node)
      ) {
        handleSaveStagedTodo(stagedTodo); // Save before clearing
        setStagedTodo(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [stagedTodo]);

  useEffect(() => {
    saveProjectsToLocalStorage(projects)
  }, [projects])

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Remove tag mappings if not used anymore.
  useEffect(() => {
    const usedTags = new Set(tasks.flatMap((todo) => todo.tags || []))
    const newMapping: Record<string, string> = { ...tagColors }
    let changed = false
    Object.keys(tagColors).forEach((tag) => {
      if (!usedTags.has(tag)) {
        delete newMapping[tag]
        changed = true
      }
    })
    if (changed) {
      setTagColors(newMapping)
      localStorage.setItem('tagColors', JSON.stringify(newMapping))
    }
  }, [tasks])

  const activeTodos = tasks.filter((todo) => !todo.completed)
  const allTags = [...new Set(activeTodos.flatMap((todo) => todo.tags || []))]

  // Expose a createTask function via ref.
  useImperativeHandle(ref, () => ({
    createTask: (taskDetails: any): void => {
      const taskWithDefaultProject = {
        ...taskDetails,
        id: taskDetails.id === 'placeholder-id' ? uuidv4() : taskDetails.id,
        project: taskDetails.project || 'Unassigned',
        projectColor: getProjectColorForTask(taskDetails.project || 'Unassigned')
      }
      console.log('Creating task:', taskWithDefaultProject)
      addTask(taskWithDefaultProject)
    }
  }))

  // Ensure tags have colors.
  useEffect(() => {
    allTags.forEach((tag) => {
      if (!tagColors[tag]) {
        assignColorToTag(tag)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTags])

  // NEW TASK HANDLER: Opens staging for a new task.
  const handleNewTask = () => {
    setStagedTodo({
      id: uuidv4(),
      title: 'New Task',
      description: '',
      project: 'Unassigned',
      tags: [],
      date: new Date(),
      time: '',
      completed: false
    })
  }

  // SAVE STAGED TASK: Now using addTask instead of setTodos.
  const handleSaveStagedTodo = (updatedTodo: any) => {
    addTask(updatedTodo)
    setStagedTodo(null)
  }

  // Update a task.
  const handleUpdateTodo = (updatedTodo: any, index: number) => {
    updateTask(updatedTodo)
  }

  // Toggle the task completion
  const handleToggleTodo = (index: number) => {
    const todo = tasks[index]
    if (todo) {
      updateTask({ ...todo, completed: !todo.completed })
    }
  }

  // Clear all completed tasks.
  const handleClearCompleted = () => {
    tasks.forEach((todo) => {
      if (todo.completed) {
        deleteTask(todo.id)
      }
    })
  }

  // Filter change handlers.
  const handleFilterProjectChange = (projectName: string) => {
    setFilterProject(projectName)
  }
  const handleTagClick = (tag: string) => {
    setFilterTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag)
      } else {
        return [...prevTags, tag]
      }
    })
  }
  const handleProjectClick = (projectName: string) => {
    setActiveTab('projects') // ActiveTab preserved in case you need it.
    setFilterProject(projectName)
  }

  const handleOpenModal = () => {
    setModalIsOpen(true)
  }
  const handleCloseModal = () => {
    setModalIsOpen(false)
  }

  // Filter tasks based on project, tags, and search term.
  const filteredTodos = tasks.filter((todo) => {
    const matchesProject = filterProject ? todo.project === filterProject : true;
    const matchesTags =
      filterTags.length > 0
        ? filterTags.every((tag) => todo.tags.includes(tag))
        : true;
    const matchesSearch = searchTerm
      ? (todo.title && todo.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    const matchesProgress = filterProgress ? todo.progress === filterProgress : true;
    const matchesPriority = filterPriority ? todo.priority === filterPriority : true;

    // Only show completed tasks if filtering by progress === "Completed"
    if (!filterProgress || filterProgress !== "Completed") {
      if (todo.completed) return false;
    }

    return (
      matchesProject &&
      matchesTags &&
      matchesSearch &&
      matchesProgress &&
      matchesPriority
    );
  });

  // Get project color based on project name.
  const getProjectColor = (projectName: string) => {
    if (projectName === 'Unassigned' || projectName === '') return '#FAF9F9'
    const project = projects.find((p) => p.name === projectName)
    return project ? project.color : '#FAF9F9'
  }

  return (
    <div className="w-full h-full px-4 mt-8 bg-b-black-200 overflow-scroll no-scrollbar">
      <div className="flex mb-4">
        <button
          onClick={() => handleFilterProjectChange('')}
          className="p-1 px-2 mr-2 rounded-t-lg text-b-white-200 border-b-2 border-blue-400"
          style={{
            backgroundColor:
              filterProject === '' ? adjustLightness('#4299E1', -20) : 'transparent'
          }}
        >
          All Tasks
        </button>
        <div className="border-x-2 border-b-white-400 pr-2">
          {projects.map((project, index) => {
            const isActive = filterProject === project.name
            return (
              <button
                key={index}
                onClick={() => handleFilterProjectChange(project.name)}
                className="p-1 px-2 rounded-t-lg ml-2 text-b-white-200 border-b-2"
                style={{
                  borderColor: project.color,
                  backgroundColor: isActive ? adjustLightness(project.color, -10) : 'transparent'
                }}
              >
                {project.name}
              </button>
            )
          })}
          <button
            onClick={() => handleFilterProjectChange('Unassigned')}
            className="p-1 rounded-t-lg ml-2 text-b-white-200 border-b-2"
            style={{
              borderColor: getProjectColor('Unassigned'),
              backgroundColor:
                filterProject === 'Unassigned'
                  ? adjustLightness(getProjectColor('Unassigned'), -10)
                  : 'transparent'
            }}
          >
            Unassigned
          </button>
        </div>
        <button onClick={handleOpenModal} className="p-1 text-b-white-300 ml-2">
          <FontAwesomeIcon icon={faPencil} />
        </button>
      </div>
      <div className="flex flex-col mb-3">
        <div className="flex flex-wrap">
          {allTags.slice(0, Math.ceil(allTags.length / 2)).map((tag, index) => (
            <span
              key={index}
              className={`text-sm h-fit mr-2 mb-2 rounded-xl px-1.5 cursor-pointer inline-block ${
                filterTags.includes(tag) ? 'text-b-blue-300' : 'text-b-white-500'
              }`}
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap">
          {allTags.slice(Math.ceil(allTags.length / 2)).map((tag, index) => (
            <span
              key={index}
              className={`text-sm h-fit mr-2 mb-2 rounded-xl px-1.5 cursor-pointer inline-block ${
                filterTags.includes(tag) ? 'text-b-blue-300' : 'text-b-white-500'
              }`}
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex">
        <div className="flex">
          <button
            onClick={handleNewTask}
            className="px-2 py-1 text-b-white-400 hover:text-b-blue-100"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
          

          <div className="flex items-center space-x-2">
            {/* Progress Filter Group */}
            <div className="flex items-center relative">
            <Tippy content="Filter by Progress">
              <button
                className="flex items-center text-b-white-400 mr-1 mx-4 hover:text-b-blue-100"
                onClick={() => setShowProgressOptions((v) => !v)}
                aria-label="Filter by Progress"
              >
                <FontAwesomeIcon icon={selectedProgressIcon} />
              </button>
              </Tippy>
              <div
                className={`flex items-center transition-all duration-300 overflow-hidden bg-b-black-300 rounded-r-xl ${
                  showProgressOptions ? 'w-fit opacity-100 ml-2' : 'w-0 opacity-0'
                }`}
                
              >
                {[
                  { label: "Not Started", icon: faStop, tip: "Not Started" },
                  { label: "In Progress", icon: faSpinner, tip: "In Progress" },
                  { label: "Waiting", icon: faHourglassHalf, tip: "Waiting" },
                  { label: "Needs Review", icon: faMagnifyingGlassChart, tip: "Needs Review" },
                  { label: "Completed", icon: faFlagCheckered, tip: "Completed" },
                ].map((opt) => (
                  <Tippy key={opt.label} content={opt.tip}>
                  <button
                    key={opt.label}
                    className={`p-2 mx-1 rounded-xl transition-colors duration-200 ${
                      filterProgress === opt.label ? "text-b-blue-200" : "text-b-white-300"
                    } hover:text-b-blue-100`}
                    onClick={() => {
                      if (filterProgress === opt.label) {
                        setFilterProgress("");
                        setSelectedProgressIcon(faFlag); // Reset to default
                      } else {
                        setFilterProgress(opt.label);
                        setSelectedProgressIcon(opt.icon);
                      }
                      setShowProgressOptions(false);
                    }}
                    title={opt.label}
                  >
                    <FontAwesomeIcon icon={opt.icon} />
                  </button>
                  </Tippy>
                ))}
              </div>
            </div>

            {/* Priority Filter Group */}
            <div className="flex items-center relative mx-4 pl-3">
              <Tippy content="Filter by Priority">
              <button
                className="flex items-center text-b-white-400 mr-1 hover:text-b-blue-100"
                onClick={() => setShowPriorityOptions((v) => !v)}
                aria-label="Filter by Priority"
              >
                <FontAwesomeIcon icon={selectedPriorityIcon} />
              </button>
              </Tippy>
              <div
                className={`flex items-center transition-all duration-300 overflow-hidden bg-b-black-300 rounded-r-xl ${
                  showPriorityOptions ? 'w-fit opacity-100 ml-2' : 'w-0 opacity-0'
                }`}
              >
                {[
                  { label: "Low", icon: faCircleChevronDown, tip: "Low Priority" },
                  { label: "Medium", icon: faCircleChevronRight, tip: "Medium Priority" },
                  { label: "High", icon: faCircleChevronUp, tip: "High Priority" },
                ].map((opt) => (
                  <Tippy key={opt.label} content={opt.tip}>
                  <button
                    key={opt.label}
                    className={`p-2 mx-1 rounded transition-colors duration-200 rounded-xl ${
                      filterPriority === opt.label ? "text-b-blue-200" : "text-b-white-400"
                    } hover:text-b-blue-100`}
                    onClick={() => {
                      if (filterPriority === opt.label) {
                        setFilterPriority("");
                        setSelectedPriorityIcon(faCircleExclamation); // Reset to default
                      } else {
                        setFilterPriority(opt.label);
                        setSelectedPriorityIcon(opt.icon);
                      }
                      setShowPriorityOptions(false);
                    }}
                    title={opt.label}
                  >
                    <FontAwesomeIcon icon={opt.icon} />
                  </button>
                  </Tippy>
                ))}
              </div>
            </div>
          </div>

          {/* ...search bar remains here... */}
          
          <div className="relative w-full ml-2 focus:text-b-blue-100 content-evenly">
            <span className="absolute inset-y-0 flex items-center ml-2">
              <FontAwesomeIcon icon={faSearch} className="text-b-white-300" />
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="pl-8 pr-4 pt-1 text-b-white-300 pb-1"
            />
          </div>
        </div>
        
      </div>
      <div className="flex flex-col border-t-2 border-b-white-600 pt-2">
        {stagedTodo && stagedTodoMatchesFilters && (
          <div ref={stagedTodoRef}>
            <TodoItem
              key={stagedTodo.id}
              todo={stagedTodo}
              onToggle={() => setStagedTodo({ ...stagedTodo, completed: !stagedTodo.completed })}
              onUpdate={(updatedTodo) => setStagedTodo(updatedTodo)}
              onSave={() => {}} // Do nothing here
              projects={projects}
              onProjectClick={handleProjectClick}
              projectColor={getProjectColor(stagedTodo.project)}
              tagColors={tagColors}
            />
          </div>
        )}
        {filteredTodos.map((todo, index) => (
          <div
            key={todo.id}
            onContextMenu={e => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, todo });
            }}
          >
            <TodoItem
              todo={todo}
              onToggle={() => handleToggleTodo(index)}
              onUpdate={updatedTodo => handleUpdateTodo(updatedTodo, index)}
              onSave={updatedTodo => handleUpdateTodo(updatedTodo, index)}
              projects={projects}
              onProjectClick={handleProjectClick}
              projectColor={getProjectColor(todo.project)}
              tagColors={tagColors}
            />
          </div>
        ))}
        {showCompletedSection && daysWithTasks.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center mb-2">
              <span className="font-semibold text-b-white-400">Tasks completed this week</span>
              <hr className="flex-grow ml-4 border-b-white-600" />
            </div>
            <div className="flex flex-col">
              {daysWithTasks.map(day => (
                <div key={day} className="mb-2">
                  <div className="font-semibold text-b-blue-200 mb-1">{day}</div>
                  {completedThisWeekByDay[day].map((todo, index) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={() => handleToggleTodo(tasks.indexOf(todo))}
                      onUpdate={(updatedTodo) => handleUpdateTodo(updatedTodo, tasks.indexOf(todo))}
                      onSave={(updatedTodo) => handleUpdateTodo(updatedTodo, tasks.indexOf(todo))}
                      projects={projects}
                      onProjectClick={handleProjectClick}
                      projectColor={getProjectColor(todo.project)}
                      tagColors={tagColors}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <EditProjectsModal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        projects={projects}
        setProjects={setProjects}
      />
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
            background: '#23272e',
            color: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            minWidth: '140px',
            padding: '4px 0'
          }}
          onClick={() => setContextMenu(null)}
          onContextMenu={e => e.preventDefault()}
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-b-blue-400"
            onClick={() => {
              deleteTask(contextMenu.todo.id);
              setContextMenu(null);
            }}
          >
            Delete
          </button>
          {contextMenu.todo.deadline ? (
            <button
              className="block w-full text-left px-4 py-2 hover:bg-b-blue-400"
              onClick={() => {
                const latest = tasks.find(t => t.id === contextMenu.todo.id);
                if (latest) updateTask({ ...latest, deadline: null });
                setContextMenu(null);
                forceUpdate(n => n + 1);
              }}
            >
              Remove Deadline
            </button>
          ) : (
            <button
              className="block w-full text-left px-4 py-2 hover:bg-b-blue-400"
              onClick={() => {
                setShowDeadlinePicker(true);
                setDeadlineTodoId(contextMenu.todo.id);
                setContextMenu(null);
              }}
            >
              Add Deadline
            </button>
          )}
        </div>
      )}
        {showDeadlinePicker && deadlineTask && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40"
          onClick={() => setShowDeadlinePicker(false)}
        >
          <div
            className="bg-b-black-200 p-6 rounded-lg"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="mb-2 text-b-white-200">Set Hard Deadline</h3>
            <DatePicker
              selected={deadlineTask.deadline ? new Date(deadlineTask.deadline) : null}
              onChange={date => {
                updateTask({ ...deadlineTask, deadline: date ? date.toISOString() : null });
                setShowDeadlinePicker(false);
                forceUpdate(n => n + 1);
              }}
              minDate={new Date()}
              className="text-b-black-800"
              autoFocus
            />
            <button
              className="block mt-4 px-4 py-2 bg-b-blue-400 rounded text-b-white-100"
              onClick={() => setShowDeadlinePicker(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
})
Todo.displayName = 'Todo'
export default Todo