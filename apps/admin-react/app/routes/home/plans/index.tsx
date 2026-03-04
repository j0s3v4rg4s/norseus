import { useEffect, useState } from 'react';
import { Plus, Loader2, ClipboardList } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@front/cn/components/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@front/cn/components/empty';
import { getPlans } from '@front/services';
import type { Plan } from '@models/plans';
import { db } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { PlansTable } from './components';

export default function PlansPage() {
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedFacility?.id) return;

    setLoading(true);
    getPlans(db, selectedFacility.id)
      .then(setPlans)
      .finally(() => setLoading(false));
  }, [selectedFacility?.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planes</h1>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link to="/home/plans/create">
            <Plus className="h-4 w-4" />
            Nuevo plan
          </Link>
        </Button>
      </div>

      {plans.length > 0 ? (
        <PlansTable plans={plans} />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>Sin planes registrados</EmptyTitle>
            <EmptyDescription>
              Aun no has creado ningun plan. Comienza creando el primero.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/home/plans/create">
                <Plus className="h-4 w-4" />
                Nuevo plan
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
