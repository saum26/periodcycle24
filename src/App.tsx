import { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { NavBar } from './components/layout/NavBar';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar/Calendar';
import { CycleLog } from './components/CycleLog/CycleLog';
import { SymptomLog } from './components/SymptomLog/SymptomLog';
import { AuthScreen } from './components/Auth/AuthScreen';
import { Tab } from './types';

function AppContent() {
  const { user, loading, signOut } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [quickLogDate, setQuickLogDate] = useState<string | undefined>();

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  function handleTabChange(tab: Tab) {
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
      <NavBar activeTab={activeTab} onTabChange={handleTabChange} onSignOut={signOut} />
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
