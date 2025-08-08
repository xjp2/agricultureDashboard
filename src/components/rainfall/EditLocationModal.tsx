import React, { useState } from 'react';
import { X, MapPin, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { RainfallLocation } from '../../lib/rainfallTypes';

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationUpdated: () => void;
  location: RainfallLocation;
  darkMode: boolean;
}

const EditLocationModal: React.FC<EditLocationModalProps> = ({
  isOpen,
  onClose,
  onLocationUpdated,
  location,
  darkMode
}) => {
  const [formData, setFormData] = useState({
    name: location.name,
    description: location.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      if (!formData.name.trim()) {
        throw new Error('Location name is required');
      }

      // Check if location name already exists (excluding current location)
      const { data: existingLocation } = await supabase
        .from('rainfallLocations')
        .select('name')
        .eq('name', formData.name.trim())
        .neq('id', location.id)
        .single();

      if (existingLocation) {
        throw new Error('Location name already exists');
      }

      // Update location
      const { error: updateError } = await supabase
        .from('rainfallLocations')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null
        })
        .eq('id', location.id);

      if (updateError) {
        throw updateError;
      }

      onLocationUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating location:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: location.name,
        description: location.description || ''
      });
      setError(null);
    }
  }, [isOpen, location]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100'} mr-3`}>
              <MapPin size={20} className="text-blue-500" />
            </div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Edit Location
            </h2>
          </div>
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
              Location Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter location name"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Location Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Brief description (e.g., North Field, Main Farm Area)"
            />
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
                  <Edit size={16} className="mr-1" />
                  Update Location
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLocationModal;