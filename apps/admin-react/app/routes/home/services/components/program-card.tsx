import { useState } from 'react';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardHeader } from '@front/cn/components/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@front/cn/components/collapsible';
import { cn } from '@front/cn/utils';
import { DateWeekCalendar, type DateCalendarSlot, getWeekStart } from '@front/ui-react';
import type { ProgramDraft } from '@models/classes';

interface ProgramCardProps {
  program: ProgramDraft;
  allSlots: DateCalendarSlot[];
  otherProgramSlotIds: Set<string>;
  minWeekStart: Date;
  maxWeekStart: Date;
  onEdit: (programId: string) => void;
  onDelete: (programId: string) => void;
}

export function ProgramCard({
  program,
  allSlots,
  otherProgramSlotIds,
  minWeekStart,
  maxWeekStart,
  onEdit,
  onDelete,
}: ProgramCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const selectedSet = new Set(program.slotIds);

  const resolvedSlots = allSlots.map((slot) => {
    if (selectedSet.has(slot.id)) {
      return { ...slot, isSelected: true, color: 'primary' as const };
    }
    if (otherProgramSlotIds.has(slot.id)) {
      return { ...slot, isDisabled: true, color: 'green' as const };
    }
    return { ...slot, isDisabled: true };
  });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="p-0">
        <CollapsibleTrigger asChild>
          <CardHeader className="p-0">
            <div className="flex items-center gap-3 px-4 py-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
              </Button>

              <div className="flex-1">
                <p className="font-semibold">{program.title}</p>
                <p className="text-sm text-muted-foreground">
                  {program.slotIds.length} {program.slotIds.length === 1 ? 'slot seleccionado' : 'slots seleccionados'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(program.id)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(program.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <DateWeekCalendar
              slots={resolvedSlots}
              weekStart={weekStart}
              onWeekChange={setWeekStart}
              minWeekStart={minWeekStart}
              maxWeekStart={maxWeekStart}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
