import React from 'react';
import { CloudRain } from 'lucide-react';

interface MonthlyTotal {
  month: number;
  year: number;
  total: number;
  monthName: string;
}

interface MonthlyRainfallCardsProps {
  monthlyTotals: MonthlyTotal[];
  unit: 'mm' | 'inches';
  onMonthClick: (month: number) => void;
  darkMode: boolean;
}

const MonthlyRainfallCards: React.FC<MonthlyRainfallCardsProps> = ({
  monthlyTotals,
  unit,
  onMonthClick,
  darkMode
}) => {
  const formatRainfall = (value: number): string => {
    return `${value.toFixed(1)} ${unit}`;
  };

  const getCardColor = (total: number) => {
    if (total === 0) return darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
    if (total < 50) return darkMode ? 'bg-blue-900/10 border-blue-900/20' : 'bg-blue-50 border-blue-200';
    if (total < 100) return darkMode ? 'bg-green-900/10 border-green-900/20' : 'bg-green-50 border-green-200';
    return darkMode ? 'bg-indigo-900/10 border-indigo-900/20' : 'bg-indigo-50 border-indigo-200';
  };

  const getTextColor = (total: number) => {
    if (total === 0) return darkMode ? 'text-gray-400' : 'text-gray-500';
    if (total < 50) return darkMode ? 'text-blue-400' : 'text-blue-700';
    if (total < 100) return darkMode ? 'text-green-400' : 'text-green-700';
    return darkMode ? 'text-indigo-400' : 'text-indigo-700';
  };

  const getIconColor = (total: number) => {
    if (total === 0) return 'text-gray-400';
    if (total < 50) return 'text-blue-500';
    if (total < 100) return 'text-green-500';
    return 'text-indigo-500';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {monthlyTotals.map((monthData) => (
        <div
          key={monthData.month}
          onClick={() => onMonthClick(monthData.month)}
          className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getCardColor(monthData.total)} hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {monthData.monthName}
            </h3>
            <CloudRain size={20} className={getIconColor(monthData.total)} />
          </div>
          
          <div className="space-y-1">
            <p className={`text-2xl font-bold ${getTextColor(monthData.total)}`}>
              {formatRainfall(monthData.total)}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Total rainfall
            </p>
          </div>

          {/* Visual bar indicator */}
          <div className={`mt-3 h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className={`h-full rounded-full transition-all ${
                monthData.total === 0 ? 'bg-gray-400' :
                monthData.total < 50 ? 'bg-blue-500' :
                monthData.total < 100 ? 'bg-green-500' : 'bg-indigo-500'
              }`}
              style={{
                width: `${Math.min(100, (monthData.total / 200) * 100)}%`
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MonthlyRainfallCards;