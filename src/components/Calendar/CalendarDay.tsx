interface CalendarDayProps {
  day: Date;
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isOvulation: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  hasLog: boolean;
  onClick: () => void;
}

export function CalendarDay({
  day,
  isPeriod,
  isPredictedPeriod,
  isOvulation,
  isToday,
  isCurrentMonth,
  hasLog,
  onClick,
}: CalendarDayProps) {
  let bg = '';
  let extraBorder = '';
  let text = isCurrentMonth ? 'text-gray-800' : 'text-gray-300';

  if (isPeriod) {
    bg = 'bg-red-400';
    text = 'text-white';
  } else if (isPredictedPeriod) {
    bg = 'bg-pink-100';
    extraBorder = 'border-2 border-dashed border-pink-400';
  } else if (isOvulation) {
    bg = 'bg-green-100';
  }

  const todayRing = isToday ? 'ring-2 ring-blue-500 ring-offset-1' : '';

  return (
    <button
      onClick={onClick}
      title={day.toDateString()}
      className={`relative h-10 w-full rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-opacity hover:opacity-75 ${bg} ${extraBorder} ${todayRing} ${text}`}
    >
      {day.getDate()}
      {hasLog && (
        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-current opacity-60" />
      )}
    </button>
  );
}
