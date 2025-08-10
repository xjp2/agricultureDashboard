import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface RainfallData {
  id: number;
  rainfall: number;
  date: string;
  created_at: string;
}

interface RainfallCalendarProps {
  year: number;
  month: number;
  rainfallData: RainfallData[];
  locationId: number;
  onDataUpdate: () => void;
  darkMode: boolean;
}

const RainfallCalendar: React.FC<RainfallCalendarProps> = ({
  year,
  month,
  rainfallData,
  locationId,
  onDataUpdate,
  darkMode
}) => {
  const { t } = useLanguage();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getRainfallForDate = (dateString: string) => {
    return rainfallData.find(entry => entry.date === dateString);
  };

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const handleCellClick = (day: number) => {
    const dateString = formatDate(year, month, day);
    const existingData = getRainfallForDate(dateString);
    
    setEditingCell(dateString);
    setInputValue(existingData ? existingData.rainfall.toString() : '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setInputValue('');
    }
  };

  const handleInputBlur = () => {
    handleSave();
  };

  const handleSave = async () => {
    if (!editingCell) return;

    const rainfallValue = parseFloat(inputValue) || 0;
    
    if (rainfallValue < 0) {
      alert('Rainfall cannot be negative');
      return;
    }

    setSaving(true);

    try {
      const existingData = getRainfallForDate(editingCell);

      if (existingData) {
        if (rainfallValue === 0) {
          // Delete the entry if rainfall is 0
          const { error } = await supabase
            .from('rainfallData')
            .delete()
            .eq('id', existingData.id);

          if (error) throw error;
        } else {
          // Update existing entry
          const { error } = await supabase
            .from('rainfallData')
            .update({ rainfall: rainfallValue })
            .eq('id', existingData.id);
          if (error) throw error;
        }
      } else if (rainfallValue > 0) {
        // Create new entry only if rainfall > 0
        const { error } = await supabase
          .from('rainfallData')
          .insert({
            rainfall: rainfallValue,
            date: editingCell,
            location_id: locationId
          });

        if (error) throw error;
      }

      onDataUpdate();
    } catch (error) {
      console.error('Error saving rainfall data:', error);
      alert('Failed to save rainfall data. Please try again.');
    } finally {
      setSaving(false);
      setEditingCell(null);
      setInputValue('');
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-20 border border-gray-200 dark:border-gray-700"></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(year, month, day);
      const rainfallEntry = getRainfallForDate(dateString);
      const isCurrentDay = isToday(year, month, day);
      const isEditing = editingCell === dateString;

      days.push(
        <div
          key={day}
          className={`h-20 border border-gray-200 dark:border-gray-700 p-2 cursor-pointer transition-colors relative ${
            isCurrentDay 
              ? darkMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-300'
              : rainfallEntry 
                ? darkMode ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-green-50 hover:bg-green-100'
                : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
          }`}
          onClick={() => !isEditing && handleCellClick(day)}
        >
          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {day}
          </div>
          
          {isEditing ? (
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              className={`absolute bottom-1 left-1 right-1 text-xs px-1 py-0.5 border rounded ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="0 mm"
              autoFocus
              disabled={saving}
            />
          ) : rainfallEntry ? (
            <div className="absolute bottom-1 left-1 right-1">
              <div className={`text-xs font-medium ${
                darkMode ? 'text-green-400' : 'text-green-700'
              }`}>
                {rainfallEntry.rainfall.toFixed(1)} mm
              </div>
            </div>
          ) : (
            <div className="absolute bottom-1 left-1 right-1">
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('clickToAdd')}
              </div>
            </div>
          )}

          {saving && isEditing && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
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
            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('hasRainfallData')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('noData')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RainfallCalendar;