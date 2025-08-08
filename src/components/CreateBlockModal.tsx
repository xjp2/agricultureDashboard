import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreateBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlockCreated: () => void;
  phaseIdentifier: string;
  darkMode?: boolean;
}

const CreateBlockModal: React.FC<CreateBlockModalProps> = ({
  isOpen,
  onClose,
  onBlockCreated,
  phaseIdentifier,
  darkMode = false
}) => {
  const [formData, setFormData] = useState({
    block: '',
    datePlanted: ''
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
      if (!formData.block.trim()) {
        throw new Error('Block name is required');
      }

      // Check if block already exists
      const { data: existingBlock } = await supabase
        .from('BlockData')
        .select('Block')
        .eq('Block', formData.block.trim())
        .single();

      if (existingBlock) {
        throw new Error('Block name already exists');
      }

      // Create new block with default values (will be calculated from tasks)
      const { error: insertError } = await supabase
        .from('BlockData')
        .insert({
          Block: formData.block.trim(),
          Area: 0,
          Trees: 0,
          Density: 0,
          FK_Phase: phaseIdentifier,
          Date_Planted: formData.datePlanted || null,
          Task: null
        });

      if (insertError) {
        throw insertError;
      }

      // Reset form and close modal
      setFormData({
        block: '',
        datePlanted: ''
      });
      onBlockCreated();
      onClose();
    } catch (err) {
      console.error('Error creating block:', err);
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
            Create New Block for Phase {phaseIdentifier}
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
              Block Name *
            </label>
            <input
              type="text"
              name="block"
              value={formData.block}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter block name (e.g., Block A, North-1, etc.)"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date Planted (Optional)
            </label>
            <input
              type="date"
              name="datePlanted"
              value={formData.datePlanted}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className={`p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Note:</strong> Area, Trees, and Density will be automatically calculated 
              based on the tasks you create within this block.
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
              className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus size={16} className="mr-1" />
                  Create Block
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlockModal;