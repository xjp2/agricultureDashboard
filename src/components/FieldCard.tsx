import React, { useState } from 'react';
import { Trees, Droplets, Trash2, Edit } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditPhaseModal from './EditPhaseModal';
import { deletePhaseWithHierarchyUpdate } from '../lib/hierarchicalData';
import { useLanguage } from '../contexts/languageContext';
interface FieldCardProps {
  id: string;
  phase: string;
  area: number;
  blockCount: number;
  trees: number;
  density: number;
  darkMode: boolean;
  onViewDetails: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

const FieldCard: React.FC<FieldCardProps> = ({
  id,
  phase,
  area,
  blockCount,
  trees,
  density,
  darkMode,
  onViewDetails,
  onDeleted,
  onUpdated
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deletePhaseWithHierarchyUpdate(parseInt(id));
      onDeleted();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting phase:', error);
      alert('Failed to delete phase. Please try again.');
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
      <div className={`border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md group`}>
        <div className="h-32 bg-gradient-to-r from-green-600 to-green-400 relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <p className="text-white/80 text-sm">Phase {phase}</p>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              title="Edit Phase"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
              title="Delete Phase"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className={`grid grid-cols-2 gap-3 mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Area</p>
              <p className={darkMode ? 'text-white' : 'text-gray-900'}>{area} acres</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Block</p>
              <p className={darkMode ? 'text-white' : 'text-gray-900'}>{blockCount}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 border-t pt-3 border-gray-200 dark:border-gray-700">
            <div className="flex items-center" title="Trees">
              <Trees size={16} className="text-green-500" />
              <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{trees}</span>
            </div>
            <div className="flex items-center" title="Density">
              <Droplets size={16} className="text-blue-500" />
              <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {density ? density.toFixed(2) : '0.00'} /acre
              </span>
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <button 
              onClick={onViewDetails}
              className={`text-xs px-3 py-1.5 rounded-md ${darkMode ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Phase"
        message="Are you sure you want to delete this phase? This will also delete all blocks and tasks within this phase."
        itemName={`Phase ${phase}`}
        loading={deleting}
        darkMode={darkMode}
      />

      <EditPhaseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onPhaseUpdated={handleUpdated}
        phaseId={parseInt(id)}
        currentPhaseName={phase}
        darkMode={darkMode}
      />
    </>
  );
};

export default FieldCard;