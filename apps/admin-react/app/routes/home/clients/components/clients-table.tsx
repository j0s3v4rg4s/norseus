import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@front/cn/components/alert-dialog';
import { Badge } from '@front/cn/components/badge';
import { Button } from '@front/cn/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@front/cn/components/table';
import type { ClientModel } from '@models/facility';

interface ClientsTableProps {
  clients: ClientModel[];
  onDelete: (clientId: string) => void;
}

export function ClientsTable({ clients, onDelete }: ClientsTableProps) {
  const navigate = useNavigate();
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-28 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.uid}>
                <TableCell className="font-medium">
                  {client.profile.name}
                </TableCell>
                <TableCell>{client.profile.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={client.isActive ? 'default' : 'destructive'}
                  >
                    {client.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      onClick={() => navigate(`/home/clients/${client.uid}`)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver detalle</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteClientId(client.uid)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteClientId !== null}
        onOpenChange={(open) => { if (!open) setDeleteClientId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara el cliente
              permanentemente de esta instalacion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteClientId) onDelete(deleteClientId);
                setDeleteClientId(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
