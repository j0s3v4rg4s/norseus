import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@front/cn/components/button';
import { Input } from '@front/cn/components/input';
import type { Plan } from '@models/plans';
import { PlanDuration, PlanDurationDays, PlanDurationNames, ClassLimitType } from '@models/plans';

interface AssignPlanFormProps {
  plan: Plan;
  isSubmitting: boolean;
  onChangePlan: () => void;
  onCancel: () => void;
  onConfirm: (startDate: string) => void;
}

function calculateEndDate(startDate: string, plan: Plan): string {
  const start = new Date(startDate + 'T00:00:00');
  const days =
    plan.duration.type === PlanDuration.CUSTOM
      ? plan.duration.days!
      : PlanDurationDays[plan.duration.type];
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return end.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function AssignPlanForm({
  plan,
  isSubmitting,
  onChangePlan,
  onCancel,
  onConfirm,
}: AssignPlanFormProps) {
  const [startDate, setStartDate] = useState(todayISO());

  const endDateLabel = calculateEndDate(startDate, plan);

  return (
    <div className="rounded-lg border-2 border-primary/50 bg-primary/[0.02] p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Plan seleccionado
          </p>
          <p className="text-lg font-semibold mt-1">{plan.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {plan.services
              .map((s) =>
                s.classLimitType === ClassLimitType.UNLIMITED
                  ? `${s.serviceId} (ilimitado)`
                  : `${s.serviceId} (${s.classLimit} clases)`
              )
              .join(' · ')}{' '}
            — ${plan.cost.toLocaleString()} {plan.currency} /{' '}
            {PlanDurationNames[plan.duration.type]}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onChangePlan}>
          Cambiar plan
        </Button>
      </div>

      <div className="border-t pt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label
            htmlFor="start-date"
            className="text-xs font-semibold text-muted-foreground"
          >
            Fecha de inicio
          </label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">
            Fecha de fin (calculada)
          </p>
          <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {endDateLabel}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(startDate)}
            disabled={isSubmitting || !startDate}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asignando...
              </>
            ) : (
              'Confirmar Asignacion'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
