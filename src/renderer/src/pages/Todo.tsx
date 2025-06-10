import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faPlus, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons'
import TodoItem from '../components/TodoItem'
import EditProjectsModal from '../components/EditProjectsModal'
import { v4 as uuidv4 } from 'uuid'
import { useTasks } from '../context/TaskContext'
import {
  loadProjectsFromLocalStorage,
  saveProjectsToLocalStorage
} from '../utils/localStorageUtils'
import { getPastelColorForTag, adjustLightness } from '../utils/colorUtils'

const Todo = forwardRef((_, ref) => {
  // Get tasks from context.
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  
  // State for projects, modal, new task staging and filtering.
  const [projects, setProjects] = useState(loadProjectsFromLocalStorage())
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [stagedTodo, setStagedTodo] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState('todo') // not used further but preserved for potential use
  const [filterProject, setFilterProject] = useState('')
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [editMode] = useState(false) // preserved if needed later
  const [searchTerm, setSearchTerm] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

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
    saveProjectsToLocalStorage(projects)
  }, [projects])

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
    const matchesProject = filterProject ? todo.project === filterProject : true
    const matchesTags =
      filterTags.length > 0
        ? filterTags.every((tag) => todo.tags.includes(tag))
        : true
    const matchesSearch = searchTerm
      ? (todo.title && todo.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      : true
    return matchesProject && matchesTags && matchesSearch
  })

  // Get project color based on project name.
  const getProjectColor = (projectName: string) => {
    if (projectName === 'Unassigned' || projectName === '') return '#FAF9F9'
    const project = projects.find((p) => p.name === projectName)
    return project ? project.color : '#FAF9F9'
  }

  return (
    <div className="w-full h-full px-4 bg-b-black-200 overflow-scroll no-scrollbar">
      <div className="flex mb-4">
        <button
          onClick={() => handleFilterProjectChange('')}
          className="p-1 px-2 mr-2 rounded-lg text-b-white-200 border-2 border-blue-400"
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
                className="p-1 px-2 rounded-lg ml-2 text-b-white-200 border-2"
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
            className="p-1 rounded-lg ml-2 text-b-white-200 border-2"
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
                filterTags.includes(tag) ? 'text-b-blue-300' : 'text-b-white-600'
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
                filterTags.includes(tag) ? 'text-b-blue-300' : 'text-b-white-600'
              }`}
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex mb-4">
        <button
          onClick={handleNewTask}
          className="px-2 py-1 text-b-white-400 hover:text-b-blue-100"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <button
          onClick={handleClearCompleted}
          className="px-2 py-1 ml-2 text-b-white-400 hover:text-b-blue-100"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <div className="relative w-full ml-2 focus:text-b-blue-100">
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
            className="pl-8 pr-4 pt-1 text-b-white-300"
          />
        </div>
      </div>
      <div className="flex flex-col border-t-2 border-b-white-600 pt-2">
        {stagedTodo && (
          <TodoItem
            key={stagedTodo.id}
            todo={stagedTodo}
            onToggle={() => handleToggleTodo(0)}
            onUpdate={(updatedTodo) => handleUpdateTodo(updatedTodo, 0)}
            onSave={(updatedTodo) => handleSaveStagedTodo(updatedTodo)} // Use staged-task saver
            projects={projects}
            onProjectClick={handleProjectClick}
            projectColor={getProjectColor(stagedTodo.project)}
            tagColors={tagColors}
          />
        )}
        {filteredTodos.map((todo, index) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => handleToggleTodo(index)}
            onUpdate={(updatedTodo) => handleUpdateTodo(updatedTodo, index)}
            onSave={(updatedTodo) => handleUpdateTodo(updatedTodo, index)}
            projects={projects}
            onProjectClick={handleProjectClick}
            projectColor={getProjectColor(todo.project)}
            tagColors={tagColors}
          />
        ))}
      </div>
      <EditProjectsModal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        projects={projects}
        setProjects={setProjects}
      />
    </div>
  )
})
Todo.displayName = 'Todo'
export default Todo