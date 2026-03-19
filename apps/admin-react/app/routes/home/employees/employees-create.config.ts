export const EMPLOYEES_CREATE_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: 'Tu sesion expiro. Inicia sesion nuevamente.',
  INVALID_ARGUMENT: 'Revisa los datos ingresados e intenta nuevamente.',
  PERMISSION_DENIED: 'No tienes permisos para realizar esta accion en esta instalacion.',
  NOT_FOUND: 'No se encontro la informacion del usuario.',
  ALREADY_EXISTS: 'Este usuario ya es empleado de esta instalacion.',
  INTERNAL: 'Ocurrio un error inesperado. Intenta nuevamente.',
};

type EmployeesCreateError = {
  code?: string;
  message?: string;
  status?: string;
  error?: {
    message?: string;
    status?: string;
  };
};

export function resolveEmployeesCreateErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  const functionError = error as EmployeesCreateError;
  const errorStatus =
    functionError?.error?.status ?? functionError?.status ?? functionError?.code;
  const normalizedStatus = errorStatus
    ?.split('/')
    .at(-1)
    ?.replace(/-/g, '_')
    .toUpperCase();

  if (normalizedStatus && EMPLOYEES_CREATE_ERROR_MESSAGES[normalizedStatus]) {
    return EMPLOYEES_CREATE_ERROR_MESSAGES[normalizedStatus];
  }

  return functionError?.message ?? functionError?.error?.message ?? fallbackMessage;
}
