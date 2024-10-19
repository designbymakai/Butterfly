import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import TodoItem from '../components/TodoItem';
import EventsTab from '../components/EventsTab';
import ProjectsTab from '../components/ProjectsTab';
import EditProjectsModal from '../components/EditProjectsModal';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

export const loadEventsFromLocalStorage = () => {
  const events = localStorage.getItem('events');
  return events ? JSON.parse(events) : [];
};

export const saveEventsToLocalStorage = (events) => {
  localStorage.setItem('events', JSON.stringify(events));
};

export const loadTodosFromLocalStorage = () => {
  const todos = localStorage.getItem('todos');
  if (todos) {
    const parsedTodos = JSON.parse(todos);
    return parsedTodos.filter(todo => todo.dueDate !== null && !isNaN(new Date(todo.dueDate).getTime()));
  }
  return [];
};

export const saveTodosToLocalStorage = (todos) => {
  localStorage.setItem('todos', JSON.stringify(todos));
};

const loadProjectsFromLocalStorage = () => {
  const projects = localStorage.getItem('projects');
  return projects ? JSON.parse(projects) : [];
};

const saveProjectsToLocalStorage = (projects) => {
  localStorage.setItem('projects', JSON.stringify(projects));
};

const Todo = forwardRef((props, ref) => {
  const [events, setEvents] = useState(loadEventsFromLocalStorage());
  const [todos, setTodos] = useState(loadTodosFromLocalStorage());
  const [projects, setProjects] = useState(loadProjectsFromLocalStorage());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [stagedTodo, setStagedTodo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('todo');
  const [filterProject, setFilterProject] = useState('');
  const [filterTags, setFilterTags] = useState([]);

  useEffect(() => {
    saveEventsToLocalStorage(events);
  }, [events]);

  useEffect(() => {
    saveTodosToLocalStorage(todos);
  }, [todos]);

  useEffect(() => {
    saveProjectsToLocalStorage(projects);
  }, [projects]);

  useImperativeHandle(ref, () => ({
    createTask: (taskDetails) => {
      console.log('createTask called with:', taskDetails); // Log the task details
      const taskWithDefaultProject = {
        ...taskDetails,
        id: taskDetails.id === 'placeholder-id' ? uuidv4() : taskDetails.id, // Replace placeholder-id with a new UUID
        project: taskDetails.project || 'No Project', // Set default project to "No Project"
      };
      setTodos((prevTodos) => {
        const updatedTodos = [...prevTodos, taskWithDefaultProject];
        saveTodosToLocalStorage(updatedTodos);
        console.log('Updated Todos:', updatedTodos); // Log the updated todos
        return updatedTodos;
      });
    },
  }));

  const handleNewTask = () => {
    setStagedTodo({
      id: uuidv4(), // Generate a unique ID
      title: 'New Task',
      description: 'No description',
      project: '',
      tags: [],
      date: new Date(),
      time: '', // Add time field
      completed: false,
    });
  };

  const handleSaveStagedTodo = (updatedTodo) => {
    setTodos([...todos, updatedTodo]);
    setStagedTodo(null);
  };

  const handleUpdateTodo = (updatedTodo, index) => {
    setTodos(todos.map((todo, i) => (i === index ? updatedTodo : todo)));
  };

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleToggleTodo = (index) => {
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

  const handleFilterProjectChange = (projectName) => {
    setFilterProject(projectName);
  };

  const handleTagClick = (tag) => {
    setFilterTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
  };

  const handleProjectClick = (projectName) => {
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

  const getProjectColor = (projectName) => {
  const project = projects.find(p => p.name === projectName);
  return project ? project.color : 'inherit';
  };

  return (
    <div className='w-full h-full p-4 bg-b-white-100 rounded-3xl overflow-scroll no-scrollbar'>
      <h1 className='text-2xl mb-4 text-b-black-100'>To-Do List</h1>
      <div className='flex mb-4'>
        <button
          className={`p-2 mr-2 ${activeTab === 'todo' ? 'bg-b-blue-300 text-b-white-100' : 'bg-b-white-200 text-b-black-100'} rounded`}
          onClick={() => setActiveTab('todo')}
        >
          Todo
        </button>
        <button
          className={`p-2 mr-2 ${activeTab === 'projects' ? 'bg-b-blue-300 text-b-white-100' : 'bg-b-white-200 text-b-black-100'} rounded`}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button
          className={`p-2 ${activeTab === 'events' ? 'bg-b-blue-300 text-b-white-100' : 'bg-b-white-200 text-b-black-100'} rounded`}
          onClick={() => setActiveTab('events')}
        >
          Upcoming Events
        </button>
      </div>

      {activeTab === 'todo' && (
        <div>
          <div className='flex mb-4'>
            <button
              onClick={() => handleFilterProjectChange('')}
              className={`p-2 rounded ${filterProject === '' ? 'bg-b-blue-400 text-white' : 'bg-gray-200 text-black'}`}
            >
              All Tasks
            </button>
            <button
              onClick={() => handleFilterProjectChange('No Project')}
              className={`p-2 rounded ml-2 hover:bg-b-blue-100 hover:text-b-white-100 ${filterProject === 'No Project' ? 'bg-b-blue-300 text-white' : 'bg-gray-200 text-black'}`}
            >
              No Project
            </button>
            {projects.map((project, index) => (
              <button
                key={index}
                onClick={() => handleFilterProjectChange(project.name)}
                className={`p-2 rounded ml-2 hover:bg-b-blue-100 hover:text-b-white-100 ${filterProject === project.name ? 'bg-b-blue-300 text-white' : 'bg-gray-200 text-black'}`}
                style={{ backgroundColor: filterProject === project.name ? project.color : '#E5E7EB' }}
              >
                {project.name}
              </button>
            ))}
            <button onClick={handleOpenModal} className='p-2 bg-b-green-300 text-white rounded ml-2'>
              <FontAwesomeIcon icon={faPencil} />
            </button>
          </div>
          <div className='flex flex-col ml-4'>
            <div className='flex flex-wrap'>
              {allTags.slice(0, Math.ceil(allTags.length / 2)).map((tag, index) => (
                <span
                  key={index}
                  className={`text-sm text-gray-500 h-fit mr-2 mb-2 bg-b-white-200 rounded-xl px-1.5 cursor-pointer ${filterTags.includes(tag) ? 'bg-b-orange-300 text-white' : ''}`}
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className='flex flex-wrap'>
              {allTags.slice(Math.ceil(allTags.length / 2)).map((tag, index) => (
                <span
                  key={index}
                  className={`text-sm text-gray-500 h-fit mr-2 mb-2 bg-b-white-200 rounded-xl px-1.5 cursor-pointer ${filterTags.includes(tag) ? 'bg-b-orange-300 text-white' : ''}`}
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
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
          <div className='flex flex-col'>
          {stagedTodo && (
              <TodoItem
                todo={stagedTodo}
                onSave={handleSaveStagedTodo}
                onUpdate={handleSaveStagedTodo}
                isEditing={true}
                projects={projects}
                onProjectClick={handleProjectClick}
                projectColor={getProjectColor(stagedTodo.project)} // Pass projectColor
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
                projectColor={getProjectColor(todo.project)} // Pass projectColor
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <EventsTab
          events={events}
          setEvents={setEvents}
          modalIsOpen={modalIsOpen}
          setModalIsOpen={setModalIsOpen}
          editingEvent={null}
          setEditingEvent={null}
        />
      )}

      {activeTab === 'projects' && (
        <ProjectsTab
          todos={todos}
          setTodos={setTodos}
          editMode={editMode}
          handleToggleTodo={handleToggleTodo}
          handleUpdateTodo={handleUpdateTodo}
          projects={projects}
          setProjects={setProjects}
        />
      )}

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