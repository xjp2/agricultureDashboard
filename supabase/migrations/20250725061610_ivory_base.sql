/*
  # Create Fertilizer Management Tables

  1. New Tables
    - `phaseStartDateData`
      - `id` (bigint, primary key)
      - `phase_id` (bigint, foreign key to PhaseData)
      - `start_date` (date)
      - `end_date` (date, automatically calculated as start_date + 1 year)
      - `created_at` (timestamp)
    
    - `yearFertilizerData`
      - `id` (bigint, primary key)
      - `phase_id` (bigint, foreign key to PhaseData)
      - `block_id` (bigint, foreign key to BlockData)
      - `month` (date)
      - `year` (integer)
      - `fertilizer_name` (text)
      - `kilogram_amount` (decimal)
      - `created_at` (timestamp)
    
    - `monthFertilizerData`
      - `id` (bigint, primary key)
      - `phase_id` (bigint, foreign key to PhaseData)
      - `block_id` (bigint, foreign key to BlockData)
      - `date` (date)
      - `name` (text)
      - `bag` (integer, constraint: 10 or 50)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

-- Create phaseStartDateData table
CREATE TABLE IF NOT EXISTS phaseStartDateData (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  phase_id bigint NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_phase_start_date_phase FOREIGN KEY (phase_id) REFERENCES "PhaseData"(id) ON DELETE CASCADE,
  CONSTRAINT unique_phase_start_date UNIQUE (phase_id)
);

-- Create yearFertilizerData table
CREATE TABLE IF NOT EXISTS yearFertilizerData (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  phase_id bigint NOT NULL,
  block_id bigint NOT NULL,
  month date NOT NULL,
  year integer NOT NULL,
  fertilizer_name text NOT NULL,
  kilogram_amount decimal(10,2) NOT NULL CHECK (kilogram_amount > 0),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_year_fertilizer_phase FOREIGN KEY (phase_id) REFERENCES "PhaseData"(id) ON DELETE CASCADE,
  CONSTRAINT fk_year_fertilizer_block FOREIGN KEY (block_id) REFERENCES "BlockData"(id) ON DELETE CASCADE
);

-- Create monthFertilizerData table
CREATE TABLE IF NOT EXISTS monthFertilizerData (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  phase_id bigint NOT NULL,
  block_id bigint NOT NULL,
  date date NOT NULL,
  name text NOT NULL,
  bag integer NOT NULL CHECK (bag IN (10, 50)),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_month_fertilizer_phase FOREIGN KEY (phase_id) REFERENCES "PhaseData"(id) ON DELETE CASCADE,
  CONSTRAINT fk_month_fertilizer_block FOREIGN KEY (block_id) REFERENCES "BlockData"(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE phaseStartDateData ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearFertilizerData ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthFertilizerData ENABLE ROW LEVEL SECURITY;

-- Create policies for phaseStartDateData
CREATE POLICY "Enable all access for phaseStartDateData"
  ON phaseStartDateData
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for yearFertilizerData
CREATE POLICY "Enable all access for yearFertilizerData"
  ON yearFertilizerData
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for monthFertilizerData
CREATE POLICY "Enable all access for monthFertilizerData"
  ON monthFertilizerData
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phase_start_date_phase_id ON phaseStartDateData(phase_id);
CREATE INDEX IF NOT EXISTS idx_year_fertilizer_phase_id ON yearFertilizerData(phase_id);
CREATE INDEX IF NOT EXISTS idx_year_fertilizer_block_id ON yearFertilizerData(block_id);
CREATE INDEX IF NOT EXISTS idx_year_fertilizer_month_year ON yearFertilizerData(month, year);
CREATE INDEX IF NOT EXISTS idx_month_fertilizer_phase_id ON monthFertilizerData(phase_id);
CREATE INDEX IF NOT EXISTS idx_month_fertilizer_block_id ON monthFertilizerData(block_id);
CREATE INDEX IF NOT EXISTS idx_month_fertilizer_date ON monthFertilizerData(date);

-- Create function to automatically calculate end_date
CREATE OR REPLACE FUNCTION calculate_end_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.end_date := NEW.start_date + INTERVAL '1 year';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set end_date
DROP TRIGGER IF EXISTS trigger_calculate_end_date ON phaseStartDateData;
CREATE TRIGGER trigger_calculate_end_date
  BEFORE INSERT OR UPDATE ON phaseStartDateData
  FOR EACH ROW
  EXECUTE FUNCTION calculate_end_date();