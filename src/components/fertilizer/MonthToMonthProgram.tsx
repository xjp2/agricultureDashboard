import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, PhaseData, BlockData } from '../../lib/supabase';
import { PhaseStartDateData, MonthFertilizerData } from '../../lib/fertilizerTypes';
import MonthlyEntryModal from './MonthlyEntryModal';
import { useLanguage } from '../../contexts/LanguageContext';

interface MonthToMonthProgramProps {
  phase: PhaseData;
  phaseStartDate: PhaseStartDateData;
  darkMode: boolean;
}

const MonthToMonthProgram: React.FC<MonthToMonthProgramProps> = ({
  phase,
  phaseStartDate,
  darkMode
}) => {
  const { t } = useLanguage();
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [fertilizerData, setFertilizerData] = useState<MonthFertilizerData[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const startDate = new Date(phaseStartDate.start_date);

  useEffect(() => {
    // Set current date to start date initially
    setCurrentDate(new Date(startDate));
    fetchData();
  }, [phase.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch blocks for this phase
      const { data: blocksData, error: blocksError } = await supabase
        .from('BlockData')
        .select('*')
        .eq('FK_Phase', phase.Phase)
        .order('Block');

      if (blocksError) throw blocksError;

      // Fetch fertilizer data for this phase
      const { data: fertilizerDataResult, error: fertilizerError } = await supabase
        .from('monthFertilizerData')
        .select('*')
        .eq('phase_id', phase.id);

      if (fertilizerError) throw fertilizerError;

      setBlocks(blocksData || []);
      setFertilizerData(fertilizerDataResult || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const getEntriesForDate = (dateString: string) => {
    return fertilizerData.filter(entry => entry.date === dateString);
  };

  const handleDateClick = (day: number) => {
    const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    setSelectedDate(dateString);
    setShowEntryModal(true);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleEntryAdded = () => {
    fetchData();
    setShowEntryModal(false);
    setSelectedDate(null);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className={`h-20 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
      const entries = getEntriesForDate(dateString);
      const isCurrentDay = isToday(currentDate.getFullYear(), currentDate.getMonth(), day);
      const hasEntries = entries.length > 0;

      days.push(
        <div
          key={day}
          className={`h-20 border p-2 transition-colors relative ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          } ${
            isCurrentDay
                ? darkMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-300'
                : hasEntries
                  ? darkMode ? 'bg-green-900/20 hover:bg-green-900/30 cursor-pointer' : 'bg-green-50 hover:bg-green-100 cursor-pointer'
                  : darkMode ? 'bg-gray-800 hover:bg-gray-700 cursor-pointer' : 'bg-white hover:bg-gray-50 cursor-pointer'
          }`}
          onClick={() => handleDateClick(day)}
        >
          <div className={`text-sm font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {day}
          </div>
          
          {hasEntries && (
            <div className="absolute bottom-1 left-1 right-1">
              <div className={`text-xs font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {entries.reduce((sum, entry) => sum + (entry.bag * entry.quantity), 0)} kg
              </div>
            </div>
          )}

          {!hasEntries && (
            <div className="absolute bottom-1 left-1 right-1">
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Click to add
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('loadingCalendarData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={24} className="text-blue-500" />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('monthToMonthProgram')}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('clickDateToAddApplication')}
            </p>
          </div>
        </div>
      </div>

      {/* Program Period Info */}
      <div className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <strong>{t('programStarted')}</strong> {startDate.toLocaleDateString()}
        </p>
      </div>

      {/* Calendar */}
      <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
        {/* Month Navigation */}
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <button
            onClick={() => handleMonthChange('prev')}
            className={`p-2 rounded-full ${
              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          <button
            onClick={() => handleMonthChange('next')}
            className={`p-2 rounded-full ${
              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7">
          {weekDays.map(day => (
            <div
              key={day}
              className={`p-3 text-center text-sm font-medium border-b ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 border-gray-600' 
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>

        {/* Legend */}
        <div className={`p-3 border-t ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${darkMode ? 'bg-blue-900/20 border border-blue-500' : 'bg-blue-50 border border-blue-300'}`}></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('today')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('hasApplications')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Modal */}
      {showEntryModal && selectedDate && (
        <MonthlyEntryModal
          isOpen={showEntryModal}
          onClose={() => {
            setShowEntryModal(false);
            setSelectedDate(null);
          }}
          onEntryAdded={handleEntryAdded}
          phaseId={phase.id}
          date={selectedDate}
          blocks={blocks}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default MonthToMonthProgram;