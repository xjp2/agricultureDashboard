
import React, { useState, useEffect } from 'react';
import { Calculator, Plus, FileText, Users, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WorkerData } from '../lib/workersTypes';
import { AccountingData, WorkOption, UomOption } from '../lib/accountingTypes'; // Import UomOption
import AccountingDataEntry from '../components/accounting/AccountingDataEntry';
import WorkerSummaryReport from '../components/accounting/WorkerSummaryReport';
import DepartmentSummaryReport from '../components/accounting/DepartmentSummaryReport';
import DepartmentDetailReport from '../components/accounting/DepartmentDetailReport';
import IntroducerCommissionReport from '../components/accounting/IntroducerCommissionReport';
import StatCard from '../components/StatCard';

interface AccountingManagementProps {
  darkMode: boolean;
}

type ReportView = 'entry' | 'worker-summary' | 'department-summary' | 'department-detail' | 'introducer-commission';

const AccountingManagement: React.FC<AccountingManagementProps> = ({ darkMode }) => {
  const [currentView, setCurrentView] = useState<ReportView>('entry');
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [workOptions, setWorkOptions] = useState<WorkOption[]>([]);
  const [uomOptions, setUomOptions] = useState<UomOption[]>([]); // Re-add uomOptions state
  const [accountingData, setAccountingData] = useState<AccountingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch workers
      const { data: workersData, error: workersError } = await supabase
        .from('workersData')
        .select('*')
        .order('Name');

      if (workersError) throw workersError;

      // Fetch work options
      const { data: workOptionsData, error: workOptionsError } = await supabase
        .from('workOption')
        .select('*')
        .order('work_name');

      if (workOptionsError) throw workOptionsError;

      // Fetch UOM options
      const { data: uomOptionsData, error: uomOptionsError } = await supabase
        .from('uomOption')
        .select('*')
        .order('uom_name');

      if (uomOptionsError) throw uomOptionsError;

      // Fetch accounting data
      const { data: accountingDataResult, error: accountingError } = await supabase
        .from('accountingData')
        .select('*')
        .order('created_at', { ascending: false });

      if (accountingError) throw accountingError;

      setWorkers(workersData || []);
      setWorkOptions(workOptionsData || []);
      setUomOptions(uomOptionsData || []); // Set UOM options
      setAccountingData(accountingDataResult || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('accounting_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accountingData'
        },
        () => {
          fetchAccountingData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workOption'
        },
        () => {
          fetchWorkOptions();
        }
      )
      .on( // Re-add UOM real-time subscription
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uomOption'
        },
        () => {
          fetchUomOptions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchAccountingData = async () => {
    try {
      const { data, error } = await supabase
        .from('accountingData')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccountingData(data || []);
    } catch (err) {
      console.error('Error fetching accounting data:', err);
    }
  };

  const fetchWorkOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('workOption')
        .select('*')
        .order('work_name');

      if (error) throw error;
      setWorkOptions(data || []);
    } catch (err) {
      console.error('Error fetching work options:', err);
    }
  };

  const fetchUomOptions = async () => { // Re-add fetchUomOptions
    try {
      const { data, error } = await supabase
        .from('uomOption')
        .select('*')
        .order('uom_name');
      if (error) throw error;
      setUomOptions(data || []);
    } catch (err) { console.error('Error fetching UOM options:', err); }
  };

  const handleDataEntrySuccess = () => {
    fetchAccountingData();
  };

  const handleWorkOptionUpdated = () => {
    fetchWorkOptions();
  };

  const handleUomOptionUpdated = () => { // New handler for UOM updates
    fetchUomOptions();
  };

  // Calculate statistics
  const totalEarnings = accountingData.reduce((sum, entry) => sum + entry.total, 0);
  const uniqueWorkers = new Set(accountingData.map(entry => entry.eid)).size;
  const currentMonthData = accountingData.filter(entry => {
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return entry.month === currentMonth;
  });
  const currentMonthEarnings = currentMonthData.reduce((sum, entry) => sum + entry.total, 0);

  const getViewTitle = () => {
    switch (currentView) {
      case 'entry':
        return 'Data Entry';
      case 'worker-summary':
        return 'Worker Summary Report';
      case 'department-summary':
        return 'Department Summary Report';
      case 'department-detail':
        return 'Department Detail Report';
      case 'introducer-commission':
        return 'Introducer Commission Report';
      default:
        return 'Accounting Management';
    }
  };

  const getViewDescription = () => {
    switch (currentView) {
      case 'entry':
        return 'Enter and manage worker accounting data';
      case 'worker-summary':
        return 'Complete earnings summary for all workers by category';
      case 'department-summary':
        return 'Total earnings grouped by department/category';
      case 'department-detail':
        return 'Detailed worker earnings within specific departments';
      case 'introducer-commission':
        return '5% commission calculations for worker introducers';
      default:
        return 'Comprehensive accounting and payroll management';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading accounting system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={fetchInitialData}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {getViewTitle()}
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {getViewDescription()}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCurrentView('entry')}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              currentView === 'entry'
                ? darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <Plus size={16} className="mr-1" />
            Entry
          </button>
          <button
            onClick={() => setCurrentView('worker-summary')}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              currentView === 'worker-summary'
                ? darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <Users size={16} className="mr-1" />
            Workers
          </button>
          <button
            onClick={() => setCurrentView('department-summary')}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              currentView === 'department-summary'
                ? darkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-800'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <FileText size={16} className="mr-1" />
            Departments
          </button>
          <button
            onClick={() => setCurrentView('department-detail')}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              currentView === 'department-detail'
                ? darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <TrendingUp size={16} className="mr-1" />
            Details
          </button>
          <button
            onClick={() => setCurrentView('introducer-commission')}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              currentView === 'introducer-commission'
                ? darkMode ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-100 text-indigo-800'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <DollarSign size={16} className="mr-1" />
            Commission
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Earnings"
          value={`$${totalEarnings.toFixed(2)}`}
          icon={<DollarSign size={20} />}
          trend={0}
          color="green"
          darkMode={darkMode}
        />
        <StatCard
          title="Active Workers"
          value={uniqueWorkers.toString()}
          icon={<Users size={20} />}
          trend={0}
          color="blue"
          darkMode={darkMode}
        />
        <StatCard
          title="This Month"
          value={`$${currentMonthEarnings.toFixed(2)}`}
          icon={<Calculator size={20} />}
          trend={0}
          color="purple"
          darkMode={darkMode}
        />
        <StatCard
          title="Total Records"
          value={accountingData.length.toString()}
          icon={<FileText size={20} />}
          trend={0}
          color="yellow"
          darkMode={darkMode}
        />
      </div>

      {/* Main Content */}
      <div className="min-h-96">
        {currentView === 'entry' && (
          <AccountingDataEntry
            workers={workers}
            workOptions={workOptions}
            uomOptions={uomOptions} // Pass uomOptions
            onDataEntrySuccess={handleDataEntrySuccess}
            onWorkOptionUpdated={handleWorkOptionUpdated}
            onUomOptionUpdated={handleUomOptionUpdated} // Pass UOM update handler
            darkMode={darkMode} // Pass darkMode prop
          />
        )}
        {currentView === 'worker-summary' && (
          <WorkerSummaryReport
            accountingData={accountingData}
            workers={workers}
            darkMode={darkMode}
          />
        )}
        {currentView === 'department-summary' && (
          <DepartmentSummaryReport
            accountingData={accountingData}
            workers={workers}
            darkMode={darkMode}
          />
        )}
        {currentView === 'department-detail' && (
          <DepartmentDetailReport
            accountingData={accountingData}
            workers={workers}
            darkMode={darkMode}
          />
        )}
        {currentView === 'introducer-commission' && (
          <IntroducerCommissionReport
            accountingData={accountingData}
            workers={workers}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
};

export default AccountingManagement;