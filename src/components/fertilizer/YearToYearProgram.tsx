import React, { useState, useEffect, useRef } from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import { supabase, PhaseData, BlockData } from '../../lib/supabase';
import { PhaseStartDateData, YearFertilizerData } from '../../lib/fertilizerTypes';
import FertilizerEntryModal from './FertilizerEntryModal';
import BlockHistoryModal from './BlockHistoryModal';
import { useLanguage } from '../../contexts/LanguageContext';

interface YearToYearProgramProps {
  phase: PhaseData;
  phaseStartDate: PhaseStartDateData;
  darkMode: boolean;
}

const YearToYearProgram: React.FC<YearToYearProgramProps> = ({
  phase,
  phaseStartDate,
  darkMode
}) => {
  const { t } = useLanguage();
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [fertilizerData, setFertilizerData] = useState<YearFertilizerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ blockId: number; month: string; year: number } | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [phase.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Store current scroll position
      const currentScrollLeft = tableRef.current?.scrollLeft || 0;

      // Fetch blocks for this phase
      const { data: blocksData, error: blocksError } = await supabase
        .from('BlockData')
        .select('*')
        .eq('FK_Phase', phase.Phase)
        .order('Block', { ascending: true });

      if (blocksError) throw blocksError;

      // Fetch fertilizer data for this phase
      const { data: fertilizerDataResult, error: fertilizerError } = await supabase
        .from('yearFertilizerData')
        .select('*')
        .eq('phase_id', phase.id);

      if (fertilizerError) throw fertilizerError;

      setBlocks(blocksData || []);
      setFertilizerData(fertilizerDataResult || []);
      
      // Restore scroll position after state update
      setTimeout(() => {
        if (tableRef.current) {
          tableRef.current.scrollLeft = currentScrollLeft;
        }
      }, 0);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sort blocks in alphanumeric order (1-10, then A-Z)
  const sortedBlocks = [...blocks].sort((a, b) => {
    const aBlock = a.Block.toString();
    const bBlock = b.Block.toString();
    
    // Check if both are numbers
    const aIsNum = /^\d+$/.test(aBlock);
    const bIsNum = /^\d+$/.test(bBlock);
    
    if (aIsNum && bIsNum) {
      return parseInt(aBlock) - parseInt(bBlock);
    }
    
    if (aIsNum && !bIsNum) return -1;
    if (!aIsNum && bIsNum) return 1;
    
    // Both are strings, sort alphabetically
    return aBlock.localeCompare(bBlock);
  });

  const getMonths = () => {
    const startDate = new Date(phaseStartDate.start_date);
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(startDate.getMonth() + i);
      months.push({
        date: monthDate,
        monthName: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: monthDate.toISOString().split('T')[0].substring(0, 7) + '-01' // First day of month
      });
    }
    
    return months;
  };

  const getCellData = (blockId: number, monthDate: string) => {
    return fertilizerData.filter(
      entry => entry.block_id === blockId && entry.month === monthDate
    );
  };

  const handleCellClick = (blockId: number, monthDate: string, year: number) => {
    setSelectedCell({ blockId, month: monthDate, year });
    setShowEntryModal(true);
  };

  const handleBlockClick = (block: BlockData) => {
    setSelectedBlock(block);
    setShowHistoryModal(true);
  };

  const handleEntryAdded = () => {
    fetchData();
    setShowEntryModal(false);
    setSelectedCell(null);
  };

  const getBlockTotal = (blockId: number) => {
    const fertilizerTotals: { [key: string]: number } = {};
    
    allColumns
      .filter(col => col.type === 'month')
      .forEach(month => {
        const cellData = getCellData(blockId, month.fullDate);
        cellData.forEach(entry => {
          if (!fertilizerTotals[entry.fertilizer_name]) {
            fertilizerTotals[entry.fertilizer_name] = 0;
          }
          fertilizerTotals[entry.fertilizer_name] += entry.kilogram_amount;
        });
      });
    
    return fertilizerTotals;
  };

  const getBlockGrandTotal = (blockId: number) => {
    return allColumns
      .filter(col => col.type === 'month')
      .reduce((total, month) => {
      const cellData = getCellData(blockId, month.fullDate);
      return total + cellData.reduce((sum, entry) => sum + entry.kilogram_amount, 0);
    }, 0);
  };

  const getYearFromStartDate = () => {
    const startDate = new Date(phaseStartDate.start_date);
    const now = new Date();
    const timeDiff = now.getTime() - startDate.getTime();
    const yearsPassed = Math.floor(timeDiff / (365.25 * 24 * 60 * 60 * 1000));
    
    return `Total (kg)`;
  };

  const getEndOfYearColumns = () => {
    const startDate = new Date(phaseStartDate.start_date);
    const columns = [];
    
    // Generate columns for multiple years (13 months per year + end of year summary)
    for (let yearIndex = 0; yearIndex < 12; yearIndex++) {
      // Add 13 months for this year (includes the matching month from next calendar year)
      for (let monthIndex = 0; monthIndex < 13; monthIndex++) {
        const monthDate = new Date(startDate);
        monthDate.setMonth(startDate.getMonth() + (yearIndex * 12) + monthIndex);
        
        columns.push({
          type: 'month' as const,
          date: monthDate,
          monthName: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          fullDate: monthDate.toISOString().split('T')[0].substring(0, 7) + '-01',
          yearNumber: yearIndex + 1
        });
      }
      
      // Add year-end column after 13 months
      // Calculate the correct start and end dates for the 13-month summary period
      const summaryStartDate = new Date(startDate);
      summaryStartDate.setMonth(startDate.getMonth() + (yearIndex * 12));
      const summaryEndDate = new Date(startDate);
      summaryEndDate.setMonth(startDate.getMonth() + (yearIndex * 12) + 12);
      
      const startMonthYear = summaryStartDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const endMonthYear = summaryEndDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      columns.push({
        type: 'yearEnd' as const,
        date: summaryEndDate,
        label: `Summary: ${startMonthYear} - ${endMonthYear}`,
        shortLabel: `Year ${yearIndex + 1} Summary`,
        yearNumber: yearIndex + 1,
        summaryStartDate: summaryStartDate,
        summaryEndDate: summaryEndDate
      });
    }
    
    return columns;
  };

  const getYearEndData = (blockId: number, summaryStartDate: Date, summaryEndDate: Date) => {
    const fertilizerTotals: { [key: string]: number } = {};
    let totalAmount = 0;
    
    // Get all month columns within the summary period
    allColumns.forEach(column => {
      if (column.type === 'month' && column.date >= summaryStartDate && column.date <= summaryEndDate) {
        const month = column;
        const cellData = getCellData(blockId, month.fullDate);
        cellData.forEach(entry => {
          if (!fertilizerTotals[entry.fertilizer_name]) {
            fertilizerTotals[entry.fertilizer_name] = 0;
          }
          fertilizerTotals[entry.fertilizer_name] += entry.kilogram_amount;
          totalAmount += entry.kilogram_amount;
        });
      }
    });
    
    return { fertilizerTotals, totalAmount };
  };

  const firstYearMonths = getMonths();
  const allColumns = getEndOfYearColumns();
  const months = getMonths();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading program data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 size={24} className="text-green-500" />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('yearToYearFertilizerProgram')}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('clickMonthBlockToAdd')}
            </p>
          </div>
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-8">
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('loadingProgramData')}</p>
          </p>
        </div>
      ) : (
        <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
          <div ref={tableRef} className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} sticky left-0 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} z-10`}>
                    {t('block')}
                  </th>
                  {allColumns.map((column, index) => (
                    column.type === 'month' ? (
                      <th
                        key={`month-${column.fullDate}`}
                        className={`px-4 py-3 text-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} min-w-[120px]`}
                      >
                        <div>{t('month' + (column.date.getMonth() + 1))}</div>
                        <div className="text-xs opacity-75">
                          {column.date.getFullYear()}
                        </div>
                      </th>
                    ) : (
                      <th
                        key={`year-end-${column.yearNumber}`}
                        className={`px-4 py-3 text-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} min-w-[120px] ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}
                      >
                        <div>{column.label}</div>
                        <div className="text-xs opacity-75">
                          {column.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </th>
                    )
                  ))}
                  <th className={`px-4 py-3 text-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} sticky right-0 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} z-10 min-w-[120px]`}>
                    {t('totalKg')}
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {sortedBlocks.map((block) => (
                  <tr key={block.id} className={darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className={`px-4 py-3 font-medium sticky left-0 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} z-10 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button
                        onClick={() => handleBlockClick(block)}
                        className={`text-left hover:underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                      >
                        {block.Block}
                      </button>
                    </td>
                    {allColumns.map((column, index) => (
                      column.type === 'month' ? (
                        (() => {
                          const cellData = getCellData(block.id, column.fullDate);
                          const hasData = cellData.length > 0;
                          
                          return (
                            <td
                              key={`${block.id}-${column.fullDate}`}
                              className={`px-2 py-3 text-center cursor-pointer transition-colors ${
                                hasData
                                  ? darkMode ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-green-50 hover:bg-green-100'
                                  : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                              }`}
                              onClick={() => handleCellClick(block.id, column.fullDate, column.date.getFullYear())}
                            >
                              {hasData ? (
                                <div className="space-y-1">
                                  {cellData.map((entry, entryIndex) => (
                                    <div key={entryIndex} className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                                      <div className="font-medium">{entry.fertilizer_name}</div>
                                      <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {entry.kilogram_amount.toFixed(2)} kg
                                      </div>
                                    </div>
                                  ))}
                                  
                                </div>
                              ) : (
                                <div className={`flex items-center justify-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  <Plus size={16} />
                                </div>
                              )}
                            </td>
                          );
                        })()
                      ) : (
                        <td
                          key={`${block.id}-year-${column.yearNumber}`}
                          className={`px-2 py-3 text-center ${darkMode ? 'bg-blue-900/20 hover:bg-blue-900/30' : 'bg-blue-50 hover:bg-blue-100'}`}
                        >
                          {(() => {
                            const { fertilizerTotals, totalAmount } = getYearEndData(block.id, column.summaryStartDate, column.summaryEndDate);
                            const fertilizerEntries = Object.entries(fertilizerTotals);
                            
                            return (
                              <div className="space-y-1">
                                {fertilizerEntries.length > 0 ? (
                                  <>
                                    {fertilizerEntries.map(([name, amount]) => (
                                      <div key={name} className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                        <div className="font-medium">{name}</div>
                                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                          {amount.toFixed(2)} kg
                                        </div>
                                      </div>
                                    ))}
                                    
                                  </>
                                ) : (
                                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {t('noData')}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                      )
                    ))}
                    <td className={`px-4 py-3 text-center font-semibold sticky right-0 ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-yellow-600'} border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'} z-10`}>
                      <div className="space-y-1">
                        {(() => {
                          const fertilizerTotals = getBlockTotal(block.id);
                          const fertilizerEntries = Object.entries(fertilizerTotals);
                          
                          return fertilizerEntries.length > 0 ? (
                            <>
                              {fertilizerEntries.map(([name, amount]) => (
                                <div key={name} className="text-xs">
                                  <div className="font-medium">{name}</div>
                                  <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {amount.toFixed(2)} kg
                                  </div>
                                </div>
                              ))}
                              
                            </>
                          ) : (
                            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {t('noData')}
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Entry Modal */}
      {showEntryModal && selectedCell && (
        <FertilizerEntryModal
          isOpen={showEntryModal}
          onClose={() => {
            setShowEntryModal(false);
            setSelectedCell(null);
          }}
          onEntryAdded={handleEntryAdded}
          phaseId={phase.id}
          blockId={selectedCell.blockId}
          month={selectedCell.month}
          year={selectedCell.year}
          blockName={sortedBlocks.find(b => b.id === selectedCell.blockId)?.Block || ''}
          darkMode={darkMode}
        />
      )}

      {/* Block History Modal */}
      {showHistoryModal && selectedBlock && (
        <BlockHistoryModal
          isOpen={showHistoryModal}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedBlock(null);
          }}
          block={selectedBlock}
          phaseId={phase.id}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default YearToYearProgram;