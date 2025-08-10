import React from 'react';
import { Sprout, MapPin, Trees, Droplets, ArrowRight } from 'lucide-react';
import { PhaseData } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

interface PhaseSelectorProps {
  phases: PhaseData[];
  onPhaseSelect: (phase: PhaseData) => void;
  darkMode: boolean;
}

const PhaseSelector: React.FC<PhaseSelectorProps> = ({
  phases,
  onPhaseSelect,
  darkMode
}) => {
  const { t } = useLanguage();

  const formatNumber = (num?: number) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
          darkMode ? 'bg-green-900/20 border-2 border-green-900/30' : 'bg-green-50 border-2 border-green-200'
        }`}>
          <Sprout size={40} className="text-green-500" />
        </div>
        <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('selectPhaseForFertilizer')}
        </h3>
        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
          {t('choosePhaseFertilizerProgram')}
        </p>
      </div>

      {phases.length === 0 ? (
        <div className="text-center py-12">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <MapPin size={32} className="text-gray-400" />
          </div>
          <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('noPhasesAvailable')}
          </h4>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            {t('createPhaseFirstMessage')}
          </p>
          <button className={`px-6 py-3 rounded-lg ${
            darkMode ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30' : 'bg-green-100 text-green-800 hover:bg-green-200'
          } transition-colors`}>
            {t('goToFieldVisualization')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {phases.map((phase) => (
            <div
              key={phase.id}
              onClick={() => onPhaseSelect(phase)}
              className={`border ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 hover:border-green-500 hover:bg-gray-750' 
                  : 'bg-white border-gray-200 hover:border-green-400 hover:shadow-lg'
              } rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl cursor-pointer group transform hover:-translate-y-1`}
            >
              <div className="h-40 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/5 rounded-full"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/90 text-sm font-medium mb-1">
                        {t('phaseDetails')} {phase.Phase}
                      </p>
                      <p className="text-white text-xl font-bold">
                        {t('fertilizerProgram')}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight size={24} className="text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Sprout size={24} className="text-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className={`grid grid-cols-2 gap-4 mb-6`}>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} text-center`}>
                    <div className="flex items-center justify-center mb-2">
                      <MapPin size={18} className="text-green-500 mr-2" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                        {t('area')}
                      </span>
                    </div>
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {phase.Area ? `${formatNumber(phase.Area)}` : 'N/A'}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('acres')}
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} text-center`}>
                    <div className="flex items-center justify-center mb-2">
                      <Trees size={18} className="text-blue-500 mr-2" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                        {t('block')}s
                      </span>
                    </div>
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(phase.Block)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('total')}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center justify-between p-4 rounded-xl border ${
                  darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
                } mb-6`}>
                  <div className="flex items-center">
                    <Trees size={16} className="text-green-500 mr-2" />
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatNumber(phase.Trees)} {t('trees')}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('totalTrees')}
                      </p>
                    </div>
                  </div>
                  <div className={`w-px h-8 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                  <div className="flex items-center">
                    <Droplets size={16} className="text-blue-500 mr-2" />
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {phase.Density ? phase.Density.toFixed(2) : 'N/A'}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('treesPerAcre')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <button className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                    darkMode 
                      ? 'bg-green-900/20 text-green-400 group-hover:bg-green-900/30 group-hover:text-green-300' 
                      : 'bg-green-100 text-green-800 group-hover:bg-green-200 group-hover:text-green-900'
                  } flex items-center justify-center group-hover:shadow-md`}>
                    <Sprout size={18} className="mr-2" />
                    {t('setupFertilizerProgram')}
                    <ArrowRight size={18} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhaseSelector;