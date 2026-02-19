import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@front/cn/utils';
import {
  type DateCalendarSlot,
  type DateSlotPosition,
  getWeekDates,
  formatDateHeader,
  getDateSlotTimeRange,
  calculateDateSlotPosition,
} from '../date-calendar.utils';

const SLOT_HEIGHT = 40;

interface DateWeekCalendarProps {
  slots: DateCalendarSlot[];
  weekStart: Date;
  onWeekChange: (newWeekStart: Date) => void;
  onSlotClick?: (slotId: string) => void;
  minWeekStart?: Date;
  maxWeekStart?: Date;
}

interface TimeLabel {
  label: string;
  isHourMark: boolean;
}

const PREDEFINED_COLORS = ['blue', 'green', 'primary'] as const;

const SLOT_COLOR_CLASSES: Record<(typeof PREDEFINED_COLORS)[number], { base: string; hover: string }> = {
  blue: {
    base: 'bg-blue-500/80 text-white',
    hover: 'hover:bg-blue-600',
  },
  green: {
    base: 'bg-green-500/80 text-white',
    hover: 'hover:bg-green-600',
  },
  primary: {
    base: 'bg-primary text-primary-foreground',
    hover: 'hover:bg-primary/90',
  },
};

function isPredefinedColor(color: string | undefined): color is (typeof PREDEFINED_COLORS)[number] {
  return color != null && PREDEFINED_COLORS.includes(color as (typeof PREDEFINED_COLORS)[number]);
}

const DISABLED_NO_COLOR_CLASSES = 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed';
const DISABLED_WITH_COLOR_CLASSES = 'opacity-60 cursor-not-allowed';
const SELECTED_RING = 'ring-2 ring-primary ring-offset-1';

function isSameWeek(a: Date, b: Date): boolean {
  const aTime = new Date(a);
  aTime.setHours(0, 0, 0, 0);
  const bTime = new Date(b);
  bTime.setHours(0, 0, 0, 0);
  return aTime.getTime() === bTime.getTime();
}

export function DateWeekCalendar({
  slots,
  weekStart,
  onWeekChange,
  onSlotClick,
  minWeekStart,
  maxWeekStart,
}: DateWeekCalendarProps) {
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const canGoPrev = !minWeekStart || !isSameWeek(weekStart, minWeekStart);
  const canGoNext = !maxWeekStart || !isSameWeek(weekStart, maxWeekStart);

  function handlePrev() {
    if (!canGoPrev) return;
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    onWeekChange(prev);
  }

  function handleNext() {
    if (!canGoNext) return;
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    onWeekChange(next);
  }

  const timeLabels = useMemo<TimeLabel[]>(() => {
    if (slots.length === 0) return [];
    const { minHour, maxHour } = getDateSlotTimeRange(slots);
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

  const slotsByDateIndex = useMemo(() => {
    const grouped: DateSlotPosition[][] = Array.from({ length: 7 }, () => []);
    if (slots.length === 0) return grouped;

    const { minHour } = getDateSlotTimeRange(slots);
    const weekStartTime = weekStart.getTime();

    for (const slot of slots) {
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((slotDate.getTime() - weekStartTime) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        grouped[diffDays].push(calculateDateSlotPosition(slot, minHour, SLOT_HEIGHT));
      }
    }

    return grouped;
  }, [slots, weekStart]);

  if (slots.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            canGoPrev
              ? 'hover:bg-accent text-foreground'
              : 'text-muted-foreground cursor-not-allowed opacity-50'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {formatDateHeader(weekDates[0])} – {formatDateHeader(weekDates[6])}
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            canGoNext
              ? 'hover:bg-accent text-foreground'
              : 'text-muted-foreground cursor-not-allowed opacity-50'
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid min-w-[600px]"
          style={{ gridTemplateColumns: '50px repeat(7, 1fr)' }}
        >
          <div className="border-b border-border" />
          {weekDates.map((date, i) => (
            <div
              key={i}
              className="border-b border-l border-border bg-muted/50 p-2 text-center text-sm font-semibold"
            >
              {formatDateHeader(date)}
            </div>
          ))}

          <div className="relative" style={{ height: calendarHeight }}>
            {timeLabels.map((tl, i) => (
              <div
                key={tl.label}
                className="absolute right-0 left-0 pr-2 text-right text-xs text-muted-foreground"
                style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
              >
                <span className="bg-background pr-1">{tl.label}</span>
              </div>
            ))}
          </div>

          {weekDates.map((_, dayIdx) => (
            <div
              key={dayIdx}
              className="relative border-l border-border"
              style={{ height: calendarHeight }}
            >
              {timeLabels.map((tl, i) => (
                <div
                  key={tl.label}
                  className={cn(
                    'absolute left-0 right-0',
                    i > 0 && (tl.isHourMark ? 'border-t border-border' : 'border-t border-border/50')
                  )}
                  style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                />
              ))}
              {slotsByDateIndex[dayIdx].map((position) => {
                const { slot } = position;
                const isDisabled = slot.isDisabled === true;
                const isSelected = slot.isSelected === true;
                const isCustomColor = slot.color != null && !isPredefinedColor(slot.color);

                const colorKey = slot.color ?? 'blue';
                const colorClasses = isPredefinedColor(colorKey)
                  ? SLOT_COLOR_CLASSES[colorKey]
                  : SLOT_COLOR_CLASSES.blue;

                const disabledClasses = slot.color
                  ? isCustomColor
                    ? DISABLED_WITH_COLOR_CLASSES
                    : cn(colorClasses.base, DISABLED_WITH_COLOR_CLASSES)
                  : DISABLED_NO_COLOR_CLASSES;

                const baseClasses = isCustomColor
                  ? cn('text-white', !isDisabled && 'hover:opacity-90')
                  : cn(colorClasses.base, !isDisabled && colorClasses.hover);

                const inlineStyle: React.CSSProperties = {
                  top: position.top,
                  height: position.height,
                  ...(isCustomColor && slot.color ? { backgroundColor: slot.color } : {}),
                };

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) onSlotClick?.(slot.id);
                    }}
                    className={cn(
                      'absolute left-1 right-1 overflow-hidden rounded px-2 py-1 text-left text-xs transition-colors',
                      isDisabled ? disabledClasses : baseClasses,
                      isSelected && !isDisabled && SELECTED_RING
                    )}
                    style={inlineStyle}
                  >
                    {slot.displayLabel && (
                      <div className="font-semibold">{slot.displayLabel}</div>
                    )}
                    {slot.displaySubLabel && (
                      <div className="text-[10px] opacity-90">{slot.displaySubLabel}</div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
