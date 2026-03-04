import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';

import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardHeader } from '@front/cn/components/card';
import { Badge } from '@front/cn/components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@front/cn/components/select';
import type { DateCalendarSlot } from '@front/ui-react';
import type { EmployeeModel } from '@models/facility';
import type { ProgramDraft } from '@models/classes';
import {
  DayOfWeek,
  DAY_OF_WEEK_LABELS,
  MONTHS_OF_YEAR,
  MONTH_LABELS,
} from '@models/common';

const JS_DAY_TO_DOW: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

function formatDayLabel(date: Date): string {
  const dayLabel = DAY_OF_WEEK_LABELS[JS_DAY_TO_DOW[date.getDay()]];
  const monthLabel = MONTH_LABELS[MONTHS_OF_YEAR[date.getMonth()]];
  return `${dayLabel} ${date.getDate()} de ${monthLabel}`;
}

interface ProgramSlot {
  slotId: string;
  slot: DateCalendarSlot;
  instructorId: string | null;
}

interface GroupedDay {
  dayKey: string;
  dayLabel: string;
  slots: ProgramSlot[];
}

interface CoachesStepProps {
  programs: ProgramDraft[];
  employees: EmployeeModel[];
  allDateSlots: DateCalendarSlot[];
  onProgramsChange: (programs: ProgramDraft[]) => void;
}

export function CoachesStep({ programs, employees, allDateSlots, onProgramsChange }: CoachesStepProps) {
  const [globalCoachId, setGlobalCoachId] = useState('');
  const [quickSelectPerProgram, setQuickSelectPerProgram] = useState<Record<string, string>>({});

  const slotsMap = useMemo(
    () => allDateSlots.reduce<Record<string, DateCalendarSlot>>((acc, s) => ({ ...acc, [s.id]: s }), {}),
    [allDateSlots]
  );

  function getGroupedDays(program: ProgramDraft): GroupedDay[] {
    const programSlots: ProgramSlot[] = program.slotIds
      .map((slotId) => ({
        slotId,
        slot: slotsMap[slotId],
        instructorId: program.coachAssignments[slotId] ?? null,
      }))
      .filter((ps) => ps.slot != null);

    const grouped = programSlots.reduce<Record<string, GroupedDay>>((acc, ps) => {
      const d = ps.slot.date;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!acc[key]) acc[key] = { dayKey: key, dayLabel: formatDayLabel(d), slots: [] };
      acc[key].slots.push(ps);
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => a.dayKey.localeCompare(b.dayKey))
      .map((group) => ({
        ...group,
        slots: group.slots.sort((a, b) => a.slot.startTime.localeCompare(b.slot.startTime)),
      }));
  }

  function handleAssignAll(coachId: string) {
    if (!coachId) return;
    onProgramsChange(
      programs.map((p) => ({
        ...p,
        coachAssignments: p.slotIds.reduce<Record<string, string>>(
          (acc, sid) => ({ ...acc, [sid]: coachId }),
          {}
        ),
      }))
    );
  }

  function handleAssignToProgram(programId: string, coachId: string) {
    if (!coachId) return;
    onProgramsChange(
      programs.map((p) =>
        p.id !== programId
          ? p
          : {
              ...p,
              coachAssignments: p.slotIds.reduce<Record<string, string>>(
                (acc, sid) => ({ ...acc, [sid]: coachId }),
                {}
              ),
            }
      )
    );
  }

  function handleClearProgram(programId: string) {
    onProgramsChange(
      programs.map((p) => (p.id !== programId ? p : { ...p, coachAssignments: {} }))
    );
    setQuickSelectPerProgram((prev) => ({ ...prev, [programId]: '' }));
  }

  function handleSlotAssign(programId: string, slotId: string, coachId: string) {
    onProgramsChange(
      programs.map((p) => {
        if (p.id !== programId) return p;
        const updated = { ...p.coachAssignments };
        if (coachId) updated[slotId] = coachId;
        else delete updated[slotId];
        return { ...p, coachAssignments: updated };
      })
    );
  }

  const assignedCount = programs.reduce(
    (total, p) => total + Object.keys(p.coachAssignments).length,
    0
  );
  const totalSlots = programs.reduce((total, p) => total + p.slotIds.length, 0);

  return (
    <div className="space-y-4">
      {/* Asignación global */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex shrink-0 items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-muted-foreground" />
              Asignar a todos los programas
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Select value={globalCoachId} onValueChange={setGlobalCoachId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar coach" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.uid} value={e.uid}>
                      {e.profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button disabled={!globalCoachId} onClick={() => handleAssignAll(globalCoachId)}>
                Asignar a todos
              </Button>
            </div>
          </div>
          {totalSlots > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {assignedCount} de {totalSlots} slots con coach asignado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card por programa */}
      {programs.map((program) => {
        const groupedDays = getGroupedDays(program);
        const programAssigned = Object.keys(program.coachAssignments).length;
        const quickCoachId = quickSelectPerProgram[program.id] ?? '';

        return (
          <Card key={program.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{program.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {program.slotIds.length}{' '}
                    {program.slotIds.length === 1 ? 'clase programada' : 'clases programadas'}
                  </p>
                </div>
                {programAssigned === program.slotIds.length && program.slotIds.length > 0 && (
                  <Badge variant="secondary" className="bg-emerald-200 text-emerald-800 dark:bg-emerald-300 dark:text-emerald-900">Completo</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Opciones rápidas */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Opciones Rápidas</p>
                <div className="flex items-center gap-2">
                  <Select
                    value={quickCoachId}
                    onValueChange={(v) =>
                      setQuickSelectPerProgram((prev) => ({ ...prev, [program.id]: v }))
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar coach para todas las clases" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.uid} value={e.uid}>
                          {e.profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={!quickCoachId}
                    onClick={() => handleAssignToProgram(program.id, quickCoachId)}
                  >
                    Asignar a todas
                  </Button>
                  <Button variant="outline" onClick={() => handleClearProgram(program.id)}>
                    Limpiar
                  </Button>
                </div>
              </div>

              {/* Clases por día */}
              {groupedDays.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium">Clases por día</p>
                  {groupedDays.map((group) => (
                    <div key={group.dayKey} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{group.dayLabel}</p>
                        <Badge variant="outline">
                          {group.slots.length}{' '}
                          {group.slots.length === 1 ? 'clase' : 'clases'}
                        </Badge>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {group.slots.map((ps) => (
                          <div
                            key={ps.slotId}
                            className="flex items-center justify-between gap-3 rounded-lg border p-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{ps.slot.displayLabel}</p>
                              <p className="text-xs text-muted-foreground">
                                {ps.slot.displaySubLabel}
                              </p>
                            </div>
                            <Select
                              value={ps.instructorId ?? undefined}
                              onValueChange={(v) => handleSlotAssign(program.id, ps.slotId, v)}
                            >
                              <SelectTrigger className="w-44 shrink-0">
                                <SelectValue placeholder="Seleccionar coach" />
                              </SelectTrigger>
                              <SelectContent>
                                {employees.map((e) => (
                                  <SelectItem key={e.uid} value={e.uid}>
                                    {e.profile.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
