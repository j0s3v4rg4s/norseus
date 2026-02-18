import { useMemo } from 'react';
import { DAYS_OF_WEEK, DAY_OF_WEEK_LABELS, type DayOfWeek } from '@models/common';
import {
  type CalendarSlot,
  type SlotPosition,
  getTimeRange,
  calculateSlotPosition,
} from '../services-create.utils';

const SLOT_HEIGHT = 40;

const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  mon: 'Lun',
  tue: 'Mar',
  wed: 'Mié',
  thu: 'Jue',
  fri: 'Vie',
  sat: 'Sáb',
  sun: 'Dom',
};

interface WeekCalendarProps {
  slots: CalendarSlot[];
  onSlotClick?: (slotId: string) => void;
}

interface TimeLabel {
  label: string;
  isHourMark: boolean;
}

export function WeekCalendar({ slots, onSlotClick }: WeekCalendarProps) {
  const timeLabels = useMemo<TimeLabel[]>(() => {
    if (slots.length === 0) return [];
    const { minHour, maxHour } = getTimeRange(slots);
    const labels: TimeLabel[] = [];
    for (let hour = minHour; hour <= maxHour; hour++) {
      labels.push({
        label: `${hour.toString().padStart(2, '0')}:00`,
        isHourMark: true,
      });
      if (hour < maxHour) {
        labels.push({
          label: `${hour.toString().padStart(2, '0')}:30`,
          isHourMark: false,
        });
      }
    }
    return labels;
  }, [slots]);

  const calendarHeight = timeLabels.length * SLOT_HEIGHT;

  const slotsByDay = useMemo<Record<DayOfWeek, SlotPosition[]>>(() => {
    const grouped: Record<DayOfWeek, SlotPosition[]> = {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    };
    if (slots.length === 0) return grouped;
    const { minHour } = getTimeRange(slots);
    for (const slot of slots) {
      grouped[slot.dayOfWeek].push(
        calculateSlotPosition(slot, minHour, SLOT_HEIGHT)
      );
    }
    return grouped;
  }, [slots]);

  if (slots.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[600px]" style={{ gridTemplateColumns: '50px repeat(7, 1fr)' }}>
        <div className="border-b border-gray-300" />
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="border-b border-l border-gray-300 bg-gray-50 p-2 text-center text-sm font-semibold"
            title={DAY_OF_WEEK_LABELS[day]}
          >
            {DAY_SHORT_LABELS[day]}
          </div>
        ))}

        <div className="relative" style={{ height: calendarHeight }}>
          {timeLabels.map((slot, i) => (
            <div
              key={slot.label}
              className="absolute right-0 left-0 pr-2 text-right text-xs text-gray-600"
              style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
            >
              <span className="bg-white pr-1">{slot.label}</span>
            </div>
          ))}
        </div>

        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="relative border-l border-gray-300"
            style={{ height: calendarHeight }}
          >
            {timeLabels.map((slot, i) => (
              <div
                key={slot.label}
                className={`absolute left-0 right-0 ${
                  i > 0
                    ? slot.isHourMark
                      ? 'border-t border-gray-400'
                      : 'border-t border-gray-200'
                    : ''
                }`}
                style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
              />
            ))}
            {slotsByDay[day].map((position) => (
              <button
                key={position.slot.id}
                type="button"
                onClick={() => onSlotClick?.(position.slot.id)}
                className="absolute left-1 right-1 overflow-hidden rounded bg-blue-500/80 px-2 py-1 text-left text-xs text-white transition-colors hover:bg-blue-600"
                style={{ top: position.top, height: position.height }}
                title="Clic para eliminar"
              >
                {position.slot.displayLabel && (
                  <div className="font-semibold">{position.slot.displayLabel}</div>
                )}
                {position.slot.displaySubLabel && (
                  <div className="text-[10px] opacity-90">{position.slot.displaySubLabel}</div>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
