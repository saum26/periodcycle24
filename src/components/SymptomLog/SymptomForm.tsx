import { useState, KeyboardEvent } from 'react';
import { format } from 'date-fns';
import { DailyLog } from '../../types';
import { SYMPTOM_CATEGORIES } from '../../constants/symptoms';

interface SymptomFormProps {
  initial?: DailyLog;
  defaultDate?: string;
  onSave: (data: Omit<DailyLog, 'id'>) => void;
  onClose: () => void;
}

export function SymptomForm({ initial, defaultDate, onSave, onClose }: SymptomFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? today);
  const [flow, setFlow] = useState<DailyLog['flow']>(initial?.flow);
  const [symptoms, setSymptoms] = useState<string[]>(initial?.symptoms ?? []);
  const [customInput, setCustomInput] = useState('');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  // Pre-open categories that have selected symptoms when editing
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => {
    if (!initial?.symptoms?.length) return new Set();
    const open = new Set<string>();
    for (const cat of SYMPTOM_CATEGORIES) {
      if (cat.symptoms.some((s) => initial.symptoms.includes(s))) {
        open.add(cat.label);
      }
    }
    return open;
  });

  function toggleSymptom(symptom: string) {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  function toggleCategory(label: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  function addCustomSymptom() {
    const trimmed = customInput.trim();
    if (!trimmed || symptoms.includes(trimmed)) return;
    setSymptoms((prev) => [...prev, trimmed]);
    setCustomInput('');
  }

  function handleCustomKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomSymptom();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ date, flow, symptoms, notes: notes.trim() || undefined });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {initial ? 'Edit Log' : 'Log Symptoms'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Flow */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flow</label>
            <div className="flex flex-wrap gap-2">
              {(['light', 'medium', 'heavy'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFlow(flow === opt ? undefined : opt)}
                  className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                    flow === opt
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>

            {/* Selected symptoms summary */}
            {symptoms.length > 0 && (
              <div className="bg-secondary/30 rounded-lg p-3 mb-3 flex flex-wrap gap-2">
                {symptoms.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSymptom(s)}
                    className="bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 hover:bg-primary-dark transition-colors"
                  >
                    {s}
                    <span className="text-white/70">×</span>
                  </button>
                ))}
              </div>
            )}

            {/* Collapsible categories */}
            <div className="space-y-1 border border-gray-200 rounded-lg overflow-hidden">
              {SYMPTOM_CATEGORIES.map((cat) => {
                const isOpen = openCategories.has(cat.label);
                const selectedCount = cat.symptoms.filter((s) => symptoms.includes(s)).length;
                return (
                  <div key={cat.label}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.label)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <span>
                        {cat.emoji} {cat.label}
                      </span>
                      <span className="flex items-center gap-2">
                        {selectedCount > 0 && (
                          <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {selectedCount}
                          </span>
                        )}
                        <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-3 py-2 bg-gray-50 flex flex-wrap gap-2 border-b border-gray-100">
                        {cat.symptoms.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSymptom(s)}
                            className={`px-2 py-1 rounded-full text-xs transition-colors ${
                              symptoms.includes(s)
                                ? 'bg-primary text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom symptom */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleCustomKeyDown}
                placeholder="Add custom symptom..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addCustomSymptom}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any other notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-primary rounded-lg text-sm font-medium text-white hover:bg-primary-dark"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
