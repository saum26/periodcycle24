import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { DailyLog } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { SymptomForm } from './SymptomForm';

interface SymptomLogProps {
  initialDate?: string;
}

export function SymptomLog({ initialDate }: SymptomLogProps) {
  const { dailyLogs, addDailyLog, updateDailyLog, deleteDailyLog } = useAppContext();
  const [showForm, setShowForm] = useState(!!initialDate);
  const [editing, setEditing] = useState<DailyLog | null>(null);

  const sorted = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date));

  function handleSave(data: Omit<DailyLog, 'id'>) {
    if (editing) {
      updateDailyLog(editing.id, data);
      setEditing(null);
    } else {
      addDailyLog(data);
      setShowForm(false);
    }
  }

  function handleEdit(log: DailyLog) {
    setEditing(log);
    setShowForm(false);
  }

  function handleClose() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Symptoms</h2>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          + Add Entry
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No symptom logs yet.</p>
          <p className="text-sm mt-1">Press "Add Entry" or use the quick-log from the Dashboard.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-xl p-4 shadow border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{formatDate(log.date)}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {log.flow && (
                      <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full capitalize">
                        Flow: {log.flow}
                      </span>
                    )}
                    {(log.symptoms ?? []).slice(0, 4).map((s) => (
                      <span key={s} className="bg-secondary/50 text-accent text-xs px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                    {(log.symptoms ?? []).length > 4 && (
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                        +{(log.symptoms ?? []).length - 4} more
                      </span>
                    )}
                  </div>
                  {log.notes && (
                    <p className="text-sm text-gray-500 mt-2 truncate">{log.notes}</p>
                  )}
                </div>
                <div className="flex gap-3 ml-4 shrink-0">
                  <button
                    onClick={() => handleEdit(log)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteDailyLog(log.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <SymptomForm
          initial={editing ?? undefined}
          defaultDate={initialDate}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
