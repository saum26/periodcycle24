export interface CycleEntry {
  id: string;
  startDate: string; // ISO date "YYYY-MM-DD"
  endDate?: string;  // optional — ongoing period has no end yet
}

export interface DailyLog {
  id: string;
  date: string;      // ISO date "YYYY-MM-DD"
  flow?: 'light' | 'medium' | 'heavy';
  cramps?: 'none' | 'mild' | 'moderate' | 'severe';
  mood?: 'happy' | 'neutral' | 'sad' | 'anxious' | 'irritable';
  notes?: string;
}

export interface AppData {
  cycles: CycleEntry[];
  dailyLogs: DailyLog[];
}

export type Tab = 'dashboard' | 'calendar' | 'cycles' | 'symptoms';
