import React, { useState, useEffect } from 'react';
import { Plus, Settings, X, Edit, Trash2, Calculator } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { WorkerData } from '../../lib/workersTypes';
import { DebtData, DebtFormData, DebtOption } from '../../lib/debtTypes';
import DebtOptionManager from './DebtOptionManager';
import { useLanguage } from '../../contexts/LanguageContext';

interface DebtDataEntryProps {
  workers: WorkerData[];
  debtOptions: DebtOption[];
  onDataEntrySuccess: () => void;
  onDebtOptionUpdated: () => void;
  darkMode: boolean;
}

const DebtDataEntry: React.FC<DebtDataEntryProps> = ({
  workers,
  debtOptions,
  onDataEntrySuccess,
  onDebtOptionUpdated,
  darkMode
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<DebtFormData>({
    month_year: '',
    worker_name: '',
    category: '',
    amount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebtManager, setShowDebtManager] = useState(false);
  const [recentEntries, setRecentEntries] = useState<DebtData[]>([]);
  const [editingEntry, setEditingEntry] = useState<DebtData | null>(null);

  useEffect(() => {
    fetchRecentEntries();
    // Set default month to current month
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, month_year: currentMonthYear }));

    // Set default category to first available option
    if (debtOptions.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: debtOptions[0].category_name }));
    }
  }, [debtOptions]);

  const fetchRecentEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('debtData')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentEntries(data || []);
    } catch (err) {
      console.error('Error fetching recent entries:', err);
    }
  };

  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    // Generate last 12 months and next 6 months
    for (let i = -12; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthValue);
    }
    
    return months;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue: string | number = value;
    
    if (name === 'amount') {
      processedValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const resetForm = () => {
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setFormData({
      month_year: currentMonthYear,
      worker_name: '',
      category: debtOptions.length > 0 ? debtOptions[0].category_name : '',
      amount: 0
    });
    setEditingEntry(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.month_year || !formData.worker_name || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Convert month format for storage (YYYY-MM to "Month YYYY")
      const [year, month] = formData.month_year.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const formattedMonth = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const debtEntry = {
        month_year: formattedMonth,
        worker_name: formData.worker_name,
        category: formData.category,
        amount: formData.amount
      };

      if (editingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('debtData')
          .update(debtEntry)
          .eq('id', editingEntry.id);

        if (updateError) throw updateError;
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from('debtData')
          .insert(debtEntry);

        if (insertError) throw insertError;
      }

      resetForm();
      onDataEntrySuccess();
      fetchRecentEntries();
    } catch (err: any) {
      console.error('Error saving debt data:', err);
      setError(err.message || 'Failed to save debt data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: DebtData) => {
    // Convert stored month format back to YYYY-MM for the input
    const monthDate = new Date(entry.month_year + ' 01');
    const monthValue = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    
    setFormData({
      month_year: monthValue,
      worker_name: entry.worker_name,
      category: entry.category,
      amount: entry.amount
    });
    setEditingEntry(entry);
  };

  const handleDelete = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this debt entry?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('debtData')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      fetchRecentEntries();
      onDataEntrySuccess();
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  const formatMonthYear = (dateString: string) => {
    return new Date(dateString + ' 01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Data Entry Form */}
      <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {editingEntry ? 'Edit Debt Entry' : 'Add New Debt Entry'}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {editingEntry ? 'Update worker debt information' : 'Record worker debt for payroll calculation'}
            </p>
          </div>
          {editingEntry && (
            <button
              onClick={resetForm}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <X size={16} className="mr-1" />
              Cancel Edit
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Month/Year */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('monthYear')} *
              </label>
              <input
                type="month"
                name="month_year"
                value={formData.month_year}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>

            {/* Worker Name */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('workerName')} *
              </label>
              <select
                name="worker_name"
                value={formData.worker_name}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              >
                <option value="">{t('selectWorker')}</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.Name}>
                    {worker.Name} ({worker.EID})
                  </option>
                ))}
              </select>
            </div>

            {/* Debt Category */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('debtCategory')} *
              </label>
              <div className="flex items-end gap-2">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className={`flex-1 px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                >
                  <option value="">{t('selectCategory')}</option>
                  {debtOptions.map(option => (
                    <option key={option.id} value={option.category_name}>
                      {option.category_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowDebtManager(true)}
                  className={`px-3 py-2 rounded-md text-sm ${
                    darkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                  title={t('manageDebtCategories')}
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('amount')} *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="amount"
                value={formData.amount || ''}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {editingEntry && (
              <button
                type="button"
                onClick={resetForm}
                className={`px-4 py-2 border rounded-md ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('cancel')}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              {editingEntry ? t('updateDebtEntry') : t('addEntry')}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Entries */}
      <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={\`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('recentDebtEntries')}
        </h3>
        
        {recentEntries.length === 0 ? (
          <div className="text-center py-8">
            <Calculator size={48} className="mx-auto mb-4 text-gray-400" />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {t('noDebtEntriesFound')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={\`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('monthYear')}
                  </th>
                  <th className={\`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('workerName')}
                  </th>
                  <th className={\`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('category')}
                  </th>
                  <th className={\`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('amount')}
                  </th>
                  <th className={\`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className={\`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {recentEntries.map((entry) => (
                  <tr key={entry.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={\`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatMonthYear(entry.month_year)}
                    </td>
                    <td className={\`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {entry.worker_name}
                    </td>
                    <td className={\`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className={\`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-800'}`}>
                        {entry.category}
                      </span>
                    </td>
                    <td className={\`px-6 py-4 whitespace-nowrap text-sm font-semibold text-center ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      ${entry.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-100 text-blue-600'}`}
                          title={t('editDebtEntry')}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className={\`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                          title={t('delete') + ' ' + t('debtEntry')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Debt Option Manager Modal */}
      <DebtOptionManager
        isOpen={showDebtManager}
        onClose={() => setShowDebtManager(false)}
        debtOptions={debtOptions}
        onDebtOptionUpdated={onDebtOptionUpdated}
        darkMode={darkMode}
      />
    </div>
  );
};

export default DebtDataEntry;