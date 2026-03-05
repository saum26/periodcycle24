import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { CycleEntry, DailyLog } from '../types';

interface AppContextType {
  user: User | null;
  loading: boolean;
  cycles: CycleEntry[];
  dailyLogs: DailyLog[];
  addCycle: (entry: Omit<CycleEntry, 'id'>) => Promise<void>;
  updateCycle: (id: string, updates: Partial<Omit<CycleEntry, 'id'>>) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;
  addDailyLog: (log: Omit<DailyLog, 'id'>) => Promise<void>;
  updateDailyLog: (id: string, updates: Partial<Omit<DailyLog, 'id'>>) => Promise<void>;
  deleteDailyLog: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

// Map DB row → CycleEntry
function dbToCycle(row: Record<string, unknown>): CycleEntry {
  return {
    id: row.id as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string | undefined,
  };
}

// Map DB row → DailyLog
function dbToLog(row: Record<string, unknown>): DailyLog {
  return {
    id: row.id as string,
    date: row.date as string,
    flow: row.flow as DailyLog['flow'] | undefined,
    symptoms: (row.symptoms as string[]) ?? [],
    notes: row.notes as string | undefined,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<CycleEntry[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when user logs in
  useEffect(() => {
    if (!user) {
      setCycles([]);
      setDailyLogs([]);
      return;
    }
    supabase.from('cycles').select('*').then(({ data }) => {
      if (data) setCycles(data.map(dbToCycle));
    });
    supabase.from('daily_logs').select('*').then(({ data }) => {
      if (data) setDailyLogs(data.map(dbToLog));
    });
  }, [user]);

  const addCycle = useCallback(async (entry: Omit<CycleEntry, 'id'>) => {
    const { data, error } = await supabase
      .from('cycles')
      .insert({ start_date: entry.startDate, end_date: entry.endDate ?? null, user_id: user!.id })
      .select()
      .single();
    if (!error && data) setCycles((prev) => [...prev, dbToCycle(data)]);
  }, [user]);

  const updateCycle = useCallback(async (id: string, updates: Partial<Omit<CycleEntry, 'id'>>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
    const { error } = await supabase.from('cycles').update(dbUpdates).eq('id', id);
    if (!error) setCycles((prev) => prev.map((c) => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCycle = useCallback(async (id: string) => {
    const { error } = await supabase.from('cycles').delete().eq('id', id);
    if (!error) setCycles((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addDailyLog = useCallback(async (log: Omit<DailyLog, 'id'>) => {
    const { data, error } = await supabase
      .from('daily_logs')
      .insert({ date: log.date, flow: log.flow ?? null, symptoms: log.symptoms, notes: log.notes ?? null, user_id: user!.id })
      .select()
      .single();
    if (!error && data) setDailyLogs((prev) => [...prev, dbToLog(data)]);
  }, [user]);

  const updateDailyLog = useCallback(async (id: string, updates: Partial<Omit<DailyLog, 'id'>>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.flow !== undefined) dbUpdates.flow = updates.flow;
    if (updates.symptoms !== undefined) dbUpdates.symptoms = updates.symptoms;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    const { error } = await supabase.from('daily_logs').update(dbUpdates).eq('id', id);
    if (!error) setDailyLogs((prev) => prev.map((l) => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteDailyLog = useCallback(async (id: string) => {
    const { error } = await supabase.from('daily_logs').delete().eq('id', id);
    if (!error) setDailyLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AppContext.Provider value={{
      user, loading, cycles, dailyLogs,
      addCycle, updateCycle, deleteCycle,
      addDailyLog, updateDailyLog, deleteDailyLog,
      signOut,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
