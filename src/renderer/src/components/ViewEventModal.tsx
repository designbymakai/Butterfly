import { useState } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faClose, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import ColorPickerModal from './ColorPickerModal';
import moment from 'moment'; // Import moment

Modal.setAppElement('#root'); // Set the root element for accessibility

const ViewEventModal = ({ isOpen, onRequestClose, onEdit, onDelete, event, onColorChange }) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  if (!event) return null;

  const handleColorChange = (newColor) => {
    onColorChange(newColor);
    setIsColorPickerOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="View Events"
      className="flex flex-col items-center justify-evenly bg-b-white-100 w-fit h-fit absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl"
      overlayClassName="modal-overlay"
    >
      <h2 className='text-b-black-100 pt-3 mt-2 text-xl'>{event.title}</h2>
      <div className='flex flex-col left-0 m-5'>
        <p className='text-b-black-100'>Start: {moment(event.start).format('DD/MM/YYYY HH:mm')}</p>
        <p className='text-b-black-100'>End: {moment(event.end).format('DD/MM/YYYY HH:mm')}</p>
        <p className='text-b-black-100'>Color: <span style={{ color: event.color }}>
          <FontAwesomeIcon
            icon={faCircle}
            onClick={() => setIsColorPickerOpen(true)}
            className="cursor-pointer"
          />
        </span></p>
        <p className='text-b-black-100'>Description: {event.description}</p>
      </div>
      <div className='flex justify-between m-5'>
        <button className='bg-b-green-300 p-2 rounded text-b-white-100' onClick={onEdit}>
          <FontAwesomeIcon icon={faPencil} />
        </button>
        <button className='bg-b-orange-300 p-2 ml-2 rounded text-b-white-100' onClick={onDelete}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <button className='bg-b-blue-300 p-2 ml-2 rounded text-b-white-100' onClick={onRequestClose}>
          <FontAwesomeIcon icon={faClose} />
        </button>
        
      </div>
      <ColorPickerModal
        isOpen={isColorPickerOpen}
        onRequestClose={() => setIsColorPickerOpen(false)}
        currentColor={event.color}
        onColorChange={handleColorChange}
      />
    </Modal>
  );
};

export default ViewEventModal;