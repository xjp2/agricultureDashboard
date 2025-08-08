import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { YearFertilizerData, FertilizerEntry } from '../../lib/fertilizerTypes';

interface FertilizerEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryAdded: () => void;
  phaseId: number;
  blockId: number;
  month: string;
  year: number;
  blockName: string;
  darkMode: boolean;
}

const FertilizerEntryModal: React.FC<FertilizerEntryModalProps> = ({
  isOpen,
  onClose,
  onEntryAdded,
  phaseId,
  blockId,
  month,
  year,
  blockName,
  darkMode
}) => {
  const [entries, setEntries] = useState<FertilizerEntry[]>([{ fertilizer_name: '', kilogram_amount: 0 }]);
  const [existingEntries, setExistingEntries] = useState<YearFertilizerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchExistingEntries();
    }
  }, [isOpen, phaseId, blockId, month]);

  const fetchExistingEntries = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('yearFertilizerData')
        .select('*')
        .eq('phase_id', phaseId)
        .eq('block_id', blockId)
        .eq('month', month)
        .order('created_at');

      if (fetchError) throw fetchError;

      setExistingEntries(data || []);
    } catch (err) {
      console.error('Error fetching existing entries:', err);
    }
  };

  const addEntry = () => {
    setEntries([...entries, { fertilizer_name: '', kilogram_amount: 0 }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index: number, field: keyof FertilizerEntry, value: string | number) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setEntries(updatedEntries);
  };

  const deleteExistingEntry = async (entryId: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('yearFertilizerData')
        .delete()
        .eq('id', entryId);

      if (deleteError) throw deleteError;

      await fetchExistingEntries();
      // Trigger refresh of parent component
      onEntryAdded();
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate entries
      const validEntries = entries.filter(
        entry => entry.fertilizer_name.trim() && entry.kilogram_amount > 0
      );

      if (validEntries.length === 0) {
        throw new Error('Please add at least one valid fertilizer entry');
      }

      // Insert new entries
      const insertData = validEntries.map(entry => ({
        phase_id: phaseId,
        block_id: blockId,
        month,
        year,
        fertilizer_name: entry.fertilizer_name.trim(),
        kilogram_amount: entry.kilogram_amount
      }));

      const { error: insertError } = await supabase
        .from('yearFertilizerData')
        .insert(insertData);

      if (insertError) throw insertError;

      onEntryAdded();
    } catch (err) {
      console.error('Error adding entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to add entries');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = () => {
    return new Date(month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-green-900/20' : 'bg-green-100'} mr-3`}>
              <Package size={20} className="text-green-500" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Add Fertilizer Entries
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Block {blockName} - {getMonthName()}
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

        {/* Existing Entries */}
        {existingEntries.length > 0 && (
          <div className="mb-6">
            <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Existing Entries
            </h3>
            <div className="space-y-2">
              {existingEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {entry.fertilizer_name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {entry.kilogram_amount} kg/palm
                    </p>
                  </div>
                  <button
                    onClick={() => deleteExistingEntry(entry.id)}
                    className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              New Entries
            </h3>
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={index}
                  className={`flex gap-3 p-3 rounded-md border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Fertilizer name"
                      value={entry.fertilizer_name}
                      onChange={(e) => updateEntry(index, 'fertilizer_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-green-500`}
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="kg/palm"
                      value={entry.kilogram_amount || ''}
                      onChange={(e) => updateEntry(index, 'kilogram_amount', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-green-500`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEntry(index)}
                    disabled={entries.length === 1}
                    className={`p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={addEntry}
              className={`mt-3 flex items-center px-3 py-2 text-sm rounded-md ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <Plus size={16} className="mr-1" />
              Add Another Entry
            </button>
          </div>

          <div className="flex gap-3 pt-4">
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
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Package size={16} className="mr-1" />
                  Add Entries
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FertilizerEntryModal;