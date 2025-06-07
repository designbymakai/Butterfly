import Modal from 'react-modal';
import { CirclePicker } from 'react-color';
import { projectColors } from '../utils/projectColors'; // use your project colors here
import '../assets/Modal.css';

Modal.setAppElement('#root');

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
        <h2 className="text-xl mb-4 text-b-white-100">Pick a Color</h2>
        <CirclePicker
          color={currentColor}
          onChangeComplete={(color) => onColorChange(color.hex)}
          colors={projectColors}  // now using projectColors from your utils
          className="m-2 p-1 rounded-md"
        />
        <button
          onClick={onRequestClose}
          className="mt-4 p-2 bg-b-blue-500 hover:bg-b-blue-300 text-white rounded"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ColorPickerModal;