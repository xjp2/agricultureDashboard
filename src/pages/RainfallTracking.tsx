import React, { useState, useEffect } from 'react';
import { Calendar, CloudRain, TrendingUp, ChevronLeft, ChevronRight, Droplets, Settings, ArrowLeft, Plus, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RainfallLocation, RainfallData, RainfallLocationWithStats, MonthlyTotal } from '../lib/rainfallTypes';
import RainfallCalendar from '../components/RainfallCalendar';
import MonthlyRainfallCards from '../components/MonthlyRainfallCards';
import YearlyRainfallSummary from '../components/YearlyRainfallSummary';
import StatCard from '../components/StatCard';
import LocationCard from '../components/rainfall/LocationCard';
import CreateLocationModal from '../components/rainfall/CreateLocationModal';
import { useLanguage } from '../contexts/LanguageContext';

interface RainfallTrackingProps {
  darkMode: boolean;
}

const RainfallTracking: React.FC<RainfallTrackingProps> = ({ darkMode }) => {
  const { t } = useLanguage();
  const [locations, setLocations] = useState<RainfallLocationWithStats[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<RainfallLocation | null>(null);
  const [rainfallData, setRainfallData] = useState<RainfallData[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedView, setSelectedView] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [unit, setUnit] = useState<'mm' | 'inches'>('mm');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([]);
  const [yearlyTotal, setYearlyTotal] = useState(0);
  const [showCreateLocationModal, setShowCreateLocationModal] = useState(false);
  const [viewMode, setViewMode] = useState<'locations' | 'tracking'>('locations');

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchRainfallData();
      const unsubscribe = setupRealtimeSubscription();
      return unsubscribe;
    }
  }, [selectedLocation, currentYear]);

  useEffect(() => {
    if (selectedLocation) {
      calculateTotals();
    }
  }, [rainfallData, currentYear]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: locationsData, error: locationsError } = await supabase
        .from('rainfallLocations')
        .select('*')
        .order('name');

      if (locationsError) {
        throw locationsError;
      }

      // Calculate statistics for each location
      const locationsWithStats: RainfallLocationWithStats[] = [];

      for (const location of locationsData || []) {
        const { data: rainfallStats, error: statsError } = await supabase
          .from('rainfallData')
          .select('rainfall, date, created_at')
          .eq('location_id', location.id)
          .order('date', { ascending: false });

        if (statsError) {
          console.error('Error fetching rainfall stats for location:', location.name, statsError);
          continue;
        }

        const totalRainfall = rainfallStats?.reduce((sum, entry) => sum + entry.rainfall, 0) || 0;
        const entryCount = rainfallStats?.length || 0;
        const lastEntry = rainfallStats?.[0]?.date;
        const averageRainfall = entryCount > 0 ? totalRainfall / entryCount : 0;

        locationsWithStats.push({
          ...location,
          totalRainfall,
          entryCount,
          lastEntry,
          averageRainfall
        });
      }

      setLocations(locationsWithStats);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const fetchRainfallData = async () => {
    if (!selectedLocation) return;

    try {
      setLoading(true);
      setError(null);

      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      const { data, error: fetchError } = await supabase
        .from('rainfallData')
        .select('*')
        .eq('location_id', selectedLocation.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setRainfallData(data || []);
    } catch (err) {
      console.error('Error fetching rainfall data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rainfall data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('rainfall_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rainfallData'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchRainfallData();
          fetchLocations(); // Refresh location stats
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rainfallLocations'
        },
        () => {
          fetchLocations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const calculateTotals = () => {
    // Calculate monthly totals
    const monthlyData: { [key: string]: number } = {};
    
    rainfallData.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + entry.rainfall;
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthlyTotalsData: MonthlyTotal[] = monthNames.map((name, index) => {
      const monthKey = `${currentYear}-${index}`;
      return {
        month: name,
        total: monthlyData[monthKey] || 0,
        monthIndex: index
      };
    });

    setMonthlyTotals(monthlyTotalsData);

    // Calculate yearly total
    const yearlyTotalValue = rainfallData
      .filter(entry => new Date(entry.date).getFullYear() === currentYear)
      .reduce((sum, entry) => sum + entry.rainfall, 0);
    
    setYearlyTotal(yearlyTotalValue);
  };

  const convertUnit = (value: number, fromUnit: 'mm' | 'inches', toUnit: 'mm' | 'inches'): number => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'mm' && toUnit === 'inches') return value / 25.4;
    if (fromUnit === 'inches' && toUnit === 'mm') return value * 25.4;
    return value;
  };

  const formatRainfall = (value: number): string => {
    return `${value.toFixed(1)} ${unit}`;
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    setCurrentYear(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    }
  };

  const handleMonthCardClick = (month: number) => {
    setCurrentMonth(month);
    setSelectedView('daily');
  };

  const handleLocationSelect = (location: RainfallLocation) => {
    setSelectedLocation(location);
    setViewMode('tracking');
  };

  const handleBackToLocations = () => {
    setSelectedLocation(null);
    setViewMode('locations');
    setRainfallData([]);
    setMonthlyTotals([]);
    setYearlyTotal(0);
  };

  const handleLocationCreated = () => {
    fetchLocations();
    setShowCreateLocationModal(false);
  };

  const handleLocationUpdated = () => {
    fetchLocations();
  };

  const handleLocationDeleted = () => {
    fetchLocations();
    if (selectedLocation) {
      handleBackToLocations();
    }
  };

  const getAverageRainfall = () => {
    const today = new Date();
    let dayOfYear: number;
    
    if (currentYear === today.getFullYear()) {
      // For current year, calculate actual day of year
      const start = new Date(currentYear, 0, 0);
      const diff = today.getTime() - start.getTime();
      dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    } else {
      // For past/future years, use total days in year
      const isLeapYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0);
      dayOfYear = isLeapYear ? 366 : 365;
    }
    
    return dayOfYear > 0 ? yearlyTotal / dayOfYear : 0;
  };

  const getRainyDaysCount = () => {
    return rainfallData.filter(entry => entry.rainfall > 0).length;
  };

  const getAverageRainyDays = () => {
    const rainyDaysCount = getRainyDaysCount();
    const today = new Date();
    const currentDate = new Date(currentYear, today.getMonth(), today.getDate());
    
    let dayOfYear: number;
    
    if (currentYear === today.getFullYear()) {
      // For current year, calculate actual day of year
      const start = new Date(currentYear, 0, 0);
      const diff = currentDate.getTime() - start.getTime();
      dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    } else {
      // For past/future years, use total days in year
      const isLeapYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0);
      dayOfYear = isLeapYear ? 366 : 365;
    }
    
    return dayOfYear > 0 ? rainyDaysCount / dayOfYear : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            {viewMode === 'locations' ? 'Loading locations...' : 'Loading rainfall data...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading data: {error}</p>
          <button 
            onClick={viewMode === 'locations' ? fetchLocations : fetchRainfallData}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Location selection view
  if (viewMode === 'locations') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {t('rainfallTrackingLocations')}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('selectLocationToTrack')}
            </p>
          </div>
          <button
            onClick={() => setShowCreateLocationModal(true)}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            <Plus size={16} className="mr-2" />
            {t('addLocation')}
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title={t('totalLocations')}
            value={locations.length.toString()}
            icon={<MapPin size={20} />}
            trend={0}
            color="blue"
            darkMode={darkMode}
          />
          <StatCard
            title={t('totalRainfallRecords')}
            value={locations.reduce((sum, loc) => sum + loc.entryCount, 0).toString()}
            icon={<CloudRain size={20} />}
            trend={0}
            color="green"
            darkMode={darkMode}
          />
          <StatCard
            title={t('combinedRainfall')}
            value={formatRainfall(locations.reduce((sum, loc) => sum + loc.totalRainfall, 0))}
            icon={<Droplets size={20} />}
            trend={0}
            color="purple"
            darkMode={darkMode}
          />
        </div>

        {/* Locations Grid */}
        {locations.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('noDataFound')}
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              {t('createFirstLocation')}
            </p>
            <button
              onClick={() => setShowCreateLocationModal(true)}
              className={`flex items-center px-4 py-2 rounded-md ${
                darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              <Plus size={16} className="mr-2" />
              {t('createFirstLocation')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map(location => (
              <LocationCard
                key={location.id}
                location={location}
                unit={unit}
                onSelect={() => handleLocationSelect(location)}
                onUpdated={handleLocationUpdated}
                onDeleted={handleLocationDeleted}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}

        {/* Create Location Modal */}
        <CreateLocationModal
          isOpen={showCreateLocationModal}
          onClose={() => setShowCreateLocationModal(false)}
          onLocationCreated={handleLocationCreated}
          darkMode={darkMode}
        />
      </div>
    );
  }

  // Rainfall tracking view for selected location
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToLocations}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {selectedLocation?.name} - {t('rainfallTracking')}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('monitorAndTrackDaily')}
            </p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedView('daily')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedView === 'daily'
                  ? darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setSelectedView('monthly')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedView === 'monthly'
                  ? darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Yearly Summary */}
      <YearlyRainfallSummary
        year={currentYear}
        total={yearlyTotal}
        unit={unit}
        onYearChange={handleYearChange}
        darkMode={darkMode}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title={t('totalRainfall')}
          value={formatRainfall(yearlyTotal)}
          icon={<CloudRain size={20} />}
          trend={0}
          color="blue"
          darkMode={darkMode}
        />
        <StatCard
          title={t('rainyDays')}
          value={getRainyDaysCount().toString()}
          icon={<Droplets size={20} />}
          trend={0}
          color="green"
          darkMode={darkMode}
        />
        <StatCard
          title={t('averageRainfallPerDay')}
          value={formatRainfall(getAverageRainfall())}
          icon={<TrendingUp size={20} />}
          trend={0}
          color="purple"
          darkMode={darkMode}
        />
      </div>

      {/* Main Content */}
      {selectedView === 'monthly' && (
        <div className="space-y-6">
          <MonthlyRainfallCards
            monthlyTotals={monthlyTotals}
            onMonthClick={handleMonthCardClick}
            darkMode={darkMode}
          />
        </div>
      )}

      {selectedView === 'daily' && (
        <div className="space-y-6">
          {/* Month Navigation */}
          <div className={`flex items-center justify-between p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <button
              onClick={() => handleMonthChange('prev')}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h3>
            <button
              onClick={() => handleMonthChange('next')}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar */}
          <RainfallCalendar
            year={currentYear}
            month={currentMonth}
            rainfallData={rainfallData}
            locationId={selectedLocation?.id || 0}
            onDataUpdate={fetchRainfallData}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
};

export default RainfallTracking;