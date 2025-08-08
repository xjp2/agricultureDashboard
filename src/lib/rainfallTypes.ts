export interface RainfallLocation {
  id: number;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface RainfallData {
  id: number;
  rainfall: number;
  date: string;
  location_id: number;
  created_at: string;
}

export interface RainfallLocationWithStats extends RainfallLocation {
  totalRainfall: number;
  entryCount: number;
  lastEntry?: string;
  averageRainfall: number;
}

export interface MonthlyTotal {
  month: number;
  year: number;
  total: number;
  monthName: string;
}