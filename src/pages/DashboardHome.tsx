import React, { useState, useEffect } from 'react';
import { Map, Users, Package, BarChart4, Sprout, Cloud, AlertTriangle, MapPin, CloudRain, Leaf, Calculator, Plus, TrendingUp, Calendar, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import WeatherCard from '../components/WeatherCard';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardHomeProps {
  darkMode: boolean;
}

interface DashboardStats {
  phases: number;
  blocks: number;
  tasks: number;
  totalArea: number;
  totalTrees: number;
  rainfallLocations: number;
  yearlyRainfall: number;
  rainyDays: number;
  totalWorkers: number;
  departments: number;
  companies: number;
  newHiresThisMonth: number;
  totalEarnings: number;
  totalRecords: number;
  currentMonthEarnings: number;
  activePrograms: number;
  monthlyApplications: number;
  totalFertilizerUsed: number;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ darkMode }) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    phases: 0,
    blocks: 0,
    tasks: 0,
    totalArea: 0,
    totalTrees: 0,
    rainfallLocations: 0,
    yearlyRainfall: 0,
    rainyDays: 0,
    totalWorkers: 0,
    departments: 0,
    companies: 0,
    newHiresThisMonth: 0,
    totalEarnings: 0,
    totalRecords: 0,
    currentMonthEarnings: 0,
    activePrograms: 0,
    monthlyApplications: 0,
    totalFertilizerUsed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch phases data
      const { data: phasesData, error: phasesError } = await supabase
        .from('PhaseData')
        .select('*');

      if (phasesError) throw phasesError;

      // Fetch blocks data
      const { data: blocksData, error: blocksError } = await supabase
        .from('BlockData')
        .select('*');

      if (blocksError) throw blocksError;

      // Fetch tasks data
      const { data: tasksData, error: tasksError } = await supabase
        .from('TaskData')
        .select('*');

      if (tasksError) throw tasksError;

      // Fetch rainfall locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('rainfallLocations')
        .select('*');

      if (locationsError) throw locationsError;

      // Fetch rainfall data for current year
      const currentYear = new Date().getFullYear();
      const { data: rainfallData, error: rainfallError } = await supabase
        .from('rainfallData')
        .select('*')
        .gte('date', `${currentYear}-01-01`)
        .lte('date', `${currentYear}-12-31`);

      if (rainfallError) throw rainfallError;

      // Fetch workers data
      const { data: workersData, error: workersError } = await supabase
        .from('workersData')
        .select('*');

      if (workersError) throw workersError;

      // Fetch accounting data
      const { data: accountingData, error: accountingError } = await supabase
        .from('accountingData')
        .select('*');

      if (accountingError) throw accountingError;

      // Fetch fertilizer data
      const { data: yearFertilizerData, error: yearFertilizerError } = await supabase
        .from('yearFertilizerData')
        .select('*');

      if (yearFertilizerError) throw yearFertilizerError;

      const { data: monthFertilizerData, error: monthFertilizerError } = await supabase
        .from('monthFertilizerData')
        .select('*');

      if (monthFertilizerError) throw monthFertilizerError;

      // Fetch phase start dates to count active programs
      const { data: phaseStartDates, error: phaseStartError } = await supabase
        .from('phaseStartDateData')
        .select('*');

      if (phaseStartError) throw phaseStartError;

      // Calculate statistics
      const totalArea = phasesData?.reduce((sum, phase) => sum + (phase.Area || 0), 0) || 0;
      const totalTrees = phasesData?.reduce((sum, phase) => sum + (phase.Trees || 0), 0) || 0;
      const yearlyRainfall = rainfallData?.reduce((sum, entry) => sum + entry.rainfall, 0) || 0;
      const rainyDays = rainfallData?.filter(entry => entry.rainfall > 0).length || 0;
      
      // Calculate unique departments and companies
      const departments = new Set(workersData?.map(w => w.Department) || []).size;
      const companies = new Set(workersData?.map(w => w.Company) || []).size;
      
      // Calculate new hires this month
      const currentMonth = new Date().getMonth();
      const currentYearForHires = new Date().getFullYear();
      const newHiresThisMonth = workersData?.filter(worker => {
        const joinDate = new Date(worker.Date_Joined);
        return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYearForHires;
      }).length || 0;

      // Calculate accounting statistics
      const totalEarnings = accountingData?.reduce((sum, entry) => sum + entry.total, 0) || 0;
      const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const currentMonthEarnings = accountingData?.filter(entry => entry.month === currentMonthName)
        .reduce((sum, entry) => sum + entry.total, 0) || 0;

      // Calculate fertilizer statistics
      const currentMonthFertilizer = monthFertilizerData?.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYearForHires;
      }) || [];

      const totalYearlyFertilizer = yearFertilizerData?.reduce((sum, entry) => sum + entry.kilogram_amount, 0) || 0;
      const totalMonthlyFertilizer = monthFertilizerData?.reduce((sum, entry) => sum + (entry.bag * entry.quantity), 0) || 0;

      setStats({
        phases: phasesData?.length || 0,
        blocks: blocksData?.length || 0,
        tasks: tasksData?.length || 0,
        totalArea,
        totalTrees,
        rainfallLocations: locationsData?.length || 0,
        yearlyRainfall,
        rainyDays,
        totalWorkers: workersData?.length || 0,
        departments,
        companies,
        newHiresThisMonth,
        totalEarnings,
        totalRecords: accountingData?.length || 0,
        currentMonthEarnings,
        activePrograms: phaseStartDates?.length || 0,
        monthlyApplications: currentMonthFertilizer.length,
        totalFertilizerUsed: totalYearlyFertilizer + totalMonthlyFertilizer
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            {t('loadingDashboard')}
          </p>
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
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t('farmOverview')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title={t('totalPhases')} 
            value={stats.phases.toString()} 
            icon={<Map size={20} />} 
            trend={0} 
            color="blue"
            darkMode={darkMode}
          />
          <StatCard 
            title={t('totalArea')} 
            value={`${stats.totalArea.toFixed(1)} ${t('acres')}`} 
            icon={<Sprout size={20} />} 
            trend={0} 
            color="green"
            darkMode={darkMode}
          />
          <StatCard 
            title={t('totalWorkers')} 
            value={stats.totalWorkers.toString()} 
            icon={<Users size={20} />} 
            trend={0} 
            color="purple"
            darkMode={darkMode}
          />
          <StatCard 
            title={t('monthlyPayroll')} 
            value={`$${stats.currentMonthEarnings.toFixed(2)}`} 
            icon={<Calculator size={20} />} 
            trend={0} 
            color="yellow"
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* System Overview */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t('systemOverview')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Field Visualization Summary */}
          <div className={`border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700'}`}>
                  <Map size={20} />
                </div>
                <h3 className={`ml-3 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('fields')}
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalPhases')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.phases}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalBlocks')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.blocks}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('activeTasks')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.tasks}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalArea')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalArea.toFixed(1)} {t('acres')}</span>
              </div>
            </div>
            <button className={`w-full mt-4 px-3 py-2 text-sm rounded-md ${darkMode ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
              <Plus size={16} className="inline mr-1" />
              {t('addNewPhase')}
            </button>
          </div>

          {/* Rainfall Tracking Summary */}
          <div className={`border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                  <CloudRain size={20} />
                </div>
                <h3 className={`ml-3 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('rainfall')}
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('trackingLocations')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.rainfallLocations}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('yearlyRainfall')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.yearlyRainfall.toFixed(1)} {t('mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('rainyDays')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.rainyDays}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('averageDaily')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.rainyDays > 0 ? (stats.yearlyRainfall / stats.rainyDays).toFixed(1) : '0.0'} {t('mm')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;