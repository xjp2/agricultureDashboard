/*
  # Create rainfall locations system

  1. New Tables
    - `rainfallLocations`
      - `id` (bigint, primary key)
      - `name` (text, unique, not null)
      - `description` (text, optional)
      - `latitude` (double precision, optional)
      - `longitude` (double precision, optional)
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, default now())

  2. Modified Tables
    - `rainfallData`
      - Add `location_id` (bigint, foreign key to rainfallLocations)
      - Add constraint to ensure location_id is required for new entries

  3. Security
    - Enable RLS on `rainfallLocations` table
    - Add policies for public access to both tables
    - Add indexes for performance

  4. Triggers
    - Add updated_at trigger for rainfallLocations table
*/

-- Create rainfallLocations table
CREATE TABLE IF NOT EXISTS "rainfallLocations" (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text UNIQUE NOT NULL,
  description text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE "rainfallLocations" ENABLE ROW LEVEL SECURITY;

-- Create policies for rainfallLocations
CREATE POLICY "Enable all access for rainfallLocations"
  ON "rainfallLocations"
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add location_id to rainfallData table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rainfallData' AND column_name = 'location_id'
  ) THEN
    ALTER TABLE "rainfallData" ADD COLUMN location_id bigint;
  END IF;
END $$;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_rainfall_location'
  ) THEN
    ALTER TABLE "rainfallData" 
    ADD CONSTRAINT fk_rainfall_location 
    FOREIGN KEY (location_id) REFERENCES "rainfallLocations"(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rainfall_locations_name ON "rainfallLocations" USING btree (name);
CREATE INDEX IF NOT EXISTS idx_rainfall_data_location_id ON "rainfallData" USING btree (location_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_rainfall_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rainfallLocations
DROP TRIGGER IF EXISTS update_rainfalllocations_updated_at ON "rainfallLocations";
CREATE TRIGGER update_rainfalllocations_updated_at
  BEFORE UPDATE ON "rainfallLocations"
  FOR EACH ROW
  EXECUTE FUNCTION update_rainfall_locations_updated_at();

-- Insert default location if none exist
INSERT INTO "rainfallLocations" (name, description)
SELECT 'Main Farm', 'Primary farm location for rainfall tracking'
WHERE NOT EXISTS (SELECT 1 FROM "rainfallLocations" LIMIT 1);