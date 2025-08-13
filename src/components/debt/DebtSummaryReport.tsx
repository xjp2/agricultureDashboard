import React, { useState, useMemo } from 'react';
import { Calculator, Download, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, FileText, Users, TrendingUp } from 'lucide-react';
import { DebtData, WorkerDebtSummary, SortConfig, FilterConfig } from '../../lib/debtTypes';
import { WorkerData } from '../../lib/workersTypes';
import { AccountingData } from '../../lib/accountingTypes';
import WorkerPayslipModal from './WorkerPayslipModal';
import { useLanguage } from '../../contexts/LanguageContext';

interface DebtSummaryReportProps {
  debtData: DebtData[];
  accountingData: AccountingData[];
  workers: WorkerData[];
  darkMode: boolean;
}

const DebtSummaryReport: React.FC<DebtSummaryReportProps> = ({
  debtData,
  accountingData,
  workers,
  darkMode
}) => {
  const { t } = useLanguage();
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    search: '',
    category: '',
    monthFrom: '',
    monthTo: ''
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'netAmount',
    direction: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerDebtSummary | null>(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);

  // Generate month options for filters
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    // Generate last 24 months and next 6 months
    for (let i = -24; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthString = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      months.push({ label: monthString, value: monthValue });
    }
    
    return months;
  };

  // Helper function to compare month strings
  const compareMonths = (month1: string, month2: string): number => {
    const date1 = new Date(month1);
    const date2 = new Date(month2);
    return date1.getTime() - date2.getTime();
  };

  // Get all unique categories
  const allCategories = useMemo(() => {
    const categories = new Set(debtData.map(d => d.category));
    return Array.from(categories).sort();
  }, [debtData]);

  // Process worker debt summaries
  const workerDebtSummaries = useMemo(() => {
    let filteredDebtData = [...debtData];
    let filteredAccountingData = [...accountingData];

    // Apply filters to debt data
    if (filterConfig.monthFrom) {
      filteredDebtData = filteredDebtData.filter(entry => {
        return compareMonths(entry.month_year, filterConfig.monthFrom) >= 0;
      });
    }
    if (filterConfig.monthTo) {
      filteredDebtData = filteredDebtData.filter(entry => {
        return compareMonths(entry.month_year, filterConfig.monthTo) <= 0;
      });
    }
    if (filterConfig.category) {
      filteredDebtData = filteredDebtData.filter(entry => entry.category === filterConfig.category);
    }
    if (filterConfig.search) {
      const searchLower = filterConfig.search.toLowerCase();
      filteredDebtData = filteredDebtData.filter(entry =>
        entry.worker_name.toLowerCase().includes(searchLower)
      );
    }

    // Group by worker and month
    const summaryMap = new Map<string, WorkerDebtSummary>();

    // Process debt data
    filteredDebtData.forEach(debt => {
      const key = `${debt.worker_name}-${debt.month_year}`;
      
      if (!summaryMap.has(key)) {
        const worker = workers.find(w => w.Name === debt.worker_name);
        summaryMap.set(key, {
          worker_name: debt.worker_name,
          eid: worker?.EID || 'N/A',
          month_year: debt.month_year,
          totalEarnings: 0,
          totalDebt: 0,
          netAmount: 0,
          debtsByCategory: {},
          earningsEntries: 0,
          debtEntries: 0
        });
      }

      const summary = summaryMap.get(key)!;
      summary.totalDebt += debt.amount;
      summary.debtEntries += 1;
      
      if (!summary.debtsByCategory[debt.category]) {
        summary.debtsByCategory[debt.category] = 0;
      }
      summary.debtsByCategory[debt.category] += debt.amount;
    });

    // Process accounting data to get earnings for the same months
    filteredAccountingData.forEach(earning => {
      // Use the month as stored in accounting data (already in "Month YYYY" format)
      const earningMonthYear = earning.month;
      
      const key = `${earning.name}-${earningMonthYear}`;
      
      if (summaryMap.has(key)) {
        const summary = summaryMap.get(key)!;
        summary.totalEarnings += earning.total;
        summary.earningsEntries += 1;
      }
    });

    // Calculate net amounts
    summaryMap.forEach(summary => {
      summary.netAmount = summary.totalEarnings - summary.totalDebt;
    });

    // Convert to array and apply sorting
    let summaries = Array.from(summaryMap.values());

    // Apply search filter to worker names
    if (filterConfig.search) {
      const searchLower = filterConfig.search.toLowerCase();
      summaries = summaries.filter(summary =>
        summary.worker_name.toLowerCase().includes(searchLower) ||
        summary.eid.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    summaries.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof WorkerDebtSummary];
      const bValue = b[sortConfig.key as keyof WorkerDebtSummary];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return summaries;
  }, [debtData, accountingData, workers, filterConfig, sortConfig]);

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

  const handleWorkerClick = (worker: WorkerDebtSummary) => {
    setSelectedWorker(worker);
    setShowPayslipModal(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Worker Name', 'EID', 'Month/Year', 'Total Earnings', 'Total Debt', 'Net Amount', ...allCategories],
      ...workerDebtSummaries.map(worker => [
        worker.worker_name,
        worker.eid,
        new Date(worker.month_year).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        worker.totalEarnings.toFixed(2),
        worker.totalDebt.toFixed(2),
        worker.netAmount.toFixed(2),
        ...allCategories.map(category => (worker.debtsByCategory[category] || 0).toFixed(2))
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'debt_summary_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrintAllPayslips = () => {
    // Create a comprehensive payslip for all workers
    const printContent = workerDebtSummaries.map(worker => {
      const monthYear = new Date(worker.month_year).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      return `
        <div style="page-break-after: always; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="text-align: center; margin-bottom: 20px;">PAYSLIP</h2>
          <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 20px;">
            <h3>Worker Information</h3>
            <p><strong>Name:</strong> ${worker.worker_name}</p>
            <p><strong>Employee ID:</strong> ${worker.eid}</p>
            <p><strong>Period:</strong> ${monthYear}</p>
          </div>
          
          <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 20px;">
            <h3>Earnings</h3>
            <p><strong>Total Earnings:</strong> $${worker.totalEarnings.toFixed(2)}</p>
            <p><strong>Number of Entries:</strong> ${worker.earningsEntries}</p>
          </div>
          
          <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 20px;">
            <h3>Deductions</h3>
            ${Object.entries(worker.debtsByCategory).map(([category, amount]) => 
              `<p><strong>${category}:</strong> $${amount.toFixed(2)}</p>`
            ).join('')}
            <hr style="margin: 10px 0;">
            <p><strong>Total Deductions:</strong> $${worker.totalDebt.toFixed(2)}</p>
          </div>
          
          <div style="border: 2px solid #000; padding: 15px; background-color: #f9f9f9;">
            <h3>Net Amount</h3>
            <p style="font-size: 18px;"><strong>Net Pay:</strong> $${worker.netAmount.toFixed(2)}</p>
          </div>
        </div>
      `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>All Worker Payslips</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              @media print { body { margin: 0; padding: 0; } }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const totalEarnings = workerDebtSummaries.reduce((sum, worker) => sum + worker.totalEarnings, 0);
  const totalDebt = workerDebtSummaries.reduce((sum, worker) => sum + worker.totalDebt, 0);
  const totalNetAmount = workerDebtSummaries.reduce((sum, worker) => sum + worker.netAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Calculator size={24} className="text-red-500" />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Debt Summary Report
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Worker earnings vs debt analysis with net calculations
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
            onClick={handlePrintAllPayslips}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            <FileText size={16} className="mr-1" />
            Print All Payslips
          </button>
          <button
            onClick={handleExport}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              darkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-100 text-red-800 hover:bg-red-200'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search
              </label>
              <input
                type="text"
                value={filterConfig.search}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search by worker name or EID"
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
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
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              >
                <option value="">All Months From</option>
                {generateMonthOptions().map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
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
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              >
                <option value="">All Months To</option>
                {generateMonthOptions().map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Debt Category
              </label>
              <select
                value={filterConfig.category}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              >
                <option value="">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Workers</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {workerDebtSummaries.length}
              </p>
            </div>
            <Users size={24} className="text-blue-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Earnings</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                ${totalEarnings.toFixed(2)}
              </p>
            </div>
            <TrendingUp size={24} className="text-green-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Debt</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                ${totalDebt.toFixed(2)}
              </p>
            </div>
            <Calculator size={24} className="text-red-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Net Amount</p>
              <p className={`text-2xl font-bold ${
                totalNetAmount >= 0 
                  ? darkMode ? 'text-green-400' : 'text-green-600'
                  : darkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                ${totalNetAmount.toFixed(2)}
              </p>
            </div>
            <FileText size={24} className={totalNetAmount >= 0 ? 'text-green-500' : 'text-red-500'} />
          </div>
        </div>
      </div>

      {/* Worker Debt Summary Table */}
      <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => handleSort('worker_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Worker</span>
                    {getSortIcon('worker_name')}
                  </div>
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => handleSort('month_year')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Month/Year</span>
                    {getSortIcon('month_year')}
                  </div>
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => handleSort('totalEarnings')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Earnings</span>
                    {getSortIcon('totalEarnings')}
                  </div>
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => handleSort('totalDebt')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Total Debt</span>
                    {getSortIcon('totalDebt')}
                  </div>
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => handleSort('netAmount')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Net Amount</span>
                    {getSortIcon('netAmount')}
                  </div>
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {workerDebtSummaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`px-6 py-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex flex-col items-center">
                      <Calculator size={48} className="mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">No debt data found</p>
                      <p className="text-sm">Add debt entries to see worker summaries</p>
                    </div>
                  </td>
                </tr>
              ) : (
                workerDebtSummaries.map((worker) => (
                  <tr key={`${worker.worker_name}-${worker.month_year}`} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div>
                        <p className="font-medium">{worker.worker_name}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          EID: {worker.eid}
                        </p>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {new Date(worker.month_year).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-center ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      ${worker.totalEarnings.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-center ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      ${worker.totalDebt.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-center ${
                      worker.netAmount >= 0 
                        ? darkMode ? 'text-green-400' : 'text-green-600'
                        : darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      ${worker.netAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <button
                        onClick={() => handleWorkerClick(worker)}
                        className={`px-3 py-1 rounded-md text-xs ${
                          darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        View Payslip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      {workerDebtSummaries.length > 0 && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('showing')} {workerDebtSummaries.length} {t('workers')}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('debtSummaryReport')}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('workerEarningsVsDebt')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Worker Payslip Modal */}
      {showPayslipModal && selectedWorker && (
        <WorkerPayslipModal
          isOpen={showPayslipModal}
          onClose={() => {
            setShowPayslipModal(false);
            setSelectedWorker(null);
          }}
          worker={selectedWorker}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default DebtSummaryReport;