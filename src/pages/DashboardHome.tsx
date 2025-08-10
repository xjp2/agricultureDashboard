import React from 'react';
import { Map, Users, Package, BarChart4, Sprout, Cloud, AlertTriangle, MapPin, CloudRain, Leaf, Calculator, Plus, TrendingUp, Calendar, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import WeatherCard from '../components/WeatherCard';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardHomeProps {
  darkMode: boolean;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ darkMode }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t('farmOverview')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title={t('totalPhases')} 
            value="5" 
            icon={<Map size={20} />} 
            trend={5} 
            color="blue"
            darkMode={darkMode}
          />
          <StatCard 
            title={t('fieldHealth')} 
            value="87%" 
            icon={<Sprout size={20} />} 
            trend={-2} 
            color="green"
            darkMode={darkMode}
          />
          <StatCard 
            title={t('workersOnDuty')} 
            value="18" 
            icon={<Users size={20} />} 
            trend={0} 
            color="purple"
            darkMode={darkMode}
          />
          <StatCard 
            title={t('monthlyPayroll')} 
            value="$12,450" 
            icon={<Calculator size={20} />} 
            trend={-4} 
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
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>5</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalBlocks')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>23</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('activeTasks')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>47</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalArea')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>1,250 {t('acres')}</span>
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
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>8</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('yearlyRainfall')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>1,245 {t('mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('rainyDays')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>89</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('lastRecorded')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('today')}</span>
              </div>
            </div>
            <button className={`w-full mt-4 px-3 py-2 text-sm rounded-md ${darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>
              <Plus size={16} className="inline mr-1" />
              {t('recordRainfall')}
            </button>
          </div>

          {/* Fertilizer Management Summary */}
          <div className={`border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700'}`}>
                  <Leaf size={20} />
                </div>
                <h3 className={`ml-3 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('fertilizer')}
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('activePrograms')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>3</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('monthlyApplications')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>156</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalFertilizerUsed')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>2,340 {t('kg')}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('programStatus')}:</span>
                <span className={`text-sm font-medium text-green-500`}>{t('active')}</span>
              </div>
            </div>
            <button className={`w-full mt-4 px-3 py-2 text-sm rounded-md ${darkMode ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
              <Leaf size={16} className="inline mr-1" />
              {t('manageFertilizer')}
            </button>
          </div>

          {/* Worker Management Summary */}
          <div className={`border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-purple-700'}`}>
                  <Users size={20} />
                </div>
                <h3 className={`ml-3 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('workers')}
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalWorkers')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>45</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('departments')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>8</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('newHires')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>3 {t('thisMonth')}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('attendanceRate')}:</span>
                <span className={`text-sm font-medium text-green-500`}>94%</span>
              </div>
            </div>
            <button className={`w-full mt-4 px-3 py-2 text-sm rounded-md ${darkMode ? 'bg-purple-900/20 text-purple-400 hover:bg-purple-900/30' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}>
              <Users size={16} className="inline mr-1" />
              {t('addNewWorker')}
            </button>
          </div>

          {/* Accounting System Summary */}
          <div className={`border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'}`}>
                  <Calculator size={20} />
                </div>
                <h3 className={`ml-3 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('accounting')}
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('monthlyPayroll')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>$12,450</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalRecords')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>234</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('pendingEntries')}:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>7</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('commissionsDue')}:</span>
                <span className={`text-sm font-medium text-green-500`}>$622.50</span>
              </div>
            </div>
            <button className={`w-full mt-4 px-3 py-2 text-sm rounded-md ${darkMode ? 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>
              <Calculator size={16} className="inline mr-1" />
              {t('addPayrollEntry')}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t('quickActions')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} text-center transition-colors`}>
            <Map size={24} className={`mx-auto mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('addNewPhase')}</p>
          </button>
          <button className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} text-center transition-colors`}>
            <CloudRain size={24} className={`mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('recordRainfall')}</p>
          </button>
          <button className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} text-center transition-colors`}>
            <Users size={24} className={`mx-auto mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('addNewWorker')}</p>
          </button>
          <button className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} text-center transition-colors`}>
            <Calculator size={24} className={`mx-auto mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('addPayrollEntry')}</p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {t('weatherConditions')}
            </h2>
            <button className={`text-sm px-3 py-1 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
              {t('viewForecast')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WeatherCard 
              location="North Fields"
              date="Today, May 10"
              temperature={24}
              condition="sunny"
              humidity={45}
              windSpeed={8}
              precipitation={0}
              darkMode={darkMode}
            />
            <WeatherCard 
              location="South Fields"
              date="Today, May 10"
              temperature={22}
              condition="cloudy"
              humidity={60}
              windSpeed={12}
              precipitation={5}
              darkMode={darkMode}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {t('alerts')}
            </h2>
            <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-800'}`}>
              4 New
            </span>
          </div>
          <div className={`space-y-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 shadow-sm`}>
            <div className={`flex items-start p-3 rounded-md ${darkMode ? 'bg-red-900/10' : 'bg-red-50'} border ${darkMode ? 'border-red-900/20' : 'border-red-100'}`}>
              <AlertTriangle size={20} className="text-red-500 mr-3 mt-0.5" />
              <div>
                <h4 className={`font-medium text-sm ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                  {t('lowInventoryAlert')}
                </h4>
                <p className={`text-xs mt-1 ${darkMode ? 'text-red-300/70' : 'text-red-700/70'}`}>
                  {t('fertilizerStockLow')}
                </p>
                <div className="mt-2">
                  <button className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/40' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                    {t('orderMore')}
                  </button>
                </div>
              </div>
            </div>
            
            <div className={`flex items-start p-3 rounded-md ${darkMode ? 'bg-yellow-900/10' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-900/20' : 'border-yellow-100'}`}>
              <AlertTriangle size={20} className="text-yellow-500 mr-3 mt-0.5" />
              <div>
                <h4 className={`font-medium text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                  {t('payrollPending')}
                </h4>
                <p className={`text-xs mt-1 ${darkMode ? 'text-yellow-300/70' : 'text-yellow-700/70'}`}>
                  {t('payrollEntriesPending')}
                </p>
                <div className="mt-2">
                  <button className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/40' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>
                    {t('reviewEntries')}
                  </button>
                </div>
              </div>
            </div>
            
            <div className={`flex items-start p-3 rounded-md ${darkMode ? 'bg-blue-900/10' : 'bg-blue-50'} border ${darkMode ? 'border-blue-900/20' : 'border-blue-100'}`}>
              <AlertTriangle size={20} className="text-blue-500 mr-3 mt-0.5" />
              <div>
                <h4 className={`font-medium text-sm ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                  {t('weatherAlert')}
                </h4>
                <p className={`text-xs mt-1 ${darkMode ? 'text-blue-300/70' : 'text-blue-700/70'}`}>
                  {t('heavyRainExpected')}
                </p>
                <div className="mt-2">
                  <button className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/40' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>
                    {t('viewForecast')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {t('recentActivity')}
          </h2>
          <button className={`text-sm px-3 py-1 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
            {t('viewAll')}
          </button>
        </div>
        <div className={`rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden shadow-sm`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('activity')}
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('performedBy')}
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('location')}
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('time')}
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('status')}
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <tr>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t('fertilizerApplication')}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  John Smith
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('phaseDetails')} A2
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  1 {t('hourAgo')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'}`}>
                    {t('completed')}
                  </span>
                </td>
              </tr>
              <tr>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t('payrollEntry')}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Sarah Johnson
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('accounting')}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  2 {t('hoursAgo')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
                    {t('processing')}
                  </span>
                </td>
              </tr>
              <tr>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t('rainfallRecording')}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Mike Davis
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('rainfall')}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('yesterday')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'}`}>
                    {t('completed')}
                  </span>
                </td>
              </tr>
              <tr>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t('workerRegistration')}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Admin User
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('workers')}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('yesterday')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
                    {t('inProgress')}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;