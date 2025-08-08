import React from 'react';
import { Sprout, MapPin, Trees, Droplets } from 'lucide-react';
import { PhaseData } from '../../lib/supabase';

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
  const formatNumber = (num?: number) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sprout size={48} className="mx-auto mb-4 text-green-500" />
        <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Select a Phase for Fertilizer Management
        </h3>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Choose a phase to set up and manage fertilizer programs
        </p>
      </div>

      {phases.length === 0 ? (
        <div className="text-center py-8">
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            No phases available. Please create a phase first in the Field Visualization section.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phases.map((phase) => (
            <div
              key={phase.id}
              onClick={() => onPhaseSelect(phase)}
              className={`border ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-gray-200 hover:border-green-400'} rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md cursor-pointer group`}
            >
              <div className="h-32 bg-gradient-to-r from-green-600 to-green-400 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="text-white/80 text-sm">Phase {phase.Phase}</p>
                  <p className="text-white text-lg font-semibold">
                    Fertilizer Program
                  </p>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Sprout size={20} className="text-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className={`grid grid-cols-2 gap-3 mb-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Area</p>
                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {phase.Area ? `${formatNumber(phase.Area)} acre` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Blocks</p>
                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {formatNumber(phase.Block)}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4 border-t pt-3 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center" title="Trees">
                    <Trees size={16} className="text-green-500" />
                    <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatNumber(phase.Trees)}
                    </span>
                  </div>
                  <div className="flex items-center" title="Density">
                    <Droplets size={16} className="text-blue-500" />
                    <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {phase.Density ? phase.Density.toFixed(2) : 'N/A'} /acre
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button className={`text-xs px-4 py-2 rounded-md transition-colors ${
                    darkMode 
                      ? 'bg-green-900/20 text-green-400 group-hover:bg-green-900/30' 
                      : 'bg-green-100 text-green-800 group-hover:bg-green-200'
                  }`}>
                    <MapPin size={14} className="inline mr-1" />
                    Setup Fertilizer Program
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