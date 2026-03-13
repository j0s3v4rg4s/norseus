import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@front/cn/components/dialog';
import type { Plan } from '@models/plans';
import type { ClientSubscription } from '@models/subscriptions';
import { SubscriptionStatus } from '@models/subscriptions';
import { PlanDurationNames, ClassLimitType } from '@models/plans';

interface AssignPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  activeSubscriptions: ClientSubscription[];
  onSelectPlan: (plan: Plan) => void;
}

export function AssignPlanModal({
  open,
  onOpenChange,
  plans,
  activeSubscriptions,
  onSelectPlan,
}: AssignPlanModalProps) {
  const activePlanIds = new Set(
    activeSubscriptions
      .filter((s) => s.status === SubscriptionStatus.ACTIVE)
      .map((s) => s.planId)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar Plan</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          {plans.map((plan) => {
            const isSubscribed = activePlanIds.has(plan.id);

            return (
              <button
                key={plan.id}
                type="button"
                disabled={isSubscribed}
                onClick={() => {
                  onSelectPlan(plan);
                  onOpenChange(false);
                }}
                className={`relative w-full rounded-lg border p-4 text-left transition-colors ${
                  isSubscribed
                    ? 'cursor-not-allowed opacity-40'
                    : 'cursor-pointer hover:border-primary'
                }`}
              >
                {isSubscribed && (
                  <span className="absolute top-2 right-3 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    Ya suscrito
                  </span>
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.services
                        .map((s) =>
                          s.classLimitType === ClassLimitType.UNLIMITED
                            ? `${s.serviceId} (ilimitado)`
                            : `${s.serviceId} (${s.classLimit} clases)`
                        )
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ${plan.cost.toLocaleString()} {plan.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {PlanDurationNames[plan.duration.type]}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
          {plans.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No hay planes activos disponibles.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
