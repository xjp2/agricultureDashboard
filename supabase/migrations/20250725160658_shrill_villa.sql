/*
  # Update fertilizer management tables

  1. Changes to phaseStartDateData
    - Remove end_date column as it's no longer needed
    - Keep start_date for reference but don't limit navigation

  2. Changes to monthFertilizerData  
    - Add quantity column (integer)
    - The total kg will be calculated as bag * quantity

  3. Security
    - Update existing RLS policies to work with new structure
*/

-- Remove end_date from phaseStartDateData
ALTER TABLE "phaseStartDateData" DROP COLUMN IF EXISTS end_date;

-- Add quantity column to monthFertilizerData
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'monthFertilizerData' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE "monthFertilizerData" ADD COLUMN quantity integer DEFAULT 1 NOT NULL;
  END IF;
END $$;

-- Add check constraint for quantity
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'monthfertilizerdata_quantity_check'
  ) THEN
    ALTER TABLE "monthFertilizerData" ADD CONSTRAINT monthfertilizerdata_quantity_check CHECK (quantity > 0);
  END IF;
END $$;