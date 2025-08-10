import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface CreatePhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhaseCreated: () => void;
  darkMode?: boolean;
}

const CreatePhaseModal: React.FC<CreatePhaseModalProps> = ({
  isOpen,
  onClose,
  onPhaseCreated,
  darkMode = false
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    phase: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.phase.trim()) {
        throw new Error('Phase name is required');
      }

      // Check if phase already exists
      const { data: existingPhase } = await supabase
        .from('PhaseData')
        .select('Phase')
        .eq('Phase', formData.phase.trim())
        .single();

      if (existingPhase) {
        throw new Error('Phase name already exists');
      }

      // Create new phase with default values (will be calculated from blocks)
      const { error: insertError } = await supabase
        .from('PhaseData')
        .insert({
          Phase: formData.phase.trim(),
          Area: 0,
          Trees: 0,
          Density: 0,
          Block: 0
        });

      if (insertError) {
        throw insertError;
      }

      // Reset form and close modal
      setFormData({
        phase: ''
      });
      onPhaseCreated();
      onClose();
    } catch (err) {
      console.error('Error creating phase:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('createNewPhase')}
          </h2>
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
              {t('phaseName')} *
            </label>
            <input
              type="text"
              name="phase"
              value={formData.phase}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder={t('enterPhaseName')}
            />
          </div>

          <div className={`p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>{t('note')}:</strong> {t('areaTreesDensityNote')}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 border rounded-md ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus size={16} className="mr-1" />
                  {t('createPhase')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePhaseModal;