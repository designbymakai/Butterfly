import React from 'react';

interface SelectorModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const SelectorModal: React.FC<SelectorModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />
      {/* Modal container */}
      <div className="bg-white rounded-lg shadow-lg z-10 max-w-md w-full p-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-900 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SelectorModal;