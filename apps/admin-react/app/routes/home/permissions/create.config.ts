import { PermissionAction, PermissionSection } from '@models/permissions';

export const SECTION_TOOLTIPS: Record<PermissionSection, string> = {
  [PermissionSection.EMPLOYEES]:
    'Controla el acceso a la gestión del personal: registro de nuevos empleados, actualización de datos, asignación de roles y procesos de baja laboral.',
  [PermissionSection.ROLES]:
    'Permite crear, editar y eliminar roles, así como configurar los permisos que tendrá cada rol en la aplicación.',
  [PermissionSection.SERVICES]:
    'Permite gestionar los servicios ofrecidos por el establecimiento (entrenamientos, planes, actividades, etc.).',
  [PermissionSection.PROGRAMMING]:
    'Permite gestionar la programación de clases, horarios y sesiones del gimnasio.',
  [PermissionSection.CLIENTS]:
    'Controla el acceso a la gestión de clientes: registro, consulta, asignación de planes y seguimiento de suscripciones.',
  [PermissionSection.PLANS]:
    'Permite gestionar los planes de membresía: creación, edición, archivado y eliminación de planes disponibles.',
};

export const ACTION_SELECTION_IMPLIES: Record<PermissionAction, PermissionAction[]> = {
  [PermissionAction.CREATE]: [PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
  [PermissionAction.UPDATE]: [PermissionAction.READ],
  [PermissionAction.DELETE]: [PermissionAction.READ],
  [PermissionAction.READ]: [],
};

export const ACTION_DESELECTION_IMPLIES: Record<PermissionAction, PermissionAction[]> = {
  [PermissionAction.READ]: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE],
  [PermissionAction.CREATE]: [],
  [PermissionAction.UPDATE]: [],
  [PermissionAction.DELETE]: [],
};
