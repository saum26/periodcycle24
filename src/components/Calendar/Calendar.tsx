import { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval,
  startOfDay,
  addDays,
} from 'date-fns';
import { useAppContext } from '../../context/AppContext';
import { useCyclePredictions } from '../../hooks/useCyclePredictions';
import { CalendarDay } from './CalendarDay';
import { toISODate } from '../../utils/dateUtils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarProps {
  onDayClick: (date: string) => void;
}

export function Calendar({ onDayClick }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { cycles, dailyLogs } = useAppContext();
  const predictions = useCyclePredictions(cycles);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const leadingBlanks = getDay(monthStart);

  function isPeriodDay(date: Date): boolean {
    return cycles.some((c) => {
      const start = startOfDay(parseISO(c.startDate));
      const end = c.endDate
        ? startOfDay(parseISO(c.endDate))
        : addDays(start, predictions.avgPeriodLength - 1);
      if (end < start) return false;
      return isWithinInterval(startOfDay(date), { start, end });
    });
  }

  function isPredictedPeriod(date: Date): boolean {
    if (!predictions.nextPeriodDate || !predictions.nextPeriodEndDate) return false;
    const start = startOfDay(parseISO(predictions.nextPeriodDate));
    const end = startOfDay(parseISO(predictions.nextPeriodEndDate));
    if (end < start) return false;
    return isWithinInterval(startOfDay(date), { start, end });
  }

  function isOvulationDay(date: Date): boolean {
    if (!predictions.ovulationStart || !predictions.ovulationEnd) return false;
    const start = startOfDay(parseISO(predictions.ovulationStart));
    const end = startOfDay(parseISO(predictions.ovulationEnd));
    if (end < start) return false;
    return isWithinInterval(startOfDay(date), { start, end });
  }

  function hasLog(date: Date): boolean {
    return dailyLogs.some((l) => l.date === toISODate(date));
  }

  const today = new Date();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            ←
          </button>
          <span className="font-semibold text-gray-700 w-36 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
        <LegendItem color="bg-red-400" label="Period" />
        <LegendItem color="bg-secondary border-2 border-dashed border-primary" label="Predicted" />
        <LegendItem color="bg-green-100" label="Ovulation" />
        <LegendItem color="ring-2 ring-blue-500" label="Today" />
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const period = isPeriodDay(day);
          return (
            <CalendarDay
              key={day.toISOString()}
              day={day}
              isPeriod={period}
              isPredictedPeriod={!period && isPredictedPeriod(day)}
              isOvulation={!period && isOvulationDay(day)}
              isToday={isSameDay(day, today)}
              isCurrentMonth={true}
              hasLog={hasLog(day)}
              onClick={() => onDayClick(toISODate(day))}
            />
          );
        })}
      </div>

      {cycles.length === 0 && (
        <p className="text-center text-gray-400 text-sm pt-2">
          Log a cycle to see it highlighted here.
        </p>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`h-3 w-3 rounded inline-block ${color}`} />
      {label}
    </div>
  );
}
