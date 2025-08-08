import React, { useState } from 'react';
import { X, Calendar, Sprout } from 'lucide-react';
import { supabase, PhaseData } from '../../lib/supabase';
import { PhaseStartDateData } from '../../lib/fertilizerTypes';

interface StartDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDateSet: (startDateData: PhaseStartDateData) => void;
  phase: PhaseData;
  phaseStartDate?: PhaseStartDateData;
  isEditing?: boolean;
  darkMode: boolean;
}

const StartDateModal: React.FC<StartDateModalProps> = ({
  isOpen,
  onClose,
  onStartDateSet,
  phase,
  phaseStartDate,
  isEditing = false,
  darkMode
}) => {
  const [startDate, setStartDate] = useState(phaseStartDate?.start_date || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate) {
      setError('Please select a start date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data;
      
      if (isEditing && phaseStartDate) {
        const { data: updateData, error: updateError } = await supabase
          .from('phaseStartDateData')
          .update({
            start_date: startDate
          })
          .eq('id', phaseStartDate.id)
          .select()
          .single();

        if (updateError) throw updateError;
        data = updateData;
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from('phaseStartDateData')
          .insert({
            phase_id: phase.id,
            start_date: startDate
          })
          .select()
          .single();

        if (insertError) throw insertError;
        data = insertData;
      }

      onStartDateSet(data);
    } catch (err) {
      console.error('Error setting start date:', err);
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'set'} start date`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-green-900/20' : 'bg-green-100'} mr-3`}>
              <Sprout size={20} className="text-green-500" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {isEditing ? 'Edit Program Period' : 'Setup Fertilizer Program'}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Phase {phase.Phase}
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

        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} mb-6`}>
          <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isEditing ? 'Update Program' : 'Program Setup'}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
            {isEditing 
              ? 'Update the start date for your fertilizer management program. The end date will be automatically recalculated.'
              : 'Set the start date for your fertilizer management program. This will create a 12-month program period.'
            }
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phase Area:</p>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{phase.Area || 0} acres</p>
            </div>
            <div>
              <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Blocks:</p>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{phase.Block || 0}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Program Start Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className={`w-full px-3 py-2 pl-10 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              <Calendar size={16} className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
          </div>

          {startDate && (
            <div className={`p-3 rounded-md ${darkMode ? 'bg-green-900/10 border border-green-900/20' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-800'}`}>
                Program Start Date
              </p>
              <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                Start: {new Date(startDate).toLocaleDateString()}
              </p>
            </div>
          )}

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
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !startDate}
              className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Sprout size={16} className="mr-1" />
                  {isEditing ? 'Update Program' : 'Start Program'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartDateModal;