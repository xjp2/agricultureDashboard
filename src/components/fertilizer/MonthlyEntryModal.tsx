import React, { useState, useEffect } from 'react';
import { X, Calendar, Trash2 } from 'lucide-react';
import { supabase, BlockData } from '../../lib/supabase';
import { MonthFertilizerData } from '../../lib/fertilizerTypes';
import { useLanguage } from '../../contexts/LanguageContext';

interface MonthlyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryAdded: () => void;
  phaseId: number;
  date: string;
  blocks: BlockData[];
  darkMode: boolean;
}

const MonthlyEntryModal: React.FC<MonthlyEntryModalProps> = ({
  isOpen,
  onClose,
  onEntryAdded,
  phaseId,
  date,
  blocks,
  darkMode
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    workerName: '',
    block_id: '',
    bag: 10 as 10 | 50,
    quantity: 1
  });
  const [existingEntries, setExistingEntries] = useState<(MonthFertilizerData & { block_name: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchExistingEntries();
      // Reset form
      setFormData({
        workerName: '',
        block_id: '',
        bag: 10,
        quantity: 1
      });
    }
  }, [isOpen, phaseId, date]);

  const fetchExistingEntries = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('monthFertilizerData')
        .select(`
          *,
          BlockData!inner(Block)
        `)
        .eq('phase_id', phaseId)
        .eq('date', date)
        .order('created_at');

      if (fetchError) throw fetchError;

      const entriesWithBlockName = (data || []).map(entry => ({
        ...entry,
        block_name: (entry as any).BlockData.Block
      }));

      setExistingEntries(entriesWithBlockName);
    } catch (err) {
      console.error('Error fetching existing entries:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bag' ? parseInt(value) as 10 | 50 : 
               name === 'quantity' ? parseInt(value) || 1 : value
    }));
  };

  const deleteExistingEntry = async (entryId: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('monthFertilizerData')
        .delete()
        .eq('id', entryId);

      if (deleteError) throw deleteError;

      await fetchExistingEntries();
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
      // Validate form
      if (!formData.workerName.trim()) {
        throw new Error(t('workerNameRequired'));
      }
      if (!formData.block_id) {
        throw new Error(t('pleaseSelectBlock'));
      }

      const { error: insertError } = await supabase
        .from('monthFertilizerData')
        .insert({
          phase_id: phaseId,
          block_id: parseInt(formData.block_id),
          date,
          name: formData.workerName.trim(),
          bag: formData.bag,
          quantity: formData.quantity
        });

      if (insertError) throw insertError;

      onEntryAdded();
    } catch (err) {
      console.error('Error adding entry:', err);
      setError(err instanceof Error ? err.message : t('failedToAddEntry'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = () => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100'} mr-3`}>
              <Calendar size={20} className="text-blue-500" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('dailyFertilizerApplication')}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatDate()}
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
              {t('existingApplications')}
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
                      {entry.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('block')} {entry.block_name} • {entry.bag}{t('kg')} × {entry.quantity} = {entry.bag * entry.quantity}{t('kg')}
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
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('workerName')} *
            </label>
            <input
              type="text"
              name="workerName"
              value={formData.workerName}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder={t('enterWorkerName')}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('block')} *
            </label>
            <select
              name="block_id"
              value={formData.block_id}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">{t('selectBlock')}</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {t('block')} {block.Block}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('bagSize')} *
            </label>
            <select
              name="bag"
              value={formData.bag}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value={10}>10 kg</option>
              <option value={50}>50 kg</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('quantity')} *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              required
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder={t('enterQuantity')}
            />
          </div>

          {formData.bag && formData.quantity && (
            <div className={`p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <strong>{t('totalWeight')}:</strong> {formData.bag} {t('kg')} × {formData.quantity} = {formData.bag * formData.quantity} {t('kg')}
              </p>
            </div>
          )}

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
              {t('cancel')}
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
                  <Calendar size={16} className="mr-1" />
                  {t('addApplication')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonthlyEntryModal;