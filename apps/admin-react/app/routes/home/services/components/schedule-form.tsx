import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info } from 'lucide-react';

import { Button } from '@front/cn/components/button';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@front/cn/components/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@front/cn/components/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@front/cn/components/tooltip';
import { DAYS_OF_WEEK, DAY_OF_WEEK_LABELS, type DayOfWeek } from '@models/common';
import { DaySelector } from './day-selector';
import { type ScheduleFormData } from '../services-create.utils';

const singleSchema = z.object({
  scheduleType: z.literal('single'),
  singleDay: z.string().min(1, 'Selecciona un dia'),
  startTime: z.string().min(1, 'Hora requerida'),
  duration: z.number().min(1, 'Minimo 1 minuto'),
  capacity: z.number().min(1, 'Minimo 1 persona'),
  minReserveMinutes: z.number().min(0, 'Minimo 0'),
  minCancelMinutes: z.number().min(0, 'Minimo 0'),
});

const multipleSchema = z
  .object({
    scheduleType: z.literal('multiple'),
    multipleDays: z.array(z.string()).min(1, 'Selecciona al menos un dia'),
    startTime: z.string().min(1, 'Hora de inicio requerida'),
    endTime: z.string().min(1, 'Hora de fin requerida'),
    duration: z.number().min(1, 'Minimo 1 minuto'),
    capacity: z.number().min(1, 'Minimo 1 persona'),
    minReserveMinutes: z.number().min(0, 'Minimo 0'),
    minCancelMinutes: z.number().min(0, 'Minimo 0'),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return data.startTime < data.endTime;
    },
    { message: 'La hora de inicio debe ser menor a la hora de fin', path: ['startTime'] }
  );

type SingleFormValues = z.infer<typeof singleSchema>;
type MultipleFormValues = z.infer<typeof multipleSchema>;

interface ScheduleFormProps {
  onSubmit: (data: ScheduleFormData) => void;
}

const RESERVE_TOOLTIP =
  'Los usuarios solo podran reservar si faltan al menos estos minutos para que inicie la clase. Por ejemplo, si se coloca 10, las reservas se cierran 10 minutos antes de que comience la clase.';
const CANCEL_TOOLTIP =
  'Los usuarios solo podran cancelar si faltan al menos estos minutos para que inicie la clase. Por ejemplo, si se coloca 10, las cancelaciones se cierran 10 minutos antes de que comience la clase.';

