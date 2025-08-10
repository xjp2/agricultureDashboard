import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';
import { WorkerData, SortConfig } from '../../lib/workersTypes';
import { useLanguage } from '../../contexts/LanguageContext';

interface WorkerTableProps {
  workers: WorkerData[];
  sortConfig: SortConfig;
  onSort: (key: keyof WorkerData) => void;
  selectedWorkers: number[];
  onSelectionChange: (selected: number[]) => void;
  onEdit: (worker: WorkerData) => void;
  onDelete: (worker: WorkerData) => void;
  darkMode: boolean;
}

const WorkerTable: React.FC<WorkerTableProps> = ({
  workers,
  sortConfig,
  onSort,
  selectedWorkers,
  onSelectionChange,
  onEdit,
  onDelete,
  darkMode
}) => {
  const { t } = useLanguage();
  
  const getSortIcon = (key: keyof WorkerData) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={16} className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={16} className="text-blue-500" />
      : <ArrowDown size={16} className="text-blue-500" />;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(workers.map(w => w.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectWorker = (workerId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedWorkers, workerId]);
    } else {
      onSelectionChange(selectedWorkers.filter(id => id !== workerId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const isAllSelected = workers.length > 0 && selectedWorkers.length === workers.length;
  const isPartiallySelected = selectedWorkers.length > 0 && selectedWorkers.length < workers.length;

  return (
    <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isPartiallySelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {[
                { key: 'Name' as keyof WorkerData, label: t('name') },
                { key: 'EID' as keyof WorkerData, label: t('employeeId') },
                { key: 'Department' as keyof WorkerData, label: t('department') },
                { key: 'Company' as keyof WorkerData, label: t('company') },
                { key: 'Introducer' as keyof WorkerData, label: t('introducer') },
                { key: 'Date_Joined' as keyof WorkerData, label: t('dateJoined') }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => onSort(key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    {getSortIcon(key)}
                  </div>
                </th>
              ))}
              <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {workers.length === 0 ? (
              <tr>
                <td colSpan={8} className={`px-6 py-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-2">{t('noWorkersFound')}</p>
                    <p className="text-sm">{t('addFirstWorker')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr
                  key={worker.id}
                  className={`${
                    selectedWorkers.includes(worker.id)
                      ? darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                      : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedWorkers.includes(worker.id)}
                      onChange={(e) => handleSelectWorker(worker.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {worker.Name}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                      {worker.EID}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {worker.Department}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {worker.Company}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {worker.Introducer || '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatDate(worker.Date_Joined)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(worker)}
                        className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-100 text-blue-600'}`}
                        title="Edit worker"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(worker)}
                        className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                        title="Delete worker"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkerTable;