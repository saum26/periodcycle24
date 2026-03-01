import { useState } from 'react';
import { format } from 'date-fns';
import { DailyLog } from '../../types';

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
  const [cramps, setCramps] = useState<DailyLog['cramps']>(initial?.cramps);
  const [mood, setMood] = useState<DailyLog['mood']>(initial?.mood);
  const [notes, setNotes] = useState(initial?.notes ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ date, flow, cramps, mood, notes: notes.trim() || undefined });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {initial ? 'Edit Log' : 'Log Symptoms'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <OptionGroup
            label="Flow"
            value={flow}
            onChange={(v) => setFlow(v as DailyLog['flow'])}
            options={['light', 'medium', 'heavy']}
          />
          <OptionGroup
            label="Cramps"
            value={cramps}
            onChange={(v) => setCramps(v as DailyLog['cramps'])}
            options={['none', 'mild', 'moderate', 'severe']}
          />
          <OptionGroup
            label="Mood"
            value={mood}
            onChange={(v) => setMood(v as DailyLog['mood'])}
            options={['happy', 'neutral', 'sad', 'anxious', 'irritable']}
          />

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

interface OptionGroupProps {
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  options: string[];
}

function OptionGroup({ label, value, onChange, options }: OptionGroupProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? undefined : opt)}
            className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
              value === opt
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
