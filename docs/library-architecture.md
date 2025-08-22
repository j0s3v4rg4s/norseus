# Arquitectura de Librerías Frontend

Este documento define la estructura y convenciones recomendadas para las librerías del frontend. Para cada librería se especifica su ruta física, su alias de TypeScript y el proceso estandarizado para su creación.

---

## Convenciones y Creación de Librerías

Para mantener la consistencia y organización en el workspace, toda nueva librería de frontend debe seguir el siguiente proceso de creación y estructuración.

### Paso 1: Generación con Nx

Utiliza el siguiente comando de `npx` para asegurar que se use la versión local de Nx. Las librerías deben ser **standalone**.

**Comando Base:**
```bash
npx nx g @nx/angular:library --name=<nombre-libreria> --directory=libs/front/<tipo>/<nombre-libreria> --standalone --importPath=@front/<tipo>/<nombre-libreria>
```

**Parámetros:**
-   `<nombre-libreria>`: El nombre de la librería (ej. `profile`, `logger`, `auth`).
-   `<tipo>`: La categoría a la que pertenece la librería (ej. `core`, `state`, `ui`, `utils`).

### Paso 2: Limpieza y Estructura de Directorios

El generador de Nx crea una estructura por defecto que **no** se alinea con las convenciones del proyecto. Es mandatorio realizar los siguientes ajustes inmediatamente después de la generación:

1.  **Eliminar Contenido de `lib`:** Borra todos los archivos y directorios generados por defecto dentro de `src/lib`.
2.  **Eliminar Directorio `lib`:** Elimina el directorio `src/lib` que ahora estará vacío.
3.  **Vaciar `index.ts`:** El archivo `src/index.ts` generado por Nx contiene exportaciones al componente de ejemplo. Este archivo debe ser vaciado y quedar en blanco antes de empezar la nueva implementación.
4.  **Crear Estructura Temática:** Dentro de `src`, crea subdirectorios que agrupen los archivos por su propósito (ej. `services`, `components`, `providers`, `store`, `config`).

**Estructura Final Ejemplo:**
```
libs/front/core/nueva-libreria/
└── src/
    ├── services/
    │   └── nueva-libreria.service.ts
    ├── providers/
    │   └── provide-nueva-libreria.ts
    └── index.ts
```

---

## Librerías de Estado (State)

### 1. Estado de Sesión Global

-   **Ruta Física:** `libs/front/state/session`
-   **Alias de Importación:** `@front/state/session`
-   **Propósito:** Manejar el estado global y reactivo de la sesión del usuario autenticado.
-   **Responsabilidades Clave:**
    -   Contener el `SessionSignalStore`.
    -   Orquestar la obtención del perfil de usuario y su lista de facilidades.
    -   Mantener la facilidad seleccionada actualmente.
-   **Comando de Creación:**
    ```bash
    npx nx g @nx/angular:library --name=session --directory=libs/front/state/session --standalone --importPath=@front/state/session
    ```
-   **Tags:** `type:state`, `scope:shared`

---

## Librerías de Acceso a Datos (Core)

### 1. Core: Perfil

-   **Ruta Física:** `libs/front/core/profile`
-   **Alias de Importación:** `@front/core/profile`
-   **Propósito:** Encapsular toda la comunicación con Firestore para la entidad `Profile`.
-   **Responsabilidades Clave:**
    -   Contener `ProfileService`.
    -   Métodos para obtener y actualizar documentos de la colección `profiles`.
-   **Comando de Creación:**
    ```bash
    npx nx g @nx/angular:library --name=profile --directory=libs/front/core/profile --standalone --importPath=@front/core/profile
    ```
-   **Tags:** `type:data-access`, `scope:shared`

### 2. Core: Facilidad

-   **Ruta Física:** `libs/front/core/facility`
-   **Alias de Importación:** `@front/core/facility` (o `@facility` como alias corto existente)
-   **Propósito:** Encapsular la comunicación con Firestore para la entidad `Facility` y sus miembros.
-   **Responsabilidades Clave:**
    -   Contener `FacilityService`.
    -   Obtener información de una facilidad y la lista de sus miembros.
