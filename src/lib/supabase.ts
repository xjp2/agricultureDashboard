import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your updated schema
export interface PhaseData {
  id: number
  Phase: string
  Area: number | null
  Trees: number | null
  Density: number | null
  Block: number | null
}

export interface BlockData {
  id: number
  Area: number | null
  Trees: number | null
  Density: number | null
  FK_Phase: string | null
  Date_Planted: string | null
  Task: number | null
  Block: string
}

export interface TaskData {
  id: number
  Task: string
  Area: number | null
  Trees: number | null
  Density: number | null
  FK_Block: string | null
}

export interface RainfallData {
  id: number
  rainfall: number
  date: string
  location_id: number
  created_at: string
}