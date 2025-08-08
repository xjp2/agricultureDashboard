```typescript
export interface WorkOption {
  id: number;
  work_name: string;
  description?: string;
  created_at: string;
}

// New UomOption interface
export interface UomOption {
  id: number;
  uom_name: string;
  description?: string;
  created_at: string;
}

export interface AccountingData {
  id: number;
  month: string;
  eid: string;
  name: string;
  work: string;
  block: string;
  quantity: number;
  // Updated UOM type to be dynamic based on uom_name
  uom: string; 
  price: number;
  total: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface AccountingFormData {
  month: string;
  name: string;
  work: string;
  block: string;
  quantity: number;
  // Updated UOM type to be dynamic based on uom_name
  uom: string;
  price: number;
}

export interface WorkerSummary {
  eid: string;
  name: string;
  categoryTotals: { [category: string]: number };
  grandTotal: number;
}

export interface DepartmentSummary {
  category: string;
  totalEarnings: number;
  workerCount: number;
}

export interface IntroducerCommission {
  introducerName: string;
  introducedWorkers: {
    eid: string;
    name: string;
  }[];
  totalCommission: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}
```