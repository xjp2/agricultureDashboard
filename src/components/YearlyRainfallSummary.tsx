import React from 'react';
import { ChevronLeft, ChevronRight, CloudRain, TrendingUp } from 'lucide-react';

interface YearlyRainfallSummaryProps {
  year: number;
  total: number;
  onYearChange: (direction: 'prev' | 'next') => void;
  darkMode: boolean;
}

const YearlyRainfallSummary: React.FC<YearlyRainfallSummaryProps> = ({
  year,
  total,
  onYearChange,
  darkMode
}) => {
  const formatRainfall = (value: number): string => {
    return `${value.toFixed(1)} mm`;
  };

  const currentYear = new Date().getFullYear();
  const isCurrentYear = year === currentYear;

  return (
    <div className={`p-4 sm:p-6 rounded-xl border-2 ${
      darkMode 
        ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-900/30' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
    } shadow-lg`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>
            <CloudRain size={32} className="text-blue-500" />
          </div>
          
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <button
                onClick={() => onYearChange('prev')}
                className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white/50'} transition-colors`}
              >
                <ChevronLeft size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
              </button>
              
              <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex flex-wrap items-center gap-2`}>
                {year}
                {isCurrentYear && (
                  <span className={`text-xs sm:text-sm font-normal px-2 py-1 rounded-full ${
                    darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                  }`}>
                    Current
                  </span>
                )}
              </h1>
              
              <button
                onClick={() => onYearChange('next')}
                className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white/50'} transition-colors`}
              >
                <ChevronRight size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            </div>
            
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Annual Rainfall Summary
            </p>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
            <TrendingUp size={20} className="text-blue-500" />
            <span className={`text-4xl font-bold ${
              total > 0 
                ? darkMode ? 'text-blue-400' : 'text-blue-600'
                : darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {formatRainfall(total)}
            </span>
          </div>
          <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total for {year}
          </p>
        </div>
      </div>

      {/* Progress bar showing rainfall distribution */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-xs mb-2">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Rainfall Progress
          </span>
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {total > 0 ? 'Active' : 'No data recorded'}
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className={`h-full rounded-full transition-all ${
              total === 0 ? 'bg-gray-400' :
              total < 500 ? 'bg-blue-500' :
              total < 1000 ? 'bg-green-500' : 'bg-indigo-500'
            }`}
            style={{
              width: `${Math.min(100, (total / 1500) * 100)}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default YearlyRainfallSummary;