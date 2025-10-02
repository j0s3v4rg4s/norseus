import { CalendarSlot } from '../interfaces';

/**
 * Type definition for a transformation function that converts any type T to CalendarSlot
 */
export type TransformToCalendarSlot<T> = (item: T) => CalendarSlot;