-   **Comando de Creación:**
    ```bash
    npx nx g @nx/angular:library --name=facility --directory=libs/front/core/facility --standalone --importPath=@front/core/facility
    ```
-   **Tags:** `type:data-access`, `scope:shared`

### 3. Core: Roles

-   **Ruta Física:** `libs/front/core/roles`
-   **Alias de Importación:** `@front/core/roles`
-   **Propósito:** Manejar la lógica de datos para roles y permisos.
-   **Responsabilidades Clave:**
    -   Contener `RolesService`.
    -   CRUD para roles y permisos por facilidad.
-   **Comando de Creación:**
    ```bash
    npx nx g @nx/angular:library --name=roles --directory=libs/front/core/roles --standalone --importPath=@front/core/roles
    ```
-   **Tags:** `type:data-access`, `scope:admin`

### 4. Core: Servicios

-   **Ruta Física:** `libs/front/core/services`
-   **Alias de Importación:** `@front/core/services`
-   **Propósito:** Gestionar los datos de los servicios y sus horarios.
-   **Responsabilidades Clave:**
    -   Contener `ServicesService`.
    -   CRUD para servicios y sus horarios.
-   **Comando de Creación:**
    ```bash
    npx nx g @nx/angular:library --name=services --directory=libs/front/core/services --standalone --importPath=@front/core/services
    ```
-   **Tags:** `type:data-access`, `scope:admin`

---

## Librerías de Utilidades (Utils)

### 1. Utils: Logger

-   **Ruta Física:** `libs/front/utils/logger`
-   **Alias de Importación:** `@front/utils/logger`
-   **Propósito:** Proveer un servicio centralizado para el manejo de logs, con comportamiento diferenciado para entornos de desarrollo y producción.
-   **Responsabilidades Clave:**
    -   Proveer `LoggerService` para registrar mensajes (`log`, `info`, `warn`, `error`).
    -   Ser configurable a través de `provideLogger` para distinguir entre producción y desarrollo.
    -   En desarrollo, usar la `console` del navegador.
    -   En producción, preparar la estructura para enviar logs a un servicio externo.
-   **Comando de Creación:**
    ```bash
    npx nx g @nx/angular:library --name=logger --directory=libs/front/utils/logger --standalone --importPath=@front/utils/logger
    ```
-   **Tags:** `type:utils`, `scope:shared`

---

## Librerías de Features (Admin App)

### 1. Feature: Gestión de Facilidad

-   **Ruta Física:** `libs/front/admin/feature/facility-management`
-   **Alias de Importación:** `@admin/feature/facility-management`
-   **Propósito:** Manejar el estado local de las páginas de administración de miembros.
-   **Responsabilidades Clave:**
    -   Contener `FacilityManagementStore` (provisto a nivel de componente/ruta).
-   **Comando de Creación:**
    ```bash
    npx nx g @nx/angular:library --name=facility-management --directory=libs/front/admin/feature/facility-management --standalone --importPath=@admin/feature/facility-management
    ```
-   **Tags:** `type:feature`, `scope:admin`

### 2. Feature: Gestión de Roles

-   **Ruta Física:** `libs/front/admin/feature/roles-management`
-   **Alias de Importación:** `@admin/feature/roles-management`
-   **Propósito:** Manejar el estado de la UI para la creación y edición de roles.
-   **Responsabilidades Clave:**
    -   Contener un `RolesManagementStore` local.
-   **Comando de Creación:**
    ```bash
    npx nx g @nx/angular:library --name=roles-management --directory=libs/front/admin/feature/roles-management --standalone --importPath=@admin/feature/roles-management
    ```
-   **Tags:** `type:feature`, `scope:admin`

### 3. Feature: Gestión de Servicios

-   **Ruta Física:** `libs/front/admin/feature/services-management`
-   **Alias de Importación:** `@admin/feature/services-management`
-   **Propósito:** Manejar el estado de la UI para la gestión de servicios y horarios.
-   **Responsabilidades Clave:**
    -   Contener un `ServicesManagementStore` local.
-   **Comando de Creación:**
    ```bash
    npx nx g @nx/angular:library --name=services-management --directory=libs/front/admin/feature/services-management --standalone --importPath=@admin/feature/services-management
    ```
-   **Tags:** `type:feature`, `scope:admin`
