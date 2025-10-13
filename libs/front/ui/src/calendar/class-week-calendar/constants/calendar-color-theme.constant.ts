import { CalendarColor } from '../enums';

/**
 * Color state type for calendar slots
 */
export type ColorState = 'normal' | 'selected' | 'legend' | 'legendCheckbox';

/**
 * Theme configuration for calendar colors with all possible states
 */
export interface CalendarColorStateTheme {
  normal: string;
  selected: string;
  legend: string;
  legendCheckbox: string;
}

/**
 * Centralized color theme configuration for the calendar component
 * Maps each CalendarColor to all its possible visual states
 */
export const CALENDAR_COLOR_THEME: Record<CalendarColor, CalendarColorStateTheme> = {
  [CalendarColor.BLUE]: {
    normal: 'bg-blue-500/90 hover:bg-blue-600 text-white',
    selected: 'bg-blue-700 hover:bg-blue-800 text-white',
    legend: 'bg-blue-500',
    legendCheckbox: 'bg-blue-500 border-blue-500',
  },
  [CalendarColor.GREEN]: {
    normal: 'bg-green-500/90 hover:bg-green-600 text-white',
    selected: 'bg-green-700 hover:bg-green-800 text-white',
    legend: 'bg-green-500',
    legendCheckbox: 'bg-green-500 border-green-500',
  },
  [CalendarColor.PURPLE]: {
    normal: 'bg-purple-500/90 hover:bg-purple-600 text-white',
    selected: 'bg-purple-700 hover:bg-purple-800 text-white',
    legend: 'bg-purple-500',
    legendCheckbox: 'bg-purple-500 border-purple-500',
  },
  [CalendarColor.ORANGE]: {
    normal: 'bg-orange-500/90 hover:bg-orange-600 text-white',
    selected: 'bg-orange-700 hover:bg-orange-800 text-white',
    legend: 'bg-orange-500',
    legendCheckbox: 'bg-orange-500 border-orange-500',
  },
  [CalendarColor.PINK]: {
    normal: 'bg-pink-500/90 hover:bg-pink-600 text-white',
    selected: 'bg-pink-700 hover:bg-pink-800 text-white',
    legend: 'bg-pink-500',
    legendCheckbox: 'bg-pink-500 border-pink-500',
  },
  [CalendarColor.INDIGO]: {
    normal: 'bg-indigo-500/90 hover:bg-indigo-600 text-white',
    selected: 'bg-indigo-700 hover:bg-indigo-800 text-white',
    legend: 'bg-indigo-500',
    legendCheckbox: 'bg-indigo-500 border-indigo-500',
  },
  [CalendarColor.TEAL]: {
    normal: 'bg-teal-500/90 hover:bg-teal-600 text-white',
    selected: 'bg-teal-700 hover:bg-teal-800 text-white',
    legend: 'bg-teal-500',
    legendCheckbox: 'bg-teal-500 border-teal-500',
  },
  [CalendarColor.ROSE]: {
    normal: 'bg-rose-500/90 hover:bg-rose-600 text-white',
    selected: 'bg-rose-700 hover:bg-rose-800 text-white',
    legend: 'bg-rose-500',
    legendCheckbox: 'bg-rose-500 border-rose-500',
  },
};

/**
 * Default color classes for disabled slots
 */
export const CALENDAR_DISABLED_COLOR = 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60';

/**
 * Default fallback colors for each state
 */
export const CALENDAR_DEFAULT_COLORS: CalendarColorStateTheme = {
  normal: 'bg-gray-500/80 hover:bg-gray-600/90 text-white',
  selected: 'bg-gray-700 hover:bg-gray-800 text-white',
  legend: 'bg-gray-500',
  legendCheckbox: 'bg-gray-500 border-gray-500',
};

