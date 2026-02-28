import { Tab } from '../../types';

interface NavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'cycles', label: 'Cycles', icon: '🔄' },
  { id: 'symptoms', label: 'Symptoms', icon: '📝' },
];

export function NavBar({ activeTab, onTabChange }: NavBarProps) {
  return (
    <nav className="bg-pink-600 text-white shadow-md">
      {/* App title */}
      <div className="text-center pt-3 pb-1">
        <h1 className="text-base font-bold tracking-tight">🌸 Period Tracker</h1>
      </div>
      {/* Tab bar */}
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-pink-600'
                : 'hover:bg-pink-500'
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
