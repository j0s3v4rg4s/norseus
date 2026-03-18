import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { sileo } from 'sileo';

import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@front/cn/components/card';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import { TooltipProvider } from '@front/cn/components/tooltip';
import type { PermissionsBySection } from '@models/permissions';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { createRole } from '@front/roles';
import { useSessionStore } from '../../../stores/session.store';
import { db } from '../../../firebase';
import { PermissionGuard } from '../../../components/permission-guard';
import { PermissionsMatrix } from './components';

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

export default function PermissionsCreateRolePage() {
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<PermissionsBySection>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSave = name.trim().length > 0 && hasAtLeastOnePermission(permissions);

  async function handleSave() {
    if (!canSave || !selectedFacility?.id) return;

    setIsSubmitting(true);
    try {
      const normalized = normalizeRoleName(name);
      await createRole(db, selectedFacility.id, {
        name: normalized,
        permissions,
      });
      sileo.success({ title: 'Rol creado correctamente', duration: 3000 });
      navigate('/home/permissions');
    } catch {
      sileo.error({ title: 'Error al crear el rol', duration: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PermissionGuard section={PermissionSection.ROLES} action={PermissionAction.CREATE}>
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home/permissions')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear rol</h1>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
            <CardDescription>Ingresa el nombre que identificará este rol</CardDescription>
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
            <CardDescription>Selecciona las acciones permitidas para cada sección</CardDescription>
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
            Guardar
          </Button>
          <Button variant="outline" onClick={() => navigate('/home/permissions')}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
    </PermissionGuard>
  );
}
