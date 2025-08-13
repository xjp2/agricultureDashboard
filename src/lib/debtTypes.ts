export interface DebtOption {
  id: number;
  category_name: string;
  description?: string;
  created_at: string;
}

export interface DebtData {
  id: number;
  month_year: string;
  worker_name: string;
  category: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface DebtFormData {
  month_year: string;
  worker_name: string;
  category: string;
  amount: number;
}

export interface WorkerDebtSummary {
  worker_name: string;
  eid: string;
  month_year: string;
  totalEarnings: number;
  totalDebt: number;
  netAmount: number;
  debtsByCategory: { [category: string]: number };
  earningsEntries: number;
  debtEntries: number;
}

export interface MonthlyDebtSummary {
  month_year: string;
  totalWorkers: number;
  totalEarnings: number;
  totalDebt: number;
  totalNetAmount: number;
  workers: WorkerDebtSummary[];
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  search: string;
  category: string;
  monthFrom: string;
  monthTo: string;
}