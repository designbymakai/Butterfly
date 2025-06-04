import { useState, useEffect } from 'react';
import ProjectsTab from '../components/ProjectsTab';
import { useTasks } from '../context/TaskContext';
import { loadTodosFromLocalStorage, saveTodosToLocalStorage, loadProjectsFromLocalStorage, saveProjectsToLocalStorage } from '../utils/localStorageUtils';

const Projects = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [todos, setTodos] = useState(loadTodosFromLocalStorage());
  const [projects, setProjects] = useState(loadProjectsFromLocalStorage());
  const [editMode] = useState(false);

  useEffect(() => {
    saveTodosToLocalStorage(todos);
  }, [todos]);

  useEffect(() => {
    saveProjectsToLocalStorage(projects);
  }, [projects]);

  return (
    <div className='w-full h-full p-4 bg-b-white-100 rounded-3xl overflow-scroll no-scrollbar'>
      <ProjectsTab
        todos={todos}
        setTodos={setTodos}
        editMode={editMode}
        handleToggleTodo={() => {}}
        handleUpdateTodo={() => {}}
        projects={projects}
        setProjects={setProjects}
      />
    </div>
  );
};

export default Projects;