import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { Archive, ArrowLeft, Loader2, Pencil, RotateCcw, Trash2 } from 'lucide-react';
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
import { getPlan, getServices, archivePlan, deletePlan, updatePlan } from '@front/services';
import { checkPlanHasActiveSubscriptions } from '@front/subscriptions';
import { type Plan, PlanDuration, PlanDurationNames, ClassLimitType, ClassLimitTypeNames } from '@models/plans';
import type { Service } from '@models/services';
import { db, functions } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';

export default function PlansDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);

  const [plan, setPlan] = useState<Plan | undefined>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  async function handleArchive() {
    if (!selectedFacility?.id || !planId) return;

    setIsProcessing(true);
    try {
      await archivePlan(db, selectedFacility.id, planId);
      setPlan((prev) => (prev ? { ...prev, active: false } : prev));
      sileo.success({ title: 'Plan archivado correctamente', duration: 3000 });
    } catch {
      sileo.error({ title: 'Error al archivar el plan', duration: 3000 });
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReactivate() {
    if (!selectedFacility?.id || !planId) return;

    setIsProcessing(true);
    try {
      await updatePlan(db, selectedFacility.id, planId, { active: true });
      setPlan((prev) => (prev ? { ...prev, active: true } : prev));
      sileo.success({ title: 'Plan reactivado correctamente', duration: 3000 });
    } catch {
      sileo.error({ title: 'Error al reactivar el plan', duration: 3000 });
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDelete() {
    if (!selectedFacility?.id || !planId) return;

    setIsProcessing(true);
    try {
      const { hasActiveSubscriptions } = await checkPlanHasActiveSubscriptions(
        functions,
        selectedFacility.id,
        planId,
      );

      if (hasActiveSubscriptions) {
        sileo.error({
          title: 'No se puede eliminar',
          description: 'Hay suscripciones activas asociadas a este plan.',
          duration: 5000,
        });
        return;
      }

      await deletePlan(db, selectedFacility.id, planId);
      sileo.success({ title: 'Plan eliminado correctamente', duration: 3000 });
      navigate('/home/plans');
    } catch {
      sileo.error({ title: 'Error al eliminar el plan', duration: 3000 });
    } finally {
      setIsProcessing(false);
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
          <Badge variant={plan.active ? 'default' : 'secondary'}>
            {plan.active ? 'Activo' : 'Archivado'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to={`/home/plans/${planId}/edit`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>

          {plan.active ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2" disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                  Archivar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archivar plan</AlertDialogTitle>
                  <AlertDialogDescription>
                    El plan sera archivado y no se podran crear nuevas suscripciones. Las suscripciones activas
                    seguiran vigentes hasta su fecha de vencimiento.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={handleArchive}>
                    Archivar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isProcessing}
                onClick={handleReactivate}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Reactivar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar plan permanentemente</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta accion no se puede deshacer. Se eliminara el plan permanentemente. Solo es posible si no
                      hay suscripciones activas asociadas.
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
            </>
          )}
        </div>
      </div>

      {!plan.active && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          Este plan esta archivado. No se pueden crear nuevas suscripciones con este plan.
        </div>
      )}

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
                  <Badge variant={plan.active ? 'default' : 'secondary'}>
                    {plan.active ? 'Activo' : 'Archivado'}
                  </Badge>
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
