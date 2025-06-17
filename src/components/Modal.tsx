import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-black/80 w-full max-w-2xl rounded-xl shadow-lg border border-gray-800 max-h-[80vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
