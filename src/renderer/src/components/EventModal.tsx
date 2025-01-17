import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import ColorPickerModal from './ColorPickerModal';

Modal.setAppElement('#root'); // Set the root element for accessibility

const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = (num) => (num < 10 ? '0' + num : num);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EventModal = ({ isOpen, onRequestClose, event = {}, onSave }) => {
  const [title, setTitle] = useState(event.title || '');
  const [description, setDescription] = useState(event.description || '');
  const [startTime, setStartTime] = useState(formatDateForInput(event.start) || '');
  const [endTime, setEndTime] = useState(formatDateForInput(event.end) || '');
  const [color, setColor] = useState(event.color || '#000000');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  useEffect(() => {
    setTitle(event.title || '');
    setDescription(event.description || '');
    setStartTime(formatDateForInput(event.start) || '');
    setEndTime(formatDateForInput(event.end) || '');
    setColor(event.color || '#000000');
  }, [event]);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setIsColorPickerOpen(false);
  };

  const handleSave = () => {
    const updatedEvent = {
      ...event,
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
      <div className="flex flex-col items-center p-4">
        <h2 className="text-xl mb-4">Edit Event</h2>
        <div className="flex items-center mb-4">
          <span className="mr-2">Color:</span>
          <FontAwesomeIcon
            icon={faCircle}
            color={color}
            size="2x"
            onClick={() => setIsColorPickerOpen(true)}
            className="cursor-pointer"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-left mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-left mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-left mb-2">Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-left mb-2">End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex justify-end w-full">
          <button onClick={handleSave} className="mr-2 p-2 bg-green-500 text-white rounded">
            Save
          </button>
          <button onClick={onRequestClose} className="p-2 bg-red-500 text-white rounded">
            Cancel
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