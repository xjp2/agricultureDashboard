import React, { useState } from 'react';
import { MapPin, CloudRain, Calendar, Droplets, Edit, Trash2, TrendingUp } from 'lucide-react';
import { RainfallLocationWithStats } from '../../lib/rainfallTypes';
import EditLocationModal from './EditLocationModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
import { supabase } from '../../lib/supabase';

interface LocationCardProps {
  location: RainfallLocationWithStats;
  onSelect: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
  darkMode: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onSelect,
  onUpdated,
  onDeleted,
  darkMode
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatRainfall = (value: number): string => {
    return `${value.toFixed(1)} mm`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No data';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      
      // Delete all rainfall data for this location first
      const { error: rainfallError } = await supabase
        .from('rainfallData')
        .delete()
        .eq('location_id', location.id);

      if (rainfallError) throw rainfallError;

      // Delete the location
      const { error: locationError } = await supabase
        .from('rainfallLocations')
        .delete()
        .eq('id', location.id);

      if (locationError) throw locationError;

      onDeleted();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Failed to delete location. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdated = () => {
    onUpdated();
    setShowEditModal(false);
  };

  return (
    <>
      <div className={`border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md group cursor-pointer`}>
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400 relative" onClick={onSelect}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <p className="text-white text-lg font-semibold">{location.name}</p>
            {location.description && (
              <p className="text-white/80 text-sm">{location.description}</p>
            )}
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              title="Edit Location"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
              title="Delete Location"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-4" onClick={onSelect}>
          <div className={`grid grid-cols-2 gap-3 mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Rainfall</p>
              <p className={darkMode ? 'text-white' : 'text-gray-900'}>{formatRainfall(location.totalRainfall)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Records</p>
              <p className={darkMode ? 'text-white' : 'text-gray-900'}>{location.entryCount}</p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Last Entry</p>
            <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(location.lastEntry)}</p>
          </div>
          
          <div className="flex justify-between items-center mt-4 border-t pt-3 border-gray-200 dark:border-gray-700">
            <div className="flex items-center" title="Average Rainfall">
              <TrendingUp size={16} className="text-green-500" />
              <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatRainfall(location.averageRainfall)} avg
              </span>
            </div>
            <div className="flex items-center" title="Location">
              <MapPin size={16} className="text-blue-500" />
              <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Location
              </span>
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <button className={`text-xs px-3 py-1.5 rounded-md ${darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>
              Track Rainfall
            </button>
          </div>
        </div>
      </div>

      <EditLocationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onLocationUpdated={handleUpdated}
        location={location}
        darkMode={darkMode}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Location"
        message="Are you sure you want to delete this location? This will also delete all rainfall data for this location."
        itemName={location.name}
        loading={deleting}
        darkMode={darkMode}
      />
    </>
  );
};

export default LocationCard;