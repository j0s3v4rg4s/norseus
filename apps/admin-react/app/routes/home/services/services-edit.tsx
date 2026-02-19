import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, AlertCircle, Trash2, X } from 'lucide-react';
import { sileo } from 'sileo';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@front/cn/components/alert-dialog';
import { Alert, AlertAction, AlertDescription } from '@front/cn/components/alert';
import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@front/cn/components/card';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import { Switch } from '@front/cn/components/switch';
import { Textarea } from '@front/cn/components/textarea';
import { WeekCalendar, type ScheduleFormData, schedulesToCalendarSlots } from '@front/ui-react';
import {
  getService,
  updateService,
  deleteService,
  getSchedules,
  createSchedules,
  deleteSchedule,
} from '@front/services';
import type { ServiceSchedule } from '@models/services';
import { db } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { ScheduleForm, ServiceFormSkeleton } from './components';
import {
  createSingleSchedule,
  createMultipleSchedules,
  checkScheduleConflicts,
} from './services-create.utils';

const serviceEditSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Maximo 100 caracteres'),
  description: z.string().max(500, 'Maximo 500 caracteres').optional(),
  isActive: z.boolean(),
});

type ServiceEditFormValues = z.infer<typeof serviceEditSchema>;

export default function ServicesEditPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [existingSchedules, setExistingSchedules] = useState<ServiceSchedule[]>([]);
  const [newSchedules, setNewSchedules] = useState<ServiceSchedule[]>([]);
  const [schedulesToDeleteIds, setSchedulesToDeleteIds] = useState<string[]>([]);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ServiceEditFormValues>({
    resolver: zodResolver(serviceEditSchema),
    defaultValues: { name: '', description: '', isActive: true },
  });

  useEffect(() => {
    if (!selectedFacility?.id || !serviceId) return;

    setLoading(true);
    Promise.all([
      getService(db, selectedFacility.id, serviceId),
      getSchedules(db, selectedFacility.id, serviceId),
    ])
      .then(([service, schedules]) => {
        if (!service) {
          setNotFound(true);
          return;
        }
        reset({
          name: service.name,
          description: service.description ?? '',
          isActive: service.isActive,
        });
        setExistingSchedules(schedules);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [selectedFacility?.id, serviceId, reset]);

  function handleScheduleFormSubmit(data: ScheduleFormData) {
    setConflictError(null);

    let incoming: ServiceSchedule[] = [];

    if (data.scheduleType === 'single') {
      const schedule = createSingleSchedule({
        day: data.days[0],
        startTime: data.startTime,
        duration: data.duration,
        capacity: data.capacity,
        minReserveMinutes: data.minReserveMinutes,
        minCancelMinutes: data.minCancelMinutes,
      });
      if (schedule) incoming = [schedule];
    } else {
      if (!data.endTime) return;
      incoming = createMultipleSchedules({
        days: data.days,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        capacity: data.capacity,
        minReserveMinutes: data.minReserveMinutes,
        minCancelMinutes: data.minCancelMinutes,
      });
    }

    if (incoming.length === 0) {
      setConflictError('No se pudieron crear horarios. Verifique los datos ingresados.');
      return;
    }

    const allCurrent = [...existingSchedules, ...newSchedules];
    const conflict = checkScheduleConflicts(allCurrent, incoming);
    if (conflict) {
      setConflictError(conflict);
      return;
    }

    setNewSchedules((prev) => [...prev, ...incoming]);
  }

  function handleRemoveSchedule(scheduleId: string) {
    setConflictError(null);

    const isExisting = existingSchedules.some((s) => s.id === scheduleId);
    if (isExisting) {
      setExistingSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      setSchedulesToDeleteIds((prev) => [...prev, scheduleId]);
    } else {
      setNewSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    }
  }

  function handleClearSchedules() {
    setSchedulesToDeleteIds((prev) => [
      ...prev,
      ...existingSchedules.map((s) => s.id),
    ]);
    setExistingSchedules([]);
    setNewSchedules([]);
    setConflictError(null);
  }

  async function onSubmit(data: ServiceEditFormValues) {
    if (!selectedFacility?.id || !serviceId) return;

    setIsSaving(true);
    try {
      await Promise.all([
        updateService(db, selectedFacility.id, serviceId, {
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        }),
        ...schedulesToDeleteIds.map((id) =>
          deleteSchedule(db, selectedFacility.id!, serviceId, id)
        ),
        ...(newSchedules.length > 0
          ? [
              createSchedules(
                db,
                selectedFacility.id,
                serviceId,
                newSchedules.map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }) => rest)
              ),
            ]
          : []),
      ]);
      sileo.success({ title: 'Servicio actualizado correctamente', duration: 3000 });
      navigate('/home/services');
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Error al actualizar el servicio';
      sileo.error({ title: message, duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedFacility?.id || !serviceId) return;

    setIsDeleting(true);
    try {
      await deleteService(db, selectedFacility.id, serviceId);
      sileo.success({ title: 'Servicio eliminado correctamente', duration: 3000 });
      navigate('/home/services');
    } catch {
      sileo.error({ title: 'Error al eliminar el servicio', duration: 3000 });
    } finally {
      setIsDeleting(false);
    }
  }

  const allSchedules = [...existingSchedules, ...newSchedules];
  const calendarSlots = schedulesToCalendarSlots(allSchedules);

  if (loading) return <ServiceFormSkeleton />;

  if (notFound) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home/services')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Servicio no encontrado
          </h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            El servicio solicitado no existe o fue eliminado.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => navigate(serviceId ? `/home/services/${serviceId}` : '/home/services')}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Editar servicio</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar servicio</AlertDialogTitle>
              <AlertDialogDescription>
                Esta accion no se puede deshacer. Se eliminara el servicio y
                todos sus horarios permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informacion del servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  Descripcion{' '}
                  <span className="text-muted-foreground">(opcional)</span>
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
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Estado del servicio</Label>
                <p className="text-sm text-muted-foreground">
                  Activa o desactiva el servicio para los usuarios.
                </p>
              </div>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
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
                <AlertDescription className="pr-8 text-inherit">
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
                    ({allSchedules.length}{' '}
                    {allSchedules.length === 1 ? 'horario' : 'horarios'})
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
            onClick={() => navigate(serviceId ? `/home/services/${serviceId}` : '/home/services')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
