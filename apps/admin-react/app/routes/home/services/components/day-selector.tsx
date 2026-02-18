import { DAYS_OF_WEEK, DAY_OF_WEEK_LABELS, type DayOfWeek } from '@models/common';
import { cn } from '@front/cn/utils';

interface DaySelectorProps {
  selected: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  mon: 'Lun',
  tue: 'Mar',
  wed: 'Mié',
  thu: 'Jue',
  fri: 'Vie',
  sat: 'Sáb',
  sun: 'Dom',
};

export function DaySelector({ selected, onChange }: DaySelectorProps) {
  function toggle(day: DayOfWeek) {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DAYS_OF_WEEK.map((day) => {
        const isSelected = selected.includes(day);
        return (
          <button
            key={day}
            type="button"
            title={DAY_OF_WEEK_LABELS[day]}
            onClick={() => toggle(day)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {DAY_SHORT_LABELS[day]}
          </button>
        );
      })}
    </div>
  );
}
