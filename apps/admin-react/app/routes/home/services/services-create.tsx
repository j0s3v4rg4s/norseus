import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, AlertCircle, Trash2, X } from 'lucide-react';
import { sileo } from 'sileo';

import { Alert, AlertAction, AlertDescription } from '@front/cn/components/alert';
import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@front/cn/components/card';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import { Textarea } from '@front/cn/components/textarea';
import { createServiceWithSchedules } from '@front/services';
import { type ServiceSchedule } from '@models/services';
import { db } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { ScheduleForm, WeekCalendar } from './components';
import {
  type ScheduleFormData,
  createSingleSchedule,
  createMultipleSchedules,
  checkScheduleConflicts,
  schedulesToCalendarSlots,
} from './services-create.utils';

const serviceSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Maximo 100 caracteres'),
  description: z.string().max(500, 'Maximo 500 caracteres').optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function ServicesCreatePage() {
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: '', description: '' },
  });

  function handleScheduleFormSubmit(data: ScheduleFormData) {
    setConflictError(null);

    let newSchedules: ServiceSchedule[] = [];

    if (data.scheduleType === 'single') {
      const schedule = createSingleSchedule({
        day: data.days[0],
        startTime: data.startTime,
        duration: data.duration,
        capacity: data.capacity,
        minReserveMinutes: data.minReserveMinutes,
        minCancelMinutes: data.minCancelMinutes,
      });
      if (schedule) newSchedules = [schedule];
    } else {
      if (!data.endTime) return;
      newSchedules = createMultipleSchedules({
        days: data.days,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        capacity: data.capacity,
        minReserveMinutes: data.minReserveMinutes,
        minCancelMinutes: data.minCancelMinutes,
      });
    }

    if (newSchedules.length === 0) {
      setConflictError('No se pudieron crear horarios. Verifique los datos ingresados.');
      return;
    }

    const conflict = checkScheduleConflicts(schedules, newSchedules);
    if (conflict) {
      setConflictError(conflict);
      return;
    }

    setSchedules((prev) => [...prev, ...newSchedules]);
  }

  function handleRemoveSchedule(scheduleId: string) {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    setConflictError(null);
  }

  function handleClearSchedules() {
    setSchedules([]);
    setConflictError(null);
  }

  async function onSubmit(data: ServiceFormValues) {
    if (!selectedFacility?.id) return;

    if (schedules.length === 0) {
      setConflictError('Debes crear al menos un horario antes de guardar.');
      return;
    }

    setIsSaving(true);
    try {
      await createServiceWithSchedules(
        db,
        selectedFacility.id,
        { name: data.name, description: data.description },
        schedules.map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }) => rest)
      );
      sileo.success({ title: 'Servicio creado correctamente', duration: 3000 });
      navigate('/home/services');
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Error al crear el servicio';
      sileo.error({ title: message, duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  }

  const calendarSlots = schedulesToCalendarSlots(schedules);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => navigate('/home/services')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear nuevo servicio</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informacion del servicio</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del servicio</Label>
              <Input
                id="name"
                placeholder="Ej. Yoga, Pilates, Spinning..."
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Descripcion <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente el servicio..."
                className="resize-none"
                rows={3}
                aria-invalid={!!errors.description}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horarios del servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScheduleForm onSubmit={handleScheduleFormSubmit} />

            {conflictError && (
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-50"
              >
                <AlertCircle className="size-4 shrink-0" />
                <AlertDescription className="text-inherit pr-8">
                  {conflictError}
                </AlertDescription>
                <AlertAction>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-red-900 hover:bg-red-100 hover:text-red-900 dark:text-red-50 dark:hover:bg-red-900/50 dark:hover:text-red-50"
                    onClick={() => setConflictError(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertAction>
              </Alert>
            )}
          </CardContent>
        </Card>

        {calendarSlots.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Vista previa de horarios
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    ({schedules.length} {schedules.length === 1 ? 'horario' : 'horarios'})
                  </span>
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-destructive hover:text-destructive"
                  onClick={handleClearSchedules}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Limpiar todos
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Haz clic en un bloque para eliminarlo.
              </p>
            </CardHeader>
            <CardContent>
              <WeekCalendar slots={calendarSlots} onSlotClick={handleRemoveSchedule} />
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/home/services')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
