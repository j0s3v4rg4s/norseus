# Plan de Acción: Sección de Gestión de Usuarios

Este documento describe el plan para crear la sección de gestión de usuarios en la aplicación de administración, siguiendo la arquitectura existente de la sección de permisos.

## 1. Estructura de Archivos

Se creará la siguiente estructura de directorios y archivos dentro de `apps/admin/src/app/pages/users`:

```
users/
├── users-create/
│   ├── users-create.component.html
│   ├── users-create.component.scss
│   └── users-create.component.ts
├── users-edit/
│   ├── users-edit.component.html
│   ├── users-edit.component.scss
│   └── users-edit.component.ts
├── users-list/
│   ├── users-list.component.html
│   ├── users-list.component.scss
│   └── users-list.component.ts
├── users.routes.ts
└── users.store.ts
```

## 2. Store de Usuarios (`users.store.ts`)

El store manejará todo el estado y la lógica de negocio para los usuarios.

### Estado (`userState`)

-   `isLoading: boolean`: Indica si hay una operación en curso (ej. cargando usuarios).
-   `errorMessage: string`: Almacena mensajes de error para mostrar en la UI.
-   `statusSaveMessage: string`: Mensajes de estado para operaciones de guardado (crear/editar).
-   `users: UserProfile[]`: Un arreglo de perfiles de usuario. `UserProfile` será una interfaz que combine datos de `profile` y `role`.
-   `user: UserProfile | null`: El usuario actualmente seleccionado para edición.
-   `roles: Role[]`: Lista de roles disponibles en la facility para poblar los selectores.

### Métodos

-   `loadUsers(facilityId: string)`:
    -   Establece `isLoading` a `true`.
    -   Obtiene los perfiles de usuario (`profile`) asociados a `facilityId` a través de la tabla `facility_user`.
    -   Hace un join con la tabla `role` para obtener el nombre del rol de cada usuario.
    -   La consulta a Supabase sería algo como: `supabase.from('facility_user').select('profile(*, role(*))').eq('facility_id', facilityId)`.
    -   Actualiza el estado con los usuarios cargados.
    -   Maneja errores y actualiza `errorMessage`.
-   `loadUser(userId: string)`:
    -   Carga los detalles de un único usuario para la página de edición.
    -   Consulta: `supabase.from('profile').select('*, role(*)').eq('id', userId).single()`.
    -   Actualiza `user` en el estado.
-   `loadRoles(facilityId: string)`:
    -   Carga todos los roles asociados a la `facilityId` actual.
    -   Consulta: `supabase.from('role').select('*').eq('facility_id', facilityId)`.
    -   Actualiza `roles` en el estado.
-   `createUser(userData: CreateUserPayload)`:
    -   `CreateUserPayload` contendrá: `email`, `password`, `name`, `role_id`.
    -   Invoca la Edge Function de Supabase `createUser` para crear el usuario en `auth.users` y obtener su `id`.
    -   La Edge Function debería devolver el `id` del nuevo usuario.
    -   Con el `id`, actualiza la tabla `profile` con el `name` y `role_id`.
    -   Asocia el nuevo usuario a la facility actual en la tabla `facility_user`.
    -   Maneja el estado `isLoading` y `statusSaveMessage`.
    -   Devuelve `true` en caso de éxito, `false` en caso de error.
-   `updateUser(userId: string, userData: UpdateUserPayload)`:
    -   `UpdateUserPayload` contendrá: `name`, `role_id`.
    -   Actualiza la tabla `profile` para el `userId` dado.
    -   Consulta: `supabase.from('profile').update({ name: userData.name, role_id: userData.role_id }).eq('id', userId)`.
    -   Maneja `isLoading` y `statusSaveMessage`.
    -   Devuelve `true`/`false`.
-   `deleteUser(userId: string)`:
    -   Elimina el usuario. Esto puede ser complejo. Por ahora, se enfocará en eliminar el registro de `profile` y `facility_user`. La eliminación de `auth.users` se podría hacer con una función de base de datos o una Edge Function que se llame `delete_user_by_id`.
    -   Invoca RPC a Supabase para eliminar al usuario.
    -   Maneja `isLoading` y `statusSaveMessage`.
    -   Devuelve `true`/`false`.

