import { CategoryTag, ThemeMode } from '../types';

export interface ThemePalette {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  border: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  cardShadow: string;
}

export interface ThemeConfig {
  dark: ThemePalette;
  light: ThemePalette;
}

export const themes: ThemeConfig = {
  dark: {
    background: '#09090B',
    surface: '#18181B',
    surfaceElevated: '#27272A',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    primary: '#6366F1',
    primarySoft: 'rgba(99, 102, 241, 0.16)',
    border: '#27272A',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    cardShadow: '#000000',
  },
  light: {
    background: '#F4F4F5',
    surface: '#FFFFFF',
    surfaceElevated: '#F4F4F5',
    text: '#09090B',
    textSecondary: '#52525B',
    textMuted: '#71717A',
    primary: '#4F46E5',
    primarySoft: 'rgba(79, 70, 229, 0.12)',
    border: '#E4E4E7',
    success: '#059669',
    danger: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
    cardShadow: '#18181B',
  },
};

export const PRIORITY_COLORS: readonly { label: string; value: string }[] = [
  { label: 'Urgent', value: '#EF4444' },
  { label: 'High', value: '#F97316' },
  { label: 'Normal', value: '#6366F1' },
  { label: 'Low', value: '#10B981' },
] as const;

export const CATEGORY_COLORS: Record<CategoryTag, string> = {
  'Travel/Logistics': '#F97316',
  Expenses: '#EC4899',
  Academic: '#6366F1',
  General: '#14B8A6',
};

export const getThemeColors = (mode: ThemeMode): ThemePalette => themes[mode];

export default themes;

