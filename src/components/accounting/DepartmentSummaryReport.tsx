import React, { useState, useMemo } from 'react';
import { FileText, Download, TrendingUp, Users } from 'lucide-react';
import { AccountingData, FilterConfig } from '../../lib/accountingTypes';
import { WorkerData } from '../../lib/workersTypes';
import { useLanguage } from '../../contexts/LanguageContext';

interface DepartmentSummaryReportProps {
  accountingData: AccountingData[];
  workers: WorkerData[];
  darkMode: boolean;
}

interface DepartmentSummary {
  category: string;
  totalEarnings: number;
  workerCount: number;
  averageEarnings: number;
}

const DepartmentSummaryReport: React.FC<DepartmentSummaryReportProps> = ({
  accountingData,
  workers,
  darkMode
}) => {
  const { t } = useLanguage();
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    monthFrom: '',
    monthTo: '',
    category: '',
    work: '',
    search: ''
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

  // Process department summaries
  const departmentSummaries = useMemo(() => {
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
    if (filterConfig.work) {
      filteredData = filteredData.filter(entry => entry.work === filterConfig.work);
    }

    // Group by category
    const categoryMap = new Map<string, { totalEarnings: number; workers: Set<string> }>();

    filteredData.forEach(entry => {
      if (!categoryMap.has(entry.category)) {
        categoryMap.set(entry.category, {
          totalEarnings: 0,
          workers: new Set()
        });
      }

      const categoryData = categoryMap.get(entry.category)!;
      categoryData.totalEarnings += entry.total;
      categoryData.workers.add(entry.eid);
    });

    // Convert to array with calculated averages
    const summaries: DepartmentSummary[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      totalEarnings: data.totalEarnings,
      workerCount: data.workers.size,
      averageEarnings: data.workers.size > 0 ? data.totalEarnings / data.workers.size : 0
    }));

    // Sort by total earnings (highest first)
    summaries.sort((a, b) => b.totalEarnings - a.totalEarnings);

    return summaries;
  }, [accountingData, filterConfig]);

  const handleExport = () => {
    const csvContent = [
      ['Department/Category', 'Total Earnings', 'Worker Count', 'Average per Worker'],
      ...departmentSummaries.map(dept => [
        dept.category,
        dept.totalEarnings.toFixed(2),
        dept.workerCount.toString(),
        dept.averageEarnings.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'department_summary_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalEarnings = departmentSummaries.reduce((sum, dept) => sum + dept.totalEarnings, 0);
  const totalWorkers = departmentSummaries.reduce((sum, dept) => sum + dept.workerCount, 0);

  // Get all unique work types for filter
  const allWorkTypes = useMemo(() => {
    const workTypes = new Set(accountingData.map(d => d.work));
    return Array.from(workTypes).sort();
  }, [accountingData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText size={24} className="text-purple-500" />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('departmentSummaryReport')}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('totalEarningsGrouped')}
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className={`flex items-center px-3 py-2 rounded-md text-sm ${
            darkMode ? 'bg-purple-900/20 text-purple-400 hover:bg-purple-900/30' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          }`}
        >
          <Download size={16} className="mr-1" />
          {t('export')} CSV
        </button>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
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
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
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
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="">{t('allWorkTypes')}</option>
              {allWorkTypes.map(work => (
                <option key={work} value={work}>{work}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Departments</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {departmentSummaries.length}
              </p>
            </div>
            <FileText size={32} className="text-purple-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Workers</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalWorkers}
              </p>
            </div>
            <Users size={32} className="text-blue-500" />
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
            <TrendingUp size={32} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Department Summary Table */}
      <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                {t('department')}/{t('category')}
              </th>
              <th className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                {t('workerCount')}
              </th>
              <th className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                {t('totalEarnings')}
              </th>
              <th className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                {t('averagePerWorker')}
              </th>
              <th className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                {t('percentageOfTotal')}
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {departmentSummaries.length === 0 ? (
              <tr>
                <td colSpan={5} className={`px-6 py-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="flex flex-col items-center">
                    <FileText size={48} className="mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">{t('noDepartmentData')}</p>
                    <p className="text-sm">{t('tryAdjustingFilters')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              departmentSummaries.map((dept, index) => {
                const percentage = totalEarnings > 0 ? (dept.totalEarnings / totalEarnings) * 100 : 0;
                
                return (
                  <tr key={dept.category} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3`} style={{
                          backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
                        }}></div>
                        {dept.category}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {dept.workerCount}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-center ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      ${dept.totalEarnings.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      ${dept.averageEarnings.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="flex items-center justify-center">
                        <div className={`w-16 h-2 rounded-full mr-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div
                            className="h-full rounded-full bg-purple-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        {percentage.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      {departmentSummaries.length > 0 && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {departmentSummaries.length} {t('departments')} • {totalWorkers} {t('workers')}
              </p>
            </div>
            <div>
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('grandTotal')}: ${totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentSummaryReport;