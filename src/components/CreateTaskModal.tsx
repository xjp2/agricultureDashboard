import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createTaskWithHierarchyUpdate } from '../lib/hierarchicalData';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  blockIdentifier: string;
  darkMode?: boolean;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  blockIdentifier,
  darkMode = false
}) => {
  const [formData, setFormData] = useState({
    task: '',
    area: '',
    trees: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.task.trim()) {
        throw new Error('Task name is required');
      }

      // Check if task already exists
      const { data: existingTask } = await supabase
        .from('TaskData')
        .select('Task')
        .eq('Task', formData.task.trim())
        .single();

      if (existingTask) {
        throw new Error('Task name already exists');
      }

      // Create new task and update hierarchy
      await createTaskWithHierarchyUpdate({
        Task: formData.task.trim(),
        Area: formData.area ? parseFloat(formData.area) : null,
        Trees: formData.trees ? parseInt(formData.trees) : null,
        FK_Block: blockIdentifier
      });

      // Reset form and close modal
      setFormData({
        task: '',
        area: '',
        trees: ''
      });
      onTaskCreated();
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Create New Task for Block {blockIdentifier}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Task Name *
            </label>
            <input
              type="text"
              name="task"
              value={formData.task}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Enter task name (e.g., Task 1, Planting-A, etc.)"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Area (acres)
            </label>
            <input
              type="number"
              step="0.1"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Enter area in acres"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Number of Trees
            </label>
            <input
              type="number"
              name="trees"
              value={formData.trees}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Enter number of trees"
            />
          </div>

          {formData.area && formData.trees && (
            <div className={`p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <strong>Calculated Density:</strong> {
                  parseFloat(formData.area) > 0 && parseInt(formData.trees) > 0
                    ? (parseInt(formData.trees) / parseFloat(formData.area)).toFixed(2)
                    : '0'
                } trees/ha
              </p>
            </div>
          )}

          <div className={`p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Note:</strong> Density will be automatically calculated as Trees ÷ Area. 
              Creating this task will update the parent block and phase data with the aggregated values.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 border rounded-md ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus size={16} className="mr-1" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;