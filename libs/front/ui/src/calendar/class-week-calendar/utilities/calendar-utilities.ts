import { ClassCalendarSlot, ClassSlotPosition } from '../interfaces';

/**
 * Predefined color palette for service differentiation
 */
export const COLOR_PALETTE = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo', 'teal', 'rose'];

/**
 * Assigns colors to slots based on their categoryId cycling through the color palette
 */
export function assignColorsToSlots<T>(slots: ClassCalendarSlot<T>[]): ClassCalendarSlot<T>[] {
  const categoryColorMap = new Map<string, string>();

  return slots.map(slot => {
    if (!categoryColorMap.has(slot.categoryId)) {
      const colorIndex = categoryColorMap.size % COLOR_PALETTE.length;
      categoryColorMap.set(slot.categoryId, COLOR_PALETTE[colorIndex]);
    }

    return {
      ...slot,
      color: categoryColorMap.get(slot.categoryId)
    };
  });
}

/**
 * Detects if two slots overlap in time (any partial overlap)
 */
export function slotsOverlap<T>(slot1: ClassCalendarSlot<T>, slot2: ClassCalendarSlot<T>): boolean {
  const date1 = new Date(slot1.date.getFullYear(), slot1.date.getMonth(), slot1.date.getDate());
  const date2 = new Date(slot2.date.getFullYear(), slot2.date.getMonth(), slot2.date.getDate());

  if (date1.getTime() !== date2.getTime()) {
    return false;
  }

  const [hour1, minute1] = slot1.startTime.split(':').map(Number);
  const [hour2, minute2] = slot2.startTime.split(':').map(Number);

  const start1 = hour1 * 60 + minute1;
  const end1 = start1 + slot1.durationMinutes;
  const start2 = hour2 * 60 + minute2;
  const end2 = start2 + slot2.durationMinutes;

  // Check for any overlap: slots overlap if one starts before the other ends
  const overlaps = !(end1 <= start2 || end2 <= start1);

  return overlaps;
}

/**
 * Groups slots by date and detects overlaps within each date
 */
export function groupSlotsByDate<T>(allSlots: ClassCalendarSlot<T>[]): Record<string, ClassCalendarSlot<T>[]> {
  const grouped: Record<string, ClassCalendarSlot<T>[]> = {};

  allSlots.forEach(slot => {
    const dateKey = slot.date.toISOString().split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(slot);
  });

  return grouped;
}

/**
 * Calculates positions for overlapping slots with horizontal division
 */
export function calculateOverlappingPositions<T>(
  slots: ClassCalendarSlot<T>[],
  minHour: number,
  slotHeight: number
): ClassSlotPosition<T>[] {
  if (slots.length === 0) return [];

  const positions: ClassSlotPosition<T>[] = [];

  // Sort slots by start time to process them in order
  const sortedSlots = [...slots].sort((a, b) => {
    const [hourA, minuteA] = a.startTime.split(':').map(Number);
    const [hourB, minuteB] = b.startTime.split(':').map(Number);
    return (hourA * 60 + minuteA) - (hourB * 60 + minuteB);
  });

  // Group slots into overlapping clusters
  const overlapGroups: ClassCalendarSlot<T>[][] = [];
  const processedSlots = new Set<string>();

  sortedSlots.forEach(slot => {
    if (processedSlots.has(slot.id)) return;

    // Find all slots that overlap with this one (including transitive overlaps)
    const currentGroup: ClassCalendarSlot<T>[] = [];
    const toProcess = [slot];

    while (toProcess.length > 0) {
      const currentSlot = toProcess.shift() as ClassCalendarSlot<T>;

      if (processedSlots.has(currentSlot.id)) continue;

      processedSlots.add(currentSlot.id);
      currentGroup.push(currentSlot);

      // Find all unprocessed slots that overlap with current slot
      sortedSlots.forEach(otherSlot => {
        if (!processedSlots.has(otherSlot.id) && slotsOverlap(currentSlot, otherSlot)) {
          toProcess.push(otherSlot);
        }
      });
    }

    if (currentGroup.length > 0) {
      overlapGroups.push(currentGroup);
    }
  });

  // Calculate positions for each group
  overlapGroups.forEach(group => {
    // Sort group by start time
    const sortedGroup = group.sort((a, b) => {
      const [hourA, minuteA] = a.startTime.split(':').map(Number);
      const [hourB, minuteB] = b.startTime.split(':').map(Number);
      return (hourA * 60 + minuteA) - (hourB * 60 + minuteB);
    });

    sortedGroup.forEach((slot, index) => {
      const [hour, minute] = slot.startTime.split(':').map(Number);
      const startMinutes = (hour - minHour) * 60 + minute;
      const top = (startMinutes / 30) * slotHeight;
      const height = (slot.durationMinutes / 30) * slotHeight;

      const totalOverlapping = group.length;
      const slotWidth = 100 / totalOverlapping;
      const left = index * slotWidth;
      const zIndex = 10 + index;

      positions.push({
        slot,
        top,
        height,
        left,
        width: slotWidth,
        zIndex
      });
    });
  });

  return positions;
}

/**
 * Gets the time range from all slots
 */
export function getTimeRangeFromSlots<T>(slots: ClassCalendarSlot<T>[]): { minHour: number; maxHour: number } {
  let minHour = 24;
  let maxHour = 0;

  slots.forEach(slot => {
    const [hour, minute] = slot.startTime.split(':').map(Number);
    const startMinutes = hour * 60 + minute;
    const endMinutes = startMinutes + slot.durationMinutes;
    const endHour = Math.ceil(endMinutes / 60);

    minHour = Math.min(minHour, hour);
    maxHour = Math.max(maxHour, endHour);
  });

  return { minHour, maxHour };
}
