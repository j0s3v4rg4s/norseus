import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Timestamp } from 'firebase/firestore';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Button } from '@front/cn/components/button';
import { cn } from '@front/cn/utils';
import {
  generateDateSlots,
  getWeekStart,
  type DateCalendarSlot,
} from '@front/ui-react';
import { getSchedules, createMultipleClasses } from '@front/services';
import { getEmployees } from '@front/employees';
import type { ServiceSchedule } from '@models/services';
import type { ProgramDraft, ClassModel, ProgramType } from '@models/classes';
import type { EmployeeModel } from '@models/facility';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { db } from '../../../../firebase';
import { useSessionStore } from '../../../../stores/session.store';
import { PermissionGuard } from '../../../../components/permission-guard';
import { ProgramsStep, DescriptionsStep, CoachesStep } from './components';

const STEP_LABELS = ['Crear programas', 'Descripción de programas', 'Asignar coaches'];

export default function SchedulesCreatePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);

  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [employees, setEmployees] = useState<EmployeeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<ProgramDraft[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const minWeekStart = useMemo(() => getWeekStart(new Date()), []);
  const maxWeekStart = useMemo(() => {
    const next = new Date(minWeekStart);
    next.setDate(next.getDate() + 7);
    return next;
  }, [minWeekStart]);

  useEffect(() => {
    if (!selectedFacility?.id || !serviceId) return;

    setLoading(true);
    Promise.all([
      getSchedules(db, selectedFacility.id, serviceId),
      getEmployees(db, selectedFacility.id),
    ])
      .then(([fetchedSchedules, fetchedEmployees]) => {
        setSchedules(fetchedSchedules);
        setEmployees(fetchedEmployees);
      })
      .finally(() => setLoading(false));
  }, [selectedFacility?.id, serviceId]);

  const allDateSlots = useMemo((): DateCalendarSlot[] => {
    if (schedules.length === 0) return [];
    const currentWeekSlots = generateDateSlots(schedules, minWeekStart);
    const nextWeekSlots = generateDateSlots(schedules, maxWeekStart);
    return [...currentWeekSlots, ...nextWeekSlots];
  }, [schedules, minWeekStart, maxWeekStart]);

  const confirmedPrograms = programs.filter((p) => p.isConfirmed);

  function handleDescriptionChange(programId: string, description: string) {
    setPrograms((prev) =>
      prev.map((p) => (p.id === programId ? { ...p, description } : p))
    );
  }

  const schedulesMap = useMemo(
    () => Object.fromEntries(schedules.map((s) => [s.id, s])),
    [schedules]
  );

  const dateSlotsMap = useMemo(
    () => Object.fromEntries(allDateSlots.map((s) => [s.id, s])),
    [allDateSlots]
  );

  async function handleSave() {
    if (!selectedFacility?.id || !serviceId) return;

    const classes: Omit<ClassModel, 'id'>[] = [];

    for (const program of confirmedPrograms) {
      for (const slotId of program.slotIds) {
        const slot = dateSlotsMap[slotId];
        if (!slot) continue;

        const schedule = schedulesMap[slot.scheduleId];
        const slotDate = new Date(slot.date);
        const [hours, minutes] = slot.startTime.split(':').map(Number);
        slotDate.setHours(hours, minutes, 0, 0);

        classes.push({
          serviceId,
          facilityId: selectedFacility.id,
          scheduleId: schedule?.id ?? '',
          date: Timestamp.fromDate(slotDate),
          capacity: schedule?.capacity ?? 0,
          startAt: slot.startTime,
          duration: slot.durationMinutes,
          instructorId: program.coachAssignments[slotId] || null,
          userBookings: [],
          program: program.description?.trim()
            ? { type: 'rich_text' as ProgramType, value: program.description }
            : null,
          programTitle: program.title,
        });
      }
    }

    if (classes.length === 0) return;

    setSaving(true);
    try {
      await createMultipleClasses(db, selectedFacility.id, classes);
      navigate(`/home/services/${serviceId}`);
    } catch (error) {
      console.error('Error al guardar las clases:', error);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PermissionGuard section={PermissionSection.PROGRAMMING} action={PermissionAction.CREATE}>
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/home/services/${serviceId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Programar clases</h1>
      </div>

      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-8 bg-border" />}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                  i + 1 === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : i + 1 < currentStep
                    ? 'bg-primary/30 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  'text-sm',
                  i + 1 === currentStep ? 'font-medium' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {currentStep === 1 && (
        <ProgramsStep
          programs={programs}
          allDateSlots={allDateSlots}
          minWeekStart={minWeekStart}
          maxWeekStart={maxWeekStart}
          onProgramsChange={setPrograms}
        />
      )}

      {currentStep === 2 && (
        <DescriptionsStep
          programs={confirmedPrograms}
          onDescriptionChange={handleDescriptionChange}
        />
      )}

      {currentStep === 3 && (
        <CoachesStep
          programs={confirmedPrograms}
          employees={employees}
          allDateSlots={allDateSlots}
          onProgramsChange={setPrograms}
        />
      )}

      <div className="flex items-center justify-between border-t pt-4">
        {currentStep === 1 ? (
          <Button
            variant="outline"
            onClick={() => navigate(`/home/services/${serviceId}`)}
          >
            Cancelar
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)}>
            Atrás
          </Button>
        )}

        {currentStep < 3 ? (
          <Button
            disabled={confirmedPrograms.length === 0}
            onClick={() => setCurrentStep((s) => s + 1)}
          >
            Continuar
          </Button>
        ) : (
          <Button
            disabled={confirmedPrograms.length === 0 || saving}
            onClick={handleSave}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        )}
      </div>
    </div>
    </PermissionGuard>
  );
}
