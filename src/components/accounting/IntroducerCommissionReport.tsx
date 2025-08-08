import React, { useState, useMemo } from 'react';
import { DollarSign, Download, ChevronDown, ChevronRight, Users, TrendingUp } from 'lucide-react';
import { AccountingData, FilterConfig } from '../../lib/accountingTypes';
import { WorkerData } from '../../lib/workersTypes';

interface IntroducerCommissionReportProps {
  accountingData: AccountingData[];
  workers: WorkerData[];
  darkMode: boolean;
}

interface IntroducerCommission {
  introducerName: string;
  introducedWorkers: {
    eid: string;
    name: string;
    totalEarnings: number;
    entryCount: number;
  }[];
  totalCommissionBase: number;
  commissionAmount: number;
}

const IntroducerCommissionReport: React.FC<IntroducerCommissionReportProps> = ({
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
  const [expandedIntroducers, setExpandedIntroducers] = useState<Set<string>>(new Set());

  const COMMISSION_RATE = 0.05; // 5%

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

  // Process introducer commissions
  const introducerCommissions = useMemo(() => {
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

    // Group workers by introducer
    const introducerMap = new Map<string, IntroducerCommission>();

    // Get workers with introducers
    const workersWithIntroducers = workers.filter(w => w.Introducer && w.Introducer.trim());

    workersWithIntroducers.forEach(worker => {
      const introducerName = worker.Introducer!;
      
      if (!introducerMap.has(introducerName)) {
        introducerMap.set(introducerName, {
          introducerName,
          introducedWorkers: [],
          totalCommissionBase: 0,
          commissionAmount: 0
        });
      }

      // Calculate total earnings for this worker
      const workerEarnings = filteredData
        .filter(entry => entry.eid === worker.EID)
        .reduce((sum, entry) => sum + entry.total, 0);

      const workerEntryCount = filteredData
        .filter(entry => entry.eid === worker.EID).length;

      if (workerEarnings > 0) {
        const commission = introducerMap.get(introducerName)!;
        commission.introducedWorkers.push({
          eid: worker.EID,
          name: worker.Name,
          totalEarnings: workerEarnings,
          entryCount: workerEntryCount
        });
        commission.totalCommissionBase += workerEarnings;
        commission.commissionAmount = commission.totalCommissionBase * COMMISSION_RATE;
      }
    });

    // Convert to array and sort by commission amount (highest first)
    const commissions = Array.from(introducerMap.values())
      .filter(commission => commission.introducedWorkers.length > 0)
      .sort((a, b) => b.commissionAmount - a.commissionAmount);

    return commissions;
  }, [accountingData, workers, filterConfig]);

  const toggleIntroducerExpansion = (introducerName: string) => {
    const newExpanded = new Set(expandedIntroducers);
    if (newExpanded.has(introducerName)) {
      newExpanded.delete(introducerName);
    } else {
      newExpanded.add(introducerName);
    }
    setExpandedIntroducers(newExpanded);
  };

  const handleExport = () => {
    const csvContent = [
      ['Introducer', 'Introduced Workers', 'Total Commission Base', 'Commission Amount (5%)'],
      ...introducerCommissions.map(commission => [
        commission.introducerName,
        commission.introducedWorkers.length.toString(),
        commission.totalCommissionBase.toFixed(2),
        commission.commissionAmount.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'introducer_commission_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalCommissions = introducerCommissions.reduce((sum, commission) => sum + commission.commissionAmount, 0);
  const totalIntroducedWorkers = introducerCommissions.reduce((sum, commission) => sum + commission.introducedWorkers.length, 0);

  // Get all unique categories and work types for filters
  const allCategories = useMemo(() => {
    const categories = new Set(workers.map(w => w.Department));
    return Array.from(categories).sort();
  }, [workers]);

  const allWorkTypes = useMemo(() => {
    const workTypes = new Set(accountingData.map(d => d.work));
    return Array.from(workTypes).sort();
  }, [accountingData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <DollarSign size={24} className="text-indigo-500" />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Introducer Commission Report
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              5% commission calculations for worker introducers
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className={`flex items-center px-3 py-2 rounded-md text-sm ${
            darkMode ? 'bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
          }`}
        >
          <Download size={16} className="mr-1" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
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
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
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
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
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
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="">All Work Types</option>
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
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Introducers</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {introducerCommissions.length}
              </p>
            </div>
            <Users size={32} className="text-indigo-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Introduced Workers</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalIntroducedWorkers}
              </p>
            </div>
            <TrendingUp size={32} className="text-blue-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Commissions</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                ${totalCommissions.toFixed(2)}
              </p>
            </div>
            <DollarSign size={32} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Commission Table */}
      <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
        {introducerCommissions.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No Commission Data
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No workers with introducers have earnings in the selected period
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {introducerCommissions.map((commission) => (
              <div key={commission.introducerName}>
                {/* Introducer Header */}
                <div
                  className={`p-4 cursor-pointer transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleIntroducerExpansion(commission.introducerName)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        {expandedIntroducers.has(commission.introducerName) ? (
                          <ChevronDown size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                        ) : (
                          <ChevronRight size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                        )}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {commission.introducerName}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {commission.introducedWorkers.length} introduced worker{commission.introducedWorkers.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ${commission.commissionAmount.toFixed(2)}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        5% of ${commission.totalCommissionBase.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded Worker Details */}
                {expandedIntroducers.has(commission.introducerName) && (
                  <div className={`px-4 pb-4 ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'}`}>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <th className={`px-4 py-2 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                              EID
                            </th>
                            <th className={`px-4 py-2 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                              Worker Name
                            </th>
                            <th className={`px-4 py-2 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                              Entries
                            </th>
                            <th className={`px-4 py-2 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                              Total Earnings
                            </th>
                            <th className={`px-4 py-2 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                              Commission (5%)
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                          {commission.introducedWorkers
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((worker) => (
                            <tr key={worker.eid}>
                              <td className={`px-4 py-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {worker.eid}
                              </td>
                              <td className={`px-4 py-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {worker.name}
                              </td>
                              <td className={`px-4 py-2 text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {worker.entryCount}
                              </td>
                              <td className={`px-4 py-2 text-sm font-semibold text-center ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                ${worker.totalEarnings.toFixed(2)}
                              </td>
                              <td className={`px-4 py-2 text-sm font-semibold text-center ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                ${(worker.totalEarnings * COMMISSION_RATE).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {introducerCommissions.length > 0 && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {introducerCommissions.length} introducers • {totalIntroducedWorkers} introduced workers
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Commission Rate: 5% of introduced workers' total earnings
              </p>
            </div>
            <div>
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Total Commissions: ${totalCommissions.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroducerCommissionReport;