import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  color: string;
  darkMode: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend = 0, color, darkMode }) => {
  const getColorClass = (colorName: string) => {
    switch (colorName) {
      case 'green':
        return darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700';
      case 'blue':
        return darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-700';
      case 'yellow':
        return darkMode ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-700';
      case 'purple':
        return darkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-purple-700';
      case 'red':
        return darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700';
      default:
        return darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700';
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{title}</h3>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClass(color)}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end">
        <p className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        {trend !== 0 && (
          <span className={`ml-2 text-sm flex items-center ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;