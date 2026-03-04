import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { type Resolver, useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { sileo } from 'sileo';

import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@front/cn/components/card';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import { Switch } from '@front/cn/components/switch';
import { Textarea } from '@front/cn/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@front/cn/components/select';
import { getPlan, updatePlan, getServices } from '@front/services';
import { PlanDuration, PlanDurationNames, ClassLimitType } from '@models/plans';
import type { Plan } from '@models/plans';
import type { Service } from '@models/services';
import { db } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { PlanServiceForm } from './components';

interface PlanEditFormValues {
  name: string;
  description: string;
  cost: number;
  duration: {
    type: PlanDuration;
    days: number | null;
  };
  services: {
    serviceId: string;
    classLimitType: ClassLimitType;
    classLimit: number | null;
  }[];
  active: boolean;
}

const planEditSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Maximo 100 caracteres'),
  description: z.string().max(500, 'Maximo 500 caracteres').default(''),
  cost: z.coerce.number().min(0, 'El costo debe ser mayor o igual a 0'),
  duration: z.object({
    type: z.nativeEnum(PlanDuration),
    days: z.coerce.number().nullable(),
  }),
  services: z.array(z.object({
    serviceId: z.string().min(1, 'Servicio requerido'),
    classLimitType: z.nativeEnum(ClassLimitType),
    classLimit: z.coerce.number().nullable(),
  })).min(1, 'Debe incluir al menos un servicio'),
  active: z.boolean(),
});

export default function PlansEditPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const [plan, setPlan] = useState<Plan | undefined>();
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlanEditFormValues>({
    resolver: zodResolver(planEditSchema) as Resolver<PlanEditFormValues>,
    defaultValues: {
      name: '',
      description: '',
      cost: 0,
      duration: { type: PlanDuration.MONTHLY, days: null },
      services: [],
      active: true,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'services' });
  const durationType = watch('duration.type');

  useEffect(() => {
    if (!selectedFacility?.id || !planId) return;

    setLoading(true);
    Promise.all([
      getPlan(db, selectedFacility.id, planId),
      getServices(db, selectedFacility.id),
    ])
      .then(([planResult, servicesResult]) => {
        if (planResult) {
          setPlan(planResult);
          setAvailableServices(servicesResult);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedFacility?.id, planId]);

  useEffect(() => {
    if (!plan) return;
    reset({
      name: plan.name,
      description: plan.description,
      cost: plan.cost,
      duration: plan.duration,
      services: plan.services,
      active: plan.active,
    });
  }, [plan, reset]);

  async function onSubmit(data: PlanEditFormValues) {
    if (!selectedFacility?.id || !planId || !plan) return;

    setIsSaving(true);
    try {
      await updatePlan(db, selectedFacility.id, planId, {
        name: data.name,
        description: data.description ?? '',
        cost: data.cost,
        currency: plan.currency,
        duration: {
          type: data.duration.type,
          days: data.duration.type === PlanDuration.CUSTOM ? data.duration.days : null,
        },
        services: data.services.map((s) => ({
          serviceId: s.serviceId,
          classLimitType: s.classLimitType,
          classLimit: s.classLimitType === ClassLimitType.FIXED ? s.classLimit : null,
        })),
        active: data.active,
      });
      sileo.success({ title: 'Plan actualizado correctamente', duration: 3000 });
      navigate(`/home/plans/${planId}`);
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Error al actualizar el plan';
      sileo.error({ title: message, duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home/plans')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Plan no encontrado</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => navigate(`/home/plans/${planId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar plan</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informacion del plan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del plan</Label>
              <Input
                id="name"
                placeholder="Ej. Plan Basico, Plan Premium..."
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                type="number"
                min={0}
                placeholder="0"
                aria-invalid={!!errors.cost}
                {...register('cost')}
              />
              {errors.cost && (
                <p className="text-sm text-destructive">{errors.cost.message}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">
                Descripcion <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente el plan..."
                className="resize-none"
                rows={3}
                aria-invalid={!!errors.description}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de duracion</Label>
              <Controller
                name="duration.type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PlanDurationNames).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {durationType === PlanDuration.CUSTOM && (
              <div className="space-y-2">
                <Label htmlFor="days">Dias</Label>
                <Input
                  id="days"
                  type="number"
                  min={1}
                  placeholder="Ej. 45"
                  aria-invalid={!!errors.duration?.days}
                  {...register('duration.days')}
                />
                {errors.duration?.days && (
                  <p className="text-sm text-destructive">{errors.duration.days.message}</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 sm:col-span-2">
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="active">Plan activo</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Servicios incluidos</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => append({ serviceId: '', classLimitType: ClassLimitType.UNLIMITED, classLimit: null })}
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar servicio
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay servicios agregados. Agrega al menos uno.
              </p>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <PlanServiceForm
                  index={index}
                  control={control}
                  register={register}
                  services={availableServices}
                  onRemove={() => remove(index)}
                  errors={errors}
                />
              </div>
            ))}
            {errors.services?.message && (
              <p className="text-sm text-destructive">{errors.services.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/home/plans/${planId}`)}
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
