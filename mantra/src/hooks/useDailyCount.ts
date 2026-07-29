import { useCallback, useEffect, useState } from 'react'
import { supabase, type DailyCount } from '../lib/supabase'

const today = () => new Date().toISOString().slice(0, 10)

export function useDailyCount(mantraId: string) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('daily_counts')
      .select('*')
      .eq('mantra_id', mantraId)
      .eq('date', today())
      .maybeSingle()
    setCount(data?.count ?? 0)
    setLoading(false)
  }, [mantraId])

  useEffect(() => { fetch() }, [fetch])

  const increment = async () => {
    const newCount = count + 1
    setCount(newCount)
    const { data: existing } = await supabase
      .from('daily_counts')
      .select('id')
      .eq('mantra_id', mantraId)
      .eq('date', today())
      .maybeSingle()

    if (existing) {
      await supabase
        .from('daily_counts')
        .update({ count: newCount })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('daily_counts')
        .insert({ mantra_id: mantraId, date: today(), count: newCount })
    }
  }

  const reset = async () => {
    setCount(0)
    const { data: existing } = await supabase
      .from('daily_counts')
      .select('id')
      .eq('mantra_id', mantraId)
      .eq('date', today())
      .maybeSingle()
    if (existing) {
      await supabase.from('daily_counts').update({ count: 0 }).eq('id', existing.id)
    }
  }

  return { count, loading, increment, reset }
}

export function useAllDailyCounts(mantraId: string) {
  const [history, setHistory] = useState<DailyCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('daily_counts')
      .select('*')
      .eq('mantra_id', mantraId)
      .order('date', { ascending: false })
      .then(({ data }: { data: DailyCount[] | null }) => {
        if (data) setHistory(data)
        setLoading(false)
      })
  }, [mantraId])

  return { history, loading }
}
