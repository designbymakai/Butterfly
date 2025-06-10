import { useState, useEffect } from 'react';
import EditProjectsModal from './EditProjectsModal';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { adjustLightness } from '../utils/colorUtils';
import { getProjectColorByIndex, getProjectColorForName } from '../utils/projectColors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faShapes } from '@fortawesome/free-solid-svg-icons';
import ColorPickerModal from './ColorPickerModal';
import CompactTodoItem from './CompactTodoItem';
import '../assets/markdown.css'; // Custom styles for ProjectsTab
import 'react-markdown-editor-lite/lib/index.css';


const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true });

interface Project {
  name: string;
  description?: string;
}

interface Todo {
  id: string;
  title: string;
  description: string;
  project: string;
  tags: string[];
  date: Date;
  time: string;
  completed: boolean;
}

interface ProjectsTabProps {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  editMode: boolean;
  handleToggleTodo: (index: number) => void;
  handleUpdateTodo: (updatedTodo: Todo, index: number) => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({
  todos,
  handleToggleTodo,
  handleUpdateTodo,
  projects,
  setProjects,
}) => {
  const [selectedProject, setSelectedProject] = useState<'all' | string>('all');
  const [projectNotes, setProjectNotes] = useState<Record<string, string>>({});
  const [isEditingProjects, setIsEditingProjects] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [openProjectOptions, setOpenProjectOptions] = useState<number | null>(null);

  // New state for inline editing
  const [editingTitleIndex, setEditingTitleIndex] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [editingDescIndex, setEditingDescIndex] = useState<number | null>(null);
  const [newDescription, setNewDescription] = useState<string>('');
  const [colorPickerProjectIndex, setColorPickerProjectIndex] = useState<number | null>(null);

  const handleEditorChange = ({ text }: { text: string }) => {
    setProjectNotes({
      ...projectNotes,
      [selectedProject]: text,
    });
  };

  // Existing useEffects…
  useEffect(() => {
    const savedNotes = localStorage.getItem('projectNotes');
    if (savedNotes) {
      setProjectNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    if (selectedProject !== 'all') {
      localStorage.setItem('projectNotes', JSON.stringify(projectNotes));
    }
  }, [projectNotes, selectedProject]);

  const handleProjectSelect = (project: Project | 'all') => {
    if (project === 'all') {
      setSelectedProject('all');
    } else {
      setSelectedProject(project.name);
    }
    setIsEditingNotes(false);
    setOpenProjectOptions(null);
  };

  const handleSave = () => {
    localStorage.setItem('projectNotes', JSON.stringify(projectNotes));
    setIsEditingNotes(false);
  };
  // Dropdown handlers:
  const handleRenameProject = (index: number) => {
    setEditingTitleIndex(index);
    setNewTitle(projects[index].name);
    setOpenProjectOptions(null);
  };

  const handleChangeProjectColor = (index: number) => {
    setColorPickerProjectIndex(index);
    setOpenProjectOptions(null);
  };

  const handleDeleteProject = (index: number) => {
    if (window.confirm(`Are you sure you want to delete project: ${projects[index].name}?`)) {
      const projectToDelete = projects[index];
      setProjects(projects.filter((_, i) => i !== index));
      if (selectedProject === projectToDelete.name) {
        setSelectedProject('all');
      }
    }
    setOpenProjectOptions(null);
  };

  const handleEditDescription = (index: number) => {
    setEditingDescIndex(index);
    setNewDescription(projects[index].description || '');
    setOpenProjectOptions(null);
  };

  // Save inline title edit
  const saveTitleEdit = (index: number) => {
    if (newTitle.trim() !== '') {
      const updatedProjects = [...projects];
      updatedProjects[index] = { ...updatedProjects[index], name: newTitle.trim() };
      setProjects(updatedProjects);
      // If the renamed project is currently selected, update selection as well
      if (selectedProject === projects[index].name) {
        setSelectedProject(newTitle.trim());
      }
    }
    setEditingTitleIndex(null);
  };

  // Save inline description edit
  const saveDescriptionEdit = (index: number) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = { ...updatedProjects[index], description: newDescription };
    setProjects(updatedProjects);
    setEditingDescIndex(null);
  };

  const projectTodos = todos.filter((todo) => todo.project === selectedProject);
  const selectedProjectColor =
  projects.find((project) => project.name === selectedProject)
    ? getProjectColorByIndex(projects.findIndex(p => p.name === selectedProject))
    : 'inherit';

  useEffect(() => {
    console.log('Projects received:', projects);
  }, [projects]);

  return (
    <div>
      <div className="flex mb-4 items-center">
        <button
          onClick={() => setIsEditingProjects(true)}
          className="p-1 px-2 text-white rounded ml-2"
        >
          <i className="fas fa-plus"></i>
        </button>
        <button
          onClick={() => setIsEditingNotes(true)}
          className="p-1 px-2 text-white rounded-lg mx-2"
        >
          <i className="fas fa-pencil-alt"></i>
        </button>
        <div className="pr-2 flex">
          <button
            onClick={() => handleProjectSelect('all')}
            className="pl-2 pr-2 rounded-lg text-b-white-200"
          >
            <FontAwesomeIcon icon={faShapes} className="text-xl" />
          </button>
        </div>
      </div>
      <EditProjectsModal
        isOpen={isEditingProjects}
        onRequestClose={() => setIsEditingProjects(false)}
        projects={projects}
        setProjects={setProjects}
      />
      {selectedProject === 'all' ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, index) => {
              const color = project.color ? project.color : getProjectColorForName(project.name, projects);
              return (
                <div
                  key={index}
                  className="relative rounded-lg shadow-lg cursor-pointer"
                  onClick={() => handleProjectSelect(project)}
                  style={{ backgroundColor: color }}
                >
                  {/* Top Section (Header) with project background */}
                  <div style={{ backgroundColor: color }} className="px-4 py-2 relative rounded-t-lg">
                    <div className="flex justify-between items-center">
                      {editingTitleIndex === index ? (
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onBlur={() => saveTitleEdit(index)}
                          autoFocus
                          className="text-xl font-bold text-white bg-transparent border-b border-white"
                        />
                      ) : (
                        <h3 className="text-xl font-bold text-white">{project.name}</h3>
                      )}
                      {/* Ellipsis button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenProjectOptions(openProjectOptions === index ? null : index);
                        }}
                        className="absolute right-4 text-white text-2xl"
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </button>
                    </div>
                    {openProjectOptions === index && (
                      <div
                        className="absolute right-0 top-full mt-1 w-40 bg-b-white-300 rounded shadow-lg z-50"
                        onMouseLeave={() => setOpenProjectOptions(null)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleRenameProject(index)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleChangeProjectColor(index)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Change Color
                        </button>
                        <button
                          onClick={() => handleEditDescription(index)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit Description
                        </button>
                        <button
                          onClick={() => handleDeleteProject(index)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Bottom Section (Body) with project description */}
                  <div className="p-4 bg-b-black-100 text-white rounded-b-lg">
                    {editingDescIndex === index ? (
                      <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        onBlur={() => saveDescriptionEdit(index)}
                        autoFocus
                        className="bg-transparent border-b border-white w-full"
                      />
                    ) : (
                      project.description || "No Description Provided."
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-col mt-4">
            {projectTodos.map((todo, index) => (
              <CompactTodoItem
                key={index}
                title={todo.title}
                description={todo.description}
                project={todo.project}
                dueDate={todo.date ? new Date(todo.date).toString() : ''}
                tags={todo.tags}
                completed={todo.completed}
                onToggle={() => handleToggleTodo(index)}
                onSave={() => {}}
                projectColor={selectedProjectColor}
                selectedIcon={undefined}
              />
            ))}
          </div>
          {isEditingNotes ? (
            <div>
              <MdEditor
                value={projectNotes[selectedProject] || ''}
                style={{ height: '300px', backgroundColor: 'transparent', border: 'none' }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={handleEditorChange}
                view={{ menu: true, md: true, html: false }}
              />
              <button
                onClick={handleSave}
                className="p-2 bg-blue-500 text-white rounded mt-2"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {projectNotes[selectedProject] || ''}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
      {/* Color Picker Modal for changing project color */}
      {colorPickerProjectIndex !== null && (
        <ColorPickerModal
          isOpen={true}
          onRequestClose={() => setColorPickerProjectIndex(null)}
          currentColor={projects[colorPickerProjectIndex!].color || getProjectColorForName(projects[colorPickerProjectIndex!].name, projects)}
          onColorChange={(newColor) => {
            const updatedProjects = [...projects];
            updatedProjects[colorPickerProjectIndex!] = {
              ...updatedProjects[colorPickerProjectIndex!],
              color: newColor,
            };
            setProjects(updatedProjects);
            setColorPickerProjectIndex(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectsTab;