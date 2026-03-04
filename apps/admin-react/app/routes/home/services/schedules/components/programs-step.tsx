import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { sileo } from 'sileo';

import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@front/cn/components/card';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import {
  DateWeekCalendar,
  getWeekStart,
  isSlotInPast,
  type DateCalendarSlot,
} from '@front/ui-react';
import type { ServiceSchedule } from '@models/services';
import type { ProgramDraft } from '@models/classes';
import { ProgramCard } from '../../components';

function generateProgramId(): string {
  return `prog_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

interface ProgramsStepProps {
  programs: ProgramDraft[];
  allDateSlots: DateCalendarSlot[];
  minWeekStart: Date;
  maxWeekStart: Date;
  onProgramsChange: (programs: ProgramDraft[]) => void;
}

export function ProgramsStep({
  programs,
  allDateSlots,
  minWeekStart,
  maxWeekStart,
  onProgramsChange,
}: ProgramsStepProps) {
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  const [programSnapshot, setProgramSnapshot] = useState<ProgramDraft | null>(null);
  const [programTitle, setProgramTitle] = useState('');
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const confirmedPrograms = programs.filter((p) => p.isConfirmed);
  const activeProgram = programs.find((p) => p.id === activeProgramId) ?? null;

  const confirmedSlotIds = useMemo(() => {
    const ids = new Set<string>();
    for (const p of confirmedPrograms) {
      for (const sid of p.slotIds) ids.add(sid);
    }
    return ids;
  }, [confirmedPrograms]);

  const activeProgramSlots = useMemo((): DateCalendarSlot[] => {
    if (!activeProgram) return [];

    const activeSelectedSet = new Set(activeProgram.slotIds);

    return allDateSlots.map((slot) => {
      const past = isSlotInPast(slot);

      if (past) return { ...slot, isDisabled: true };
      if (confirmedSlotIds.has(slot.id)) return { ...slot, isDisabled: true, color: 'green' as const };
      if (activeSelectedSet.has(slot.id)) return { ...slot, isSelected: true, color: 'primary' as const };
      return { ...slot, color: 'blue' as const };
    });
  }, [allDateSlots, activeProgram, confirmedSlotIds]);

  const visibleSlots = useMemo(
    () => activeProgramSlots.filter((s) => {
      const slotWeekStart = getWeekStart(s.date);
      return slotWeekStart.getTime() === weekStart.getTime();
    }),
    [activeProgramSlots, weekStart]
  );

  function getOtherProgramSlotIds(excludeProgramId: string): Set<string> {
    const ids = new Set<string>();
    for (const p of programs) {
      if (p.id === excludeProgramId || !p.isConfirmed) continue;
      for (const sid of p.slotIds) ids.add(sid);
    }
    return ids;
  }

  function handleCreateProgram() {
    const newProgram: ProgramDraft = {
      id: generateProgramId(),
      title: '',
      slotIds: [],
      description: '',
      isConfirmed: false,
      coachAssignments: {},
    };
    onProgramsChange([...programs, newProgram]);
    setActiveProgramId(newProgram.id);
    setProgramSnapshot(null);
    setProgramTitle('');
    setWeekStart(getWeekStart(new Date()));
  }

  function handleSlotClick(slotId: string) {
    if (!activeProgramId) return;
    const updated = programs.map((p) => {
      if (p.id !== activeProgramId) return p;
      const slotIds = p.slotIds.includes(slotId)
        ? p.slotIds.filter((id) => id !== slotId)
        : [...p.slotIds, slotId];
      return { ...p, slotIds };
    });
    onProgramsChange(updated);
  }

  function handleConfirmProgram() {
    if (!activeProgram) return;

    if (programTitle.trim() === '') {
      sileo.error({ title: 'El nombre del programa es requerido', duration: 3000 });
      return;
    }
    if (activeProgram.slotIds.length === 0) {
      sileo.error({ title: 'Selecciona al menos un slot', duration: 3000 });
      return;
    }

    onProgramsChange(
      programs.map((p) =>
        p.id === activeProgramId
          ? { ...p, title: programTitle.trim(), isConfirmed: true }
          : p
      )
    );
    setActiveProgramId(null);
    setProgramTitle('');
  }

  function handleCancelProgram() {
    if (!activeProgram) return;

    if (programSnapshot) {
      onProgramsChange(
        programs.map((p) =>
          p.id === activeProgramId ? { ...programSnapshot, isConfirmed: true } : p
        )
      );
      setProgramSnapshot(null);
    } else {
      onProgramsChange(programs.filter((p) => p.id !== activeProgramId));
    }

    setActiveProgramId(null);
    setProgramTitle('');
  }

  function handleEditProgram(programId: string) {
    const program = programs.find((p) => p.id === programId);
    if (!program) return;

    setProgramSnapshot({ ...program });
    onProgramsChange(
      programs.map((p) => (p.id === programId ? { ...p, isConfirmed: false } : p))
    );
    setActiveProgramId(programId);
    setProgramTitle(program.title);
    setWeekStart(getWeekStart(new Date()));
  }

  function handleDeleteProgram(programId: string) {
    onProgramsChange(programs.filter((p) => p.id !== programId));
    if (activeProgramId === programId) {
      setActiveProgramId(null);
      setProgramTitle('');
    }
  }

  return (
    <div className="space-y-4">
      {confirmedPrograms.length > 0 && (
        <div className="space-y-3">
          {confirmedPrograms.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              allSlots={allDateSlots}
              otherProgramSlotIds={getOtherProgramSlotIds(program.id)}
              minWeekStart={minWeekStart}
              maxWeekStart={maxWeekStart}
              onEdit={handleEditProgram}
              onDelete={handleDeleteProgram}
            />
          ))}
        </div>
      )}

      {activeProgram && (
        <Card>
          <CardHeader>
            <CardTitle>
              {confirmedPrograms.some((p) => p.id === activeProgramId)
                ? 'Editar programa'
                : 'Nuevo programa'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="programTitle">Nombre del programa</Label>
              <Input
                id="programTitle"
                placeholder="Ej: Fuerza, Agilidad, Cardio..."
                value={programTitle}
                onChange={(e) => setProgramTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Selecciona los slots para este programa</Label>
              <DateWeekCalendar
                slots={visibleSlots}
                weekStart={weekStart}
                onWeekChange={setWeekStart}
                onSlotClick={handleSlotClick}
                minWeekStart={minWeekStart}
                maxWeekStart={maxWeekStart}
              />
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm bg-blue-500/80" />
                  Disponible
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-primary inline-block h-3 w-3 rounded-sm" />
                  Seleccionado para este programa
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm bg-green-500/80" />
                  Asignado a otro programa
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm bg-muted opacity-50" />
                  No disponible
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {activeProgram.slotIds.length}{' '}
                {activeProgram.slotIds.length === 1 ? 'slot seleccionado' : 'slots seleccionados'}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancelProgram}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmProgram}
                  disabled={programTitle.trim() === '' || activeProgram.slotIds.length === 0}
                >
                  Confirmar programa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!activeProgram && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleCreateProgram}
        >
          <Plus className="h-4 w-4" />
          Crear nuevo programa
        </Button>
      )}
    </div>
  );
}
