import { useState } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faClose, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import ColorPickerModal from './ColorPickerModal';
import moment from 'moment';
import '../assets/Modal.css';

Modal.setAppElement('#root');

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
      className="standard-modal"
      overlayClassName="standard-overlay"
    >
      <div className="flex flex-col items-center w-full">
        <h2 className='text-b-white-100 pt-3 mt-2 text-xl'>{event.title}</h2>
        <div className='flex flex-col m-5'>
          <p className="text-b-white-100 text-lg">
          {moment(event.start).format("dddd, MMM D")} <br/> {moment(event.start).format("h:mm A")} – {moment(event.end).format("h:mm A")}
        </p>
          <p className='text-b-white-100'>Color: <span style={{ color: event.color }}>
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => setIsColorPickerOpen(true)}
              className="cursor-pointer"
            />
          </span></p>
          <p className='text-b-white-100 text-wrap'>Description: <span className='text-sm text-b-white-500'>{event.description}</span></p>
        </div>
        <div className='flex justify-center m-5 w-full'>
          <button className='bg-b-green-500 hover:bg-b-green-300 p-2 rounded-lg text-b-white-100' onClick={onEdit}>
            <FontAwesomeIcon icon={faPencil} />
          </button>
          <button className='bg-b-orange-500 hover:bg-b-orange-300 p-2 ml-2 rounded-lg text-b-white-100' onClick={onDelete}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
          <button className='bg-b-blue-500 hover:bg-b-blue-300 p-2 ml-2 rounded-lg text-b-white-100' onClick={onRequestClose}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <ColorPickerModal
          isOpen={isColorPickerOpen}
          onRequestClose={() => setIsColorPickerOpen(false)}
          currentColor={event.color}
          onColorChange={handleColorChange}
        />
      </div>
    </Modal>
  );
};

export default ViewEventModal;