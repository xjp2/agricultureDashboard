import React, { useState, useMemo } from 'react';
import { X, User, Calendar, DollarSign, Briefcase, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { AccountingData, SortConfig } from '../../lib/accountingTypes';

interface WorkerSummary {
  eid: string;
  name: string;
  categoryTotals: { [category: string]: number };
  grandTotal: number;
}

interface WorkerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: WorkerSummary;
  accountingData: AccountingData[];
  darkMode: boolean;
}

const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  isOpen,
  onClose,
  worker,
  accountingData,
  darkMode
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  });
  const [filterMonth, setFilterMonth] = useState('');
  const [filterWork, setFilterWork] = useState('');

  // Generate month options for filters
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    // Generate last 24 months and next 6 months
    for (let i = -24; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthString = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push(monthString);
    }
    
    return months;
  };

  // Process and filter data
  const processedData = useMemo(() => {
    let filtered = [...accountingData];

    if (filterMonth) {
      filtered = filtered.filter(entry => entry.month === filterMonth);
    }

    if (filterWork) {
      filtered = filtered.filter(entry => entry.work === filterWork);
    }

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof AccountingData];
      const bValue = b[sortConfig.key as keyof AccountingData];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return sortConfig.direction === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return filtered;
  }, [accountingData, filterMonth, filterWork, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={16} className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={16} className="text-blue-500" />
      : <ArrowDown size={16} className="text-blue-500" />;
  };

  const handleExport = () => {
    const csvContent = [
      ['Month', 'Work', 'Block', 'Quantity', 'UOM', 'Price', 'Total', 'Date Created'],
      ...processedData.map(entry => [
        entry.month,
        entry.work,
        entry.block,
        entry.quantity.toString(),
        entry.uom,
        entry.price.toString(),
        entry.total.toString(),
        new Date(entry.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worker.name.replace(/\s+/g, '_')}_work_history.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get unique months and work types for filters
  const uniqueMonths = useMemo(() => {
    return [...new Set(accountingData.map(entry => entry.month))].sort();
  }, [accountingData]);

  const uniqueWorkTypes = useMemo(() => {
    return [...new Set(accountingData.map(entry => entry.work))].sort();
  }, [accountingData]);

  // Calculate statistics
  const totalEntries = processedData.length;
  const totalEarnings = processedData.reduce((sum, entry) => sum + entry.total, 0);
  const averagePerEntry = totalEntries > 0 ? totalEarnings / totalEntries : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100'} mr-4`}>
              <User size={24} className="text-blue-500" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {worker.name} - Work History
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Employee ID: {worker.eid} • Complete work and earnings history
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              <Download size={16} className="mr-1" />
              Export
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
        </div>

        {/* Worker Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Entries</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {totalEntries}
                </p>
              </div>
              <Briefcase size={24} className="text-blue-500" />
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Earnings</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ${totalEarnings.toFixed(2)}
                </p>
              </div>
              <DollarSign size={24} className="text-green-500" />
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average per Entry</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${averagePerEntry.toFixed(2)}
                </p>
              </div>
              <Calendar size={24} className="text-purple-500" />
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Categories</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {Object.keys(worker.categoryTotals).length}
                </p>
              </div>
              <User size={24} className="text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} mb-6`}>
          <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Earnings by Category
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(worker.categoryTotals).map(([category, amount]) => (
              <div
                key={category}
                className={`p-3 rounded-md border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'}`}
              >
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {category}
                </p>
                <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ${amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Filter by Month
              </label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">All Months</option>
                {generateMonthOptions().map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Filter by Work Type
              </label>
              <select
                value={filterWork}
                onChange={(e) => setFilterWork(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">All Work Types</option>
                {uniqueWorkTypes.map(work => (
                  <option key={work} value={work}>{work}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Work History Table */}
        <div className={`rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className={darkMode ? 'bg-gray-600' : 'bg-gray-50'}>
                <tr>
                  {[
                    { key: 'month', label: 'Month' },
                    { key: 'work', label: 'Work Type' },
                    { key: 'block', label: 'Block' },
                    { key: 'quantity', label: 'Quantity' },
                    { key: 'uom', label: 'UOM' },
                    { key: 'price', label: 'Price' },
                    { key: 'total', label: 'Total' },
                    { key: 'created_at', label: 'Date Created' }
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500`}
                      onClick={() => handleSort(key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{label}</span>
                        {getSortIcon(key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                {processedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={`px-6 py-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="flex flex-col items-center">
                        <Briefcase size={48} className="mb-4 text-gray-400" />
                        <p className="text-lg font-medium mb-2">No work history found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedData.map((entry) => (
                    <tr key={entry.id} className={darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {entry.month}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {entry.work}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {entry.block}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {entry.quantity.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                          {entry.uom}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        ${entry.price.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ${entry.total.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className={`mt-6 p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {processedData.length} of {accountingData.length} total entries
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Filtered Total: ${totalEarnings.toFixed(2)}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Average: ${averagePerEntry.toFixed(2)} per entry
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDetailModal;