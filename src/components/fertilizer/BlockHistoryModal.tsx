import React, { useState, useEffect } from 'react';
import { X, History, Filter, Calendar, Package, BarChart3, ChevronDown } from 'lucide-react';
import { supabase, BlockData } from '../../lib/supabase';
import { YearFertilizerData, MonthFertilizerData } from '../../lib/fertilizerTypes';

interface BlockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: BlockData;
  phaseId: number;
  darkMode: boolean;
}

type FilterType = 'all' | 'yearly' | 'daily';
type SortType = 'date' | 'type' | 'amount';

const BlockHistoryModal: React.FC<BlockHistoryModalProps> = ({
  isOpen,
  onClose,
  block,
  phaseId,
  darkMode
}) => {
  const [yearlyEntries, setYearlyEntries] = useState<YearFertilizerData[]>([]);
  const [monthlyEntries, setMonthlyEntries] = useState<MonthFertilizerData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [filteredMonthlyEntries, setFilteredMonthlyEntries] = useState<MonthFertilizerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistoryData();
    }
  }, [isOpen, block.id, phaseId]);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch yearly fertilizer data
      const { data: yearlyData, error: yearlyError } = await supabase
        .from('yearFertilizerData')
        .select('*')
        .eq('phase_id', phaseId)
        .eq('block_id', block.id)
        .order('month', { ascending: true });

      if (yearlyError) throw yearlyError;

      // Fetch monthly fertilizer data
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('monthFertilizerData')
        .select('*')
        .eq('phase_id', phaseId)
        .eq('block_id', block.id)
        .order('date', { ascending: true });

      if (monthlyError) throw monthlyError;

      setYearlyEntries(yearlyData || []);
      setMonthlyEntries(monthlyData || []);
      
      // Set default selected month to current month if entries exist
      if (monthlyData && monthlyData.length > 0) {
        const currentDate = new Date();
        const currentMonthStr = currentDate.toISOString().slice(0, 7);
        const hasCurrentMonth = monthlyData.some(entry => entry.date.startsWith(currentMonthStr));
        
        if (hasCurrentMonth) {
          setSelectedMonth(currentMonthStr);
        } else {
          // Set to the most recent month with data
          const latestEntry = monthlyData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          setSelectedMonth(latestEntry.date.slice(0, 7));
        }
      }
    } catch (err) {
      console.error('Error fetching history data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch history data');
    } finally {
      setLoading(false);
    }
  };

  // Filter monthly entries based on selected month
  useEffect(() => {
    if (selectedMonth) {
      const filtered = monthlyEntries.filter(entry => entry.date.startsWith(selectedMonth));
      setFilteredMonthlyEntries(filtered);
    } else {
      setFilteredMonthlyEntries(monthlyEntries);
    }
  }, [selectedMonth, monthlyEntries]);

  // Get unique months from monthly entries for the dropdown
  const getAvailableMonths = () => {
    const months = new Set<string>();
    monthlyEntries.forEach(entry => {
      months.add(entry.date.slice(0, 7));
    });
    return Array.from(months).sort().reverse(); // Most recent first
  };

  const formatMonthOption = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getSelectedMonthStats = () => {
    if (!selectedMonth) return { totalAmount: 0, totalApplications: 0, applicationsByName: {} };
    
    const filtered = monthlyEntries.filter(entry => entry.date.startsWith(selectedMonth));
    const totalAmount = filtered.reduce((sum, entry) => sum + (entry.bag * entry.quantity), 0);
    const totalApplications = filtered.length;
    
    // Group by fertilizer name (worker name in this case)
    const applicationsByName: { [key: string]: { amount: number; count: number } } = {};
    filtered.forEach(entry => {
      if (!applicationsByName[entry.name]) {
        applicationsByName[entry.name] = { amount: 0, count: 0 };
      }
      applicationsByName[entry.name].amount += (entry.bag * entry.quantity);
      applicationsByName[entry.name].count += 1;
    });
    
    return { totalAmount, totalApplications, applicationsByName };
  };

  const getYearlyStats = () => {
    const fertilizerGroups: { [key: string]: { total: number; applications: number } } = {};
    
    yearlyEntries.forEach(entry => {
      if (!fertilizerGroups[entry.fertilizer_name]) {
        fertilizerGroups[entry.fertilizer_name] = { total: 0, applications: 0 };
      }
      fertilizerGroups[entry.fertilizer_name].total += entry.kilogram_amount;
      fertilizerGroups[entry.fertilizer_name].applications += 1;
    });

    const totalYearlyAmount = yearlyEntries.reduce((sum, entry) => sum + entry.kilogram_amount, 0);
    
    return {
      fertilizerGroups,
      totalAmount: totalYearlyAmount,
      totalApplications: yearlyEntries.length
    };
  };

  const getMonthlyStats = () => {
    const totalMonthlyAmount = monthlyEntries.reduce((sum, entry) => sum + (entry.bag * entry.quantity), 0);

    return {
      totalAmount: totalMonthlyAmount,
      totalApplications: monthlyEntries.length
    };
  };

  const formatDate = (dateString: string, type: 'yearly' | 'daily') => {
    const date = new Date(dateString);
    if (type === 'yearly') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric' 
      });
    }
  };

  const yearlyStats = getYearlyStats();
  const monthlyStats = getMonthlyStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100'} mr-3`}>
              <History size={20} className="text-blue-500" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Block {block.Block} - Fertilizer History
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Complete fertilizer application history
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

        {/* Year-to-Year Program History */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading history...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <button 
              onClick={fetchHistoryData}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : yearlyEntries.length === 0 && monthlyEntries.length === 0 ? (
          <div className="text-center py-8">
            <History size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              No fertilizer applications found for this block.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Year-to-Year Section */}
            {yearlyEntries.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 size={20} className="text-green-500" />
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Year-to-Year Program
                  </h3>
                </div>
                
                {/* Yearly Statistics - Side by Side */}
                <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gradient-to-r from-green-900/20 to-green-800/20 border-green-900/30' : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'} mb-6`}>
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {yearlyStats.totalAmount.toFixed(3)} kg
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Amount</p>
                    </div>
                    <div className={`w-px h-12 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {yearlyStats.totalApplications}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Applications</p>
                    </div>
                  </div>
                </div>

                {/* Fertilizer Groups */}
                <div className="space-y-3 mb-4">
                  <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fertilizer Summary
                  </h4>
                  {Object.entries(yearlyStats.fertilizerGroups).map(([name, data]) => (
                    <div
                      key={name}
                      className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex justify-between items-center">
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {name}
                        </p>
                        <div className="text-right">
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Total Applied per Palm: {data.total.toFixed(3)} kg/palm
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Total Applications per Year: {data.applications}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Yearly Entries */}
                <div className="space-y-2">
                  <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Monthly Entries
                  </h4>
                  {yearlyEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {entry.fertilizer_name}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(entry.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {entry.kilogram_amount.toFixed(2)} kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Month-to-Month Section */}
            {monthlyEntries.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={20} className="text-blue-500" />
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Month-to-Month Program
                  </h3>
                </div>
                
                {/* Month Selector */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Month to View History
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-md appearance-none ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">All Months</option>
                      {getAvailableMonths().map(month => (
                        <option key={month} value={month}>
                          {formatMonthOption(month)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className={`absolute right-3 top-3 pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </div>

                {/* Selected Month Statistics */}
                {selectedMonth && (
                  <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gradient-to-r from-blue-900/20 to-blue-800/20 border-blue-900/30' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'} mb-6`}>
                    <h4 className={`font-medium mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                      {formatMonthOption(selectedMonth)} Summary
                    </h4>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {getSelectedMonthStats().totalAmount.toFixed(2)} kg
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Applied</p>
                      </div>
                      <div className={`w-px h-12 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {getSelectedMonthStats().totalApplications}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Applications</p>
                      </div>
                    </div>
                    
                    {/* Applications by Worker */}
                    <div>
                      <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Applications by Worker
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(getSelectedMonthStats().applicationsByName).map(([name, data]) => (
                          <div
                            key={name}
                            className={`p-2 rounded border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white/50 border-gray-200'}`}
                          >
                            <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {name}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {data.amount.toFixed(2)} kg • {data.count} application{data.count > 1 ? 's' : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Monthly Statistics - Side by Side */}
                {!selectedMonth && (
                  <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gradient-to-r from-blue-900/20 to-blue-800/20 border-blue-900/30' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'} mb-6`}>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {monthlyStats.totalAmount.toFixed(2)} kg
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Amount</p>
                      </div>
                      <div className={`w-px h-12 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {monthlyStats.totalApplications}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Applications</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Monthly Entries */}
                <div className="space-y-2">
                  <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedMonth ? `Applications in ${formatMonthOption(selectedMonth)}` : 'All Daily Applications'}
                  </h4>
                  {(selectedMonth ? filteredMonthlyEntries : monthlyEntries).map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {entry.name}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(entry.date).toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {entry.bag}kg × {entry.quantity} = {(entry.bag * entry.quantity).toFixed(2)}kg
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Quantity: {entry.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockHistoryModal;