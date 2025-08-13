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
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('');
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

  // Set default selected month to current month
  useEffect(() => {
    if (!selectedMonthYear) {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setSelectedMonthYear(currentMonth);
    }
  }, []);

  // Generate unlimited month/year options
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    // Generate from 5 years ago to 2 years in the future
    for (let year = currentDate.getFullYear() - 5; year <= currentDate.getFullYear() + 2; year++) {
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        const monthString = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        months.push(monthString);
      }
    }
    
    return months.sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Most recent first
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

  // Process monthly worker summaries (group by worker AND month)
  const monthlyWorkerSummaries = useMemo(() => {
    // Filter by selected month/year only
    let filteredDebtData = selectedMonthYear 
      ? debtData.filter(entry => entry.month_year === selectedMonthYear)
      : [];
    
    let filteredAccountingData = selectedMonthYear 
      ? accountingData.filter(entry => entry.month === selectedMonthYear)
      : [];

    // Apply category filter
    if (filterConfig.category) {
      filteredDebtData = filteredDebtData.filter(entry => entry.category === filterConfig.category);
    }

    // Group by worker AND month (key: "EID-Month")
    const workerMonthMap = new Map<string, WorkerDebtSummary>();

    // Process debt data
    filteredDebtData.forEach(debt => {
      const worker = workers.find(w => w.Name === debt.worker_name);
      const eid = worker?.EID || debt.worker_name;
      const key = `${eid}-${debt.month_year}`;
      
      if (!workerMonthMap.has(key)) {
        workerMonthMap.set(key, {
          worker_name: debt.worker_name,
          eid: eid,
          month_year: debt.month_year,
          totalEarnings: 0,
          totalDebt: 0,
          netAmount: 0,
          debtsByCategory: {},
          earningsEntries: 0,
          debtEntries: 0
        });
      }

      const summary = workerMonthMap.get(key)!;
      summary.totalDebt += debt.amount;
      summary.debtEntries += 1;
      
      if (!summary.debtsByCategory[debt.category]) {
        summary.debtsByCategory[debt.category] = 0;
      }
      summary.debtsByCategory[debt.category] += debt.amount;
    });

    // Process accounting data
    filteredAccountingData.forEach(earning => {
      const worker = workers.find(w => w.Name === earning.name);
      const eid = worker?.EID || earning.eid;
      const key = `${eid}-${earning.month}`;
      
      if (!workerMonthMap.has(key)) {
        workerMonthMap.set(key, {
          worker_name: earning.name,
          eid: eid,
          month_year: earning.month,
          totalEarnings: 0,
          totalDebt: 0,
          netAmount: 0,
          debtsByCategory: {},
          earningsEntries: 0,
          debtEntries: 0
        });
      }

      const summary = workerMonthMap.get(key)!;
      summary.totalEarnings += earning.total;
      summary.earningsEntries += 1;
    });

    // Calculate net amounts and apply search filter
    let summaries = Array.from(workerMonthMap.values()).map(summary => ({
      ...summary,
      netAmount: summary.totalEarnings - summary.totalDebt
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
      let aValue: any, bValue: any;

      if (sortConfig.key === 'month_year') {
        aValue = new Date(a.month_year).getTime();
        bValue = new Date(b.month_year).getTime();
      } else {
        aValue = a[sortConfig.key as keyof WorkerDebtSummary];
        bValue = b[sortConfig.key as keyof WorkerDebtSummary];
      }

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
  }, [debtData, accountingData, workers, selectedMonthYear, filterConfig, sortConfig]);

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
      ['Worker Name', 'EID', 'Month/Year', 'Total Earnings', 'Total Debt', 'Net Amount', 'Earnings Entries', 'Debt Entries', ...allCategories],
      ...monthlyWorkerSummaries.map(worker => [
        worker.worker_name,
        worker.eid,
        worker.month_year,
        worker.totalEarnings.toFixed(2),
        worker.totalDebt.toFixed(2),
        worker.netAmount.toFixed(2),
        worker.earningsEntries.toString(),
        worker.debtEntries.toString(),
        ...allCategories.map(category => (worker.debtsByCategory[category] || 0).toFixed(2))
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'monthly_debt_summary_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate totals based on filtered data
  const totalEarnings = monthlyWorkerSummaries.reduce((sum, worker) => sum + worker.totalEarnings, 0);
  const totalDebt = monthlyWorkerSummaries.reduce((sum, worker) => sum + worker.totalDebt, 0);
  const totalNetAmount = monthlyWorkerSummaries.reduce((sum, worker) => sum + worker.netAmount, 0);

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
              {selectedMonthYear ? `${t('monthlyWorkerEarningsVsDebt')} - ${selectedMonthYear}` : t('monthlyWorkerEarningsVsDebt')}
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

      {/* Month/Year Selector */}
      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('selectMonthYearForPayslips')} *
            </label>
            <select
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
            >
              <option value="">{t('selectMonthYear')}</option>
              {generateMonthOptions().map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedMonthYear 
                ? `${t('showing')} ${t('payslipsFor')} ${selectedMonthYear}`
                : t('selectMonthToViewPayslips')
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          {/* Active Filters Display */}
          {(filterConfig.category || filterConfig.search) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('activeFilters')}:
              </p>
              <div className="flex flex-wrap gap-2">
                {filterConfig.category && (
                  <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-800'}`}>
                    {t('category')}: {filterConfig.category}
                  </span>
                )}
                {filterConfig.search && (
                  <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'}`}>
                    {t('search')}: "{filterConfig.search}"
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Month Selected Message */}
      {!selectedMonthYear ? (
        <div className="text-center py-12">
          <Calculator size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('selectMonthToViewData')}
          </h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            {t('chooseMonthYearFromDropdown')}
          </p>
        </div>
      ) : (
        <>
      {/* Summary Statistics (based on filtered data) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('workersInMonth')}</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {monthlyWorkerSummaries.length}
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

      {/* Monthly Worker Summary Table */}
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
              {monthlyWorkerSummaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`px-6 py-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex flex-col items-center">
                      <Calculator size={48} className="mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">{t('noDataForSelectedMonth')}</p>
                      <p className="text-sm">{t('noWorkersFoundForMonth', { month: selectedMonthYear })}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                monthlyWorkerSummaries.map((worker) => (
                  <tr key={`${worker.eid}-${worker.month_year}`} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {worker.worker_name}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                        {worker.eid}
                      </span>
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
      {monthlyWorkerSummaries.length > 0 && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('showing')} {monthlyWorkerSummaries.length} {t('workersFor')} {selectedMonthYear}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {filterConfig.category || filterConfig.search ? t('filteredResults') : t('allWorkersForMonth')}
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
        </>
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