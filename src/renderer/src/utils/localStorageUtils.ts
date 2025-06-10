
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
  
  export const loadProjectsFromLocalStorage = () => {
    const projects = localStorage.getItem('projects');
    return projects ? JSON.parse(projects) : [];
  };
  
  export const saveProjectsToLocalStorage = (projects) => {
    localStorage.setItem('projects', JSON.stringify(projects));
  };

  export const loadEventsFromLocalStorage = () => {
  const events = localStorage.getItem('events');
  return events ? JSON.parse(events) : [];
};

export const saveEventsToLocalStorage = (events: any[]) => {
  localStorage.setItem('events', JSON.stringify(events));
};