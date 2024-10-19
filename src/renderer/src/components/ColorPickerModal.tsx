import React from 'react';
import Modal from 'react-modal';
import { CirclePicker } from 'react-color';

Modal.setAppElement('#root'); // Set the root element for accessibility

const ColorPickerModal = ({ isOpen, onRequestClose, currentColor, onColorChange }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Color Picker"
      className="color-picker-modal"
      overlayClassName="color-picker-overlay"
    >
      <div className="flex flex-col items-center p-4">
        <h2 className="text-xl mb-4">Pick a Color</h2>
        <CirclePicker
          color={currentColor}
          onChangeComplete={(color) => onColorChange(color.hex)}
          className='m-2 p-1 rounded-md'
        />
        <button onClick={onRequestClose} className="mt-4 p-2 bg-blue-500 text-white rounded">
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ColorPickerModal;