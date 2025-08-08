import React from 'react';
import { Battery, AlertCircle, Check } from 'lucide-react';

interface DroneCardProps {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'maintenance' | 'charging';
  battery: number;
  lastMission: string;
  darkMode: boolean;
}

const DroneCard: React.FC<DroneCardProps> = ({ 
  id, 
  name, 
  status, 
  battery, 
  lastMission,
  darkMode
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'maintenance':
        return 'bg-red-500';
      case 'charging':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getBatteryIcon = () => {
    if (battery < 20) {
      return <Battery size={16} className="text-red-500" />;
    } else if (battery < 50) {
      return <Battery size={16} className="text-yellow-500" />;
    } else {
      return <Battery size={16} className="text-green-500" />;
    }
  };

  return (
    <div className={`border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()} mr-2`}></div>
          <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{name}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === 'active' ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800' :
          status === 'maintenance' ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800' :
          status === 'charging' ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800' :
          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      
      <div className={`grid grid-cols-2 gap-2 mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <div>
          <p className="flex items-center">
            {getBatteryIcon()}
            <span className="ml-1">{battery}%</span>
          </p>
        </div>
        <div>
          <p>ID: {id}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs">Last mission: {lastMission}</p>
        </div>
      </div>
      
      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
        <button className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
          Details
        </button>
        {status === 'maintenance' ? (
          <button className="flex items-center text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
            <AlertCircle size={12} className="mr-1" />
            Fix Issues
          </button>
        ) : (
          <button className={`flex items-center text-xs px-2 py-1 rounded ${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'}`}>
            <Check size={12} className="mr-1" />
            Deploy
          </button>
        )}
      </div>
    </div>
  );
};

export default DroneCard;