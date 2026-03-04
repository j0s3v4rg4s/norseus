import { Trash2 } from 'lucide-react';
import { type Control, type UseFormRegister, type FieldErrors, Controller, useWatch } from 'react-hook-form';

import { Button } from '@front/cn/components/button';
import { Field, FieldError, FieldLabel } from '@front/cn/components/field';
import { Input } from '@front/cn/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@front/cn/components/select';
import { ClassLimitType, ClassLimitTypeNames } from '@models/plans';
import type { Service } from '@models/services';

interface PlanServiceFormProps {
  index: number;
  control: Control<any>;
  register: UseFormRegister<any>;
  services: Service[];
  onRemove: () => void;
  errors?: FieldErrors;
}

export function PlanServiceForm({
  index,
  control,
  register,
  services,
  onRemove,
  errors,
}: PlanServiceFormProps) {
  const classLimitType = useWatch({
    control,
    name: `services.${index}.classLimitType`,
  });
  const isFixedLimit = classLimitType === ClassLimitType.FIXED;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start">
      <Field data-invalid={!!(errors as any)?.services?.[index]?.serviceId || undefined}>
        <FieldLabel>Servicio</FieldLabel>
        <Controller
          name={`services.${index}.serviceId`}
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="h-9 w-full" aria-invalid={!!(errors as any)?.services?.[index]?.serviceId}>
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError>{(errors as any)?.services?.[index]?.serviceId?.message}</FieldError>
      </Field>

      <Field>
        <FieldLabel>Tipo de limite</FieldLabel>
        <Controller
          name={`services.${index}.classLimitType`}
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ClassLimitTypeNames).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field data-invalid={!!(isFixedLimit && (errors as any)?.services?.[index]?.classLimit) || undefined}>
        <FieldLabel>Limite de clases</FieldLabel>
        <Input
          type="number"
          min={1}
          placeholder="Ej. 10"
          className="h-9"
          disabled={!isFixedLimit}
          aria-invalid={!!(isFixedLimit && (errors as any)?.services?.[index]?.classLimit)}
          {...register(`services.${index}.classLimit`, { valueAsNumber: true })}
        />
        {isFixedLimit && <FieldError>{(errors as any)?.services?.[index]?.classLimit?.message}</FieldError>}
      </Field>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive md:self-end md:justify-self-end"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
