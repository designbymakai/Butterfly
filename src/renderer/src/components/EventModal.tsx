import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faClose, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import ColorPickerModal from './ColorPickerModal';
import { getRandomProjectColor } from '../utils/projectColors';
import '../assets/Modal.css';

Modal.setAppElement('#root');

const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = (num) => (num < 10 ? '0' + num : num);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface Event {
  title: string;
  description: string;
  start: Date;
  end: Date;
  color: string;
}

interface EventModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSave: (event: Event) => void;
  onDelete: () => void;
  initialTitle: string;
  initialStart: Date;
  initialEnd: Date;
  initialColor: string;
  initialDescription: string;
  event?: Event;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onRequestClose,
  onSave,
  onDelete,
  initialTitle,
  initialStart,
  initialEnd,
  initialColor,
  initialDescription,
}) => {
  
  // If initialColor is undefined or an empty string, use a random project color
const defaultColor =
  initialColor &&
  initialColor.trim() !== '' &&
  initialColor !== '#000000'
    ? initialColor
    : getRandomProjectColor();
    
    useEffect(() => {
  console.log("Using default color:", defaultColor);
}, [defaultColor]);

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [startTime, setStartTime] = useState(formatDateForInput(initialStart));
  const [endTime, setEndTime] = useState(formatDateForInput(initialEnd));
  const [color, setColor] = useState(defaultColor);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setStartTime(formatDateForInput(initialStart));
    setEndTime(formatDateForInput(initialEnd));
    setColor(initialColor && initialColor.trim() !== '' ? initialColor : getRandomProjectColor());
  }, [initialTitle, initialDescription, initialStart, initialEnd, initialColor]);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setIsColorPickerOpen(false);
  };

  const handleSave = () => {
    const updatedEvent: Event = {
      title,
      description,
      start: new Date(startTime),
      end: new Date(endTime),
      color,
    };
    onSave(updatedEvent);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Event Modal"
      className="event-modal"
      overlayClassName="event-overlay"
    >
      <div className="flex flex-col items-center pb-4">
        <h2 className="text-xl mb-4 text-b-white-100">New Event</h2>
        <div className="flex items-center mb-4">
          <span className="mr-2 text-b-white-100">Color:</span>
          <FontAwesomeIcon
              icon={faCircle}
              style={{ color: defaultColor }}
              size="2x"
              onClick={() => setIsColorPickerOpen(true)}
              className="cursor-pointer"
          />
        </div>
        {/* The rest of your form */}
        <div className="mb-4 w-full">
          <label className="block text-left mb-2 text-b-white-100">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded text-b-white-100"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-left mb-2 text-b-white-100">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded text-b-white-100"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-left mb-2 text-b-white-100">Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border rounded text-b-white-500"
          />
        </div>
        <div className="mb-4 w-full text-b-white-100">
          <label className="block text-left mb-2">End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border rounded text-b-white-500"
          />
        </div>
        <div className="flex justify-end w-full mx-auto">
          <button onClick={handleSave} className="mx-2 px-2 py-1 bg-b-green-500 hover:bg-b-green-300 text-b-white-200 rounded">
            Save
          </button>
          <button onClick={onRequestClose} className="mx-2 px-2 py-1 bg-b-blue-500 hover:bg-b-blue-300 text-b-white-200 rounded">
            Cancel
          </button>
          <button onClick={onDelete} className="mx-2 px-2 py-1 bg-b-orange-500 hover:bg-b-orange-300 text-b-white-200 rounded">
            Delete
          </button>
        </div>
      </div>
      <ColorPickerModal
        isOpen={isColorPickerOpen}
        onRequestClose={() => setIsColorPickerOpen(false)}
        currentColor={color}
        onColorChange={handleColorChange}
      />
    </Modal>
  );
};

export default EventModal;