# Arquitectura de Librerías Frontend

Este documento define la estructura de librerías recomendada para el frontend. Para cada librería se especifica su ruta física relativa a la raíz del proyecto y el alias de TypeScript que se debe configurar en `tsconfig.base.json` para su importación.

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
-   **Tags:** `type:data-access`, `scope:shared`

### 2. Core: Facilidad

-   **Ruta Física:** `libs/front/core/facility`
-   **Alias de Importación:** `@front/core/facility` (o `@facility` como alias corto existente)
-   **Propósito:** Encapsular la comunicación con Firestore para la entidad `Facility` y sus miembros.
-   **Responsabilidades Clave:**
    -   Contener `FacilityService`.
    -   Obtener información de una facilidad y la lista de sus miembros.
-   **Tags:** `type:data-access`, `scope:shared`

### 3. Core: Roles

-   **Ruta Física:** `libs/front/core/roles`
-   **Alias de Importación:** `@front/core/roles`
-   **Propósito:** Manejar la lógica de datos para roles y permisos.
-   **Responsabilidades Clave:**
    -   Contener `RolesService`.
    -   CRUD para roles y permisos por facilidad.
-   **Tags:** `type:data-access`, `scope:admin`

### 4. Core: Servicios

-   **Ruta Física:** `libs/front/core/services`
-   **Alias de Importación:** `@front/core/services`
-   **Propósito:** Gestionar los datos de los servicios y sus horarios.
-   **Responsabilidades Clave:**
    -   Contener `ServicesService`.
    -   CRUD para servicios y sus horarios.
-   **Tags:** `type:data-access`, `scope:admin`

---

## Librerías de Features (Admin App)

### 1. Feature: Gestión de Facilidad

-   **Ruta Física:** `libs/front/admin/feature/facility-management`
-   **Alias de Importación:** `@admin/feature/facility-management`
-   **Propósito:** Manejar el estado local de las páginas de administración de miembros.
-   **Responsabilidades Clave:**
    -   Contener `FacilityManagementStore` (provisto a nivel de componente/ruta).
-   **Tags:** `type:feature`, `scope:admin`

### 2. Feature: Gestión de Roles

-   **Ruta Física:** `libs/front/admin/feature/roles-management`
-   **Alias de Importación:** `@admin/feature/roles-management`
-   **Propósito:** Manejar el estado de la UI para la creación y edición de roles.
-   **Responsabilidades Clave:**
    -   Contener un `RolesManagementStore` local.
-   **Tags:** `type:feature`, `scope:admin`

### 3. Feature: Gestión de Servicios

-   **Ruta Física:** `libs/front/admin/feature/services-management`
-   **Alias de Importación:** `@admin/feature/services-management`
-   **Propósito:** Manejar el estado de la UI para la gestión de servicios y horarios.
-   **Responsabilidades Clave:**
    -   Contener un `ServicesManagementStore` local.
-   **Tags:** `type:feature`, `scope:admin`
