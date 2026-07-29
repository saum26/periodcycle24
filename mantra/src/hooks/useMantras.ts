import { useEffect, useState, useCallback } from 'react'
import { supabase, type Mantra } from '../lib/supabase'

export function useMantras() {
  const [mantras, setMantras] = useState<Mantra[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMantras = useCallback(async () => {
    const { data, error } = await supabase
      .from('mantras')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error && data) setMantras(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchMantras() }, [fetchMantras])

  const addMantra = async (name: string, targetCount: number, mantraText: string | null = null) => {
    const { data, error } = await supabase
      .from('mantras')
      .insert({ name, target_count: targetCount, mantra_text: mantraText })
      .select()
      .single()
    if (!error && data) setMantras(prev => [...prev, data])
  }

  const deleteMantra = async (id: string) => {
    await supabase.from('mantras').delete().eq('id', id)
    setMantras(prev => prev.filter(m => m.id !== id))
  }

  return { mantras, loading, addMantra, deleteMantra, refetch: fetchMantras }
}
