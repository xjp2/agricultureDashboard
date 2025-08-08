import React, { useState, useMemo } from 'react';
import { Users, Download, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { AccountingData, FilterConfig, SortConfig } from '../../lib/accountingTypes';
import { WorkerData } from '../../lib/workersTypes';
import WorkerDetailModal from './WorkerDetailModal';

interface WorkerSummaryReportProps {
  accountingData: AccountingData[];
  workers: WorkerData[];
  darkMode: boolean;
}

interface WorkerSummary {
  eid: string;
  name: string;
  categoryTotals: { [category: string]: number };
  grandTotal: number;
}

const WorkerSummaryReport: React.FC<WorkerSummaryReportProps> = ({
  accountingData,
  workers,
  darkMode
}) => {
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    monthFrom: '',
    monthTo: '',
    category: '',
    work: '',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'grandTotal',
    direction: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerSummary | null>(null);
  const [showWorkerDetail, setShowWorkerDetail] = useState(false);

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

  // Helper function to compare month strings
  const compareMonths = (month1: string, month2: string): number => {
    const date1 = new Date(month1 + ' 01');
    const date2 = new Date(month2 + ' 01');
    return date1.getTime() - date2.getTime();
  };

  // Get all unique categories
  const allCategories = useMemo(() => {
    const categories = new Set(workers.map(w => w.Department));
    return Array.from(categories).sort();
  }, [workers]);

  // Get all unique work types
  const allWorkTypes = useMemo(() => {
    const workTypes = new Set(accountingData.map(d => d.work));
    return Array.from(workTypes).sort();
  }, [accountingData]);

  // Filter and process data
  const workerSummaries = useMemo(() => {
    let filteredData = [...accountingData];

    // Apply filters
    if (filterConfig.monthFrom) {
      filteredData = filteredData.filter(entry => {
        return compareMonths(entry.month, filterConfig.monthFrom) >= 0;
      });
    }
    if (filterConfig.monthTo) {
      filteredData = filteredData.filter(entry => {
        return compareMonths(entry.month, filterConfig.monthTo) <= 0;
      });
    }
    if (filterConfig.category) {
      filteredData = filteredData.filter(entry => entry.category === filterConfig.category);
    }
    if (filterConfig.work) {
      filteredData = filteredData.filter(entry => entry.work === filterConfig.work);
    }
    if (filterConfig.search) {
      const searchLower = filterConfig.search.toLowerCase();
      filteredData = filteredData.filter(entry =>
        entry.name.toLowerCase().includes(searchLower) ||
        entry.eid.toLowerCase().includes(searchLower)
      );
    }

    // Group by worker and calculate totals
    const workerMap = new Map<string, WorkerSummary>();

    filteredData.forEach(entry => {
      if (!workerMap.has(entry.eid)) {
        workerMap.set(entry.eid, {
          eid: entry.eid,
          name: entry.name,
          categoryTotals: {},
          grandTotal: 0
        });
      }

      const worker = workerMap.get(entry.eid)!;
      if (!worker.categoryTotals[entry.category]) {
        worker.categoryTotals[entry.category] = 0;
      }
      worker.categoryTotals[entry.category] += entry.total;
      worker.grandTotal += entry.total;
    });

    // Convert to array and sort
    let summaries = Array.from(workerMap.values());

    // Apply sorting
    summaries.sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortConfig.key === 'grandTotal') {
        aValue = a.grandTotal;
        bValue = b.grandTotal;
      } else if (sortConfig.key.startsWith('category_')) {
        const category = sortConfig.key.replace('category_', '');
        aValue = a.categoryTotals[category] || 0;
        bValue = b.categoryTotals[category] || 0;
      } else {
        aValue = a[sortConfig.key as keyof WorkerSummary];
        bValue = b[sortConfig.key as keyof WorkerSummary];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return summaries;
  }, [accountingData, filterConfig, sortConfig]);

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

  const handleWorkerClick = (worker: WorkerSummary) => {
    setSelectedWorker(worker);
    setShowWorkerDetail(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['EID', 'Name', ...allCategories, 'Grand Total'],
      ...workerSummaries.map(worker => [
        worker.eid,
        worker.name,
        ...allCategories.map(category => (worker.categoryTotals[category] || 0).toFixed(2)),
        worker.grandTotal.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'worker_summary_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalGrandTotal = workerSummaries.reduce((sum, worker) => sum + worker.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-blue-500" />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Worker Summary Report
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Complete earnings breakdown by worker and category
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <Filter size={16} className="mr-1" />
            Filters
          </button>
          <button
            onClick={handleExport}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            <Download size={16} className="mr-1" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search
              </label>
              <input
                type="text"
                value={filterConfig.search}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search by name or EID"
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                From Month
              </label>
              <select
                value={filterConfig.monthFrom}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, monthFrom: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">All months from...</option>
                {generateMonthOptions().map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                To Month
              </label>
              <select
                value={filterConfig.monthTo}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, monthTo: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">All months to...</option>
                {generateMonthOptions().map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                value={filterConfig.category}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Work Type
              </label>
              <select
                value={filterConfig.work}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, work: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">All Work Types</option>
                {allWorkTypes.map(work => (
                  <option key={work} value={work}>{work}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {workerSummaries.length} workers
            </p>
          </div>
          <div>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Total: ${totalGrandTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Worker Detail Modal */}
      {showWorkerDetail && selectedWorker && (
        <WorkerDetailModal
          isOpen={showWorkerDetail}
          onClose={() => {
            setShowWorkerDetail(false);
            setSelectedWorker(null);
          }}
          worker={selectedWorker}
          accountingData={accountingData.filter(entry => entry.eid === selectedWorker.eid)}
          darkMode={darkMode}
        />
      )}

      {/* Table */}
      <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => handleSort('eid')}
                >
                  <div className="flex items-center space-x-1">
                    <span>EID</span>
                    {getSortIcon('eid')}
                  </div>
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                {allCategories.map(category => (
                  <th
                    key={category}
                    className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                    onClick={() => handleSort(`category_${category}`)}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>{category}</span>
                      {getSortIcon(`category_${category}`)}
                    </div>
                  </th>
                ))}
                <th
                  className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => handleSort('grandTotal')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Grand Total</span>
                    {getSortIcon('grandTotal')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {workerSummaries.length === 0 ? (
                <tr>
                  <td colSpan={allCategories.length + 3} className={`px-6 py-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex flex-col items-center">
                      <Users size={48} className="mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">No data found</p>
                      <p className="text-sm">Try adjusting your filters or add some accounting entries</p>
                    </div>
                  </td>
                </tr>
              ) : (
                workerSummaries.map((worker) => (
                  <tr key={worker.eid} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <button
                        onClick={() => handleWorkerClick(worker)}
                        className={`text-left hover:underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                      >
                        {worker.eid}
                      </button>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <button
                        onClick={() => handleWorkerClick(worker)}
                        className={`text-left hover:underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                      >
                        {worker.name}
                      </button>
                    </td>
                    {allCategories.map(category => (
                      <td key={category} className={`px-6 py-4 whitespace-nowrap text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {worker.categoryTotals[category] 
                          ? `$${worker.categoryTotals[category].toFixed(2)}`
                          : <span className="text-gray-400">nil</span>
                        }
                      </td>
                    ))}
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-center ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      ${worker.grandTotal.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerSummaryReport;