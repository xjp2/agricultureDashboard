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

interface ConsolidatedWorkerSummary {
  worker_name: string;
  eid: string;
  totalEarnings: number;
  totalDebt: number;
  netAmount: number;
  debtsByCategory: { [category: string]: number };
  earningsEntries: number;
  debtEntries: number;
  months: string[];
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

  // Generate month options for filters (last 24 months and next 12 months)
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = -24; i <= 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthString = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push(monthString);
    }
    
    return months.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
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

  // Process consolidated worker summaries
  const consolidatedWorkerSummaries = useMemo(() => {
    let filteredDebtData = [...debtData];
    let filteredAccountingData = [...accountingData];

    // Apply month range filters
    if (filterConfig.monthFrom) {
      filteredDebtData = filteredDebtData.filter(entry => {
        return compareMonths(entry.month_year, filterConfig.monthFrom) >= 0;
      });
      filteredAccountingData = filteredAccountingData.filter(entry => {
        return compareMonths(entry.month, filterConfig.monthFrom) >= 0;
      });
    }
    if (filterConfig.monthTo) {
      filteredDebtData = filteredDebtData.filter(entry => {
        return compareMonths(entry.month_year, filterConfig.monthTo) <= 0;
      });
      filteredAccountingData = filteredAccountingData.filter(entry => {
        return compareMonths(entry.month, filterConfig.monthTo) <= 0;
      });
    }

    // Apply category filter
    if (filterConfig.category) {
      filteredDebtData = filteredDebtData.filter(entry => entry.category === filterConfig.category);
    }

    // Group by worker (consolidate all months for each worker)
    const workerMap = new Map<string, ConsolidatedWorkerSummary>();

    // Process debt data
    filteredDebtData.forEach(debt => {
      const worker = workers.find(w => w.Name === debt.worker_name);
      const key = worker?.EID || debt.worker_name; // Use EID as primary key, fallback to name
      
      if (!workerMap.has(key)) {
        workerMap.set(key, {
          worker_name: debt.worker_name,
          eid: worker?.EID || 'N/A',
          totalEarnings: 0,
          totalDebt: 0,
          netAmount: 0,
          debtsByCategory: {},
          earningsEntries: 0,
          debtEntries: 0,
          months: []
        });
      }

      const summary = workerMap.get(key)!;
      summary.totalDebt += debt.amount;
      summary.debtEntries += 1;
      
      if (!summary.debtsByCategory[debt.category]) {
        summary.debtsByCategory[debt.category] = 0;
      }
      summary.debtsByCategory[debt.category] += debt.amount;
      
      // Add month to the list if not already present
      if (!summary.months.includes(debt.month_year)) {
        summary.months.push(debt.month_year);
      }
    });

    // Process accounting data
    filteredAccountingData.forEach(earning => {
      const worker = workers.find(w => w.Name === earning.name);
      const key = worker?.EID || earning.name; // Use EID as primary key, fallback to name
      
      if (!workerMap.has(key)) {
        workerMap.set(key, {
          worker_name: earning.name,
          eid: worker?.EID || 'N/A',
          totalEarnings: 0,
          totalDebt: 0,
          netAmount: 0,
          debtsByCategory: {},
          earningsEntries: 0,
          debtEntries: 0,
          months: []
        });
      }

      const summary = workerMap.get(key)!;
      summary.totalEarnings += earning.total;
      summary.earningsEntries += 1;
      
      // Add month to the list if not already present
      if (!summary.months.includes(earning.month)) {
        summary.months.push(earning.month);
      }
    });

    // Calculate net amounts and apply search filter
    let summaries = Array.from(workerMap.values()).map(summary => ({
      ...summary,
      netAmount: summary.totalEarnings - summary.totalDebt,
      months: summary.months.sort((a, b) => compareMonths(b, a)) // Sort months newest first
    }));

    // Apply search filter
    if (filterConfig.search) {
      const searchLower = filterConfig.search.toLowerCase();
      summaries = summaries.filter(summary =>
        summary.worker_name.toLowerCase().includes(searchLower) ||
        summary.eid.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    summaries.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof ConsolidatedWorkerSummary];
      const bValue = b[sortConfig.key as keyof ConsolidatedWorkerSummary];

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

  const handleWorkerClick = (worker: ConsolidatedWorkerSummary) => {
    // Convert to the format expected by WorkerPayslipModal
    // Use the most recent month for the payslip
    const mostRecentMonth = worker.months[0] || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const payslipWorker: WorkerDebtSummary = {
      worker_name: worker.worker_name,
      eid: worker.eid,
      month_year: mostRecentMonth,
      totalEarnings: worker.totalEarnings,
      totalDebt: worker.totalDebt,
      netAmount: worker.netAmount,
      debtsByCategory: worker.debtsByCategory,
      earningsEntries: worker.earningsEntries,
      debtEntries: worker.debtEntries
    };
    
    setSelectedWorker(payslipWorker);
    setShowPayslipModal(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Worker Name', 'EID', 'Total Earnings', 'Total Debt', 'Net Amount', 'Months Active', ...allCategories],
      ...consolidatedWorkerSummaries.map(worker => [
        worker.worker_name,
        worker.eid,
        worker.totalEarnings.toFixed(2),
        worker.totalDebt.toFixed(2),
        worker.netAmount.toFixed(2),
        worker.months.join('; '),
        ...allCategories.map(category => (worker.debtsByCategory[category] || 0).toFixed(2))
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'consolidated_debt_summary_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrintAllPayslips = () => {
    // Create a comprehensive payslip for all workers
    const printContent = consolidatedWorkerSummaries.map(worker => {
      return `
        <div style="page-break-after: always; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="text-align: center; margin-bottom: 20px;">CONSOLIDATED PAYSLIP</h2>
          <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 20px;">
            <h3>Worker Information</h3>
            <p><strong>Name:</strong> ${worker.worker_name}</p>
            <p><strong>Employee ID:</strong> ${worker.eid}</p>
            <p><strong>Period:</strong> ${worker.months.join(', ')}</p>
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
            <title>All Worker Consolidated Payslips</title>
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

  // Calculate totals based on filtered data
  const totalEarnings = consolidatedWorkerSummaries.reduce((sum, worker) => sum + worker.totalEarnings, 0);
  const totalDebt = consolidatedWorkerSummaries.reduce((sum, worker) => sum + worker.totalDebt, 0);
  const totalNetAmount = consolidatedWorkerSummaries.reduce((sum, worker) => sum + worker.netAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Calculator size={24} className="text-red-500" />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('debtSummaryReport')}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('workerEarningsVsDebt')}
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
            {t('filters')}
          </button>
          <button
            onClick={handlePrintAllPayslips}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            <FileText size={16} className="mr-1" />
            {t('printAllPayslips')}
          </button>
          <button
            onClick={handleExport}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              darkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            <Download size={16} className="mr-1" />
            {t('export')} CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('search')}
              </label>
              <input
                type="text"
                value={filterConfig.search}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, search: e.target.value }))}
                placeholder={t('searchByNameOrEid')}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('fromMonth')}
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
                <option value="">{t('allMonthsFrom')}</option>
                {generateMonthOptions().map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('toMonth')}
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
                <option value="">{t('allMonthsTo')}</option>
                {generateMonthOptions().map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('debtCategory')}
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
                <option value="">{t('allCategories')}</option>
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
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalWorkers')}</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {consolidatedWorkerSummaries.length}
              </p>
            </div>
            <Users size={24} className="text-blue-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalEarnings')}</p>
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
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalDebt')}</p>
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
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('netAmount')}</p>
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

      {/* Consolidated Worker Summary Table */}
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
                    <span>{t('name')}</span>
                    {getSortIcon('worker_name')}
                  </div>
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => handleSort('eid')}
                >
                  <div className="flex items-center space-x-1">
                    <span>{t('employeeId')}</span>
                    {getSortIcon('eid')}
                  </div>
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('monthYear')}
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => handleSort('totalEarnings')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>{t('earnings')}</span>
                    {getSortIcon('totalEarnings')}
                  </div>
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => handleSort('totalDebt')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>{t('totalDebt')}</span>
                    {getSortIcon('totalDebt')}
                  </div>
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => handleSort('netAmount')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>{t('netAmount')}</span>
                    {getSortIcon('netAmount')}
                  </div>
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {consolidatedWorkerSummaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-6 py-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex flex-col items-center">
                      <Calculator size={48} className="mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">{t('noDataFound')}</p>
                      <p className="text-sm">{t('tryAdjustingFilters')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                consolidatedWorkerSummaries.map((worker) => (
                  <tr key={worker.eid} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {worker.worker_name}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                        {worker.eid}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="max-w-32">
                        {worker.months.slice(0, 2).map((month, index) => (
                          <div key={index} className="text-xs">
                            {month}
                          </div>
                        ))}
                        {worker.months.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{worker.months.length - 2} more
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-center ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      ${worker.totalEarnings.toFixed(2)}
                      <div className={`text-xs font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {worker.earningsEntries} {t('entries')}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-center ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      ${worker.totalDebt.toFixed(2)}
                      <div className={`text-xs font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {worker.debtEntries} {t('entries')}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-center ${
                      worker.netAmount >= 0 
                        ? darkMode ? 'text-green-400' : 'text-green-600'
                        : darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      ${worker.netAmount.toFixed(2)}
                      <div className={`text-xs font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {worker.netAmount >= 0 ? t('credit') : t('debit')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <button
                        onClick={() => handleWorkerClick(worker)}
                        className={`px-3 py-1 rounded-md text-xs ${
                          darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {t('viewPayslip')}
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
      {consolidatedWorkerSummaries.length > 0 && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('showing')} {consolidatedWorkerSummaries.length} {t('workers')}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {filterConfig.monthFrom || filterConfig.monthTo ? 
                  `${t('filtered')} ${filterConfig.monthFrom ? `${t('from')} ${filterConfig.monthFrom}` : ''} ${filterConfig.monthTo ? `${t('to')} ${filterConfig.monthTo}` : ''}` :
                  t('allTimeData')
                }
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('netAmount')}: ${totalNetAmount.toFixed(2)}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('earnings')}: ${totalEarnings.toFixed(2)} | {t('deductions')}: ${totalDebt.toFixed(2)}
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