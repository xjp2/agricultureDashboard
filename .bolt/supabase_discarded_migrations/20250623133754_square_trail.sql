/*
  # Update schema to use strings for identifiers

  1. Schema Changes
    - Change PhaseData.Phase from numeric to text
    - Change BlockData.Block from numeric to text  
    - Change TaskData.Task from numeric to text
    - Update all foreign key references to use text
    - Maintain referential integrity with cascading updates

  2. Data Migration
    - Convert existing numeric values to text equivalents
    - Update foreign key relationships

  3. Constraints
    - Maintain unique constraints on identifier fields
    - Update foreign key constraints to reference text fields
*/

-- First, drop existing foreign key constraints
ALTER TABLE "BlockData" DROP CONSTRAINT IF EXISTS "BlockData_FK_Phase_fkey";
ALTER TABLE "TaskData" DROP CONSTRAINT IF EXISTS "TaskData_FK_Block_fkey";

-- Convert PhaseData.Phase to text
ALTER TABLE "PhaseData" ALTER COLUMN "Phase" TYPE text USING "Phase"::text;

-- Convert BlockData.Block to text and update FK_Phase
ALTER TABLE "BlockData" ALTER COLUMN "Block" TYPE text USING "Block"::text;
ALTER TABLE "BlockData" ALTER COLUMN "FK_Phase" TYPE text USING "FK_Phase"::text;

-- Convert TaskData.Task to text and update FK_Block
ALTER TABLE "TaskData" ALTER COLUMN "Task" TYPE text USING "Task"::text;
ALTER TABLE "TaskData" ALTER COLUMN "FK_Block" TYPE text USING "FK_Block"::text;

-- Re-add foreign key constraints with text references
ALTER TABLE "BlockData" 
ADD CONSTRAINT "BlockData_FK_Phase_fkey" 
FOREIGN KEY ("FK_Phase") REFERENCES "PhaseData"("Phase") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskData" 
ADD CONSTRAINT "TaskData_FK_Block_fkey" 
FOREIGN KEY ("FK_Block") REFERENCES "BlockData"("Block") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update unique constraints to work with text
DROP INDEX IF EXISTS "PhaseData_Phase_key";
DROP INDEX IF EXISTS "BlockData_Block_key";
DROP INDEX IF EXISTS "TaskData_Task_key";

CREATE UNIQUE INDEX "PhaseData_Phase_key" ON "PhaseData" USING btree ("Phase");
CREATE UNIQUE INDEX "BlockData_Block_key" ON "BlockData" USING btree ("Block");
CREATE UNIQUE INDEX "TaskData_Task_key" ON "TaskData" USING btree ("Task");