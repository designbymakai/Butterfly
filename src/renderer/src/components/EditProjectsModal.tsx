import { useState } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faPlus, faTrash, faCircle, faPencil } from '@fortawesome/free-solid-svg-icons';
import ColorPickerModal from './ColorPickerModal';
import { getRandomProjectColor } from '../utils/projectColors';
import '../assets/Modal.css';

const EditProjectsModal = ({ isOpen, onRequestClose, projects, setProjects }) => {
  const [newProjectName, setNewProjectName] = useState('');
  // Set default new project color to a random project color
  const [newProjectColor, setNewProjectColor] = useState(getRandomProjectColor());
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [editingProjectColor, setEditingProjectColor] = useState('#000000'); // or getRandomProjectColor() if desired

  const handleAddProject = () => {
    if (newProjectName.trim() !== '') {
      setProjects([...projects, { name: newProjectName.trim(), color: newProjectColor }]);
      setNewProjectName('');
      setNewProjectColor(getRandomProjectColor()); // Reset color with a new random project color
    }
  };

  // Remove the defaultColor block that referenced "initialColor"

  const handleDeleteProject = (project) => {
    setProjects(projects.filter(p => p.name !== project.name));
  };

  const handleEditProject = (index) => {
    setEditingProjectIndex(index);
    setEditingProjectName(projects[index].name);
    setEditingProjectColor(projects[index].color || '#000000');
  };

  const handleSaveEditProject = () => {
    if (editingProjectName.trim() !== '' && editingProjectIndex !== null) {
      const updatedProjects = [...projects];
      updatedProjects[editingProjectIndex] = {
        ...updatedProjects[editingProjectIndex],
        name: editingProjectName.trim(),
        color: editingProjectColor,
      };
      setProjects(updatedProjects);
      setEditingProjectIndex(null);
      setEditingProjectName('');
      setEditingProjectColor('#000000');
    }
  };

  const handleColorChange = (newColor) => {
    if (editingProjectIndex !== null) {
      setEditingProjectColor(newColor);
    } else {
      setNewProjectColor(newColor);
    }
    setIsColorPickerOpen(false);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={onRequestClose} 
      className="flex flex-col items-center justify-evenly w-fit h-fit absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl"
      overlayClassName="modal-overlay"
      contentLabel="Edit Projects"
    >
      <div className='p-4 bg-b-black-300 rounded-lg'>
        <h2 className='text-2xl py-3 text-b-white-100'>Edit Projects</h2>
        <div className='flex flex-row items-center'>
          <input
            type='text'
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder='New Project Name'
            className='mb-2 p-1 bg-transparent mr-2 py-3'
          />
          <FontAwesomeIcon
            icon={faCircle}
            style={{ color: newProjectColor }}
            size="2x"
            onClick={() => setIsColorPickerOpen(true)}
            className="cursor-pointer"
          />
          <button onClick={handleAddProject} className='p-2 bg-b-blue-500 text-white rounded-lg hover:bg-b-blue-300'>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <div className='mt-4 text-b-white-100'>
          {projects.map((project, index) => (
            <div key={index} className='flex items-center mb-2'>
              {editingProjectIndex === index ? (
                <div className='flex items-center'>
                  
                  <input
                    type='text'
                    value={editingProjectName}
                    onChange={(e) => setEditingProjectName(e.target.value)}
                    className='border-b-2 border-gray-300 mb-2 p-1 bg-transparent py-3 flex-grow'
                  />
                  <FontAwesomeIcon
                    icon={faCircle}
                    color={editingProjectColor}
                    size="2x"
                    onClick={() => setIsColorPickerOpen(true)}
                    className="cursor-pointer mx-2"
                  />
                  <button onClick={() => handleDeleteProject(project)} className='p-2  text-b-white-100 rounded'>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button onClick={handleSaveEditProject} className='p-2 bg-b-green-500 hover:bg-b-green-300 text-white rounded-lg ml-2'>
                    <FontAwesomeIcon icon={faPencil} />
                  </button>
                </div>
              ) : (
                <>
                  <span className='flex-grow'>{project.name}</span>
                  <FontAwesomeIcon
                    icon={faCircle}
                    color={project.color}
                    size="2x"
                    className="mx-2"
                  />
                  <button onClick={() => handleEditProject(index)} className='p-2 bg-b-orange-500 hover:bg-b-orange-300 text-white rounded-lg ml-2'>
                    <FontAwesomeIcon icon={faPencil} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <button onClick={onRequestClose} className='p-2 bg-gray-500 text-white rounded mt-4 mb-4'>
          <FontAwesomeIcon icon={faClose} />
        </button>
        <ColorPickerModal
          isOpen={isColorPickerOpen}
          onRequestClose={() => setIsColorPickerOpen(false)}
          currentColor={editingProjectIndex !== null ? editingProjectColor : newProjectColor}
          onColorChange={handleColorChange}
        />
      </div>
    </Modal>
  );
};

export default EditProjectsModal;