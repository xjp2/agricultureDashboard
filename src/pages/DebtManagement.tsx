import React, { useState, useEffect } from 'react';
import { Calculator, Plus, FileText, Users, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WorkerData } from '../lib/workersTypes';
import { AccountingData } from '../lib/accountingTypes';
import { DebtData, DebtOption } from '../lib/debtTypes';
import DebtDataEntry from '../components/debt/DebtDataEntry';
import DebtSummaryReport from '../components/debt/DebtSummaryReport';
import StatCard from '../components/StatCard';
import { useLanguage } from '../contexts/LanguageContext';

interface DebtManagementProps {
  darkMode: boolean;
}

type DebtView = 'entry' | 'summary';

const DebtManagement: React.FC<DebtManagementProps> = ({ darkMode }) => {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<DebtView>('entry');
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [debtOptions, setDebtOptions] = useState<DebtOption[]>([]);
  const [debtData, setDebtData] = useState<DebtData[]>([]);
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

      // Fetch debt options
      const { data: debtOptionsData, error: debtOptionsError } = await supabase
        .from('debtOption')
        .select('*')
        .order('category_name');

      if (debtOptionsError) throw debtOptionsError;

      // Fetch debt data
      const { data: debtDataResult, error: debtError } = await supabase
        .from('debtData')
        .select('*')
        .order('created_at', { ascending: false });

      if (debtError) throw debtError;

      // Fetch accounting data for calculations
      const { data: accountingDataResult, error: accountingError } = await supabase
        .from('accountingData')
        .select('*')
        .order('created_at', { ascending: false });

      if (accountingError) throw accountingError;

      setWorkers(workersData || []);
      setDebtOptions(debtOptionsData || []);
      setDebtData(debtDataResult || []);
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
      .channel('debt_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debtData'
        },
        () => {
          fetchDebtData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debtOption'
        },
        () => {
          fetchDebtOptions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchDebtData = async () => {
    try {
      const { data, error } = await supabase
        .from('debtData')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDebtData(data || []);
    } catch (err) {
      console.error('Error fetching debt data:', err);
    }
  };

  const fetchDebtOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('debtOption')
        .select('*')
        .order('category_name');

      if (error) throw error;
      setDebtOptions(data || []);
    } catch (err) {
      console.error('Error fetching debt options:', err);
    }
  };

  const handleDataEntrySuccess = () => {
    fetchDebtData();
  };

  const handleDebtOptionUpdated = () => {
    fetchDebtOptions();
  };

  // Calculate statistics
  const totalDebt = debtData.reduce((sum, entry) => sum + entry.amount, 0);
  const uniqueWorkers = new Set(debtData.map(entry => entry.worker_name)).size;
  const currentMonthData = debtData.filter(entry => {
    const currentDate = new Date();
    const entryDate = new Date(entry.month_year);
    return entryDate.getMonth() === currentDate.getMonth() && 
           entryDate.getFullYear() === currentDate.getFullYear();
  });
  const currentMonthDebt = currentMonthData.reduce((sum, entry) => sum + entry.amount, 0);

  const getViewTitle = () => {
    switch (currentView) {
      case 'entry':
        return t('debtEntry');
      case 'summary':
        return t('debtSummary');
      default:
        return t('debtManagement');
    }
  };

  const getViewDescription = () => {
    switch (currentView) {
      case 'entry':
        return t('recordWorkerDebt');
      case 'summary':
        return t('viewWorkerDebtSummaries');
      default:
        return t('recordWorkerDebt');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('loadingData')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{t('error')}: {error}</p>
          <button 
            onClick={fetchInitialData}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            {t('retry')}
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
                ? darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-800'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <Plus size={16} className="mr-1" />
            {t('entry')}
          </button>
          <button
            onClick={() => setCurrentView('summary')}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              currentView === 'summary'
                ? darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <FileText size={16} className="mr-1" />
            {t('debtSummary')}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title={t('totalDebt')}
          value={`$${totalDebt.toFixed(2)}`}
          icon={<Calculator size={20} />}
          trend={0}
          color="red"
          darkMode={darkMode}
        />
        <StatCard
          title={t('workersWithDebt')}
          value={uniqueWorkers.toString()}
          icon={<Users size={20} />}
          trend={0}
          color="blue"
          darkMode={darkMode}
        />
        <StatCard
          title={t('thisMonth')}
          value={`$${currentMonthDebt.toFixed(2)}`}
          icon={<DollarSign size={20} />}
          trend={0}
          color="purple"
          darkMode={darkMode}
        />
        <StatCard
          title={t('totalRecords')}
          value={debtData.length.toString()}
          icon={<FileText size={20} />}
          trend={0}
          color="yellow"
          darkMode={darkMode}
        />
      </div>

      {/* Main Content */}
      <div className="min-h-96">
        {currentView === 'entry' && (
          <DebtDataEntry
            workers={workers}
            debtOptions={debtOptions}
            onDataEntrySuccess={handleDataEntrySuccess}
            onDebtOptionUpdated={handleDebtOptionUpdated}
            darkMode={darkMode}
          />
        )}
        {currentView === 'summary' && (
          <DebtSummaryReport
            debtData={debtData}
            accountingData={accountingData}
            workers={workers}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
};

export default DebtManagement;