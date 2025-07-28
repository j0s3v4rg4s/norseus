import { Enums } from './types';
import { PERMISSIONS_ACTIONS, PERMISSIONS_SECTIONS, UserType } from './db.types';

export const PERMISSIONS_ACTIONS_DICTIONARY: Record<Enums<'permission_action'>, string> = {
  [PERMISSIONS_ACTIONS[0]]: 'Leer',
  [PERMISSIONS_ACTIONS[1]]: 'Editar',
  [PERMISSIONS_ACTIONS[2]]: 'Eliminar',
  [PERMISSIONS_ACTIONS[3]]: 'Crear',
};

export const PERMISSIONS_SECTIONS_DICTIONARY: Record<Enums<'sections'>, string> = {
  [PERMISSIONS_SECTIONS[0]]: 'Permisos',
  [PERMISSIONS_SECTIONS[1]]: 'Usuarios',
};

export const USER_TYPES_DICTIONARY: Record<UserType, string> = {
  admin: 'Administrador',
  employer: 'Empleado',
  client: 'Cliente',
};
