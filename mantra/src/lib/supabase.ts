import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Mantra = {
  id: string
  name: string
  mantra_text?: string | null
  target_count: number
  created_at: string
}

export type DailyCount = {
  id: string
  mantra_id: string
  date: string
  count: number
}
