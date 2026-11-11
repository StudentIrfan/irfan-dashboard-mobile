export type CategoryTag = 'Travel/Logistics' | 'Expenses' | 'Academic' | 'General';

export type ThemeMode = 'light' | 'dark';

export interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  priorityColor: string;
  categoryTag: CategoryTag;
  isRecurring: boolean;
  sideNotes: string;
  isCompleted: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  sideNotes: string;
}

export interface Subscription {
  id: string;
  name: string;
  dueDate: string;
  amount: number;
  platform: string;
}

export type RootTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Calendar: undefined;
  SnakeGame: undefined;
};

export interface Coordinate {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface CalendarDot {
  key: string;
  color: string;
  selectedDotColor?: string;
}

export interface MarkedDateEntry {
  dots: CalendarDot[];
  marked?: boolean;
  selected?: boolean;
  selectedColor?: string;
}

export type MarkedDatesMap = Record<string, MarkedDateEntry>;
