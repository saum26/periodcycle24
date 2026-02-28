import React, { createContext, useContext, useCallback } from 'react';
import { CycleEntry, DailyLog, AppData } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const STORAGE_KEY = 'period-tracker-data';

const initialData: AppData = {
  cycles: [],
  dailyLogs: [],
};

interface AppContextType {
  cycles: CycleEntry[];
  dailyLogs: DailyLog[];
  addCycle: (entry: Omit<CycleEntry, 'id'>) => void;
  updateCycle: (id: string, updates: Partial<Omit<CycleEntry, 'id'>>) => void;
  deleteCycle: (id: string) => void;
  addDailyLog: (log: Omit<DailyLog, 'id'>) => void;
  updateDailyLog: (id: string, updates: Partial<Omit<DailyLog, 'id'>>) => void;
  deleteDailyLog: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useLocalStorage<AppData>(STORAGE_KEY, initialData);

  const addCycle = useCallback(
    (entry: Omit<CycleEntry, 'id'>) => {
      setData((prev) => ({
        ...prev,
        cycles: [...prev.cycles, { ...entry, id: crypto.randomUUID() }],
      }));
    },
    [setData],
  );

  const updateCycle = useCallback(
    (id: string, updates: Partial<Omit<CycleEntry, 'id'>>) => {
      setData((prev) => ({
        ...prev,
        cycles: prev.cycles.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      }));
    },
    [setData],
  );

  const deleteCycle = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        cycles: prev.cycles.filter((c) => c.id !== id),
      }));
    },
    [setData],
  );

  const addDailyLog = useCallback(
    (log: Omit<DailyLog, 'id'>) => {
      setData((prev) => ({
        ...prev,
        dailyLogs: [...prev.dailyLogs, { ...log, id: crypto.randomUUID() }],
      }));
    },
    [setData],
  );

  const updateDailyLog = useCallback(
    (id: string, updates: Partial<Omit<DailyLog, 'id'>>) => {
      setData((prev) => ({
        ...prev,
        dailyLogs: prev.dailyLogs.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      }));
    },
    [setData],
  );

  const deleteDailyLog = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        dailyLogs: prev.dailyLogs.filter((l) => l.id !== id),
      }));
    },
    [setData],
  );

  return (
    <AppContext.Provider
      value={{
        cycles: data.cycles,
        dailyLogs: data.dailyLogs,
        addCycle,
        updateCycle,
        deleteCycle,
        addDailyLog,
        updateDailyLog,
        deleteDailyLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
