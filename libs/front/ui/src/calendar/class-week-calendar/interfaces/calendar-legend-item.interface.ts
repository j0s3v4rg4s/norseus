import { CalendarColor } from '../enums';

/**
 * Interface for legend items in the calendar component
 */
export interface CalendarLegendItem {
  serviceId: string;
  serviceName: string;
  color: CalendarColor;
  visible: boolean;
}
