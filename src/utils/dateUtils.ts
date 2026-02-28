import { differenceInDays, parseISO, format, isWithinInterval, startOfDay } from 'date-fns';

export function isBetween(date: Date, start: Date, end: Date): boolean {
  return isWithinInterval(startOfDay(date), {
    start: startOfDay(start),
    end: startOfDay(end),
  });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function getDaysBetween(a: Date | string, b: Date | string): number {
  const dateA = typeof a === 'string' ? parseISO(a) : a;
  const dateB = typeof b === 'string' ? parseISO(b) : b;
  return Math.abs(differenceInDays(dateA, dateB));
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
