import { ShieldOff } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@front/cn/components/button';
import { Card, CardContent } from '@front/cn/components/card';

export function AccessDenied() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8 text-center">
          <ShieldOff className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Acceso denegado</h2>
            <p className="text-sm text-muted-foreground">
              No tienes permiso para acceder a esta sección.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/home">Volver al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
