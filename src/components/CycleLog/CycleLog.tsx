import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CycleEntry } from '../../types';
import { formatDate, getDaysBetween } from '../../utils/dateUtils';
import { CycleForm } from './CycleForm';

export function CycleLog() {
  const { cycles, addCycle, updateCycle, deleteCycle } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CycleEntry | null>(null);

  const sorted = [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate));

  function handleSave(data: Omit<CycleEntry, 'id'>) {
    if (editing) {
      updateCycle(editing.id, data);
      setEditing(null);
    } else {
      addCycle(data);
      setShowForm(false);
    }
  }

  function handleEdit(cycle: CycleEntry) {
    setEditing(cycle);
    setShowForm(false);
  }

  function handleClose() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Cycles</h2>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          + Log Period
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No cycles logged yet.</p>
          <p className="text-sm mt-1">Press "Log Period" to add your first cycle.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((cycle) => {
            const duration = cycle.endDate
              ? getDaysBetween(cycle.startDate, cycle.endDate) + 1
              : null;
            return (
              <div
                key={cycle.id}
                className="bg-white rounded-xl p-4 shadow border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {formatDate(cycle.startDate)}
                    {cycle.endDate
                      ? ` – ${formatDate(cycle.endDate)}`
                      : ' – ongoing'}
                  </p>
                  {duration !== null && (
                    <p className="text-sm text-gray-500 mt-0.5">{duration} day{duration !== 1 ? 's' : ''}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(cycle)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCycle(cycle.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showForm || editing) && (
        <CycleForm
          initial={editing ?? undefined}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
