import { useCallback, useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { sileo } from 'sileo';

import { Button } from '@front/cn/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@front/cn/components/card';
import {
  getClientSubscriptions,
  getActivePlans,
  createSubscription,
} from '@front/subscriptions';
import type { ClientSubscription } from '@models/subscriptions';
import type { Plan } from '@models/plans';

import { SubscriptionsTable } from './subscriptions-table';
import { AssignPlanModal } from './assign-plan-modal';
import { AssignPlanForm } from './assign-plan-form';

interface ClientSubscriptionsSectionProps {
  db: import('firebase/firestore').Firestore;
  functions: import('firebase/functions').Functions;
  facilityId: string;
  clientId: string;
}

export function ClientSubscriptionsSection({
  db,
  functions,
  facilityId,
  clientId,
}: ClientSubscriptionsSectionProps) {
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCompactEmptyState = subscriptions.length === 0 && !selectedPlan;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, activePlans] = await Promise.all([
        getClientSubscriptions(db, facilityId, clientId),
        getActivePlans(db, facilityId),
      ]);
      setSubscriptions(subs);
      setPlans(activePlans);
    } finally {
      setLoading(false);
    }
  }, [db, facilityId, clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleSelectPlan(plan: Plan) {
    setSelectedPlan(plan);
  }

  function handleCancel() {
    setSelectedPlan(null);
  }

  function handleChangePlan() {
    setIsModalOpen(true);
  }

  async function handleConfirm(startDate: string) {
    if (!selectedPlan) return;

    setIsSubmitting(true);
    try {
      await createSubscription(functions, {
        facilityId,
        clientId,
        planId: selectedPlan.id,
        startDate,
      });
      sileo.success({
        title: 'Plan asignado correctamente',
        duration: 3000,
      });
      setSelectedPlan(null);
      await loadData();
    } catch {
      sileo.error({
        title: 'Error al asignar el plan',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/70 pt-0 shadow-sm gap-0">
      <CardHeader className="border-b bg-gradient-to-br from-primary/5 via-background to-background pt-6 gap-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Suscripciones</CardTitle>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Asignar Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent className={isCompactEmptyState ? 'p-0' : 'space-y-4 p-6'}>
        <SubscriptionsTable subscriptions={subscriptions} />

        {selectedPlan && (
          <AssignPlanForm
            plan={selectedPlan}
            isSubmitting={isSubmitting}
            onChangePlan={handleChangePlan}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
          />
        )}
      </CardContent>

      <AssignPlanModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        plans={plans}
        activeSubscriptions={subscriptions}
        onSelectPlan={handleSelectPlan}
      />
    </Card>
  );
}
