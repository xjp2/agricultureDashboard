import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  loading?: boolean;
  darkMode?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  loading = false,
  darkMode = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-red-900/20' : 'bg-red-100'} mr-3`}>
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        <div className="mb-6">
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
            {message}
          </p>
          <div className={`p-3 rounded-md ${darkMode ? 'bg-red-900/10 border border-red-900/20' : 'bg-red-50 border border-red-100'}`}>
            <p className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
              {itemName}
            </p>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
            <strong>Warning:</strong> This action cannot be undone and will also update parent hierarchy data.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`flex-1 px-4 py-2 border rounded-md ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Trash2 size={16} className="mr-1" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;