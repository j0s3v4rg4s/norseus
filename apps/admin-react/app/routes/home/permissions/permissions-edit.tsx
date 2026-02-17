import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
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
import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@front/cn/components/card';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import { TooltipProvider } from '@front/cn/components/tooltip';
import type { PermissionsBySection } from '@models/permissions';
import { getRoleById, updateRole, deleteRole } from '@front/roles';
import { useSessionStore } from '../../../stores/session.store';
import { db } from '../../../firebase';
import { PermissionsEditPageSkeleton, PermissionsMatrix } from './components';

function normalizeRoleName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.toUpperCase())
    .join('_');
}

function hasAtLeastOnePermission(permissions: PermissionsBySection): boolean {
  return Object.values(permissions).some((actions) => actions.length > 0);
}

export default function PermissionsEditRolePage() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);

  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<PermissionsBySection>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!selectedFacility?.id || !roleId) return;

    setLoading(true);
    getRoleById(db, selectedFacility.id, roleId)
      .then((role) => {
        if (!role) {
          setNotFound(true);
          return;
        }
        setName(role.name);
        setPermissions(role.permissions);
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [selectedFacility?.id, roleId]);

  const canSave = name.trim().length > 0 && hasAtLeastOnePermission(permissions);

  async function handleSave() {
    if (!canSave || !selectedFacility?.id || !roleId) return;

    setIsSubmitting(true);
    try {
      const normalized = normalizeRoleName(name);
      await updateRole(db, selectedFacility.id, {
        id: roleId,
        name: normalized,
        permissions,
      });
      sileo.success({ title: 'Rol actualizado correctamente', duration: 3000 });
      navigate('/home/permissions');
    } catch {
      sileo.error({ title: 'Error al actualizar el rol', duration: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedFacility?.id || !roleId) return;

    setIsDeleting(true);
    try {
      await deleteRole(db, selectedFacility.id, roleId);
      sileo.success({ title: 'Rol eliminado correctamente', duration: 3000 });
      navigate('/home/permissions');
    } catch {
      sileo.error({ title: 'Error al eliminar el rol', duration: 3000 });
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <PermissionsEditPageSkeleton />;
  }

  if (notFound) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home/permissions')}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Rol no encontrado</h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            El rol solicitado no existe o fue eliminado.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home/permissions')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Editar rol</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar rol</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará el rol permanentemente.
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

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
            <CardDescription>Modifica el nombre del rol</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="role-name">Nombre del rol</Label>
              <Input
                id="role-name"
                placeholder="Ej: Administrador, Recepcionista..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permisos</CardTitle>
            <CardDescription>Modifica las acciones permitidas para cada sección</CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <PermissionsMatrix permissions={permissions} onChange={setPermissions} />
            </TooltipProvider>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button disabled={!canSave || isSubmitting} onClick={handleSave}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
          <Button variant="outline" onClick={() => navigate('/home/permissions')}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
