import React, { useState, useMemo } from 'react';
import { TrendingUp, Download, Users, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { AccountingData, FilterConfig, SortConfig } from '../../lib/accountingTypes';
import { WorkerData } from '../../lib/workersTypes';
import { useLanguage } from '../../contexts/LanguageContext';

interface DepartmentDetailReportProps {
  accountingData: AccountingData[];
  workers: WorkerData[];
  darkMode: boolean;
}

interface WorkerDetail {
  eid: string;
  name: string;
  totalEarnings: number;
  entryCount: number;
}

const DepartmentDetailReport: React.FC<DepartmentDetailReportProps> = ({
  accountingData,
  workers,
  darkMode
}) => {
  const { t } = useLanguage();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    monthFrom: '',
    monthTo: '',
    category: '',
    work: '',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'totalEarnings',
    direction: 'desc'
  });

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

  // Get all unique departments
  const allDepartments = useMemo(() => {
    const departments = new Set(workers.map(w => w.Department));
    return Array.from(departments).sort();
  }, [workers]);

  // Get all unique work types
  const allWorkTypes = useMemo(() => {
    const workTypes = new Set(accountingData.map(d => d.work));
    return Array.from(workTypes).sort();
  }, [accountingData]);

  // Process worker details for selected department
  const workerDetails = useMemo(() => {
    if (!selectedDepartment) return [];

    let filteredData = accountingData.filter(entry => entry.category === selectedDepartment);

    // Apply additional filters
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

    // Group by worker
    const workerMap = new Map<string, WorkerDetail>();

    filteredData.forEach(entry => {
      if (!workerMap.has(entry.eid)) {
        workerMap.set(entry.eid, {
          eid: entry.eid,
          name: entry.name,
          totalEarnings: 0,
          entryCount: 0
        });
      }

      const worker = workerMap.get(entry.eid)!;
      worker.totalEarnings += entry.total;
      worker.entryCount += 1;
    });

    // Convert to array and sort
    let details = Array.from(workerMap.values());

    // Apply sorting
    details.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof WorkerDetail];
      const bValue = b[sortConfig.key as keyof WorkerDetail];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return details;
  }, [accountingData, selectedDepartment, filterConfig, sortConfig]);

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
    if (!selectedDepartment) return;

    const csvContent = [
      ['EID', 'Name', 'Total Earnings', 'Entry Count', 'Average per Entry'],
      ...workerDetails.map(worker => [
        worker.eid,
        worker.name,
        worker.totalEarnings.toFixed(2),
        worker.entryCount.toString(),
        (worker.totalEarnings / worker.entryCount).toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDepartment.toLowerCase().replace(/\s+/g, '_')}_detail_report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const departmentTotal = workerDetails.reduce((sum, worker) => sum + worker.totalEarnings, 0);
  const departmentWorkerCount = workerDetails.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp size={24} className="text-yellow-500" />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('departmentDetailReport')}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('detailedWorkerEarnings')}
            </p>
          </div>
        </div>
        {selectedDepartment && (
          <button
            onClick={handleExport}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              darkMode ? 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            <Download size={16} className="mr-1" />
            {t('export')} CSV
          </button>
        )}
      </div>

      {/* Department Selector */}
      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('selectDepartmentCategory')} *
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            >
              <option value="">{t('chooseDepartmentToView')}</option>
              {allDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          {selectedDepartment && (
            <div className={`p-3 rounded-md ${darkMode ? 'bg-yellow-900/10' : 'bg-yellow-50'}`}>
              <p className={`text-sm font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                {selectedDepartment}
              </p>
              <p className={`text-xs ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                {departmentWorkerCount} {t('workers')} • ${departmentTotal.toFixed(2)} {t('totalEarnings')}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedDepartment ? (
        <>
          {/* Filters */}
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('searchWorkers')}
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
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
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
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
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
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                  <option value="">{t('allMonthsTo')}</option>
                  {generateMonthOptions().map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('workType')}
                </label>
                <select
                  value={filterConfig.work}
                  onChange={(e) => setFilterConfig(prev => ({ ...prev, work: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                  <option value="">{t('allWorkTypes')}</option>
                  {allWorkTypes.map(work => (
                    <option key={work} value={work}>{work}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Worker Details Table */}
          <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
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
                    className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{t('name')}</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th
                    className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                    onClick={() => handleSort('entryCount')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>{t('entries')}</span>
                      {getSortIcon('entryCount')}
                    </div>
                  </th>
                  <th
                    className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                    onClick={() => handleSort('totalEarnings')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>{t('totalEarnings')}</span>
                      {getSortIcon('totalEarnings')}
                    </div>
                  </th>
                  <th className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('averagePerEntry')}
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {workerDetails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-6 py-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="flex flex-col items-center">
                        <Users size={48} className="mb-4 text-gray-400" />
                        <p className="text-lg font-medium mb-2">{t('noWorkersFound')}</p>
                        <p className="text-sm">
                          {selectedDepartment 
                            ? t('noWorkersInDepartment')
                            : t('selectDepartmentToView')
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  workerDetails.map((worker, index) => (
                    <tr key={worker.eid} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {worker.eid}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {worker.name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {worker.entryCount}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-center ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ${worker.totalEarnings.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        ${(worker.totalEarnings / worker.entryCount).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Department Summary */}
          {workerDetails.length > 0 && (
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedDepartment} {t('departmentSummary')}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {departmentWorkerCount} {t('workers')} • {t('average')}: ${(departmentTotal / departmentWorkerCount).toFixed(2)} {t('perWorker')}
                  </p>
                </div>
                <div>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('total')}: ${departmentTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <TrendingUp size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('selectDepartment')}
          </h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            {t('chooseDepartmentFromDropdown')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {allDepartments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
                }`}
              >
                <p className="font-medium">{dept}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {workers.filter(w => w.Department === dept).length} {t('workers')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetailReport;