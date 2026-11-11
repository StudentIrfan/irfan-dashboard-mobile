import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, addDays } from 'date-fns';
import { CalendarEvent, Subscription, Task, ThemeMode } from '../types';

export interface DashboardStoreState {
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  subscriptions: Subscription[];
  snakeHighScore: number;
  theme: ThemeMode;
  addTask: (task: Omit<Task, 'id'> & { id?: string }) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'> & { id?: string }) => void;
  updateEvent: (id: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => void;
  deleteEvent: (id: string) => void;
  setSnakeHighScore: (score: number) => void;
  toggleTheme: () => void;
}

const todayStr = format(new Date(), 'yyyy-MM-dd');
const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const inTwoDaysStr = format(addDays(new Date(), 2), 'yyyy-MM-dd');
const inFourDaysStr = format(addDays(new Date(), 4), 'yyyy-MM-dd');

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Book redBus & KLIA Transit for Campus Return',
    date: todayStr,
    time: '14:30',
    priorityColor: '#F97316',
    categoryTag: 'Travel/Logistics',
    isRecurring: false,
    sideNotes: 'Check TBS terminal platform and KLIA Ekspres student concession rate.',
    isCompleted: false,
  },
  {
    id: 'task-2',
    title: 'CCNA Routing & Switching Lab Simulation',
    date: todayStr,
    time: '20:00',
    priorityColor: '#EF4444',
    categoryTag: 'Academic',
    isRecurring: true,
    sideNotes: 'Complete OSPF multi-area packet tracer topology for IIUM KICT module.',
    isCompleted: true,
  },
  {
    id: 'task-3',
    title: 'Log Setel Fuel, Tealive & Pop Meals Expenses',
    date: tomorrowStr,
    time: '18:00',
    priorityColor: '#6366F1',
    categoryTag: 'Expenses',
    isRecurring: true,
    sideNotes: 'Reconcile weekly Mahallah food & fuel budget in monthly ledger.',
    isCompleted: false,
  },
  {
    id: 'task-4',
    title: 'Cyber Skills Level-Up IIUM CTF Prep',
    date: inTwoDaysStr,
    time: '21:30',
    priorityColor: '#EF4444',
    categoryTag: 'Academic',
    isRecurring: false,
    sideNotes: 'Review web exploitation and reverse engineering writeups.',
    isCompleted: false,
  },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'IIUM JumpStart 2.0 Committee Sync',
    date: tomorrowStr,
    time: '16:00',
    sideNotes: 'KICT Conference Room / Google Meet link in group chat.',
  },
  {
    id: 'event-2',
    title: 'Kulliyyah of ICT Dean’s List Appreciation Briefing',
    date: inFourDaysStr,
    time: '10:30',
    sideNotes: 'Main Auditorium, IIUM Gombak Campus.',
  },
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-spaylater',
    name: 'SPayLater Monthly Due',
    dueDate: '10th Monthly',
    amount: 145.5,
    platform: 'ShopeePay / SPayLater',
  },
  {
    id: 'sub-google-ai',
    name: 'Google AI Plus (Gemini Advanced)',
    dueDate: '18th Monthly',
    amount: 97.9,
    platform: 'Google One (2TB + AI)',
  },
  {
    id: 'sub-capcut',
    name: 'CapCut Pro Cloud Renewal',
    dueDate: '24th Monthly',
    amount: 39.9,
    platform: 'Bytedance / App Store',
  },
];

const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
};

export const useStore = create<DashboardStoreState>()(
  persist(
    (set) => ({
      tasks: INITIAL_TASKS,
      calendarEvents: INITIAL_EVENTS,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      snakeHighScore: 0,
      theme: 'dark',

      addTask: (taskInput) =>
        set((state) => {
          const newTask: Task = {
            ...taskInput,
            id: taskInput.id ?? generateId('task'),
          };
          return {
            ...state,
            tasks: [newTask, ...state.tasks],
          };
        }),

      updateTask: (id, updates) =>
        set((state) => ({
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          ...state,
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      toggleTaskCompletion: (id) =>
        set((state) => ({
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
          ),
        })),

      addEvent: (eventInput) =>
        set((state) => {
          const newEvent: CalendarEvent = {
            ...eventInput,
            id: eventInput.id ?? generateId('event'),
          };
          return {
            ...state,
            calendarEvents: [newEvent, ...state.calendarEvents],
          };
        }),

      updateEvent: (id, updates) =>
        set((state) => ({
          ...state,
          calendarEvents: state.calendarEvents.map((ev) =>
            ev.id === id ? { ...ev, ...updates } : ev
          ),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          ...state,
          calendarEvents: state.calendarEvents.filter((ev) => ev.id !== id),
        })),

      setSnakeHighScore: (score) =>
        set((state) => ({
          ...state,
          snakeHighScore: Math.max(state.snakeHighScore, score),
        })),

      toggleTheme: () =>
        set((state) => ({
          ...state,
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
    }),
    {
      name: 'irfan-personal-dashboard-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useStore;

