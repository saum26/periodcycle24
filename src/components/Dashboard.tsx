import { useAppContext } from '../context/AppContext';
import { useCyclePredictions } from '../hooks/useCyclePredictions';
import { formatDate } from '../utils/dateUtils';

interface DashboardProps {
  onQuickLog: () => void;
}

export function Dashboard({ onQuickLog }: DashboardProps) {
  const { cycles } = useAppContext();
  const predictions = useCyclePredictions(cycles);

  const statusBg = predictions.isOnPeriod ? 'bg-red-500' : 'bg-pink-500';

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {/* Status banner */}
      <div className={`rounded-xl p-6 text-white shadow-lg ${statusBg}`}>
        {cycles.length === 0 ? (
          <p className="text-lg">No cycles logged yet. Start by adding a cycle!</p>
        ) : predictions.isOnPeriod ? (
          <>
            <p className="text-sm font-medium opacity-80">Currently</p>
            <p className="text-2xl font-bold mt-1">Period in progress</p>
            {predictions.currentCycleDay !== null && (
              <p className="mt-1 opacity-80">Day {predictions.currentCycleDay} of your cycle</p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm font-medium opacity-80">Cycle Status</p>
            {predictions.currentCycleDay !== null && (
              <p className="text-2xl font-bold mt-1">Day {predictions.currentCycleDay}</p>
            )}
            <p className="mt-1 opacity-80">of your cycle</p>
          </>
        )}
      </div>

      {/* Prediction cards */}
      {cycles.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <p className="text-sm text-gray-500">Next Period</p>
            <p className="text-lg font-semibold text-gray-800 mt-1">
              {predictions.nextPeriodDate ? formatDate(predictions.nextPeriodDate) : '—'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <p className="text-sm text-gray-500">Avg Cycle Length</p>
            <p className="text-lg font-semibold text-gray-800 mt-1">
              {predictions.avgCycleLength} days
            </p>
          </div>
          {predictions.ovulationStart && predictions.ovulationEnd && (
            <div className="bg-white rounded-xl p-4 shadow border border-gray-100 col-span-2">
              <p className="text-sm text-gray-500">Estimated Ovulation Window</p>
              <p className="text-lg font-semibold text-gray-800 mt-1">
                {formatDate(predictions.ovulationStart)} – {formatDate(predictions.ovulationEnd)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick log */}
      <button
        onClick={onQuickLog}
        className="w-full py-3 bg-pink-100 hover:bg-pink-200 text-pink-700 font-medium rounded-xl transition-colors"
      >
        + Log Today's Symptoms
      </button>
    </div>
  );
}
