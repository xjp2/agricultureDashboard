/*
  # Update fertilizer tables for 3 decimal precision

  1. Changes
    - Update yearFertilizerData.kilogram_amount to support 3 decimal places
    - Ensure proper precision for fertilizer measurements

  2. Security
    - Maintain existing RLS policies
*/

-- Update the kilogram_amount column to support 3 decimal places
ALTER TABLE "yearFertilizerData" 
ALTER COLUMN kilogram_amount TYPE numeric(10,3);