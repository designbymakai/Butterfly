import { useState, useEffect } from 'react';
import EditProjectsModal from './EditProjectsModal';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getProjectColorByIndex, getProjectColorForName } from '../utils/projectColors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faShapes } from '@fortawesome/free-solid-svg-icons';
import ColorPickerModal from './ColorPickerModal';
import MiniCompactTodoItem from './MiniCompactTodoItem';
import '../assets/markdown.css';
import 'react-markdown-editor-lite/lib/index.css';
import { useTasks } from '../context/TaskContext';
import CompactTodoItem from './CompactTodoItem';
import { logProjectVisit } from '../utils/projectVisits'; // adjust path as needed


const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true });

interface Project {
  name: string;
  description?: string;
  color?: string;
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
  selectedProjectName?: string | null;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({
  selectedProjectName,
  todos,
  setTodos,
  editMode,
  handleToggleTodo,
  handleUpdateTodo,
  projects,
  setProjects,
}) => {
  const [selectedProject, setSelectedProject] = useState<'all' | string>('all');
  const { tasks } = useTasks();
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

  // Load saved project notes from local storage
  useEffect(() => {
    const savedNotes = localStorage.getItem('projectNotes');
    if (savedNotes) {
      setProjectNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    if (selectedProjectName) {
      setSelectedProject(selectedProjectName);
    }
  }, [selectedProjectName]);

  useEffect(() => {
    if (selectedProject !== 'all') {
      localStorage.setItem('projectNotes', JSON.stringify(projectNotes));
    }
  }, [projectNotes, selectedProject]);

  const handleSave = () => {
    localStorage.setItem('projectNotes', JSON.stringify(projectNotes));
    setIsEditingNotes(false);
  };

  const handleProjectSelect = (project: Project | 'all') => {
    if (project !== 'all') {
      logProjectVisit(project.name);
      setSelectedProject(project.name);
    } else {
      setSelectedProject('all');
    }
    setIsEditingNotes(false);
    setOpenProjectOptions(null);
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

  // For the "all" projects view, get project-related tasks for each project.
  // When a single project is selected, these todos will be shown in a separate projects view.
  const projectTodosMap: Record<string, Todo[]> = {};
  projects.forEach((project) => {
    const normalizedProjectName = project.name.trim().toLowerCase();
    projectTodosMap[project.name] = tasks.filter((todo) =>
      todo.project.trim().toLowerCase() === normalizedProjectName
    );
    console.log(`Project "${project.name}" tasks:`, projectTodosMap[project.name]);
  });
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
              const color = project.color
                ? project.color
                : getProjectColorForName(project.name, projects);
              // Get tasks related to current project; fallback to empty array if none.
              const projectTasks = projectTodosMap[project.name] || [];
              return (
                <div
                  key={index}
                  className="relative rounded-lg shadow-lg cursor-pointer"
                  onClick={() => handleProjectSelect(project)}
                  style={{ backgroundColor: color }}
                >
                  {/* Top Section (Header) with project background */}
                  <div
                    style={{ backgroundColor: color }}
                    className="px-4 py-2 relative rounded-t-lg"
                  >
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
                          setOpenProjectOptions(
                            openProjectOptions === index ? null : index
                          );
                        }}
                        className="absolute right-4 text-white text-2xl pl-4 pr-2"
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
                  {/* Bottom Section (Body) with project description and related tasks */}
                  <div className="p-4 bg-b-black-100 text-white rounded-b-lg h-64 flex flex-col">
                    <div className="flex-none">
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
                        <>
                          <p className="truncate">
                            {project.description || "No Description Provided."}
                          </p>
                          {projectTasks.length > 0 && (
                            <h4 className="text-sm font-bold mt-2">Tasks:</h4>
                          )}
                        </>
                      )}
                    </div>
                    <div className="mt-2 flex-grow overflow-y-auto">
                      {projectTasks.length > 0 && (
                        <div className="space-y-2">
                          {projectTasks.map((task) => (
                           <MiniCompactTodoItem
                            title={task.title}
                            completed={task.completed}
                            onToggle={() => {}}
                            projectColor={task.projectColor}
                            description={task.description}
                            project={task.project}
                            dueDate={task.dueDate || task.date}
                            tags={task.tags}
                          />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          {/* Header with Project Title and Description at the top */}
          <div className="mb-4 p-4 bg-b-black-300 text-white rounded">
            <h2 className="text-2xl font-bold">{selectedProject}</h2>
            {projects.find((p) => p.name === selectedProject) && (
              <p className="mt-2">
                {projects.find((p) => p.name === selectedProject)?.description ||
                  "No Description Provided."}
              </p>
            )}
          </div>
          {/* Section for task items beneath the header using tasks from context */}
          <div className="p-4 text-white rounded-lg h-64 flex flex-col">
            <div className="mt-2 flex-grow overflow-y-auto">
              {tasks
                .filter((task) =>
                  task.project.trim().toLowerCase() === selectedProject.trim().toLowerCase()
                )
                .map((task, index) => (
                  <CompactTodoItem
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    project={task.project}
                    dueDate={task.date ? new Date(task.date).toString() : ""}
                    tags={task.tags}
                    completed={task.completed}
                    onToggle={() => handleToggleTodo(index)}
                    onSave={() => {}}
                    projectColor={selectedProjectColor}
                    selectedIcon={undefined}
                    onNavigate={() => {}}
                  />
                ))}
            </div>
          </div>
          {/* Existing notes / markdown editor section if needed */}
          {isEditingNotes ? (
            <div>
              <MdEditor
                value={projectNotes[selectedProject] || ""}
                style={{
                  height: "300px",
                  backgroundColor: "transparent",
                  border: "none",
                }}
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
                {projectNotes[selectedProject] || ""}
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
          currentColor={
            projects[colorPickerProjectIndex!].color ||
            getProjectColorForName(
              projects[colorPickerProjectIndex!].name,
              projects
            )
          }
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