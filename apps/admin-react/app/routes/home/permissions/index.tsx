import { useEffect, useState } from 'react';
import { Plus, Eye, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router';

import { Badge } from '@front/cn/components/badge';
import { Button } from '@front/cn/components/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@front/cn/components/collapsible';
import {
  PERMISSIONS_ACTIONS,
  PERMISSIONS_ACTIONS_DICTIONARY,
  PERMISSIONS_SECTIONS,
  PERMISSIONS_SECTIONS_DICTIONARY,
  PermissionSection,
  PermissionAction,
  type Role,
} from '@models/permissions';
import { getAllRoles } from '@front/roles';
import { useSessionStore } from '../../../stores/session.store';
import { db } from '../../../firebase';
import { PermissionGuard } from '../../../components/permission-guard';
import { Can } from '../../../components/can';

function getSectionLabel(section: string): string {
  return PERMISSIONS_SECTIONS_DICTIONARY[section] ?? section;
}

function getActionLabel(action: string | PermissionAction): string {
  return PERMISSIONS_ACTIONS_DICTIONARY[action] ?? String(action);
}

function PermissionBadges({ role }: { role: Role }) {
  return (
    <div className="flex gap-x-10 gap-y-2 flex-wrap">
      {PERMISSIONS_SECTIONS.map((section) => {
        const roleActions = role.permissions[section] ?? [];
        return (
          <div key={section} className="min-w-0 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{getSectionLabel(section)}</p>
            <div className="flex flex-wrap gap-1.5">
              {PERMISSIONS_ACTIONS.map((action) => {
                const isActive = roleActions.includes(action);
                return (
                  <Badge key={action} variant={isActive ? 'default' : 'outline'}>
                    {getActionLabel(action)}
                  </Badge>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PermissionsPage() {
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRoleId, setOpenRoleId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFacility?.id) return;

    setLoading(true);
    getAllRoles(db, selectedFacility.id)
      .then(setRoles)
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
    <PermissionGuard section={PermissionSection.ROLES}>
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles y permisos</h1>
          <p className="text-sm text-muted-foreground">Administra los roles y sus permisos asociados</p>
        </div>
        <Can section={PermissionSection.ROLES} action={PermissionAction.CREATE}>
          <Button size="lg" className="gap-2" asChild>
            <Link to="/home/permissions/create">
              <Plus className="h-4 w-4" />
              Crear rol
            </Link>
          </Button>
        </Can>
      </div>

      <div className="overflow-hidden rounded-lg border">
        {roles.length > 0 ? (
          roles.map((role, index) => (
            <Collapsible
              key={role.id}
              open={openRoleId === role.id}
              onOpenChange={(open) => setOpenRoleId(open ? role.id : null)}
            >
              <div className={index < roles.length - 1 ? 'border-b' : ''}>
                <div className="flex items-center px-4 py-3 hover:bg-muted/30 transition-colors">
                  <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left">
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-90" />
                    <span className="font-medium">{role.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {PERMISSIONS_SECTIONS.filter((s) => (role.permissions[s] ?? []).length > 0)
                        .map((s) => getSectionLabel(s))
                        .join(' · ')}
                    </span>
                  </CollapsibleTrigger>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                    <Link to={`/home/permissions/${role.id}/edit`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Editar rol</span>
                    </Link>
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="bg-muted/20 px-10 pb-4 pt-2">
                    <PermissionBadges role={role} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))
        ) : (
          <div className="flex h-24 items-center justify-center text-muted-foreground">No hay roles registrados.</div>
        )}
      </div>
    </div>
    </PermissionGuard>
  );
}