export function ScheduleForm({ onSubmit }: ScheduleFormProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'multiple'>('single');

  const singleForm = useForm<SingleFormValues>({
    resolver: zodResolver(singleSchema),
    defaultValues: {
      scheduleType: 'single',
      singleDay: '',
      startTime: '',
      duration: NaN,
      capacity: NaN,
      minReserveMinutes: NaN,
      minCancelMinutes: NaN,
    },
  });

  const multipleForm = useForm<MultipleFormValues>({
    resolver: zodResolver(multipleSchema),
    defaultValues: {
      scheduleType: 'multiple',
      multipleDays: [],
      startTime: '',
      endTime: '',
      duration: NaN,
      capacity: NaN,
      minReserveMinutes: NaN,
      minCancelMinutes: NaN,
    },
  });

  function handleSingleSubmit(values: SingleFormValues) {
    onSubmit({
      scheduleType: 'single',
      days: [values.singleDay as DayOfWeek],
      startTime: values.startTime,
      duration: values.duration,
      capacity: values.capacity,
      minReserveMinutes: values.minReserveMinutes,
      minCancelMinutes: values.minCancelMinutes,
    });
    singleForm.reset({
      scheduleType: 'single',
      singleDay: '',
      startTime: '',
      duration: NaN,
      capacity: NaN,
      minReserveMinutes: NaN,
      minCancelMinutes: NaN,
    });
  }

  function handleMultipleSubmit(values: MultipleFormValues) {
    onSubmit({
      scheduleType: 'multiple',
      days: values.multipleDays as DayOfWeek[],
      startTime: values.startTime,
      endTime: values.endTime,
      duration: values.duration,
      capacity: values.capacity,
      minReserveMinutes: values.minReserveMinutes,
      minCancelMinutes: values.minCancelMinutes,
    });
    multipleForm.reset({
      scheduleType: 'multiple',
      multipleDays: [],
      startTime: '',
      endTime: '',
      duration: NaN,
      capacity: NaN,
      minReserveMinutes: NaN,
      minCancelMinutes: NaN,
    });
  }

  return (
    <TooltipProvider>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'single' | 'multiple')}>
        <div className="flex justify-center mb-4">
          <TabsList>
            <TabsTrigger value="single">Horario unico</TabsTrigger>
            <TabsTrigger value="multiple">Rangos de horarios</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="single">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Dia de la semana</Label>
                <Controller
                  name="singleDay"
                  control={singleForm.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        aria-invalid={!!singleForm.formState.errors.singleDay}
                        className="w-full"
                      >
                        <SelectValue placeholder="Seleccione una opcion" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>
                            {DAY_OF_WEEK_LABELS[day]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {singleForm.formState.errors.singleDay && (
                  <p className="text-sm text-destructive">
                    {singleForm.formState.errors.singleDay.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Hora primera clase</Label>
                <Input
                  type="time"
                  aria-invalid={!!singleForm.formState.errors.startTime}
                  {...singleForm.register('startTime')}
                />
                {singleForm.formState.errors.startTime && (
                  <p className="text-sm text-destructive">
                    {singleForm.formState.errors.startTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Duracion del servicio (minutos)</Label>
                <Input
                  type="number"
                  min={1}
                  aria-invalid={!!singleForm.formState.errors.duration}
                  {...singleForm.register('duration', { valueAsNumber: true })}
                />
                {singleForm.formState.errors.duration && (
                  <p className="text-sm text-destructive">
                    {singleForm.formState.errors.duration.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Capacidad</Label>
                <Input
                  type="number"
                  min={1}
                  aria-invalid={!!singleForm.formState.errors.capacity}
                  {...singleForm.register('capacity', { valueAsNumber: true })}
                />
                {singleForm.formState.errors.capacity && (
                  <p className="text-sm text-destructive">
                    {singleForm.formState.errors.capacity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label>Tiempo minimo para reservar (minutos)</Label>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">{RESERVE_TOOLTIP}</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  min={0}
                  aria-invalid={!!singleForm.formState.errors.minReserveMinutes}
                  {...singleForm.register('minReserveMinutes', { valueAsNumber: true })}
                />
                {singleForm.formState.errors.minReserveMinutes && (
                  <p className="text-sm text-destructive">
                    {singleForm.formState.errors.minReserveMinutes.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label>Tiempo minimo para cancelacion (minutos)</Label>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">{CANCEL_TOOLTIP}</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  min={0}
                  aria-invalid={!!singleForm.formState.errors.minCancelMinutes}
                  {...singleForm.register('minCancelMinutes', { valueAsNumber: true })}
                />
                {singleForm.formState.errors.minCancelMinutes && (
                  <p className="text-sm text-destructive">
                    {singleForm.formState.errors.minCancelMinutes.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={singleForm.handleSubmit(handleSingleSubmit)}
              >
                Crear horarios
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="multiple">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dias de la semana</Label>
              <Controller
                name="multipleDays"
                control={multipleForm.control}
                render={({ field }) => (
                  <DaySelector
                    selected={field.value as DayOfWeek[]}
                    onChange={(days) => field.onChange(days)}
                  />
                )}
              />
              {multipleForm.formState.errors.multipleDays && (
                <p className="text-sm text-destructive">
                  {multipleForm.formState.errors.multipleDays.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Hora primera clase</Label>
                <Input
                  type="time"
                  aria-invalid={!!multipleForm.formState.errors.startTime}
                  {...multipleForm.register('startTime')}
                />
                {multipleForm.formState.errors.startTime && (
                  <p className="text-sm text-destructive">
                    {multipleForm.formState.errors.startTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Hora ultima clase</Label>
                <Input
                  type="time"
                  aria-invalid={!!multipleForm.formState.errors.endTime}
                  {...multipleForm.register('endTime')}
                />
                {multipleForm.formState.errors.endTime && (
                  <p className="text-sm text-destructive">
                    {multipleForm.formState.errors.endTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Duracion del servicio (minutos)</Label>
                <Input
                  type="number"
                  min={1}
                  aria-invalid={!!multipleForm.formState.errors.duration}
                  {...multipleForm.register('duration', { valueAsNumber: true })}
                />
                {multipleForm.formState.errors.duration && (
                  <p className="text-sm text-destructive">
                    {multipleForm.formState.errors.duration.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Capacidad</Label>
                <Input
                  type="number"
                  min={1}
                  aria-invalid={!!multipleForm.formState.errors.capacity}
                  {...multipleForm.register('capacity', { valueAsNumber: true })}
                />
                {multipleForm.formState.errors.capacity && (
                  <p className="text-sm text-destructive">
                    {multipleForm.formState.errors.capacity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label>Tiempo minimo para reservar (minutos)</Label>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">{RESERVE_TOOLTIP}</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  min={0}
                  aria-invalid={!!multipleForm.formState.errors.minReserveMinutes}
                  {...multipleForm.register('minReserveMinutes', { valueAsNumber: true })}
                />
                {multipleForm.formState.errors.minReserveMinutes && (
                  <p className="text-sm text-destructive">
                    {multipleForm.formState.errors.minReserveMinutes.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label>Tiempo minimo para cancelacion (minutos)</Label>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">{CANCEL_TOOLTIP}</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  min={0}
                  aria-invalid={!!multipleForm.formState.errors.minCancelMinutes}
                  {...multipleForm.register('minCancelMinutes', { valueAsNumber: true })}
                />
                {multipleForm.formState.errors.minCancelMinutes && (
                  <p className="text-sm text-destructive">
                    {multipleForm.formState.errors.minCancelMinutes.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={multipleForm.handleSubmit(handleMultipleSubmit)}
              >
                Crear horarios
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}
