import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DebtOption } from '../../lib/debtTypes';
import { useLanguage } from '../../contexts/LanguageContext';

interface DebtOptionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  debtOptions: DebtOption[];
  onDebtOptionUpdated: () => void;
  darkMode: boolean;
}

const DebtOptionManager: React.FC<DebtOptionManagerProps> = ({
  isOpen,
  onClose,
  debtOptions,
  onDebtOptionUpdated,
  darkMode
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    category_name: '',
    description: ''
  });
  const [editingOption, setEditingOption] = useState<DebtOption | null>(null);
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
    
    if (!formData.category_name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const debtData = {
        category_name: formData.category_name.trim(),
        description: formData.description.trim() || null
      };

      if (editingOption) {
        const { error: updateError } = await supabase
          .from('debtOption')
          .update(debtData)
          .eq('id', editingOption.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('debtOption')
          .insert(debtData);

        if (insertError) throw insertError;
      }

      // Reset form
      setFormData({ category_name: '', description: '' });
      setEditingOption(null);
      onDebtOptionUpdated();
    } catch (err: any) {
      console.error('Error saving debt option:', err);
      if (err.code === '23505') {
        setError('Category name already exists');
      } else {
        setError(err.message || 'Failed to save debt category');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (option: DebtOption) => {
    setEditingOption(option);
    setFormData({
      category_name: option.category_name,
      description: option.description || ''
    });
    setError(null);
  };

  const handleDelete = async (option: DebtOption) => {
    if (!confirm(`Are you sure you want to delete "${option.category_name}"?`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('debtOption')
        .delete()
        .eq('id', option.id);

      if (deleteError) throw deleteError;

      onDebtOptionUpdated();
    } catch (err: any) {
      console.error('Error deleting debt option:', err);
      if (err.code === '23503') {
        setError('Cannot delete debt category that is being used in debt records');
      } else {
        setError(err.message || 'Failed to delete debt category');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ category_name: '', description: '' });
    setEditingOption(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-red-900/20' : 'bg-red-100'} mr-3`}>
              <Settings size={20} className="text-red-500" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Manage Debt Categories
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Add, edit, or remove debt category types
              </p>
            </div>
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

        {/* Add/Edit Form */}
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} mb-6`}>
          <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingOption ? 'Edit Debt Category' : 'Add New Debt Category'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Category Name *
              </label>
              <input
                type="text"
                name="category_name"
                value={formData.category_name}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-600 border-gray-500 text-white focus:ring-red-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-red-500'
                } focus:outline-none focus:ring-2`}
                placeholder="Enter debt category name (e.g., BOH HING, TONG GAS, ROKOK)"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-600 border-gray-500 text-white focus:ring-red-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-red-500'
                } focus:outline-none focus:ring-2`}
                placeholder="Optional description for this debt category"
              />
            </div>

            <div className="flex gap-2">
              {editingOption && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className={`px-3 py-2 border rounded-md text-sm ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    {editingOption ? <Edit size={16} className="mr-1" /> : <Plus size={16} className="mr-1" />}
                    {editingOption ? 'Update' : 'Add'} Category
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Debt Categories */}
        <div>
          <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Existing Debt Categories ({debtOptions.length})
          </h3>
          
          {debtOptions.length === 0 ? (
            <div className="text-center py-8">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                No debt categories available. Add your first category above.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {debtOptions.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    editingOption?.id === option.id
                      ? darkMode ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-300'
                      : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {option.category_name}
                    </p>
                    {option.description && (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {option.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(option)}
                      className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-100 text-blue-600'}`}
                      title={t('editDebtCategoryTooltip')}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(option)}
                      className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                      title={t('deleteDebtCategory')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtOptionManager;