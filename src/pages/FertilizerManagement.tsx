import React, { useState, useEffect } from 'react';
import { Sprout, Calendar, BarChart3, ArrowLeft } from 'lucide-react';
import { supabase, PhaseData } from '../lib/supabase';
import { PhaseStartDateData } from '../lib/fertilizerTypes';
import PhaseSelector from '../components/fertilizer/PhaseSelector';
import StartDateModal from '../components/fertilizer/StartDateModal';
import YearToYearProgram from '../components/fertilizer/YearToYearProgram';
import MonthToMonthProgram from '../components/fertilizer/MonthToMonthProgram';

interface FertilizerManagementProps {
  darkMode: boolean;
}

const FertilizerManagement: React.FC<FertilizerManagementProps> = ({ darkMode }) => {
  const [phases, setPhases] = useState<PhaseData[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<PhaseData | null>(null);
  const [phaseStartDate, setPhaseStartDate] = useState<PhaseStartDateData | null>(null);
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [activeProgram, setActiveProgram] = useState<'year' | 'month'>('year');
  const [showEditDateModal, setShowEditDateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPhases();
  }, []);

  const fetchPhases = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('PhaseData')
        .select('*')
        .order('Phase');

      if (fetchError) {
        throw fetchError;
      }

      setPhases(data || []);
    } catch (err) {
      console.error('Error fetching phases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch phases');
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseSelect = async (phase: PhaseData) => {
    try {
      setSelectedPhase(phase);
      
      // Check if this phase already has a start date
      const { data: startDateData, error: startDateError } = await supabase
        .from('phaseStartDateData')
        .select('*')
        .eq('phase_id', phase.id)
        .single();

      if (startDateError && startDateError.code !== 'PGRST116') {
        throw startDateError;
      }

      if (startDateData) {
        setPhaseStartDate(startDateData);
      } else {
        setShowStartDateModal(true);
      }
    } catch (err) {
      console.error('Error checking phase start date:', err);
      setError(err instanceof Error ? err.message : 'Failed to check phase start date');
    }
  };

  const handleStartDateSet = (startDateData: PhaseStartDateData) => {
    setPhaseStartDate(startDateData);
    setShowStartDateModal(false);
  };

  const handleBackToPhases = () => {
    setSelectedPhase(null);
    setPhaseStartDate(null);
    setActiveProgram('year');
  };

  const handleEditProgramPeriod = () => {
    setShowEditDateModal(true);
  };

  const handleDateUpdated = (updatedData: PhaseStartDateData) => {
    setPhaseStartDate(updatedData);
    setShowEditDateModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={fetchPhases}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          {selectedPhase && (
            <button
              onClick={handleBackToPhases}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {selectedPhase ? `${t('fertilizerManagement')} - ${t('phaseDetails')} ${selectedPhase.Phase}` : t('fertilizerManagement')}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {selectedPhase 
                ? t('manageFertilizerPrograms', { phase: selectedPhase.Phase })
                : t('selectPhaseToManageFertilizer')
              }
            </p>
          </div>
        </div>

        {selectedPhase && phaseStartDate && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveProgram('year')}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                activeProgram === 'year'
                  ? darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <BarChart3 size={16} className="mr-2" />
              {t('yearToYear')}
            </button>
            <button
              onClick={() => setActiveProgram('month')}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                activeProgram === 'month'
                  ? darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <Calendar size={16} className="mr-2" />
              {t('monthToMonth')}
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {!selectedPhase ? (
        <PhaseSelector
          phases={phases}
          onPhaseSelect={handlePhaseSelect}
          darkMode={darkMode}
        />
      ) : !phaseStartDate ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Sprout size={48} className="mx-auto mb-4 text-green-500" />
            <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('settingUpPhase', { phase: selectedPhase.Phase })}
            </p>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {t('configuringFertilizerProgram')}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Program Info */}
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('programStartDate')}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('programStarted')} {new Date(phaseStartDate.start_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="text-right">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('phaseArea')}: {selectedPhase.Area || 0} {t('ac')}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('totalBlocks')}: {selectedPhase.Block || 0}
                  </p>
                </div>
                <button
                  onClick={handleEditProgramPeriod}
                  className={`px-3 py-2 text-sm rounded-md ${
                    darkMode 
                      ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' 
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {t('editStartDate')}
                </button>
              </div>
            </div>
          </div>

          {/* Active Program */}
          {activeProgram === 'year' ? (
            <YearToYearProgram
              phase={selectedPhase}
              phaseStartDate={phaseStartDate}
              darkMode={darkMode}
            />
          ) : (
            <MonthToMonthProgram
              phase={selectedPhase}
              phaseStartDate={phaseStartDate}
              darkMode={darkMode}
            />
          )}
        </div>
      )}

      {/* Start Date Modal */}
      {showStartDateModal && selectedPhase && (
        <StartDateModal
          isOpen={showStartDateModal}
          onClose={() => {
            setShowStartDateModal(false);
            setSelectedPhase(null);
          }}
          onStartDateSet={handleStartDateSet}
          phase={selectedPhase}
          darkMode={darkMode}
        />
      )}

      {/* Edit Date Modal */}
      {showEditDateModal && selectedPhase && phaseStartDate && (
        <StartDateModal
          isOpen={showEditDateModal}
          onClose={() => setShowEditDateModal(false)}
          onStartDateSet={handleDateUpdated}
          phase={selectedPhase}
          phaseStartDate={phaseStartDate}
          darkMode={darkMode}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default FertilizerManagement;