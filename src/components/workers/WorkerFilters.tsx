import React from 'react';
import { Search, X } from 'lucide-react';
import { FilterConfig } from '../../lib/workersTypes';

interface WorkerFiltersProps {
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  departments: string[];
  companies: string[];
  darkMode: boolean;
}

const WorkerFilters: React.FC<WorkerFiltersProps> = ({
  filterConfig,
  onFilterChange,
  departments,
  companies,
  darkMode
}) => {
  const handleFilterChange = (key: keyof FilterConfig, value: string) => {
    onFilterChange({
      ...filterConfig,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      department: '',
      company: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const hasActiveFilters = Object.values(filterConfig).some(value => value !== '');

  return (
    <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`flex items-center text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
          >
            <X size={16} className="mr-1" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Search
          </label>
          <div className="relative">
            <Search size={16} className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={filterConfig.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name, EID, department..."
              className={`w-full pl-10 pr-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Department
          </label>
          <select
            value={filterConfig.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Company */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Company
          </label>
          <select
            value={filterConfig.company}
            onChange={(e) => handleFilterChange('company', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Date From
          </label>
          <input
            type="date"
            value={filterConfig.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Date To
          </label>
          <input
            type="date"
            value={filterConfig.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filterConfig.search && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
              Search: "{filterConfig.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-1 hover:text-blue-600"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filterConfig.department && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'}`}>
              Dept: {filterConfig.department}
              <button
                onClick={() => handleFilterChange('department', '')}
                className="ml-1 hover:text-green-600"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filterConfig.company && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-800'}`}>
              Company: {filterConfig.company}
              <button
                onClick={() => handleFilterChange('company', '')}
                className="ml-1 hover:text-purple-600"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {(filterConfig.dateFrom || filterConfig.dateTo) && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
              Date: {filterConfig.dateFrom || '...'} - {filterConfig.dateTo || '...'}
              <button
                onClick={() => {
                  handleFilterChange('dateFrom', '');
                  handleFilterChange('dateTo', '');
                }}
                className="ml-1 hover:text-yellow-600"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerFilters;