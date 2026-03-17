import { useCallback, useEffect, useState } from 'react';
import { Plus, Loader2, Building2 } from 'lucide-react';
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
import { getAllFacilities } from '@front/super-admin';
import type { FacilityModel } from '@models/facility';
import { db } from '../../../firebase';
import { FacilitiesTable } from './components';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<FacilityModel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFacilities = useCallback(() => {
    setLoading(true);
    getAllFacilities(db)
      .then(setFacilities)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

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
          <h1 className="text-3xl font-bold tracking-tight">Instalaciones</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona todas las instalaciones de la plataforma
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link to="/home/facilities/create">
            <Plus className="h-4 w-4" />
            Nueva instalacion
          </Link>
        </Button>
      </div>

      {facilities.length > 0 ? (
        <FacilitiesTable facilities={facilities} />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>Sin instalaciones registradas</EmptyTitle>
            <EmptyDescription>
              Aun no se ha creado ninguna instalacion. Comienza creando la primera.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/home/facilities/create">
                <Plus className="h-4 w-4" />
                Nueva instalacion
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
