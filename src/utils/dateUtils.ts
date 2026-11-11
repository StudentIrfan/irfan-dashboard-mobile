import {
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfWeek,
  endOfWeek,
  differenceInSeconds,
  isValid,
} from 'date-fns';
import { CalendarEvent, MarkedDatesMap, Task } from '../types';

export const getTodayISO = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const formatDisplayDate = (dateStr: string): string => {
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) {
      return dateStr;
    }
    return format(parsed, 'EEE, dd MMM yyyy');
  } catch {
    return dateStr;
  }
};

export const isDateToday = (dateStr: string): boolean => {
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) {
      return false;
    }
    return isSameDay(parsed, new Date());
  } catch {
    return false;
  }
};

export const isDateInCurrentWeek = (dateStr: string): boolean => {
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) {
      return false;
    }
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return isWithinInterval(parsed, { start, end });
  } catch {
    return false;
  }
};

export interface WeeklyTaskStats {
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export const calculateWeeklyTaskStats = (tasks: readonly Task[]): WeeklyTaskStats => {
  const weeklyTasks = tasks.filter((task) => isDateInCurrentWeek(task.date));
  const targetPool = weeklyTasks.length > 0 ? weeklyTasks : tasks;
  const totalCount = targetPool.length;
  if (totalCount === 0) {
    return { completedCount: 0, totalCount: 0, percentage: 0 };
  }
  const completedCount = targetPool.filter((task) => task.isCompleted).length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  return { completedCount, totalCount, percentage };
};

export const calculateTodayTaskCompletion = (tasks: readonly Task[]): number => {
  const todayTasks = tasks.filter((task) => isDateToday(task.date));
  const pool = todayTasks.length > 0 ? todayTasks : tasks;
  if (pool.length === 0) {
    return 0;
  }
  const completed = pool.filter((t) => t.isCompleted).length;
  return Math.round((completed / pool.length) * 100);
};

export interface CountdownBreakdown {
  title: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const getNextUpcomingCountdown = (
  tasks: readonly Task[],
  events: readonly CalendarEvent[]
): CountdownBreakdown => {
  const now = new Date();

  interface Candidate {
    title: string;
    targetDate: Date;
  }

  const candidates: Candidate[] = [];

  tasks.forEach((task) => {
    if (!task.isCompleted) {
      const dateTimeStr = `${task.date}T${task.time || '09:00'}:00`;
      const parsed = parseISO(dateTimeStr);
      if (isValid(parsed) && parsed.getTime() > now.getTime()) {
        candidates.push({ title: task.title, targetDate: parsed });
      }
    }
  });

  events.forEach((ev) => {
    const dateTimeStr = `${ev.date}T${ev.time || '09:00'}:00`;
    const parsed = parseISO(dateTimeStr);
    if (isValid(parsed) && parsed.getTime() > now.getTime()) {
      candidates.push({ title: ev.title, targetDate: parsed });
    }
  });

  candidates.sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

  if (candidates.length === 0) {
    return {
      title: 'All Caught Up',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const next = candidates[0];
  const totalSeconds = Math.max(0, differenceInSeconds(next.targetDate, now));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    title: next.title,
    days,
    hours,
    minutes,
    seconds,
    isExpired: totalSeconds <= 0,
  };
};

/**
 * Multi-dot marker rules:
 * - Orange (#F97316) for Travel/Logistics (e.g., redBus / KLIA Transit)
 * - Green (#10B981) for Recurring tasks
 * - Red (#EF4444) for Urgent priority tasks
 * - Indigo (#6366F1) for Academic / Calendar Events / General
 */
export const buildCalendarMarkedDates = (
  tasks: readonly Task[],
  events: readonly CalendarEvent[],
  selectedDate: string,
  primaryColor: string
): MarkedDatesMap => {
  const map: MarkedDatesMap = {};

  const ensureEntry = (dateKey: string): void => {
    if (!map[dateKey]) {
      map[dateKey] = {
        dots: [],
        marked: false,
      };
    }
  };

  const addUniqueDot = (dateKey: string, key: string, color: string): void => {
    ensureEntry(dateKey);
    const exists = map[dateKey].dots.some((d) => d.key === key);
    if (!exists && map[dateKey].dots.length < 4) {
      map[dateKey].dots.push({ key, color, selectedDotColor: '#FFFFFF' });
      map[dateKey].marked = true;
    }
  };

  tasks.forEach((task) => {
    const parsed = parseISO(task.date);
    if (!isValid(parsed)) {
      return;
    }
    const dateKey = format(parsed, 'yyyy-MM-dd');

    if (task.categoryTag === 'Travel/Logistics') {
      addUniqueDot(dateKey, 'travel', '#F97316');
    }
    if (task.isRecurring) {
      addUniqueDot(dateKey, 'recurring', '#10B981');
    }
    if (task.priorityColor.toUpperCase() === '#EF4444') {
      addUniqueDot(dateKey, 'urgent', '#EF4444');
    }
    if (
      task.categoryTag !== 'Travel/Logistics' &&
      !task.isRecurring &&
      task.priorityColor.toUpperCase() !== '#EF4444'
    ) {
      addUniqueDot(dateKey, `task-${task.categoryTag}`, task.priorityColor || primaryColor);
    }
  });

  events.forEach((event) => {
    const parsed = parseISO(event.date);
    if (!isValid(parsed)) {
      return;
    }
    const dateKey = format(parsed, 'yyyy-MM-dd');
    addUniqueDot(dateKey, 'event', primaryColor);
  });

  if (selectedDate) {
    ensureEntry(selectedDate);
    map[selectedDate] = {
      ...map[selectedDate],
      selected: true,
      selectedColor: primaryColor,
    };
  }

  return map;
};

