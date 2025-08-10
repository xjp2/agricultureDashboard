import React, { useState, useEffect } from 'react';
import { Plus, Settings, X, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { WorkerData } from '../../lib/workersTypes';
import { AccountingData, AccountingFormData, WorkOption, UomOption } from '../../lib/accountingTypes'; // Import UomOption
import WorkOptionManager from './WorkOptionManager';
import UomOptionManager from './UomOptionManager'; // Import UomOptionManager
import { useLanguage } from '../../contexts/LanguageContext';

interface AccountingDataEntryProps {
  workers: WorkerData[];
  workOptions: WorkOption[];
  uomOptions: UomOption[]; // New prop
  onDataEntrySuccess: () => void;
  onWorkOptionUpdated: () => void;
  onUomOptionUpdated: () => void; // New prop
  darkMode: boolean; // New prop
}

const AccountingDataEntry: React.FC<AccountingDataEntryProps> = ({
  workers,
  workOptions,
  uomOptions, // Destructure new prop
  onDataEntrySuccess,
  onWorkOptionUpdated,
  onUomOptionUpdated, // Destructure new prop
  darkMode // Destructure new prop
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<AccountingFormData>({
    month: '',
    name: '',
    work: '',
    block: '',
    quantity: 0,
    uom: '', // Initialize with empty string, will be set to first UOM option
    price: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWorkManager, setShowWorkManager] = useState(false);
  const [showUomManager, setShowUomManager] = useState(false); // New state for UOM manager
  const [recentEntries, setRecentEntries] = useState<AccountingData[]>([]);
  const [editingEntry, setEditingEntry] = useState<AccountingData | null>(null);

  useEffect(() => {
    fetchRecentEntries();
    // Set default month to current month
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    setFormData(prev => ({ ...prev, month: currentMonth }));

    // Set default UOM to the first available option if uomOptions exist
    if (uomOptions.length > 0 && !formData.uom) {
      setFormData(prev => ({ ...prev, uom: uomOptions[0].uom_name }));
    }
  }, [uomOptions]); // Add uomOptions to dependency array

  const fetchRecentEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('accountingData')
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
      const monthString = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push(monthString);
    }
    
    return months;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue: string | number = value;
    
    if (name === 'quantity' || name === 'price') {
      processedValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleWorkerSelect = (eid: string) => {
    const selectedWorker = workers.find(w => w.EID === eid);
    if (selectedWorker) {
      setFormData(prev => ({
        ...prev,
        name: selectedWorker.Name
      }));
    }
  };

  const calculateTotal = () => {
    return formData.quantity * formData.price;
  };

  const resetForm = () => {
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    setFormData({
      month: currentMonth,
      name: '',
      work: workOptions.length > 0 ? workOptions[0].work_name : '',
      block: '',
      quantity: 0,
      uom: uomOptions.length > 0 ? uomOptions[0].uom_name : '', // Set default UOM from fetched options
      price: 0
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
      if (!formData.month || !formData.name || !formData.work || !formData.block || !formData.uom) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.quantity <= 0 || formData.price <= 0) {
        throw new Error('Quantity and price must be greater than 0');
      }

      // Find worker by name to get EID and category
      const worker = workers.find(w => w.Name === formData.name);
      if (!worker) {
        throw new Error('Selected worker not found');
      }

      const accountingEntry = {
        month: formData.month,
        eid: worker.EID,
        name: formData.name,
        work: formData.work,
        block: formData.block,
        quantity: formData.quantity,
        uom: formData.uom,
        price: formData.price,
        total: calculateTotal(),
        category: worker.Department
      };

      if (editingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('accountingData')
          .update(accountingEntry)
          .eq('id', editingEntry.id);

        if (updateError) throw updateError;
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from('accountingData')
          .insert(accountingEntry);

        if (insertError) throw insertError;
      }

      resetForm();
      onDataEntrySuccess();
      fetchRecentEntries();
    } catch (err: any) {
      console.error('Error saving accounting data:', err);
      setError(err.message || 'Failed to save accounting data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: AccountingData) => {
    setFormData({
      month: entry.month,
      name: entry.name,
      work: entry.work,
      block: entry.block,
      quantity: entry.quantity,
      uom: entry.uom,
      price: entry.price
    });
    setEditingEntry(entry);
  };

  const handleDelete = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('accountingData')
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

  return (
    <div className="space-y-6">
      {/* Data Entry Form */}
      <div className={"p-6 rounded-lg border " + (darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={"text-lg font-semibold " + (darkMode ? 'text-white' : 'text-gray-900')}>
              {editingEntry ? t('editAccountingEntry') : t('addNewAccountingEntry')}
            </h3>
            <p className={"text-sm " + (darkMode ? 'text-gray-400' : 'text-gray-600')}>
              {editingEntry ? t('updateAccountingEntry') : t('enterWorkerPayment')}
            </p>
          </div>
          {editingEntry && (
            <button
              onClick={resetForm}
              className={"flex items-center px-3 py-2 rounded-md text-sm " + (
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              )}
            >
              <X size={16} className="mr-1" />
              {t('cancel')} {t('edit')}
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
            {/* Month */}
            <div>
              <label className={"block text-sm font-medium mb-1 " + (darkMode ? 'text-gray-300' : 'text-gray-700')}>
                {t('month')} *
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                required
                className={"w-full px-3 py-2 border rounded-md " + (
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                ) + " focus:outline-none focus:ring-2 focus:ring-green-500"}
              >
                <option value="">{t('selectMonth')}</option>
                {generateMonthOptions().map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {/* Worker Name */}
            <div>
              <label className={"block text-sm font-medium mb-1 " + (darkMode ? 'text-gray-300' : 'text-gray-700')}>
                {t('workerName')} *
              </label>
              <select
                name="name"
                value={formData.name}
                onChange={(e) => {
                  handleInputChange(e);
                  handleWorkerSelect(workers.find(w => w.Name === e.target.value)?.EID || '');
                }}
                required
                className={"w-full px-3 py-2 border rounded-md " + (
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                ) + " focus:outline-none focus:ring-2 focus:ring-green-500"}
              >
                <option value="">{t('selectWorker')}</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.Name}>
                    {worker.Name} ({worker.EID})
                  </option>
                ))}
              </select>
            </div>

            {/* Work Type */}
            <div>
              <label className={"block text-sm font-medium mb-1 " + (darkMode ? 'text-gray-300' : 'text-gray-700')}>
                {t('workType')} *
              </label>
              <div className="flex items-end gap-2">
                <select
                  name="work"
                  value={formData.work}
                  onChange={handleInputChange}
                  required
                  className={"flex-1 px-3 py-2 border rounded-md " + (
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  ) + " focus:outline-none focus:ring-2 focus:ring-green-500"}
                >
                  <option value="">{t('selectWorkType')}</option>
                  {workOptions.map(option => (
                    <option key={option.id} value={option.work_name}>
                      {option.work_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowWorkManager(true)}
                  className={"px-3 py-2 rounded-md text-sm " + (
                    darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  )}
                  title="Manage work options"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {/* Block */}
            <div>
              <label className={"block text-sm font-medium mb-1 " + (darkMode ? 'text-gray-300' : 'text-gray-700')}>
                {t('block')} *
              </label>
              <input
                type="text"
                name="block"
                value={formData.block}
                onChange={handleInputChange}
                required
                className={"w-full px-3 py-2 border rounded-md " + (
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                ) + " focus:outline-none focus:ring-2 focus:ring-green-500"}
                placeholder={t('enterBlockIdentifier')}
              />
            </div>

            {/* Quantity */}
            <div>
              <label className={"block text-sm font-medium mb-1 " + (darkMode ? 'text-gray-300' : 'text-gray-700')}>
                {t('quantity')} *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="quantity"
                value={formData.quantity || ''}
                onChange={handleInputChange}
                required
                className={"w-full px-3 py-2 border rounded-md " + (
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                ) + " focus:outline-none focus:ring-2 focus:ring-green-500"}
                placeholder={t('enterQuantity')}
              />
            </div>

            {/* UOM */}
            <div>
              <label className={"block text-sm font-medium mb-1 " + (darkMode ? 'text-gray-300' : 'text-gray-700')}>
                {t('unitOfMeasure')} (UOM) *
              </label>
              <div className="flex items-end gap-2">
                <select
                  name="uom"
                  value={formData.uom}
                  onChange={handleInputChange}
                  required
                  className={"flex-1 px-3 py-2 border rounded-md " + (
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  ) + " focus:outline-none focus:ring-2 focus:ring-green-500"}
                >
                  {uomOptions.length === 0 ? (
                    <option value="">{t('noDataFound')}</option>
                  ) : (
                    uomOptions.map(option => (
                      <option key={option.id} value={option.uom_name}>
                        {option.uom_name}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setShowUomManager(true)} // New button to open UOM manager
                  className={"px-3 py-2 rounded-md text-sm " + (
                    darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  )}
                  title={t('manageUomOptions')}
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className={"block text-sm font-medium mb-1 " + (darkMode ? 'text-gray-300' : 'text-gray-700')}>
                {t('pricePerUnit')} *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={formData.price || ''}
                onChange={handleInputChange}
                required
                className={"w-full px-3 py-2 border rounded-md " + (
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                ) + " focus:outline-none focus:ring-2 focus:ring-green-500"}
                placeholder={t('enterPricePerUnit')}
              />
            </div>

            {/* Total (calculated) */}
            <div>
              <label className={"block text-sm font-medium mb-1 " + (darkMode ? 'text-gray-300' : 'text-gray-700')}>
                {t('totalAmount')}
              </label>
              <div className={"w-full px-3 py-2 border rounded-md " + (
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-gray-300' 
                  : 'bg-gray-50 border-gray-300 text-gray-600'
              )}>
                ${calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {editingEntry && (
              <button
                type="button"
                onClick={resetForm}
                className={"px-4 py-2 border rounded-md " + (
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                )}
              >
                {t('cancel')}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              {editingEntry ? t('updateEntry') : t('addEntry')}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Entries */}
      <div className={"p-6 rounded-lg border " + (darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
        <h3 className={"text-lg font-semibold mb-4 " + (darkMode ? 'text-white' : 'text-gray-900')}>
          {t('recentEntries')}
        </h3>
        
        {recentEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {t('noDataFound')}. {t('addNewAccountingEntry')}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={"px-6 py-3 text-left text-xs font-medium " + (darkMode ? 'text-gray-300' : 'text-gray-500') + " uppercase tracking-wider"}>
                    {t('month')}
                  </th>
                  <th className={"px-6 py-3 text-left text-xs font-medium " + (darkMode ? 'text-gray-300' : 'text-gray-500') + " uppercase tracking-wider"}>
                    {t('workers')}
                  </th>
                  <th className={"px-6 py-3 text-left text-xs font-medium " + (darkMode ? 'text-gray-300' : 'text-gray-500') + " uppercase tracking-wider"}>
                    {t('workType')}
                  </th>
                  <th className={"px-6 py-3 text-left text-xs font-medium " + (darkMode ? 'text-gray-300' : 'text-gray-500') + " uppercase tracking-wider"}>
                    {t('block')}
                  </th>
                  <th className={"px-6 py-3 text-center text-xs font-medium " + (darkMode ? 'text-gray-300' : 'text-gray-500') + " uppercase tracking-wider"}>
                    {t('quantity')}
                  </th>
                  <th className={"px-6 py-3 text-center text-xs font-medium " + (darkMode ? 'text-gray-300' : 'text-gray-500') + " uppercase tracking-wider"}>
                    {t('uom')}
                  </th>
                  <th className={"px-6 py-3 text-center text-xs font-medium " + (darkMode ? 'text-gray-300' : 'text-gray-500') + " uppercase tracking-wider"}>
                    {t('price')}
                  </th>
                  <th className={"px-6 py-3 text-center text-xs font-medium " + (darkMode ? 'text-gray-300' : 'text-gray-500') + " uppercase tracking-wider"}>
                    {t('total')}
                  </th>
                  <th className={"px-6 py-3 text-center text-xs font-medium " + (darkMode ? 'text-gray-300' : 'text-gray-500') + " uppercase tracking-wider"}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className={"divide-y " + (darkMode ? 'divide-gray-700' : 'divide-gray-200')}>
                {recentEntries.map((entry) => (
                  <tr key={entry.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={"px-6 py-4 whitespace-nowrap text-sm " + (darkMode ? 'text-gray-300' : 'text-gray-600')}>
                      {entry.month}
                    </td>
                    <td className={"px-6 py-4 whitespace-nowrap text-sm font-medium " + (darkMode ? 'text-white' : 'text-gray-900')}>
                      {entry.name}
                      <div className={"text-xs " + (darkMode ? 'text-gray-400' : 'text-gray-500')}>
                        {entry.eid}
                      </div>
                    </td>
                    <td className={"px-6 py-4 whitespace-nowrap text-sm " + (darkMode ? 'text-gray-300' : 'text-gray-600')}>
                      {entry.work}
                    </td>
                    <td className={"px-6 py-4 whitespace-nowrap text-sm " + (darkMode ? 'text-gray-300' : 'text-gray-600')}>
                      {entry.block}
                    </td>
                    <td className={"px-6 py-4 whitespace-nowrap text-sm text-center " + (darkMode ? 'text-gray-300' : 'text-gray-600')}>
                      {entry.quantity.toFixed(2)}
                    </td>
                    <td className={"px-6 py-4 whitespace-nowrap text-sm text-center " + (darkMode ? 'text-gray-300' : 'text-gray-600')}>
                      <span className={"px-2 py-1 text-xs rounded-full " + (darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-800')}>
                        {entry.uom}
                      </span>
                    </td>
                    <td className={"px-6 py-4 whitespace-nowrap text-sm text-center " + (darkMode ? 'text-gray-300' : 'text-gray-600')}>
                      ${entry.price.toFixed(2)}
                    </td>
                    <td className={"px-6 py-4 whitespace-nowrap text-sm font-semibold text-center " + (darkMode ? 'text-green-400' : 'text-green-600')}>
                      ${entry.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className={"p-1 rounded-full " + (darkMode ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-100 text-blue-600')}
                          title={t('editAccountingEntry')}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className={"p-1 rounded-full " + (darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600')}
                          title={t('delete') + ' ' + t('entry')}
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

      {/* Work Option Manager Modal */}
      <WorkOptionManager
        isOpen={showWorkManager}
        onClose={() => setShowWorkManager(false)}
        workOptions={workOptions}
        onWorkOptionUpdated={onWorkOptionUpdated}
        darkMode={darkMode}
      />

      {/* UOM Option Manager Modal */}
      <UomOptionManager
        isOpen={showUomManager}
        onClose={() => setShowUomManager(false)}
        uomOptions={uomOptions}
        onUomOptionUpdated={onUomOptionUpdated}
        darkMode={darkMode}
      />
    </div>
  );
};

export default AccountingDataEntry;