export interface WorkerData {
  id: number;
  Name: string;
  EID: string;
  Department: string;
  Company: string;
  Introducer?: string;
  Date_Joined: string;
  created_at: string;
  updated_at: string;
}

export interface WorkerFormData {
  Name: string;
  EID: string;
  Department: string;
  Company: string;
  Introducer?: string;
  Date_Joined: string;
}

export interface SortConfig {
  key: keyof WorkerData;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  search: string;
  department: string;
  company: string;
  dateFrom: string;
  dateTo: string;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}