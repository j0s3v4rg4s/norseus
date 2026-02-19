import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, Loader2, Trash2, Pencil, CalendarX2, Plus } from 'lucide-react';
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
import { getService, deleteService } from '@front/services';
import type { Service } from '@models/services';
import { db } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';

export default function ServicesDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);

  const [service, setService] = useState<Service | undefined>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!selectedFacility?.id || !serviceId) return;

    setLoading(true);
    getService(db, selectedFacility.id, serviceId)
      .then((result) => {
        if (!result) {
          setNotFound(true);
          return;
        }
        setService(result);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [selectedFacility?.id, serviceId]);

  async function handleDelete() {
    if (!selectedFacility?.id || !serviceId) return;

    setIsDeleting(true);
    try {
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
        <div className="flex flex-1 items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
          <Badge variant={service.isActive ? 'default' : 'secondary'}>
            {service.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to={`/home/services/${serviceId}/edit`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
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
        </div>
      </div>

      {service.description && (
        <p className="text-muted-foreground">{service.description}</p>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Clases programadas</CardTitle>
            <Button size="sm" className="gap-2" asChild>
              <Link to={`/home/services/${serviceId}/schedules/create`}>
                Nueva clase
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
            <EmptyContent>
              <Button asChild>
                <Link to={`/home/services/${serviceId}/schedules/create`}>
                  Programar clase
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    </div>
  );
}
