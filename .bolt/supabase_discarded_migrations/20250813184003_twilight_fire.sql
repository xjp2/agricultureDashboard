/*
  # Create debt management tables

  1. New Tables
    - `debtOption`
      - `id` (bigint, primary key)
      - `category_name` (text, unique)
      - `description` (text, optional)
      - `created_at` (timestamp)
    - `debtData`
      - `id` (bigint, primary key)
      - `month_year` (date)
      - `worker_name` (text, references workersData.Name)
      - `category` (text, references debtOption.category_name)
      - `amount` (numeric with 2 decimal places)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (matching existing pattern)

  3. Indexes
    - Add indexes for performance on commonly queried fields
*/

-- Create debtOption table
CREATE TABLE IF NOT EXISTS "debtOption" (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category_name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create debtData table
CREATE TABLE IF NOT EXISTS "debtData" (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  month_year date NOT NULL,
  worker_name text NOT NULL,
  category text NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE "debtOption" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "debtData" ENABLE ROW LEVEL SECURITY;

-- Create policies for debtOption
CREATE POLICY "Enable all access for debtOption"
  ON "debtOption"
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for debtData
CREATE POLICY "Enable all access for debtData"
  ON "debtData"
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE "debtData" 
ADD CONSTRAINT fk_debt_worker 
FOREIGN KEY (worker_name) REFERENCES "workersData"("Name") 
ON DELETE CASCADE;

ALTER TABLE "debtData" 
ADD CONSTRAINT fk_debt_category 
FOREIGN KEY (category) REFERENCES "debtOption"(category_name) 
ON DELETE RESTRICT;

-- Add check constraints
ALTER TABLE "debtData" 
ADD CONSTRAINT debtdata_amount_check 
CHECK (amount >= 0);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_debt_data_month_year ON "debtData" (month_year);
CREATE INDEX IF NOT EXISTS idx_debt_data_worker_name ON "debtData" (worker_name);
CREATE INDEX IF NOT EXISTS idx_debt_data_category ON "debtData" (category);
CREATE INDEX IF NOT EXISTS idx_debt_data_created_at ON "debtData" (created_at);
CREATE INDEX IF NOT EXISTS idx_debt_option_category_name ON "debtOption" (category_name);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_debt_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for debtData
CREATE TRIGGER update_debtdata_updated_at
  BEFORE UPDATE ON "debtData"
  FOR EACH ROW
  EXECUTE FUNCTION update_debt_updated_at();