import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import {
  ArrowLeft,
  CalendarDays,
  CalendarX2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
  Ticket,
} from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@front/cn/components/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@front/cn/components/empty';
import { Separator } from '@front/cn/components/separator';
import { getService, deleteService, getClassesByService } from '@front/services';
import { checkServiceHasActiveSubscriptions } from '@front/subscriptions';
import {
  DateWeekCalendar,
  type DateCalendarSlot,
  getWeekStart,
} from '@front/ui-react';
import type { ClassModel } from '@models/classes';
import { DAYS_OF_WEEK } from '@models/common';
import type { Service } from '@models/services';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { db, functions } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { PermissionGuard } from '../../../components/permission-guard';
import { Can } from '../../../components/can';

export default function ServicesDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);

  const [service, setService] = useState<Service | undefined>();
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  useEffect(() => {
    if (!selectedFacility?.id || !serviceId) return;

    setLoading(true);
    Promise.all([
      getService(db, selectedFacility.id, serviceId),
      getClassesByService(db, selectedFacility.id, serviceId),
    ])
      .then(([serviceResult, classesResult]) => {
        if (!serviceResult) {
          setNotFound(true);
          return;
        }
        setService(serviceResult);
        setClasses(classesResult);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [selectedFacility?.id, serviceId]);

  const calendarSlots = useMemo<DateCalendarSlot[]>(() => {
    const jsDayToDayOfWeek = [
      DAYS_OF_WEEK[6], // 0 = Sunday
      DAYS_OF_WEEK[0], // 1 = Monday
      DAYS_OF_WEEK[1], // 2 = Tuesday
      DAYS_OF_WEEK[2], // 3 = Wednesday
      DAYS_OF_WEEK[3], // 4 = Thursday
      DAYS_OF_WEEK[4], // 5 = Friday
      DAYS_OF_WEEK[5], // 6 = Saturday
    ];

    return classes.map((c) => {
      const date = c.date.toDate();
      return {
        id: c.id,
        scheduleId: c.scheduleId,
        date,
        dayOfWeek: jsDayToDayOfWeek[date.getDay()],
        startTime: c.startAt,
        durationMinutes: c.duration,
        displayLabel: c.programTitle || c.startAt,
        displaySubLabel: `${c.duration} min · Cap: ${c.capacity}`,
        color: 'green' as const,
      };
    });
  }, [classes]);

  const weekRange = useMemo(() => {
    if (classes.length === 0) return { min: undefined, max: undefined };
    // classes are sorted by date asc from Firestore
    const firstDate = classes[0].date.toDate();
    const lastDate = classes[classes.length - 1].date.toDate();
    return { min: getWeekStart(firstDate), max: getWeekStart(lastDate) };
  }, [classes]);

  const stats = useMemo(() => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekClasses = classes.filter((c) => {
      const d = c.date.toDate();
      return d >= weekStart && d < weekEnd;
    });

    return {
      classesThisWeek: weekClasses.length,
      totalCapacity: weekClasses.reduce((sum, c) => sum + c.capacity, 0),
      totalBookings: weekClasses.reduce((sum, c) => sum + c.userBookings.length, 0),
    };
  }, [classes, weekStart]);

  async function handleDelete() {
    if (!selectedFacility?.id || !serviceId) return;

    setIsDeleting(true);
    try {
      const { hasActiveSubscriptions } = await checkServiceHasActiveSubscriptions(
        functions,
        selectedFacility.id,
        serviceId,
      );

      if (hasActiveSubscriptions) {
        sileo.error({
          title: 'No se puede eliminar',
          description: 'Hay suscripciones activas que utilizan este servicio.',
          duration: 5000,
        });
        return;
      }

      await deleteService(db, selectedFacility.id, serviceId);
      sileo.success({ title: 'Servicio eliminado correctamente', duration: 3000 });
      navigate('/home/services');
    } catch {
      sileo.error({ title: 'Error al eliminar el servicio', duration: 3000 });
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home/services')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Servicio no encontrado
          </h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            El servicio solicitado no existe o fue eliminado.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard section={PermissionSection.SERVICES}>
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/home/services')}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
          <Badge variant={service.isActive ? 'default' : 'secondary'}>
            {service.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Can section={PermissionSection.SERVICES} action={PermissionAction.UPDATE}>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to={`/home/services/${serviceId}/edit`}>
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            </Button>
          </Can>
          <Can section={PermissionSection.SERVICES} action={PermissionAction.DELETE}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar servicio</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta accion no se puede deshacer. Se eliminara el servicio y
                    todos sus horarios permanentemente.
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
          </Can>
        </div>
      </div>

      {service.description && (
        <p className="text-muted-foreground">{service.description}</p>
      )}

      {/* Stats */}
      {classes.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="py-5">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.classesThisWeek}</p>
                <p className="text-sm text-muted-foreground">Clases esta semana</p>
              </div>
            </CardContent>
          </Card>
          <Card className="py-5">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalCapacity}</p>
                <p className="text-sm text-muted-foreground">Capacidad total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="py-5">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                <Ticket className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalBookings}</p>
                <p className="text-sm text-muted-foreground">Reservas</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar / Empty */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Clases programadas</CardTitle>
            <Can section={PermissionSection.PROGRAMMING} action={PermissionAction.CREATE}>
              <Button size="sm" className="gap-2" asChild>
                <Link to={`/home/services/${serviceId}/schedules/create`}>
                  <Plus className="h-4 w-4" />
                  Nueva clase
                </Link>
              </Button>
            </Can>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {calendarSlots.length > 0 ? (
            <DateWeekCalendar
              slots={calendarSlots}
              weekStart={weekStart}
              onWeekChange={setWeekStart}
              minWeekStart={weekRange.min}
              maxWeekStart={weekRange.max}
            />
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarX2 />
                </EmptyMedia>
                <EmptyTitle>Sin clases programadas</EmptyTitle>
                <EmptyDescription>
                  Este servicio aun no tiene clases programadas. Crea la primera
                  clase para que los usuarios puedan reservar.
                </EmptyDescription>
              </EmptyHeader>
              <Can section={PermissionSection.PROGRAMMING} action={PermissionAction.CREATE}>
                <EmptyContent>
                  <Button asChild>
                    <Link to={`/home/services/${serviceId}/schedules/create`}>
                      <Plus className="h-4 w-4" />
                      Programar clase
                    </Link>
                  </Button>
                </EmptyContent>
              </Can>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
    </PermissionGuard>
  );
}
