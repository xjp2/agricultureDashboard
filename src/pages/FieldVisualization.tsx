import React, { useState, useEffect } from 'react';
import { Map, MapPin, Layers, ChevronDown, Filter, Download, ArrowLeft, Plus } from 'lucide-react';
import FieldCard from '../components/FieldCard';
import BlockCard from '../components/BlockCard';
import TaskCard from '../components/TaskCard';
import CreatePhaseModal from '../components/CreatePhaseModal';
import CreateBlockModal from '../components/CreateBlockModal';
import CreateTaskModal from '../components/CreateTaskModal';
import StatCard from '../components/StatCard';
import MapboxMap from '../components/MapBoxMap';
import { supabase, PhaseData, BlockData, TaskData } from '../lib/supabase';
import { createBlockWithHierarchyUpdate } from '../lib/hierarchicalData';

interface PhaseWithBlocks extends PhaseData {
  blockCount: number;
}

interface FieldVisualizationProps {
  darkMode: boolean;
}

const FieldVisualization: React.FC<FieldVisualizationProps> = ({ darkMode }) => {
  const [phases, setPhases] = useState<PhaseWithBlocks[]>([]);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'phases' | 'blocks' | 'tasks'>('phases');
  const [showCreatePhaseModal, setShowCreatePhaseModal] = useState(false);
  const [showCreateBlockModal, setShowCreateBlockModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  useEffect(() => {
    fetchPhaseData();
  }, []);

  const handleViewDetails = async (phaseIdentifier: string) => {
    setSelectedPhase(phaseIdentifier);
    setViewMode('blocks');
    await fetchBlockData(phaseIdentifier);
  };

  const handleViewTask = async (blockIdentifier: string) => {
    setSelectedBlock(blockIdentifier);
    setViewMode('tasks');
    await fetchTaskData(blockIdentifier);
  };
  
  const handleBackToPhases = () => {
    setSelectedPhase(null);
    setSelectedBlock(null);
    setViewMode('phases');
    setBlocks([]);
    setTasks([]);
  };

  const handleBackToBlocks = () => {
    setSelectedBlock(null);
    setViewMode('blocks');
    setTasks([]);
  };

  const handlePhaseCreated = () => {
    fetchPhaseData(); // Refresh the phase data
  };

  const handlePhaseDeleted = () => {
    fetchPhaseData(); // Refresh the phase data
    // If we're currently viewing this phase, go back to phases view
    if (viewMode !== 'phases') {
      handleBackToPhases();
    }
  };

  const handlePhaseUpdated = () => {
    fetchPhaseData(); // Refresh the phase data
    // If we're currently viewing blocks, refresh them too
    if (viewMode === 'blocks' && selectedPhase) {
      fetchBlockData(selectedPhase);
    }
  };

  const handleBlockCreated = async () => {
    if (selectedPhase) {
      await fetchBlockData(selectedPhase);
      await fetchPhaseData(); // Refresh phase data to show updated block count
    }
  };

  const handleBlockDeleted = async () => {
    if (selectedPhase) {
      await fetchBlockData(selectedPhase);
      await fetchPhaseData(); // Refresh phase data to show updated block count
    }
    // If we're currently viewing tasks for this block, go back to blocks view
    if (viewMode === 'tasks') {
      handleBackToBlocks();
    }
  };

  const handleBlockUpdated = async () => {
    if (selectedPhase) {
      await fetchBlockData(selectedPhase);
      await fetchPhaseData(); // Refresh phase data
    }
    // If we're currently viewing tasks, refresh them too
    if (viewMode === 'tasks' && selectedBlock) {
      await fetchTaskData(selectedBlock);
    }
  };

  const handleTaskCreated = async () => {
    if (selectedBlock) {
      await fetchTaskData(selectedBlock);
      if (selectedPhase) {
        await fetchBlockData(selectedPhase); // Refresh block data
        await fetchPhaseData(); // Refresh phase data
      }
    }
  };

  const handleTaskDeleted = async () => {
    if (selectedBlock) {
      await fetchTaskData(selectedBlock);
      if (selectedPhase) {
        await fetchBlockData(selectedPhase); // Refresh block data
        await fetchPhaseData(); // Refresh phase data
      }
    }
  };
  
  const fetchPhaseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch PhaseData
      const { data: PhaseData, error: phaseError } = await supabase
        .from('PhaseData')
        .select('*')
        .order('Phase');

      if (phaseError) {
        throw phaseError;
      }

      // Fetch BlockData to count blocks per phase
      const { data: blockData, error: blockError } = await supabase
        .from('BlockData')
        .select('*');

      if (blockError) {
        throw blockError;
      }

      // Count blocks per phase
      const blockCounts = blockData?.reduce((acc: Record<string, number>, block: BlockData) => {
        if (block.FK_Phase !== null) {
          acc[block.FK_Phase] = (acc[block.FK_Phase] || 0) + 1;
        }
        return acc;
      }, {}) || {};

      // Combine phase data with block counts and generate names
      const phasesWithBlocks: PhaseWithBlocks[] = PhaseData?.map((phase: PhaseData) => ({
        ...phase,
        blockCount: blockCounts[phase.Phase] || 0,
        name: `Phase ${phase.Phase} Field` // Generate field name based on phase
      })) || [];

      setPhases(phasesWithBlocks);
    } catch (err) {
      console.error('Error fetching phase data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockData = async (phaseIdentifier: string) => {
    try {
      setBlocksLoading(true);
      setError(null);

      const { data: blockData, error: blockError } = await supabase
        .from('BlockData')
        .select('*')
        .eq('FK_Phase', phaseIdentifier)
        .order('Block');

      if (blockError) {
        throw blockError;
      }

      setBlocks(blockData || []);
    } catch (err) {
      console.error('Error fetching block data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred fetching block data');
    } finally {
      setBlocksLoading(false);
    }
  };

  const fetchTaskData = async (blockIdentifier: string) => {
    try {
      setTasksLoading(true);
      setError(null);

      const { data: taskData, error: taskError } = await supabase
        .from('TaskData')
        .select('*')
        .eq('FK_Block', blockIdentifier)
        .order('Task');

      if (taskError) {
        throw taskError;
      }

      setTasks(taskData || []);
    } catch (err) {
      console.error('Error fetching task data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred fetching task data');
    } finally {
      setTasksLoading(false);
    }
  };

  // Calculate total area based on current view
  const totalArea = viewMode === 'phases' 
    ? phases.reduce((sum, phase) => sum + (phase.Area || 0), 0)
    : viewMode === 'blocks'
    ? blocks.reduce((sum, block) => sum + (block.Area || 0), 0)
    : tasks.reduce((sum, task) => sum + (task.Area || 0), 0);

  const totalTrees = viewMode === 'phases'
    ? phases.reduce((sum, phase) => sum + (phase.Trees || 0), 0)
    : viewMode === 'blocks'
    ? blocks.reduce((sum, block) => sum + (block.Trees || 0), 0)
    : tasks.reduce((sum, task) => sum + (task.Trees || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading field data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading data: {error}</p>
          <button 
            onClick={() => {
              if (viewMode === 'phases') fetchPhaseData();
              else if (viewMode === 'blocks') fetchBlockData(selectedPhase!);
              else fetchTaskData(selectedBlock!);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    if (viewMode === 'phases') return 'Field Visualization';
    if (viewMode === 'blocks') return `Phase ${selectedPhase} - Block Details`;
    return `Block ${selectedBlock} - Task Details`;
  };

  const getSubtitle = () => {
    if (viewMode === 'phases') return 'Monitor and manage your fields and crops';
    if (viewMode === 'blocks') return `Detailed view of blocks in Phase ${selectedPhase}`;
    return `Detailed view of tasks in Block ${selectedBlock}`;
  };

  const getCreateButtonText = () => {
    if (viewMode === 'phases') return 'Add Field';
    if (viewMode === 'blocks') return 'Add Block';
    return 'Add Task';
  };

  const handleCreateClick = () => {
    if (viewMode === 'phases') {
      setShowCreatePhaseModal(true);
    } else if (viewMode === 'blocks') {
      setShowCreateBlockModal(true);
    } else {
      setShowCreateTaskModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            {(viewMode === 'blocks' || viewMode === 'tasks') && (
              <button
                onClick={viewMode === 'blocks' ? handleBackToPhases : handleBackToBlocks}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {getTitle()}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {getSubtitle()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className={`flex items-center px-3 py-2 rounded-md text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
            <Map size={16} className="mr-2" />
            View Map
          </button>
          <button 
            onClick={handleCreateClick}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${darkMode ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
          >
            <MapPin size={16} className="mr-2" />
            {getCreateButtonText()}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Area"
          value={`${totalArea.toFixed(1)} acre`}
          icon={<Map size={20} />}
          trend={0}
          color="green"
          darkMode={darkMode}
        />
        <StatCard
          title="Total Trees"
          value={totalTrees.toString()}
          icon={<MapPin size={20} />}
          trend={0}
          color="blue"
          darkMode={darkMode}
        />
      </div>

      <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center">
            <button className={`px-3 py-2 rounded-md text-sm flex items-center ${darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
              <Map size={16} className="mr-2" />
              Satellite View
              <ChevronDown size={16} className="ml-2" />
            </button>
            <div className={`mx-3 h-6 border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full bg-green-500`}></span>
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active</span>
              <span className={`inline-block w-3 h-3 rounded-full bg-yellow-500 ml-2`}></span>
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Moderate</span>
              <span className={`inline-block w-3 h-3 rounded-full bg-red-500 ml-2`}></span>
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Low</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className={`px-3 py-2 rounded-md text-sm flex items-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
              <Filter size={16} className="mr-2" />
              Filter
            </button>
            <button className={`px-3 py-2 rounded-md text-sm flex items-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
              <Download size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>
        
        <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
          <MapboxMap 
          darkMode={darkMode}
          viewMode={viewMode}
          selectedPhase={selectedPhase}
          selectedBlock={selectedBlock}
        />
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {viewMode === 'phases' ? 'Phase Details' : viewMode === 'blocks' ? `Phase ${selectedPhase} - Blocks` : `Block ${selectedBlock} - Tasks`}
          </h3>
          <div className="flex items-center gap-2">
            {viewMode === 'phases' ? (
              <button 
                onClick={() => setShowCreatePhaseModal(true)}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${darkMode ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
              >
                <Plus size={16} className="mr-2" />
                Create New Phase
              </button>
            ) : viewMode === 'blocks' ? (
              <>
                <button 
                  onClick={() => setShowCreateBlockModal(true)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                >
                  <Plus size={16} className="mr-2" />
                  Create New Block
                </button>
                <select className={`text-sm rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} py-1 px-2`}>
                  <option>Sort by Block</option>
                  <option>Sort by Area</option>
                  <option>Sort by Trees</option>
                  <option>Sort by Date Planted</option>
                </select>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setShowCreateTaskModal(true)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${darkMode ? 'bg-purple-900/20 text-purple-400 hover:bg-purple-900/30' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}
                >
                  <Plus size={16} className="mr-2" />
                  Create New Task
                </button>
                <select className={`text-sm rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} py-1 px-2`}>
                  <option>Sort by Task</option>
                  <option>Sort by Area</option>
                  <option>Sort by Trees</option>
                  <option>Sort by Density</option>
                </select>
              </>
            )}
          </div>
        </div>
      </div>
      
      {viewMode === 'phases' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phases.length > 0 ? (
            phases.map(phase => (
              <FieldCard
                key={phase.id}
                id={phase.id.toString()}
                phase={phase.Phase}
                area={phase.Area || 0}
                blockCount={phase.Block || 0}
                trees={phase.Trees || 0}
                density={phase.Density || 0}
                darkMode={darkMode}
                onViewDetails={() => handleViewDetails(phase.Phase)}
                onDeleted={handlePhaseDeleted}
                onUpdated={handlePhaseUpdated}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                No phase data available. Click "Create New Phase" to add your first phase.
              </p>
            </div>
          )}
        </div>
      ) : viewMode === 'blocks' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blocksLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading block data...</p>
            </div>
          ) : blocks.length > 0 ? (
            blocks.map(block => (
              <BlockCard
                key={block.id}
                id={block.id}
                block={block.Block}
                area={block.Area || 0}
                trees={block.Trees || 0}
                density={block.Density || 0}
                datePlanted={block.Date_Planted}
                task={block.Task}
                fkPhase={block.FK_Phase}
                darkMode={darkMode}
                onViewTask={() => handleViewTask(block.Block)}
                onDeleted={handleBlockDeleted}
                onUpdated={handleBlockUpdated}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                No blocks found for Phase {selectedPhase}. Click "Create New Block" to add your first block.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasksLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading task data...</p>
            </div>
          ) : tasks.length > 0 ? (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                id={task.id}
                task={task.Task}
                area={task.Area || 0}
                trees={task.Trees || 0}
                density={task.Density || 0}
                fkBlock={task.FK_Block}
                darkMode={darkMode}
                onDeleted={handleTaskDeleted}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                No tasks found for Block {selectedBlock}. Click "Create New Task" to add your first task.
              </p>
            </div>
          )}
        </div>
      )}

      <CreatePhaseModal
        isOpen={showCreatePhaseModal}
        onClose={() => setShowCreatePhaseModal(false)}
        onPhaseCreated={handlePhaseCreated}
        darkMode={darkMode}
      />

      {selectedPhase && (
        <CreateBlockModal
          isOpen={showCreateBlockModal}
          onClose={() => setShowCreateBlockModal(false)}
          onBlockCreated={handleBlockCreated}
          phaseIdentifier={selectedPhase}
          darkMode={darkMode}
        />
      )}

      {selectedBlock && (
        <CreateTaskModal
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          onTaskCreated={handleTaskCreated}
          blockIdentifier={selectedBlock}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default FieldVisualization;