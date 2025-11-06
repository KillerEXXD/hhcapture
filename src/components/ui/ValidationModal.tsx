/**
 * ValidationModal Component
 *
 * A nice-looking modal for displaying validation errors
 * Features:
 * - Clean, centered design
 * - Auto-focus on OK button
 * - Refocuses on the input that caused the error when closed
 */

import React, { useEffect, useRef } from 'react';

interface ValidationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  inputRef
}) => {
  const okButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus OK button when modal opens
  useEffect(() => {
    if (isOpen && okButtonRef.current) {
      okButtonRef.current.focus();
    }
  }, [isOpen]);

  // Refocus on input when modal closes
  const handleClose = () => {
    onClose();

    // Refocus the input after a short delay
    setTimeout(() => {
      if (inputRef?.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 100);
  };

  // Handle Enter key on OK button
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-white text-2xl">⚠️</div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
        </div>

        {/* Message */}
        <div className="px-6 py-6">
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button
            ref={okButtonRef}
            onClick={handleClose}
            onKeyDown={handleKeyDown}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
