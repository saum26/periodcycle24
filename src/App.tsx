import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { NavBar } from './components/layout/NavBar';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar/Calendar';
import { CycleLog } from './components/CycleLog/CycleLog';
import { SymptomLog } from './components/SymptomLog/SymptomLog';
import { Tab } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [quickLogDate, setQuickLogDate] = useState<string | undefined>();

  function handleTabChange(tab: Tab) {
    // Clear the prefilled date whenever navigating away from symptoms
    if (tab !== 'symptoms') setQuickLogDate(undefined);
    setActiveTab(tab);
  }

  function handleQuickLog() {
    const today = new Date();
    const isoDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setQuickLogDate(isoDate);
    setActiveTab('symptoms');
  }

  function handleCalendarDayClick(date: string) {
    setQuickLogDate(date);
    setActiveTab('symptoms');
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
      <Layout>
        {activeTab === 'dashboard' && <Dashboard onQuickLog={handleQuickLog} />}
        {activeTab === 'calendar' && <Calendar onDayClick={handleCalendarDayClick} />}
        {activeTab === 'cycles' && <CycleLog />}
        {activeTab === 'symptoms' && <SymptomLog initialDate={quickLogDate} />}
      </Layout>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
