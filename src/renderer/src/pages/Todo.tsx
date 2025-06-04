import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import TodoItem from '../components/TodoItem';
import EditProjectsModal from '../components/EditProjectsModal';
import { v4 as uuidv4 } from 'uuid';
import { useTasks } from '../context/TaskContext';
import { loadTodosFromLocalStorage, saveTodosToLocalStorage, loadProjectsFromLocalStorage, saveProjectsToLocalStorage } from '../utils/localStorageUtils';

const Todo = forwardRef((_, ref) => {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [todos, setTodos] = useState(loadTodosFromLocalStorage());
  const [projects, setProjects] = useState(loadProjectsFromLocalStorage());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [stagedTodo, setStagedTodo] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('todo');
  const [filterProject, setFilterProject] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [editMode] = useState(false);

  useEffect(() => {
    saveTodosToLocalStorage(todos);
  }, [todos]);

  useEffect(() => {
    saveProjectsToLocalStorage(projects);
  }, [projects]);

  useImperativeHandle(ref, () => ({
    createTask: (taskDetails) => {
      console.log('createTask called with:', taskDetails);
      const taskWithDefaultProject = {
        ...taskDetails,
        id: taskDetails.id === 'placeholder-id' ? uuidv4() : taskDetails.id,
        project: taskDetails.project || 'Unassigned',
      };
      setTodos((prevTodos) => {
        const updatedTodos = [...prevTodos, taskWithDefaultProject];
        saveTodosToLocalStorage(updatedTodos);
        console.log('Updated Todos:', updatedTodos);
        return updatedTodos;
      });
    },
  }));

  const handleNewTask = () => {
    setStagedTodo({
      id: uuidv4(),
      title: 'New Task',
      description: '',
      project: '',
      tags: [],
      date: new Date(),
      time: '',
      completed: false,
    });
  };

  const handleSaveStagedTodo = (updatedTodo: any) => {
    setTodos([...todos, updatedTodo]);
    setStagedTodo(null);
  };

  const handleUpdateTodo = (updatedTodo: any, index: number) => {
    setTodos(todos.map((todo, i) => (i === index ? updatedTodo : todo)));
  };

  const handleToggleTodo = (index: number) => {
    const updatedTodos = todos.map((todo, i) => {
      if (i === index) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    setTodos(updatedTodos);
  };

  const handleClearCompleted = () => {
    const updatedTodos = todos.filter(todo => !todo.completed);
    setTodos(updatedTodos);
  };

  const handleFilterProjectChange = (projectName: string) => {
    setFilterProject(projectName);
  };

  const handleTagClick = (tag: string) => {
    setFilterTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
  };

  const handleProjectClick = (projectName: string) => {
    setActiveTab('projects');
    setFilterProject(projectName);
  };

  const handleOpenModal = () => {
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };

  const filteredTodos = todos.filter(todo => {
    const matchesProject = filterProject ? todo.project === filterProject : true;
    const matchesTags = filterTags.length > 0 ? filterTags.every(tag => todo.tags.includes(tag)) : true;
    return matchesProject && matchesTags;
  });

  const activeTodos = todos.filter(todo => !todo.completed);
  const allTags = [...new Set(activeTodos.flatMap(todo => todo.tags))];

  const getProjectColor = (projectName: string) => {
  if (projectName === 'Unassigned') return '#FAF9F9'; // b-white-100
  const project = projects.find(p => p.name === projectName);
  return project ? project.color : '#FAF9F9';
};

  return (
    <div className='w-full h-full p-4 bg-b-black-200 rounded-3xl overflow-scroll no-scrollbar'>
      <div className='flex mb-4'></div>
      <div>
        <div className='flex mb-4 items-center'>
          <button
            onClick={() => handleFilterProjectChange('')}
            className={`p-1 px-2 mr-2 rounded ${filterProject === '' ? 'bg-b-blue-400 text-white' : 'bg-gray-200 text-white'}`}
          >
            All Tasks
          </button>
          <div className='border-x-2 border-b-white-400 pr-2'>
            {projects.map((project, index) => (
              <button
                key={index}
                onClick={() => handleFilterProjectChange(project.name)}
                className={`p-1 px-2 rounded ml-2 hover:bg-b-blue-100 hover:text-b-white-100 ${filterProject === project.name ? 'bg-b-blue-300 text-white' : 'bg-gray-200 text-white'}`}
                style={{ backgroundColor: filterProject === project.name ? project.color : '#E5E7EB' }}
              >
                {project.name}
              </button>
            ))}
            <button
            onClick={() => handleFilterProjectChange('Unassigned')}
            className={`p-1 rounded ml-2 hover:bg-b-blue-100 hover:text-b-white-100 ${filterProject === 'Unassigned' ? 'bg-b-blue-300 text-white' : 'bg-gray-200 text-white'}`}
          >
            Unassigned
          </button>
          </div>
          <button onClick={handleOpenModal} className='p-1 text-b-white-300 rounded ml-2'>
            <FontAwesomeIcon icon={faPencil} />
          </button>
        </div>
        <div className='flex flex-col ml-4'>
          <div className='flex flex-wrap'>
            {allTags.slice(0, Math.ceil(allTags.length / 2)).map((tag, index) => (
              <span
                key={index}
                className={`text-sm text-gray-500 h-fit mr-2 mb-2 bg-b-white-200 rounded-xl px-1.5 cursor-pointer ${filterTags.includes(tag as string) ? 'bg-b-orange-300 text-white' : ''}`}
                onClick={() => handleTagClick(tag as string)}
              >
                #{tag as string}
              </span>
            ))}
          </div>
          <div className='flex flex-wrap'>
            {allTags.slice(Math.ceil(allTags.length / 2)).map((tag, index) => (
              <span
                key={index}
                className={`text-sm text-gray-500 h-fit mr-2 mb-2 bg-b-white-200 rounded-xl px-1.5 cursor-pointer ${filterTags.includes(tag as string) ? 'bg-b-orange-300 text-white' : ''}`}
                onClick={() => handleTagClick(tag as string)}
              >
                #{tag as string}
              </span>
            ))}
          </div>
        </div>
        <div className='flex mb-4'>
          <button onClick={handleNewTask} className='p-2 bg-b-blue-300 text-white rounded'>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button onClick={handleClearCompleted} className='p-2 bg-b-orange-300 text-white rounded ml-2'>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
        <div className='flex flex-col border-t-2 border-gray-200 pt-2'>
          {stagedTodo && (
            <TodoItem
              todo={stagedTodo}
              onSave={handleSaveStagedTodo}
              onUpdate={handleSaveStagedTodo}
              onToggle={() => {}}
              isEditing={true}
              projects={projects}
              onProjectClick={handleProjectClick}
              projectColor={getProjectColor(stagedTodo.project)}
            />
          )}
          {filteredTodos.map((todo, index) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => handleToggleTodo(index)}
              onUpdate={(updatedTodo) => handleUpdateTodo(updatedTodo, index)}
              onSave={(updatedTodo) => handleUpdateTodo(updatedTodo, index)}
              isEditing={editMode}
              projects={projects}
              onProjectClick={handleProjectClick}
              projectColor={getProjectColor(todo.project)}
            />
          ))}
        </div>
      </div>
      <EditProjectsModal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        projects={projects}
        setProjects={setProjects}
      />
    </div>
  );
});

export default Todo;