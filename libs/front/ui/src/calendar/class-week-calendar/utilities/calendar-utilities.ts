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
 * Checks if two slots have exact same start time and duration
 */
function slotsAreIdentical<T>(slot1: ClassCalendarSlot<T>, slot2: ClassCalendarSlot<T>): boolean {
  return slot1.startTime === slot2.startTime && slot1.durationMinutes === slot2.durationMinutes;
}

/**
 * Calculates positions for overlapping slots with intelligent multi-column cascading
 */
export function calculateOverlappingPositions<T>(
  slots: ClassCalendarSlot<T>[],
  minHour: number,
  slotHeight: number
): ClassSlotPosition<T>[] {
  if (slots.length === 0) return [];

  const sortedSlots = [...slots].sort((a, b) => {
    const [hourA, minuteA] = a.startTime.split(':').map(Number);
    const [hourB, minuteB] = b.startTime.split(':').map(Number);
    return (hourA * 60 + minuteA) - (hourB * 60 + minuteB);
  });

  const identicalGroups = new Map<string, ClassCalendarSlot<T>[]>();
  const processedSlots = new Set<string>();

  sortedSlots.forEach(slot => {
    if (processedSlots.has(slot.id)) return;

    const groupKey = `${slot.startTime}-${slot.durationMinutes}`;
    const identicalSlots = sortedSlots.filter(s =>
      !processedSlots.has(s.id) && slotsAreIdentical(slot, s)
    );

    if (identicalSlots.length > 1) {
      identicalGroups.set(groupKey, identicalSlots);
      identicalSlots.forEach(s => processedSlots.add(s.id));
    }
  });

  const columns: ClassCalendarSlot<T>[][] = [];
  const slotColumnMap = new Map<string, number>();
  const identicalGroupInfo = new Map<string, { groupSize: number; indexInGroup: number }>();

  sortedSlots.forEach(slot => {
    const groupKey = `${slot.startTime}-${slot.durationMinutes}`;

    if (identicalGroups.has(groupKey)) {
      const group = identicalGroups.get(groupKey);
      if (group) {
        const indexInGroup = group.findIndex(s => s.id === slot.id);
        identicalGroupInfo.set(slot.id, {
          groupSize: group.length,
          indexInGroup
        });
        slotColumnMap.set(slot.id, 0);
      }
      return;
    }

    let assignedColumn = -1;

    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const columnSlots = columns[colIndex];
      const hasOverlap = columnSlots.some(existingSlot => slotsOverlap(slot, existingSlot));

      if (!hasOverlap) {
        assignedColumn = colIndex;
        break;
      }
    }

    if (assignedColumn === -1) {
      assignedColumn = columns.length;
      columns.push([]);
    }

    columns[assignedColumn].push(slot);
    slotColumnMap.set(slot.id, assignedColumn);
  });

  const totalColumns = columns.length;
  const offsetPerColumn = totalColumns === 1 ? 0 : 100 / totalColumns;

  const positions: ClassSlotPosition<T>[] = sortedSlots.map(slot => {
    const [hour, minute] = slot.startTime.split(':').map(Number);
    const startMinutes = (hour - minHour) * 60 + minute;
    const top = (startMinutes / 30) * slotHeight;
    const height = (slot.durationMinutes / 30) * slotHeight;

    const identicalInfo = identicalGroupInfo.get(slot.id);

    if (identicalInfo) {
      const { groupSize, indexInGroup } = identicalInfo;
      const slotWidth = 100 / groupSize;
      const left = indexInGroup * slotWidth;
      const zIndex = 10 + (indexInGroup * 10);

      return {
        slot,
        top,
        height,
        left,
        width: slotWidth,
        zIndex
      };
    }

    const columnIndex = slotColumnMap.get(slot.id) || 0;
    const left = columnIndex * offsetPerColumn;
    const width = 100 - left;
    const zIndex = 10 + (columnIndex * 10);

    return {
      slot,
      top,
      height,
      left,
      width,
      zIndex
    };
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
