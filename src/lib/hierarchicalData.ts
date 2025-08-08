import { supabase, PhaseData, BlockData, TaskData } from './supabase';

// Calculate phase totals from its blocks
const calculatePhaseFromBlocks = async (phaseIdentifier: string): Promise<Partial<PhaseData>> => {
  const { data: blocks, error } = await supabase
    .from('BlockData')
    .select('*')
    .eq('FK_Phase', phaseIdentifier);

  if (error) {
    throw error;
  }

  if (!blocks || blocks.length === 0) {
    return {
      Area: 0,
      Trees: 0,
      Density: 0,
      Block: 0
    };
  }

  const totalArea = blocks.reduce((sum, block) => sum + (block.Area || 0), 0);
  const totalTrees = blocks.reduce((sum, block) => sum + (block.Trees || 0), 0);
  const blockCount = blocks.length;
  const calculatedDensity = totalArea > 0 ? totalTrees / totalArea : 0;

  return {
    Area: totalArea,
    Trees: totalTrees,
    Density: calculatedDensity,
    Block: blockCount
  };
};

// Calculate block totals from its tasks
const calculateBlockFromTasks = async (blockIdentifier: string): Promise<Partial<BlockData>> => {
  const { data: tasks, error } = await supabase
    .from('TaskData')
    .select('*')
    .eq('FK_Block', blockIdentifier);

  if (error) {
    throw error;
  }

  if (!tasks || tasks.length === 0) {
    return {
      Area: 0,
      Trees: 0,
      Density: 0,
      Task: 0
    };
  }

  const totalArea = tasks.reduce((sum, task) => sum + (task.Area || 0), 0);
  const totalTrees = tasks.reduce((sum, task) => sum + (task.Trees || 0), 0);
  const calculatedDensity = totalArea > 0 ? totalTrees / totalArea : 0;
  const taskCount = tasks.length;

  return {
    Area: totalArea,
    Trees: totalTrees,
    Density: calculatedDensity,
    Task: taskCount
  };
};

// Update phase data based on its blocks
const updatePhaseFromBlocks = async (phaseIdentifier: string): Promise<void> => {
  const calculatedData = await calculatePhaseFromBlocks(phaseIdentifier);
  
  const { error } = await supabase
    .from('PhaseData')
    .update(calculatedData)
    .eq('Phase', phaseIdentifier);

  if (error) {
    throw error;
  }
};

// Update block data based on its tasks
const updateBlockFromTasks = async (blockIdentifier: string): Promise<void> => {
  const calculatedData = await calculateBlockFromTasks(blockIdentifier);
  
  const { error } = await supabase
    .from('BlockData')
    .update(calculatedData)
    .eq('Block', blockIdentifier);

  if (error) {
    throw error;
  }
};

// Create a new task and update parent block and phase
export const createTaskWithHierarchyUpdate = async (taskData: Omit<TaskData, 'id'>): Promise<void> => {
  // Calculate density for the task
  const calculatedDensity = (taskData.Area && taskData.Area > 0 && taskData.Trees) 
    ? taskData.Trees / taskData.Area 
    : 0;

  const taskDataWithDensity = {
    ...taskData,
    Density: calculatedDensity
  };

  // Insert the new task
  const { error: taskError } = await supabase
    .from('TaskData')
    .insert(taskDataWithDensity);

  if (taskError) {
    throw taskError;
  }

  // Update the parent block if FK_Block is provided
  if (taskDataWithDensity.FK_Block) {
    await updateBlockFromTasks(taskDataWithDensity.FK_Block);

    // Get the block to find its phase
    const { data: block, error: blockError } = await supabase
      .from('BlockData')
      .select('FK_Phase')
      .eq('Block', taskDataWithDensity.FK_Block)
      .single();

    if (blockError) {
      throw blockError;
    }

    // Update the parent phase if FK_Phase is provided
    if (block?.FK_Phase) {
      await updatePhaseFromBlocks(block.FK_Phase);
    }
  }
};

// Create a new block and update parent phase
export const createBlockWithHierarchyUpdate = async (blockData: Omit<BlockData, 'id'>): Promise<void> => {
  // Insert the new block
  const { error: blockError } = await supabase
    .from('BlockData')
    .insert(blockData);

  if (blockError) {
    throw blockError;
  }

  // Update the parent phase if FK_Phase is provided
  if (blockData.FK_Phase) {
    await updatePhaseFromBlocks(blockData.FK_Phase);
  }
};

// Delete a task and update parent hierarchy
export const deleteTaskWithHierarchyUpdate = async (taskId: number): Promise<void> => {
  // Get task data before deletion to know which block/phase to update
  const { data: task, error: getError } = await supabase
    .from('TaskData')
    .select('FK_Block')
    .eq('id', taskId)
    .single();

  if (getError) {
    throw getError;
  }

  // Delete the task
  const { error: deleteError } = await supabase
    .from('TaskData')
    .delete()
    .eq('id', taskId);

  if (deleteError) {
    throw deleteError;
  }

  // Update parent block and phase
  if (task?.FK_Block) {
    await updateBlockFromTasks(task.FK_Block);

    // Get the block to find its phase
    const { data: block, error: blockError } = await supabase
      .from('BlockData')
      .select('FK_Phase')
      .eq('Block', task.FK_Block)
      .single();

    if (blockError) {
      throw blockError;
    }

    if (block?.FK_Phase) {
      await updatePhaseFromBlocks(block.FK_Phase);
    }
  }
};

