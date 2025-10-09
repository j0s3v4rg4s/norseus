import { CalendarSlot } from '../week-calendar/interfaces';

/**
 * Type definition for a transformation function that converts any type T to CalendarSlot
 */
export type TransformToCalendarSlot<T> = (item: T) => CalendarSlot;
