import { Tab } from '../../types';

interface NavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'cycles', label: 'Cycles' },
  { id: 'symptoms', label: 'Symptoms' },
];

export function NavBar({ activeTab, onTabChange }: NavBarProps) {
  return (
    <nav className="bg-pink-600 text-white shadow-md">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <h1 className="text-lg font-bold tracking-tight">🌸 Period Tracker</h1>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-pink-600'
                    : 'hover:bg-pink-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
