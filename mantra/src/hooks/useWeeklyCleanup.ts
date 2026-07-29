import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useWeeklyCleanup() {
  useEffect(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    const cutoffStr = cutoff.toISOString().slice(0, 10)

    supabase
      .from('daily_counts')
      .delete()
      .lt('date', cutoffStr)
      .then(() => {})
  }, [])
}
