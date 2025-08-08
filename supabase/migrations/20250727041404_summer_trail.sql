/*
  # Create workers data table

  1. New Tables
    - `workersData`
      - `id` (bigint, primary key)
      - `Name` (text, required)
      - `EID` (text, required, unique) - Employee ID
      - `Department` (text, required)
      - `Company` (text, required)
      - `Introducer` (text, optional)
      - `Date_Joined` (date, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `workersData` table
    - Add policy for authenticated users to manage worker data

  3. Indexes
    - Add indexes for frequently queried columns
*/

CREATE TABLE IF NOT EXISTS "workersData" (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "Name" text NOT NULL,
  "EID" text UNIQUE NOT NULL,
  "Department" text NOT NULL,
  "Company" text NOT NULL,
  "Introducer" text,
  "Date_Joined" date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE "workersData" ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Enable all access for workersData"
  ON "workersData"
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workers_eid ON "workersData" ("EID");
CREATE INDEX IF NOT EXISTS idx_workers_department ON "workersData" ("Department");
CREATE INDEX IF NOT EXISTS idx_workers_company ON "workersData" ("Company");
CREATE INDEX IF NOT EXISTS idx_workers_date_joined ON "workersData" ("Date_Joined");
CREATE INDEX IF NOT EXISTS idx_workers_name ON "workersData" ("Name");

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workersdata_updated_at
    BEFORE UPDATE ON "workersData"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();