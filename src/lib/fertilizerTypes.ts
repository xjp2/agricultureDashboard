export interface PhaseStartDateData {
  id: number;
  phase_id: number;
  start_date: string;
  created_at: string;
}

export interface YearFertilizerData {
  id: number;
  phase_id: number;
  block_id: number;
  month: string;
  year: number;
  fertilizer_name: string;
  kilogram_amount: number;
  created_at: string;
}

export interface MonthFertilizerData {
  id: number;
  phase_id: number;
  block_id: number;
  date: string;
  name: string;
  bag: 10 | 50;
  quantity: number;
  created_at: string;
}

export interface FertilizerEntry {
  fertilizer_name: string;
  kilogram_amount: number;
}

export interface MonthlyEntry {
  name: string;
  block_id: number;
  bag: 10 | 50;
}

export interface BlockHistoryData {
  yearlyEntries: (YearFertilizerData & { block_name: string })[];
  monthlyEntries: (MonthFertilizerData & { block_name: string })[];
}