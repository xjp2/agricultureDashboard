/*
  # Create Accounting System Tables

  1. New Tables
    - `workOption`
      - `id` (bigint, primary key)
      - `work_name` (text, unique)
      - `description` (text, optional)
      - `created_at` (timestamp)
    - `accountingData`
      - `id` (bigint, primary key)
      - `month` (text, format: "June 2024")
      - `eid` (text, references workersData.EID)
      - `name` (text, references workersData.Name)
      - `work` (text, references workOption.work_name)
      - `block` (text)
      - `quantity` (numeric(10,2))
      - `uom` (text, check constraint for valid values)
      - `price` (numeric(10,2))
      - `total` (numeric(10,2), calculated field)
      - `category` (text, auto-populated from workersData.Department)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (as per existing pattern)

  3. Indexes
    - Add indexes for performance on commonly queried fields
*/

-- Create workOption table
CREATE TABLE IF NOT EXISTS "workOption" (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  work_name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create accountingData table
CREATE TABLE IF NOT EXISTS "accountingData" (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  month text NOT NULL,
  eid text NOT NULL,
  name text NOT NULL,
  work text NOT NULL,
  block text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 0.00,
  uom text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0.00,
  total numeric(10,2) NOT NULL DEFAULT 0.00,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints
ALTER TABLE "accountingData" 
ADD CONSTRAINT accountingdata_uom_check 
CHECK (uom IN ('BATANG', 'CHAINS', 'UNIT', 'HOURS', 'HECTARES'));

ALTER TABLE "accountingData" 
ADD CONSTRAINT accountingdata_quantity_check 
CHECK (quantity >= 0);

ALTER TABLE "accountingData" 
ADD CONSTRAINT accountingdata_price_check 
CHECK (price >= 0);

ALTER TABLE "accountingData" 
ADD CONSTRAINT accountingdata_total_check 
CHECK (total >= 0);

-- Add foreign key constraints
ALTER TABLE "accountingData" 
ADD CONSTRAINT fk_accounting_eid 
FOREIGN KEY (eid) REFERENCES "workersData"("EID") ON DELETE CASCADE;

ALTER TABLE "accountingData" 
ADD CONSTRAINT fk_accounting_work 
FOREIGN KEY (work) REFERENCES "workOption"(work_name) ON DELETE RESTRICT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounting_month ON "accountingData" (month);
CREATE INDEX IF NOT EXISTS idx_accounting_eid ON "accountingData" (eid);
CREATE INDEX IF NOT EXISTS idx_accounting_name ON "accountingData" (name);
CREATE INDEX IF NOT EXISTS idx_accounting_category ON "accountingData" (category);
CREATE INDEX IF NOT EXISTS idx_accounting_work ON "accountingData" (work);
CREATE INDEX IF NOT EXISTS idx_accounting_created_at ON "accountingData" (created_at);

CREATE INDEX IF NOT EXISTS idx_work_option_name ON "workOption" (work_name);

-- Enable Row Level Security
ALTER TABLE "workOption" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accountingData" ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (following existing pattern)
CREATE POLICY "Enable all access for workOption"
  ON "workOption"
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access for accountingData"
  ON "accountingData"
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_accounting_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accountingdata_updated_at
  BEFORE UPDATE ON "accountingData"
  FOR EACH ROW
  EXECUTE FUNCTION update_accounting_updated_at();

-- Insert some default work options
INSERT INTO "workOption" (work_name, description) VALUES
  ('Harvesting', 'Palm fruit harvesting operations'),
  ('Pruning', 'Tree pruning and maintenance'),
  ('Fertilizer Application', 'Fertilizer spreading and application'),
  ('Weeding', 'Weed control and removal'),
  ('Spraying', 'Pesticide and herbicide application'),
  ('Planting', 'New tree planting operations'),
  ('Maintenance', 'General field maintenance'),
  ('Transportation', 'Material and equipment transport')
ON CONFLICT (work_name) DO NOTHING;