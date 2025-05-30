import React, { Component } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({ error, errorInfo });
  }

  handleDeleteTasks = () => {
    localStorage.removeItem('todos');
    window.location.reload();
  };

  handleClearChat = () => {
    localStorage.removeItem('chatMessages');
    window.location.reload();
  };

  loadTodosFromLocalStorage = () => {
    const todos = localStorage.getItem('todos');
    if (todos) {
      return JSON.parse(todos);
    }
    return [];
  };

  loadProjectsFromLocalStorage = () => {
    const projects = localStorage.getItem('projects');
    if (projects) {
      return JSON.parse(projects);
    }
    return [];
  };

  handleDeleteProject = (projectName) => {
    const projects = this.loadProjectsFromLocalStorage();
    const updatedProjects = projects.filter(project => project.name !== projectName);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const tasks = this.loadTodosFromLocalStorage();
      const projects = this.loadProjectsFromLocalStorage();

      return (
        <div className="error-boundary">
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button onClick={this.handleDeleteTasks} className="delete-tasks-button">
            Delete All Tasks
          </button>
          <button onClick={this.handleClearChat} className="clear-chat-button">
            Clear Chat
          </button>
          <div className="tasks-list">
            <h2>Active Tasks:</h2>
            <ul>
              {tasks.map((task) => (
                <li key={task.id}>
                  <strong>{task.title}</strong>: {task.description} (Due: {new Date(task.dueDate).toLocaleString()})
                </li>
              ))}
            </ul>
          </div>
          <div className="projects-list">
            <h2>Projects:</h2>
            <ul>
              {projects.map((project) => (
                <li key={project.name}>
                  <strong>{project.name}</strong>
                  <button onClick={() => this.handleDeleteProject(project.name)} className="delete-project-button">
                    Delete Project
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;