import { useState } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faPlus, faTrash, faCircle } from '@fortawesome/free-solid-svg-icons';
import ColorPickerModal from './ColorPickerModal'; // Import ColorPickerModal

const EditProjectsModal = ({ isOpen, onRequestClose, projects, setProjects }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#000000'); // Default color
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [editingProjectColor, setEditingProjectColor] = useState('#000000'); // Default color

  const handleAddProject = () => {
    if (newProjectName.trim() !== '') {
      setProjects([...projects, { name: newProjectName.trim(), color: newProjectColor }]);
      setNewProjectName('');
      setNewProjectColor('#000000'); // Reset color
    }
  };

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
      className="flex flex-col items-center justify-evenly bg-b-white-100 w-fit h-fit absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl"
      overlayClassName="modal-overlay"
      contentLabel="Edit Projects"
    >
      <div className='p-4'>
      <h2 className='text-2xl py-3'>Edit Projects</h2>
      <div className='flex flex-row items-center'>
        <input
          type='text'
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder='New Project Name'
          className='border-b-2 border-gray-300 mb-2 p-1 bg-transparent mr-2 py-3'
        />
        <FontAwesomeIcon
          icon={faCircle}
          color={newProjectColor}
          size="2x"
          onClick={() => setIsColorPickerOpen(true)}
          className="cursor-pointer mx-2"
        />
        <button onClick={handleAddProject} className='p-2 bg-blue-500 text-white rounded'>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
      <div className='mt-4'>
        {projects.map((project, index) => (
          <div key={index} className='flex items-center mb-2'>
            {editingProjectIndex === index ? (
              <div className='flex items-center'>
              <button onClick={() => handleDeleteProject(project)} className='p-2 bg-b-orange-300 text-b-white-100 rounded'>
                <FontAwesomeIcon icon={faTrash} />
              </button>
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
                <button onClick={handleSaveEditProject} className='p-2 bg-green-500 text-white rounded ml-2'>
                  Save
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
                <button onClick={() => handleEditProject(index)} className='p-2 bg-yellow-500 text-white rounded ml-2'>
                  Edit
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