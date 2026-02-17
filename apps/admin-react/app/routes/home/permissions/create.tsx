import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Info } from 'lucide-react';

import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@front/cn/components/card';
import { Checkbox } from '@front/cn/components/checkbox';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@front/cn/components/tooltip';
import {
  PERMISSIONS_ACTIONS,
  PERMISSIONS_ACTIONS_DICTIONARY,
  PERMISSIONS_SECTIONS,
  PERMISSIONS_SECTIONS_DICTIONARY,
  type PermissionAction,
  type PermissionSection,
  type PermissionsBySection,
} from '@models/permissions';

import {
  ACTION_DESELECTION_IMPLIES,
  ACTION_SELECTION_IMPLIES,
  SECTION_TOOLTIPS,
} from './create.config';

function PermissionsMatrix({
  permissions,
  onChange,
}: {
  permissions: PermissionsBySection;
  onChange: (permissions: PermissionsBySection) => void;
}) {
  function toggleAction(section: PermissionSection, action: PermissionAction) {
    const current = permissions[section] ?? [];
    const isChecked = current.includes(action);

    let next: PermissionAction[];
    if (isChecked) {
      const toRemove = [action, ...ACTION_DESELECTION_IMPLIES[action]];
      next = current.filter((a) => !toRemove.includes(a));
    } else {
      const toAdd = [action, ...ACTION_SELECTION_IMPLIES[action]];
      next = [...new Set([...current, ...toAdd])];
    }

    onChange({ ...permissions, [section]: next });
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-medium text-muted-foreground">
              Sección
            </th>
            {PERMISSIONS_ACTIONS.map((action) => (
              <th key={action} className="px-4 py-3 text-center font-medium text-muted-foreground">
                {PERMISSIONS_ACTIONS_DICTIONARY[action] ?? action}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSIONS_SECTIONS.map((section, index) => (
            <tr
              key={section}
              className={`hover:bg-muted/30 transition-colors ${
                index < PERMISSIONS_SECTIONS.length - 1 ? 'border-b' : ''
              }`}
            >
              <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>{PERMISSIONS_SECTIONS_DICTIONARY[section] ?? section}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
                      >
                        <Info className="h-4 w-4 shrink-0" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      {SECTION_TOOLTIPS[section]}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </td>
              {PERMISSIONS_ACTIONS.map((action) => {
                const isChecked = (permissions[section] ?? []).includes(action);
                const id = `${section}-${action}`;
                return (
                  <td key={action} className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <Checkbox id={id} checked={isChecked} onCheckedChange={() => toggleAction(section, action)} />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function hasAtLeastOnePermission(permissions: PermissionsBySection): boolean {
  return Object.values(permissions).some((actions) => actions.length > 0);
}

export default function CreateRolePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<PermissionsBySection>({});

  const canSave = name.trim().length > 0 && hasAtLeastOnePermission(permissions);

  function handleSave() {
    const roleData = { name: name.trim(), permissions };
    console.log('Role data:', roleData);
  }

  return (
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
          <Button disabled={!canSave} onClick={handleSave}>
            Guardar
          </Button>
          <Button variant="outline" onClick={() => navigate('/home/permissions')}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
