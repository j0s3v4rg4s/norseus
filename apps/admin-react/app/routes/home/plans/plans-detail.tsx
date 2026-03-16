import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, Loader2, Pencil, Trash2 } from 'lucide-react';
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
import { Badge } from '@front/cn/components/badge';
import { Button } from '@front/cn/components/button';
import { Card, CardContent } from '@front/cn/components/card';
import { getPlan, getServices } from '@front/services';
import { type Plan, PlanDuration, PlanDurationNames, ClassLimitType, ClassLimitTypeNames } from '@models/plans';
import type { Service } from '@models/services';
import { db } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { deletePlan } from '@front/services';

export default function PlansDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);

  const [plan, setPlan] = useState<Plan | undefined>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!selectedFacility?.id || !planId) return;

    setLoading(true);
    Promise.all([getPlan(db, selectedFacility.id, planId), getServices(db, selectedFacility.id)])
      .then(([planResult, servicesResult]) => {
        if (!planResult) {
          setNotFound(true);
          return;
        }
        setPlan(planResult);
        setServices(servicesResult);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [selectedFacility?.id, planId]);

  async function handleDelete() {
    if (!selectedFacility?.id || !planId) return;

    setIsDeleting(true);
    try {
      await deletePlan(db, selectedFacility.id, planId);
      sileo.success({ title: 'Plan eliminado correctamente', duration: 3000 });
      navigate('/home/plans');
    } catch {
      sileo.error({ title: 'Error al eliminar el plan', duration: 3000 });
    } finally {
      setIsDeleting(false);
    }
  }

  function getServiceName(serviceId: string): string {
    return services.find((s) => s.id === serviceId)?.name ?? 'Servicio desconocido';
  }

  function getDurationLabel(): string {
    if (!plan) return '';
    if (plan.duration.type === PlanDuration.CUSTOM) {
      return `${plan.duration.days} dias`;
    }
    return PlanDurationNames[plan.duration.type];
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !plan) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home/plans')}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Plan no encontrado</h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            El plan solicitado no existe o fue eliminado.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home/plans')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
          <Badge variant={plan.active ? 'default' : 'secondary'}>{plan.active ? 'Activo' : 'Inactivo'}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to={`/home/plans/${planId}/edit`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar plan</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta accion no se puede deshacer. Se eliminara el plan permanentemente.
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
      </div>

      {plan.description && <p className="text-muted-foreground">{plan.description}</p>}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Detalles</h2>
        <Card className="border-border/70 shadow-sm">
          <CardContent>
            <dl className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Costo</dt>
                <dd className="text-base font-medium">
                  {plan.cost.toLocaleString()} {plan.currency}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Duracion</dt>
                <dd className="text-base font-medium">{getDurationLabel()}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Estado</dt>
                <dd>
                  <Badge variant={plan.active ? 'default' : 'secondary'}>{plan.active ? 'Activo' : 'Inactivo'}</Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Servicios incluidos</h2>

        {plan.services.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {plan.services.map((ps, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2"
              >
                <span className="text-sm font-medium">{getServiceName(ps.serviceId)}</span>
                <Badge variant="secondary" className="text-xs">
                  {ClassLimitTypeNames[ps.classLimitType]}
                  {ps.classLimitType === ClassLimitType.FIXED && ps.classLimit
                    ? ` — ${ps.classLimit} clases`
                    : ''}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Este plan no tiene servicios asociados.
          </p>
        )}
      </section>
    </div>
  );
}
