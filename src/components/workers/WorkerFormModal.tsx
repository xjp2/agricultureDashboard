import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { WorkerData, WorkerFormData } from '../../lib/workersTypes';
import { useLanguage } from '../../contexts/LanguageContext';

interface WorkerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkerSaved: () => void;
  worker?: WorkerData | null;
  darkMode?: boolean;
}

const WorkerFormModal: React.FC<WorkerFormModalProps> = ({
  isOpen,
  onClose,
  onWorkerSaved,
  worker,
  darkMode = false
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<WorkerFormData>({
    Name: '',
    EID: '',
    Department: '',
    Company: '',
    Introducer: '',
    Date_Joined: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<WorkerFormData>>({});

  useEffect(() => {
    if (isOpen) {
      if (worker) {
        setFormData({
          Name: worker.Name,
          EID: worker.EID,
          Department: worker.Department,
          Company: worker.Company,
          Introducer: worker.Introducer || '',
          Date_Joined: worker.Date_Joined
        });
      } else {
        setFormData({
          Name: '',
          EID: '',
          Department: '',
          Company: '',
          Introducer: '',
          Date_Joined: ''
        });
      }
      setError(null);
      setErrors({});
    }
  }, [isOpen, worker]);

  const validateForm = (): boolean => {
    const newErrors: Partial<WorkerFormData> = {};

    if (!formData.Name.trim()) {
      newErrors.Name = 'Name is required';
    }

    if (!formData.EID.trim()) {
      newErrors.EID = 'Employee ID is required';
    }

    if (!formData.Department.trim()) {
      newErrors.Department = 'Department is required';
    }

    if (!formData.Company.trim()) {
      newErrors.Company = 'Company is required';
    }

    if (!formData.Date_Joined) {
      newErrors.Date_Joined = 'Date joined is required';
    } else {
      const joinDate = new Date(formData.Date_Joined);
      const today = new Date();
      if (joinDate > today) {
        newErrors.Date_Joined = 'Date joined cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name as keyof WorkerFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const workerData = {
        Name: formData.Name.trim(),
        EID: formData.EID.trim(),
        Department: formData.Department.trim(),
        Company: formData.Company.trim(),
        Introducer: formData.Introducer?.trim() || null,
        Date_Joined: formData.Date_Joined
      };

      if (worker) {
        // Update existing worker
        const { error: updateError } = await supabase
          .from('workersData')
          .update(workerData)
          .eq('id', worker.id);

        if (updateError) throw updateError;
      } else {
        // Create new worker
        const { error: insertError } = await supabase
          .from('workersData')
          .insert(workerData);

        if (insertError) throw insertError;
      }

      onWorkerSaved();
    } catch (err: any) {
      console.error('Error saving worker:', err);
      if (err.code === '23505' && err.constraint === 'workersData_EID_key') {
        setError('Employee ID already exists. Please use a different EID.');
      } else {
        setError(err.message || 'Failed to save worker');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100'} mr-3`}>
              {worker ? <Edit size={20} className="text-blue-500" /> : <UserPlus size={20} className="text-blue-500" />}
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {worker ? t('editWorker') : t('addWorker')}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {worker ? t('updateWorkerInfo') : t('enterWorkerDetails')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('name')} *
            </label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.Name
                  ? 'border-red-500 focus:ring-red-500'
                  : darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
              placeholder={t('enterFullName')}
            />
            {errors.Name && <p className="mt-1 text-sm text-red-500">{errors.Name}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('employeeId')} (EID) *
            </label>
            <input
              type="text"
              name="EID"
              value={formData.EID}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.EID
                  ? 'border-red-500 focus:ring-red-500'
                  : darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
              placeholder={t('enterEmployeeId')}
            />
            {errors.EID && <p className="mt-1 text-sm text-red-500">{errors.EID}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('department')} *
            </label>
            <input
              type="text"
              name="Department"
              value={formData.Department}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.Department
                  ? 'border-red-500 focus:ring-red-500'
                  : darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
              placeholder={t('enterDepartment')}
            />
            {errors.Department && <p className="mt-1 text-sm text-red-500">{errors.Department}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('company')} *
            </label>
            <input
              type="text"
              name="Company"
              value={formData.Company}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.Company
                  ? 'border-red-500 focus:ring-red-500'
                  : darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
              placeholder={t('enterCompany')}
            />
            {errors.Company && <p className="mt-1 text-sm text-red-500">{errors.Company}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('introducer')}
            </label>
            <input
              type="text"
              name="Introducer"
              value={formData.Introducer}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
              placeholder={t('personWhoReferred')}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('dateJoined')} *
            </label>
            <input
              type="date"
              name="Date_Joined"
              value={formData.Date_Joined}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.Date_Joined
                  ? 'border-red-500 focus:ring-red-500'
                  : darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
            />
            {errors.Date_Joined && <p className="mt-1 text-sm text-red-500">{errors.Date_Joined}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 px-4 py-2 border rounded-md ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
              }`}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  {worker ? <Edit size={16} className="mr-1" /> : <UserPlus size={16} className="mr-1" />}
                  {worker ? t('updateWorker') : t('addWorker')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerFormModal;