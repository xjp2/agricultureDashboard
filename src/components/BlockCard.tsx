import React, { useState } from 'react';
import { Trees, Droplets, Calendar, Hash, Trash2, Edit } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditBlockModal from './EditBlockModal';
import { deleteBlockWithHierarchyUpdate } from '../lib/hierarchicalData';
import { useLanguage } from '../contexts/LanguageContext';

interface BlockCardProps {
  id: number;
  block: string;
  area?: number;
  trees?: number;
  density?: number;
  datePlanted?: string;
  task?: number;
  fkPhase?: string;
  darkMode?: boolean;
  onViewTask: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

const BlockCard: React.FC<BlockCardProps> = ({
  id,
  block,
  area,
  trees,
  density,
  datePlanted,
  task,
  fkPhase,
  darkMode = false,
  onViewTask,
  onDeleted,
  onUpdated
}) => {
  const { t } = useLanguage();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatNumber = (num?: number) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteBlockWithHierarchyUpdate(id);
      onDeleted();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting block:', error);
      alert('Failed to delete block. Please try again.');
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
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400 relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <p className="text-white/80 text-sm">Block {block}</p>
            {fkPhase && (
              <p className="text-white/60 text-xs">Phase {fkPhase}</p>
            )}
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              title="Edit Block"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
              title="Delete Block"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className={`grid grid-cols-2 gap-3 mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Area</p>
              <p className={darkMode ? 'text-white' : 'text-gray-900'}>{area ? `${formatNumber(area)} acre` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Trees</p>
              <p className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(trees)}</p>
            </div>
          </div>

          {datePlanted && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('datePlanted')}</p>
              <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(datePlanted)}</p>
            </div>
          )}
          
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
            {task && (
              <div className="flex items-center" title="Task">
                <Hash size={16} className="text-purple-500" />
                <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{task}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-4">
            <button 
              onClick={onViewTask}
              className={`text-xs px-3 py-1.5 rounded-md ${darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
            >
              {t('viewTask')}
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Block"
        message={t('deleteBlockWarning')}
        itemName={`Block ${block}`}
        loading={deleting}
        darkMode={darkMode}
      />

      <EditBlockModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onBlockUpdated={handleUpdated}
        blockId={id}
        currentBlockName={block}
        darkMode={darkMode}
      />
    </>
  );
};

export default BlockCard;