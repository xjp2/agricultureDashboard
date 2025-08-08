import React from 'react';
import { Cloud, CloudRain, Sun, Wind, CloudLightning, CloudSnow, CloudFog } from 'lucide-react';

interface WeatherCardProps {
  location: string;
  date: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'windy';
  humidity: number;
  windSpeed: number;
  precipitation: number;
  darkMode: boolean;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  location,
  date,
  temperature,
  condition,
  humidity,
  windSpeed,
  precipitation,
  darkMode
}) => {
  const getWeatherIcon = () => {
    switch (condition) {
      case 'sunny':
        return <Sun size={40} className="text-yellow-400" />;
      case 'cloudy':
        return <Cloud size={40} className="text-gray-400" />;
      case 'rainy':
        return <CloudRain size={40} className="text-blue-400" />;
      case 'stormy':
        return <CloudLightning size={40} className="text-purple-400" />;
      case 'snowy':
        return <CloudSnow size={40} className="text-blue-200" />;
      case 'foggy':
        return <CloudFog size={40} className="text-gray-300" />;
      case 'windy':
        return <Wind size={40} className="text-blue-300" />;
      default:
        return <Cloud size={40} className="text-gray-400" />;
    }
  };

  const getWeatherConditionName = () => {
    return condition.charAt(0).toUpperCase() + condition.slice(1);
  };

  const getBackgroundColor = () => {
    switch (condition) {
      case 'sunny':
        return darkMode ? 'bg-yellow-900/10' : 'bg-yellow-50';
      case 'cloudy':
        return darkMode ? 'bg-gray-800' : 'bg-gray-50';
      case 'rainy':
      case 'stormy':
        return darkMode ? 'bg-blue-900/10' : 'bg-blue-50';
      case 'snowy':
        return darkMode ? 'bg-blue-900/5' : 'bg-blue-50';
      case 'foggy':
        return darkMode ? 'bg-gray-800' : 'bg-gray-50';
      case 'windy':
        return darkMode ? 'bg-blue-900/5' : 'bg-blue-50';
      default:
        return darkMode ? 'bg-gray-800' : 'bg-white';
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md ${getBackgroundColor()} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{location}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
          </div>
          <div>
            {getWeatherIcon()}
          </div>
        </div>
        
        <div className="flex items-end mb-4">
          <p className={`text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{temperature}°C</p>
          <p className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{getWeatherConditionName()}</p>
        </div>
        
        <div className={`grid grid-cols-3 gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
            <p className="text-sm">{humidity}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
            <p className="text-sm">{windSpeed} km/h</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Rain</p>
            <p className="text-sm">{precipitation} mm</p>
          </div>
        </div>
      </div>
      
      <div className={`px-4 py-3 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center">
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {condition === 'sunny' || condition === 'cloudy' ? 'Good conditions for field work' :
             condition === 'rainy' || condition === 'stormy' ? 'Not suitable for spraying or harvesting' :
             condition === 'windy' ? 'Caution advised for drone operations' :
             'Check field conditions before operations'}
          </p>
          <button className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
            Forecast
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;