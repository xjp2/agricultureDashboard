import React, { useState } from 'react';
import { Trees, Droplets, Hash, MapPin, Trash2 } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';
import { deleteTaskWithHierarchyUpdate } from '../lib/hierarchicalData';

interface TaskCardProps {
  id: number;
  task: string;
  area?: number;
  trees?: number;
  density?: number;
  fkBlock?: string;
  darkMode?: boolean;
  onDeleted: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  task,
  area,
  trees,
  density,
  fkBlock,
  darkMode = false,
  onDeleted
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatNumber = (num?: number) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteTaskWithHierarchyUpdate(id);
      onDeleted();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className={`border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md group`}>
        <div className="h-32 bg-gradient-to-r from-purple-600 to-purple-400 relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <p className="text-white/80 text-sm">Task {task}</p>
            {fkBlock && (
              <p className="text-white/60 text-xs">Block {fkBlock}</p>
            )}
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className={`grid grid-cols-2 gap-3 mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Area</p>
              <p className={darkMode ? 'text-white' : 'text-gray-900'}>{area ? `${formatNumber(area)} ha` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Trees</p>
              <p className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(trees)}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 border-t pt-3 border-gray-200 dark:border-gray-700">
            <div className="flex items-center" title="Trees">
              <Trees size={16} className="text-green-500" />
              <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatNumber(trees)}</span>
            </div>
            <div className="flex items-center" title="Density">
              <Droplets size={16} className="text-blue-500" />
              <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {density ? density.toFixed(2) : 'N/A'} /acre
              </span>
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <button 
              className={`text-xs px-3 py-1.5 rounded-md ${darkMode ? 'bg-purple-900/20 text-purple-400 hover:bg-purple-900/30' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}
            >
              Manage Task
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        itemName={`Task ${task}`}
        loading={deleting}
        darkMode={darkMode}
      />
    </>
  );
};

export default TaskCard;