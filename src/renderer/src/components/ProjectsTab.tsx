import { useState, useEffect } from 'react';
import CompactTodoItem from './CompactTodoItem';
import EditProjectsModal from './EditProjectsModal';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/markdown.css';

const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true });

interface Project {
  name: string;
  color: string;
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
  };

  const handleEditorChange = ({ text }: { text: string }) => {
    setProjectNotes({
      ...projectNotes,
      [selectedProject]: text,
    });
  };

  const handleSave = () => {
    localStorage.setItem('projectNotes', JSON.stringify(projectNotes));
    setIsEditingNotes(false);
  };

  const projectTodos = todos.filter(todo => todo.project === selectedProject);
  const selectedProjectColor = projects.find(project => project.name === selectedProject)?.color || 'inherit';

  return (
    <div>
      <div className='flex mb-4 items-center'>
        <button
          onClick={() => setIsEditingProjects(true)}
          className='p-1 px-2 bg-yellow-500 text-white rounded ml-2'
        >
          <i className="fas fa-plus"></i>
        </button>
        <button
          onClick={() => setIsEditingNotes(true)}
          className='p-1 px-2 bg-yellow-500 text-white rounded mx-2'
        >
          <i className="fas fa-pencil-alt"></i>
        </button>

        <div className='border-x-2 border-b-white-400 pr-2 flex'>
          <button
            onClick={() => handleProjectSelect('all')}
            className={`p-1 px-2 rounded ml-2 ${selectedProject === 'all' ? 'bg-blue-500 text-white' : 'bg-b-white-200 text-b-white-100'}`}
            style={{ backgroundColor: selectedProject === 'all' ? '#A0AEC0' : '#E5E7EB' }}
          >
            All Projects
          </button>
          {projects.map((project, index) => (
            <button
              key={index}
              onClick={() => handleProjectSelect(project)}
              className={`p-1 px-2 rounded ml-2 ${selectedProject === project.name ? 'bg-blue-500 text-white' : 'bg-b-white-200 text-b-white-100'}`}
              style={{ backgroundColor: selectedProject === project.name ? project.color : '#E5E7EB' }}
            >
              {project.name}
            </button>
          ))}
          <button
            onClick={() => handleProjectSelect('Unassigned')}
            className={`p-1 rounded ml-2 hover:bg-b-blue-100 hover:text-b-white-100 ${selectedProject === 'Unassigned' ? 'bg-b-blue-300 text-white' : 'bg-gray-200 text-white'}`}
          >
            Unassigned
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
          <h2 className="text-xl font-bold mb-4">All Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, index) => (
              <div
                key={index}
                className="p-4 rounded shadow cursor-pointer"
                style={{ backgroundColor: project.color }}
                onClick={() => handleProjectSelect(project)}
              >
                <h3 className="text-lg font-semibold">{project.name}</h3>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className='flex flex-col mt-4'>
            {projectTodos.map((todo, index) => (
              <CompactTodoItem
                key={index}
                title={todo.title}
                description={todo.description}
                project={todo.project}
                dueDate={todo.date.toString()}
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
                className='p-2 bg-blue-500 text-white rounded mt-2'
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
    </div>
  );
};

export default ProjectsTab;