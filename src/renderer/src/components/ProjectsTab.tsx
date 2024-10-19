import React, { useState, useEffect } from 'react';
import CompactTodoItem from './CompactTodoItem'; // Import CompactTodoItem
import EditProjectsModal from './EditProjectsModal';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Import remark-gfm for GitHub Flavored Markdown
import '@fortawesome/fontawesome-free/css/all.min.css'; // Ensure this line is included
import '../assets/markdown.css'; // Import the custom CSS file

// Configure MarkdownIt to support tables
const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true });

const ProjectsTab = ({ todos, setTodos, editMode, handleToggleTodo, handleUpdateTodo, projects, setProjects }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [projectNotes, setProjectNotes] = useState({});
  const [isEditingProjects, setIsEditingProjects] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false); // Display rendered text by default

  useEffect(() => {
    const savedNotes = localStorage.getItem('projectNotes');
    if (savedNotes) {
      setProjectNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('projectNotes', JSON.stringify(projectNotes));
    }
  }, [projectNotes, selectedProject]);

  const handleProjectSelect = (project) => {
    setSelectedProject(project.name);
    setIsEditingNotes(false); // Display rendered text by default
  };

  const handleEditorChange = ({ text }) => {
    setProjectNotes({
      ...projectNotes,
      [selectedProject]: text,
    });
  };

  const handleSave = () => {
    localStorage.setItem('projectNotes', JSON.stringify(projectNotes)); // Save notes to localStorage
    setIsEditingNotes(false);
  };

  const projectTodos = todos.filter(todo => todo.project === selectedProject);
  const selectedProjectColor = projects.find(project => project.name === selectedProject)?.color || 'inherit';

  return (
    <div>
    <div className='flex mb-4'>
      <button
        onClick={() => setIsEditingProjects(true)}
        className='p-2 bg-yellow-500 text-white rounded ml-2'
      >
        <i className="fas fa-plus"></i>
      </button>
      {projects.map((project, index) => (
        <button
          key={index}
          onClick={() => handleProjectSelect(project)}
          className={`p-2 rounded ml-2 ${selectedProject === project.name ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
          style={{ backgroundColor: selectedProject === project.name ? project.color : 'gray' }}
        >
          {project.name}
        </button>
      ))}
      <button
        onClick={() => setIsEditingNotes(true)}
        className='p-2 bg-yellow-500 text-white rounded ml-2'
      >
        <i className="fas fa-pencil-alt"></i>
      </button>
    </div>
    <EditProjectsModal
      isOpen={isEditingProjects}
      onRequestClose={() => setIsEditingProjects(false)}
      projects={projects}
      setProjects={setProjects}
    />
    {selectedProject && (
      <div>
        <div className='flex flex-col mt-4'>
          {projectTodos.map((todo, index) => (
            <CompactTodoItem
              key={index}
              todo={{ ...todo, project: selectedProject }} // Pass project name as string
              onToggle={() => handleToggleTodo(index)}
              onUpdate={(updatedTodo) => handleUpdateTodo(updatedTodo, index)}
              onSave={() => {}} // Add onSave prop if needed
              projectColor={selectedProjectColor} // Pass the project color
            />
          ))}
        </div>
        {isEditingNotes ? (
          <div>
            <MdEditor
              value={projectNotes[selectedProject] || ''}
              style={{ height: '300px', backgroundColor: 'transparent', border: 'none' }} // Set background to transparent and remove border
              renderHTML={(text) => mdParser.render(text)}
              onChange={handleEditorChange}
              view={{ menu: true, md: true, html: false }} // Hide the preview tab
            />
            <button
              onClick={handleSave}
              className='p-2 bg-blue-500 text-white rounded mt-2'
            >
              Save
            </button>
          </div>
        ) : (
          <div className="markdown-body"> {/* Add this class for Markdown styling */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{projectNotes[selectedProject] || ''}</ReactMarkdown>
          </div>
        )}
      </div>
    )}
    </div>
  );
};

export default ProjectsTab;