// Delete a block and update parent phase
export const deleteBlockWithHierarchyUpdate = async (blockId: number): Promise<void> => {
  // Get block data before deletion to know which phase to update
  const { data: block, error: getError } = await supabase
    .from('BlockData')
    .select('FK_Phase, Block')
    .eq('id', blockId)
    .single();

  if (getError) {
    throw getError;
  }

  // Delete all tasks in this block first (cascade should handle this, but let's be explicit)
  const { error: deleteTasksError } = await supabase
    .from('TaskData')
    .delete()
    .eq('FK_Block', block.Block);

  if (deleteTasksError) {
    throw deleteTasksError;
  }

  // Delete the block
  const { error: deleteError } = await supabase
    .from('BlockData')
    .delete()
    .eq('id', blockId);

  if (deleteError) {
    throw deleteError;
  }

  // Update parent phase
  if (block?.FK_Phase) {
    await updatePhaseFromBlocks(block.FK_Phase);
  }
};

// Delete a phase and all its blocks and tasks
export const deletePhaseWithHierarchyUpdate = async (phaseId: number): Promise<void> => {
  // Get phase data before deletion
  const { data: phase, error: getError } = await supabase
    .from('PhaseData')
    .select('Phase')
    .eq('id', phaseId)
    .single();

  if (getError) {
    throw getError;
  }

  // Get all blocks in this phase
  const { data: blocks, error: blocksError } = await supabase
    .from('BlockData')
    .select('Block')
    .eq('FK_Phase', phase.Phase);

  if (blocksError) {
    throw blocksError;
  }

  // Delete all tasks in all blocks of this phase
  if (blocks && blocks.length > 0) {
    const blockIdentifiers = blocks.map(block => block.Block);
    const { error: deleteTasksError } = await supabase
      .from('TaskData')
      .delete()
      .in('FK_Block', blockIdentifiers);

    if (deleteTasksError) {
      throw deleteTasksError;
    }
  }

  // Delete all blocks in this phase
  const { error: deleteBlocksError } = await supabase
    .from('BlockData')
    .delete()
    .eq('FK_Phase', phase.Phase);

  if (deleteBlocksError) {
    throw deleteBlocksError;
  }

  // Delete the phase
  const { error: deleteError } = await supabase
    .from('PhaseData')
    .delete()
    .eq('id', phaseId);

  if (deleteError) {
    throw deleteError;
  }
};

// Update task and propagate changes up the hierarchy
const updateTaskWithHierarchyUpdate = async (taskId: number, updates: Partial<TaskData>): Promise<void> => {
  // Get current task data
  const { data: currentTask, error: getError } = await supabase
    .from('TaskData')
    .select('FK_Block')
    .eq('id', taskId)
    .single();

  if (getError) {
    throw getError;
  }

  // Calculate density if area or trees are being updated
  let updatesWithDensity = { ...updates };
  if (updates.Area !== undefined || updates.Trees !== undefined) {
    // Get current task data to calculate density
    const { data: taskData, error: taskError } = await supabase
      .from('TaskData')
      .select('Area, Trees')
      .eq('id', taskId)
      .single();

    if (taskError) {
      throw taskError;
    }

    const newArea = updates.Area !== undefined ? updates.Area : taskData.Area;
    const newTrees = updates.Trees !== undefined ? updates.Trees : taskData.Trees;
    const calculatedDensity = (newArea && newArea > 0 && newTrees) ? newTrees / newArea : 0;
    
    updatesWithDensity.Density = calculatedDensity;
  }

  // Update the task
  const { error: updateError } = await supabase
    .from('TaskData')
    .update(updatesWithDensity)
    .eq('id', taskId);

  if (updateError) {
    throw updateError;
  }

  // Update parent block and phase
  if (currentTask?.FK_Block) {
    await updateBlockFromTasks(currentTask.FK_Block);

    // Get the block to find its phase
    const { data: block, error: blockError } = await supabase
      .from('BlockData')
      .select('FK_Phase')
      .eq('Block', currentTask.FK_Block)
      .single();

    if (blockError) {
      throw blockError;
    }

    if (block?.FK_Phase) {
      await updatePhaseFromBlocks(block.FK_Phase);
    }
  }
};

// Update block and propagate changes up the hierarchy
export const updateBlockWithHierarchyUpdate = async (blockId: number, updates: Partial<BlockData>): Promise<void> => {
  // Get current block data
  const { data: currentBlock, error: getError } = await supabase
    .from('BlockData')
    .select('FK_Phase')
    .eq('id', blockId)
    .single();

  if (getError) {
    throw getError;
  }

  // Update the block
  const { error: updateError } = await supabase
    .from('BlockData')
    .update(updates)
    .eq('id', blockId);

  if (updateError) {
    throw updateError;
  }

  // Update parent phase
  if (currentBlock?.FK_Phase) {
    await updatePhaseFromBlocks(currentBlock.FK_Phase);
  }
};

// Update phase name
export const updatePhaseWithHierarchyUpdate = async (phaseId: number, updates: Partial<PhaseData>): Promise<void> => {
  // Get current phase data
  const { data: currentPhase, error: getError } = await supabase
    .from('PhaseData')
    .select('Phase')
    .eq('id', phaseId)
    .single();

  if (getError) {
    throw getError;
  }

  // // If we're updating the Phase identifier, we need to update all references
  // if (updates.Phase && updates.Phase !== currentPhase.Phase) {
  //   // Update all blocks that reference this phase
  //   const { error: updateBlocksError } = await supabase
  //     .from('BlockData')
  //     .update({ FK_Phase: updates.Phase })
  //     .eq('FK_Phase', currentPhase.Phase);

  //   if (updateBlocksError) {w
  //     throw updateBlocksError;
  //   }S\wdwadwda
  // }

  // Update the phase
  const { error: updateError } = await supabase
    .from('PhaseData')
    .update(updates)
    .eq('id', phaseId);

  if (updateError) {
    throw updateError;
  }
};