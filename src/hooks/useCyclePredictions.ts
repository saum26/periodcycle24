import { useMemo } from 'react';
import {
  parseISO,
  differenceInDays,
  addDays,
  isWithinInterval,
  startOfDay,
} from 'date-fns';
import { CycleEntry } from '../types';
import { toISODate } from '../utils/dateUtils';

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;
const OVULATION_OFFSET = 14; // days before predicted next period start

export interface CyclePredictions {
  avgCycleLength: number;
  avgPeriodLength: number;
  nextPeriodDate: string | null;
  nextPeriodEndDate: string | null;
  currentCycleDay: number | null;
  isOnPeriod: boolean;
  ovulationStart: string | null;
  ovulationEnd: string | null;
}

export function useCyclePredictions(cycles: CycleEntry[]): CyclePredictions {
  return useMemo(() => {
    const today = startOfDay(new Date());

    // Sort cycles newest-first
    const sorted = [...cycles].sort(
      (a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime(),
    );

    const completedCycles = sorted.filter((c) => c.endDate);

    // Average cycle length: gap between consecutive period starts
    let avgCycleLength = DEFAULT_CYCLE_LENGTH;
    if (sorted.length >= 2) {
      const lengths: number[] = [];
      for (let i = 0; i < sorted.length - 1; i++) {
        const diff = differenceInDays(
          parseISO(sorted[i].startDate),
          parseISO(sorted[i + 1].startDate),
        );
        if (diff > 0 && diff < 60) lengths.push(diff);
      }
      if (lengths.length > 0) {
        avgCycleLength = Math.round(
          lengths.reduce((a, b) => a + b, 0) / lengths.length,
        );
      }
    }

    // Average period length from completed cycles
    let avgPeriodLength = DEFAULT_PERIOD_LENGTH;
    if (completedCycles.length > 0) {
      const lengths = completedCycles
        .map((c) => differenceInDays(parseISO(c.endDate!), parseISO(c.startDate)) + 1)
        .filter((l) => l > 0 && l < 15);
      if (lengths.length > 0) {
        avgPeriodLength = Math.round(
          lengths.reduce((a, b) => a + b, 0) / lengths.length,
        );
      }
    }

    const mostRecent = sorted[0];
    let isOnPeriod = false;
    let currentCycleDay: number | null = null;
    let nextPeriodDate: string | null = null;
    let nextPeriodEndDate: string | null = null;

    if (mostRecent) {
      const startDate = startOfDay(parseISO(mostRecent.startDate));
      const endDate = mostRecent.endDate
        ? startOfDay(parseISO(mostRecent.endDate))
        : addDays(startDate, avgPeriodLength - 1); // implied end for open cycles

      isOnPeriod =
        endDate >= startDate &&
        isWithinInterval(today, { start: startDate, end: endDate });

      currentCycleDay = differenceInDays(today, startDate) + 1;

      const nextStart = addDays(startDate, avgCycleLength);
      if (nextStart > today) {
        nextPeriodDate = toISODate(nextStart);
        nextPeriodEndDate = toISODate(addDays(nextStart, avgPeriodLength - 1));
      } else {
        // Prediction overdue — show today as the next period
        nextPeriodDate = toISODate(today);
        nextPeriodEndDate = toISODate(addDays(today, avgPeriodLength - 1));
      }
    }

    // Ovulation window: centred ~14 days before next period, ±2 days
    let ovulationStart: string | null = null;
    let ovulationEnd: string | null = null;
    if (nextPeriodDate) {
      const ovDay = addDays(parseISO(nextPeriodDate), -OVULATION_OFFSET);
      ovulationStart = toISODate(addDays(ovDay, -2));
      ovulationEnd = toISODate(addDays(ovDay, 2));
    }

    return {
      avgCycleLength,
      avgPeriodLength,
      nextPeriodDate,
      nextPeriodEndDate,
      currentCycleDay,
      isOnPeriod,
      ovulationStart,
      ovulationEnd,
    };
  }, [cycles]);
}