## 3. Componentes de la UI

### `users-list.component`

-   **UI:**
    -   Título: "Usuarios".
    -   Botón "Crear Usuario" que navega a `/home/users/create`.
    -   Tabla con columnas:
        -   `Nombre`: `user.name`
        -   `Rol`: `user.role.name`
        -   `Acciones`: Un botón de "ver/editar" con un ícono (`visibility`) que navega a `/home/users/:id/edit`.
    -   Muestra un spinner (`pk-spinner`) mientras `store.isLoading()` sea `true`.
    -   Muestra un mensaje de error si `store.errorMessage()` tiene un valor.
-   **Lógica:**
    -   Inyecta `usersStore` y `ProfileSignalStore`.
    -   Usa un `effect` para llamar a `store.loadUsers(facilityId)` cuando `facilityId` del `profileStore` esté disponible.
    -   La fuente de datos de la tabla será `store.users()`.

### `users-create.component`

-   **UI:**
    -   Título: "Crear Nuevo Usuario".
    -   Formulario reactivo con los siguientes campos:
        -   `name`: `input` de texto, requerido.
        -   `email`: `input` de email, requerido y con validación de email.
        -   `password`: `input` de password, requerido, longitud mínima.
        -   `role_id`: `pk-select` poblado con los roles de `store.roles()`. Requerido.
    -   Botones "Guardar" y "Cancelar". El botón "Guardar" se deshabilita si el formulario es inválido y muestra un estado de carga.
    -   Muestra mensajes de error/éxito del `store.statusSaveMessage()`.
-   **Lógica:**
    -   Inyecta `usersStore` y `ProfileSignalStore`.
    -   En `ngOnInit` o un `effect`, llama a `store.loadRoles(facilityId)`.
    -   El método `saveUser` valida el formulario y llama a `store.createUser(formData)`.
    -   Si la creación es exitosa, navega a la lista de usuarios.

### `users-edit.component`

-   **UI:**
    -   Título: "Editar Usuario".
    -   Formulario reactivo con:
        -   `name`: `input` de texto.
        -   `email`: `input` de texto, deshabilitado (no se puede cambiar).
        -   `role_id`: `pk-select` con los roles.
    -   Botones "Guardar Cambios", "Cancelar" y "Eliminar Usuario".
    -   El botón "Eliminar Usuario" abrirá un modal de confirmación (`ConfirmComponent`).
-   **Lógica:**
    -   Obtiene el `id` del usuario de la ruta (`ActivatedRoute`).
    -   Llama a `store.loadUser(id)` y `store.loadRoles(facilityId)`.
    -   Usa un `effect` para rellenar el formulario cuando `store.user()` tenga datos.
    -   El método `saveUser` llama a `store.updateUser(id, formData)`.
    -   El método `deleteUser` llama a `store.deleteUser(id)` después de la confirmación.
    -   Navega a la lista al guardar o eliminar con éxito.

## 4. Enrutamiento

Se creará `users.routes.ts` para definir las rutas hijas de `/users`:

```typescript
import { Route } from '@angular/router';
import { UsersListComponent } from './users-list/users-list.component';
import { UsersCreateComponent } from './users-create/users-create.component';
import { UsersEditComponent } from './users-edit/users-edit.component';

export const USERS_ROUTES: Route[] = [
  { path: '', component: UsersListComponent },
  { path: 'create', component: UsersCreateComponent },
  { path: ':id/edit', component: UsersEditComponent },
];
```

Estas rutas se registrarán de forma perezosa en `app.routes.ts` bajo el path `home/users`.

Se añadirá un nuevo item de navegación en `layout.component.html` para enlazar a `/home/users`, con el texto "Usuarios" y un ícono apropiado como `group`.

```html
<app-nav-item
  [icon]="'group'"
  [label]="'Usuarios'"
  [route]="'/home/users'"
></app-nav-item>
``` 
