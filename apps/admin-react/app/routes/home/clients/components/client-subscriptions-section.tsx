import { useCallback, useEffect, useState } from 'react';
import { Plus, Loader2, Inbox } from 'lucide-react';
import { sileo } from 'sileo';

import { Button } from '@front/cn/components/button';
import { Card, CardContent } from '@front/cn/components/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@front/cn/components/empty';
import {
  getClientSubscriptions,
  getActivePlans,
  createSubscription,
} from '@front/subscriptions';
import type { ClientSubscription } from '@models/subscriptions';
import type { Plan } from '@models/plans';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { Can } from '../../../../components/can';

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
  const hasSubscriptions = subscriptions.length > 0;

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
    } catch (error) {
      const code = (error as { code?: string })?.code;
      const descriptions: Record<string, string> = {
        'functions/failed-precondition': 'El cliente o el plan no estan activos.',
        'functions/already-exists': 'El cliente ya tiene una suscripcion activa para este plan.',
        'functions/not-found': 'El plan o el cliente no fueron encontrados.',
      };
      sileo.error({
        title: 'Error al asignar el plan',
        description: descriptions[code ?? ''] ?? 'Ocurrio un error inesperado.',
        duration: 5000,
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
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Suscripciones</h2>
        <Can section={PermissionSection.CLIENTS} action={PermissionAction.UPDATE}>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Asignar Plan
          </Button>
        </Can>
      </div>
      {hasSubscriptions ? (
        <SubscriptionsTable subscriptions={subscriptions} />
      ) : selectedPlan ? null : (
        <Empty className="border border-border/70 py-6 md:py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox className="h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle>No hay suscripciones registradas</EmptyTitle>
            <EmptyDescription>
              Asigna un plan para crear la primera suscripcion de este cliente.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {selectedPlan && (
        <AssignPlanForm
          plan={selectedPlan}
          isSubmitting={isSubmitting}
          onChangePlan={handleChangePlan}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      )}
      <AssignPlanModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        plans={plans}
        activeSubscriptions={subscriptions}
        onSelectPlan={handleSelectPlan}
      />
    </section>
  );
}
