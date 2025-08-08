import React, { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Search, Filter, Download, ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WorkerData, WorkerFormData, SortConfig, FilterConfig, PaginationConfig } from '../lib/workersTypes';
import WorkerFormModal from '../components/workers/WorkerFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import WorkerFilters from '../components/workers/WorkerFilters';
import WorkerTable from '../components/workers/WorkerTable';
import StatCard from '../components/StatCard';

interface WorkerManagementProps {
  darkMode: boolean;
}

const WorkerManagement: React.FC<WorkerManagementProps> = ({ darkMode }) => {
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerData | null>(null);
  const [deletingWorker, setDeletingWorker] = useState<WorkerData | null>(null);
  
  // Table states
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'Date_Joined', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    search: '',
    department: '',
    company: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    limit: 10,
    total: 0
  });
  
  // UI states
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    fetchWorkers();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError, count } = await supabase
        .from('workersData')
        .select('*', { count: 'exact' })
        .order('Date_Joined', { ascending: false });

      if (fetchError) throw fetchError;

      setWorkers(data || []);
      setPagination(prev => ({ ...prev, total: count || 0 }));
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('workers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workersData'
        },
        () => {
          fetchWorkers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  // Filtered and sorted data
  const processedWorkers = useMemo(() => {
    let filtered = [...workers];

    // Apply filters
    if (filterConfig.search) {
      const searchLower = filterConfig.search.toLowerCase();
      filtered = filtered.filter(worker =>
        worker.Name.toLowerCase().includes(searchLower) ||
        worker.EID.toLowerCase().includes(searchLower) ||
        worker.Department.toLowerCase().includes(searchLower) ||
        worker.Company.toLowerCase().includes(searchLower) ||
        (worker.Introducer && worker.Introducer.toLowerCase().includes(searchLower))
      );
    }

    if (filterConfig.department) {
      filtered = filtered.filter(worker => worker.Department === filterConfig.department);
    }

    if (filterConfig.company) {
      filtered = filtered.filter(worker => worker.Company === filterConfig.company);
    }

    if (filterConfig.dateFrom) {
      filtered = filtered.filter(worker => worker.Date_Joined >= filterConfig.dateFrom);
    }

    if (filterConfig.dateTo) {
      filtered = filtered.filter(worker => worker.Date_Joined <= filterConfig.dateTo);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [workers, filterConfig, sortConfig]);

  // Paginated data
  const paginatedWorkers = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return processedWorkers.slice(startIndex, endIndex);
  }, [processedWorkers, pagination.page, pagination.limit]);

  const handleSort = (key: keyof WorkerData) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCreateWorker = () => {
    setEditingWorker(null);
    setShowFormModal(true);
  };

  const handleEditWorker = (worker: WorkerData) => {
    setEditingWorker(worker);
    setShowFormModal(true);
  };

  const handleDeleteWorker = (worker: WorkerData) => {
    setDeletingWorker(worker);
    setShowDeleteModal(true);
  };

  const handleWorkerSaved = () => {
    setShowFormModal(false);
    setEditingWorker(null);
    fetchWorkers();
  };

  const handleWorkerDeleted = async () => {
    if (!deletingWorker) return;

    try {
      const { error: deleteError } = await supabase
        .from('workersData')
        .delete()
        .eq('id', deletingWorker.id);

      if (deleteError) throw deleteError;

      setShowDeleteModal(false);
      setDeletingWorker(null);
      fetchWorkers();
    } catch (err) {
      console.error('Error deleting worker:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete worker');
    }
  };

  const handleBulkDelete = async () => {
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedWorkers.length === 0) return;

    try {
      const { error: deleteError } = await supabase
        .from('workersData')
        .delete()
        .in('id', selectedWorkers);

      if (deleteError) throw deleteError;

      setSelectedWorkers([]);
      setShowBulkDeleteModal(false);
      fetchWorkers();
    } catch (err) {
      console.error('Error deleting workers:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete workers');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'EID', 'Department', 'Company', 'Introducer', 'Date Joined'],
      ...processedWorkers.map(worker => [
        worker.Name,
        worker.EID,
        worker.Department,
        worker.Company,
        worker.Introducer || '',
        new Date(worker.Date_Joined).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workers_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get unique values for filters
  const departments = useMemo(() => 
    [...new Set(workers.map(w => w.Department))].sort(), [workers]
  );
  
  const companies = useMemo(() => 
    [...new Set(workers.map(w => w.Company))].sort(), [workers]
  );

  const totalPages = Math.ceil(processedWorkers.length / pagination.limit);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading workers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Worker Management
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your workforce and employee information
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
          <button
            onClick={handleExport}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
          <button
            onClick={handleCreateWorker}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            <UserPlus size={16} className="mr-2" />
            Add Worker
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Workers"
          value={workers.length.toString()}
          icon={<Users size={20} />}
          trend={0}
          color="blue"
          darkMode={darkMode}
        />
        <StatCard
          title="Departments"
          value={departments.length.toString()}
          icon={<Users size={20} />}
          trend={0}
          color="green"
          darkMode={darkMode}
        />
        <StatCard
          title="Companies"
          value={companies.length.toString()}
          icon={<Users size={20} />}
          trend={0}
          color="purple"
          darkMode={darkMode}
        />
        <StatCard
          title="This Month"
          value={workers.filter(w => {
            const joinDate = new Date(w.Date_Joined);
            const now = new Date();
            return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
          }).length.toString()}
          icon={<UserPlus size={20} />}
          trend={0}
          color="yellow"
          darkMode={darkMode}
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <WorkerFilters
          filterConfig={filterConfig}
          onFilterChange={setFilterConfig}
          departments={departments}
          companies={companies}
          darkMode={darkMode}
        />
      )}

      {/* Bulk Actions */}
      {selectedWorkers.length > 0 && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {selectedWorkers.length} worker{selectedWorkers.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash2 size={16} className="mr-1" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Workers Table */}
      <WorkerTable
        workers={paginatedWorkers}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectedWorkers={selectedWorkers}
        onSelectionChange={setSelectedWorkers}
        onEdit={handleEditWorker}
        onDelete={handleDeleteWorker}
        darkMode={darkMode}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-between p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, processedWorkers.length)} of {processedWorkers.length} workers
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded-md text-sm ${
                pagination.page === 1
                  ? darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              Previous
            </button>
            <span className={`px-3 py-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Page {pagination.page} of {totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
              disabled={pagination.page === totalPages}
              className={`px-3 py-1 rounded-md text-sm ${
                pagination.page === totalPages
                  ? darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <WorkerFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingWorker(null);
        }}
        onWorkerSaved={handleWorkerSaved}
        worker={editingWorker}
        darkMode={darkMode}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingWorker(null);
        }}
        onConfirm={handleWorkerDeleted}
        title="Delete Worker"
        message="Are you sure you want to delete this worker? This action cannot be undone."
        itemName={deletingWorker ? `${deletingWorker.Name} (${deletingWorker.EID})` : ''}
        darkMode={darkMode}
      />

      <DeleteConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
        }}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Multiple Workers"
        message={`Are you sure you want to delete ${selectedWorkers.length} worker${selectedWorkers.length > 1 ? 's' : ''}? This action cannot be undone.`}
        itemName={`${selectedWorkers.length} selected worker${selectedWorkers.length > 1 ? 's' : ''}`}
        darkMode={darkMode}
      />
    </div>
  );
};

export default WorkerManagement;