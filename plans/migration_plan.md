# Plan de Migracion: Admin Angular -> React

## Contexto

La app admin actual esta construida con Angular 20 + NgRx Signals + Firebase (Auth, Firestore, Functions) + Angular Material + TailwindCSS dentro de un monorepo Nx. Se necesita crear una nueva app admin en React que replique toda la funcionalidad existente, permitiendo una migracion gradual por features mientras ambas apps coexisten.

**Stack nuevo:** React 19 + Zustand + React Hook Form + Zod + shadcn/ui (Radix + Tailwind) + Firebase JS SDK directo.

**Estrategia:** La nueva app `apps/admin-react/` vivira junto a `apps/admin/` en el mismo monorepo Nx. La libreria `libs/models/` (interfaces/enums TS puros) se comparte directamente sin cambios.

---

## Fase 0: Scaffold y Foundation del Monorepo

### Que se hace
- Crear app React con Vite via Nx generator (`@nx/react`)
- Configurar TailwindCSS 4, shadcn/ui (`components.json`), PostCSS
- Configurar Firebase (auth, firestore, functions, emulators) como modulos TS planos
- Extraer utilidades puras (time utils) a `libs/shared/utils/` para compartir entre apps
- Agregar path aliases en `tsconfig.base.json` para la nueva app
- Instalar dependencias: `react`, `react-router`, `zustand`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`

### Estructura de archivos
```
apps/admin-react/
  src/
    main.tsx
    app.tsx
    routes.tsx
    environments/
      environment.ts              # Misma config Firebase que Angular
      environment.development.ts
    lib/
      firebase/
        config.ts                 # initializeApp + emulators
        auth.ts                   # getAuth() export
        firestore.ts              # getFirestore() export
        functions.ts              # getFunctions() export
      hooks/
        use-auth-state.ts         # onAuthStateChanged wrapper
      stores/
        session.store.ts          # Zustand: profile, facilities
        layout.store.ts           # Zustand: sidebar, menu
      services/
        profile.service.ts        # getDoc() async/await
        facility.service.ts       # getDocs() async/await
      utils/
        logger.ts
        cn.ts                     # clsx + tailwind-merge
    features/                     # Vacio inicialmente
    components/
      ui/                         # shadcn/ui generados
      layout/                     # Layout, Sidebar, Header
  components.json                 # shadcn/ui config
  vite.config.ts
  project.json
```

### Archivos clave a modificar
- `/tsconfig.base.json` - agregar aliases `@shared/utils`
- `/package.json` - agregar dependencias React
- `/nx.json` - no necesita cambios (Nx auto-detecta)

### Verificacion
- `nx serve admin` sigue funcionando (Angular intacto)
- `nx serve admin-react` levanta Vite dev server
- Firebase inicializa sin errores en consola
- Imports de `@models/*` resuelven desde ambas apps

---

## Fase 1: Autenticacion + Sesion + Layout

### Que se hace
Construir login, session management global, layout con sidebar, y routing base. Es el prerequisito para todo lo demas.

### Componentes Angular -> React

| Angular | React |
|---------|-------|
| `app.component.ts` (auth subscribe + menu setup) | `app.tsx` + `use-auth-state.ts` hook |
| `SessionSignalStore` (`libs/front/state/session/`) | `stores/session.store.ts` (Zustand) |
| `LayoutStore` (`libs/front/ui/marco/layout/`) | `stores/layout.store.ts` (Zustand) |
| `LayoutComponent` + template | `components/layout/layout.tsx` |
| `SidebarComponent` | `components/layout/sidebar.tsx` |
| `UiHeaderComponent` | `components/layout/header.tsx` |
| `MenuSectionComponent` | `components/layout/menu-section.tsx` |
| `MenuItemLinkComponent` | `components/layout/menu-item-link.tsx` |
| `SubMenuContainerComponent` | `components/layout/sub-menu-container.tsx` |
| `LoginComponent` (`pages/login/`) | `features/login/login-page.tsx` |
| `app.routes.ts` | `routes.tsx` con React Router |

### Mapeo de patrones

| Angular | React |
|---------|-------|
| `user(this.auth).subscribe()` | `onAuthStateChanged` en `useEffect` |
| `rxMethod<string>(pipe(switchMap(...)))` | `async/await` en Zustand action |
| `BreakpointObserver` (CDK) | `useMediaQuery` custom hook o CSS-only |
| `MatSidenav` | Sidebar custom con Tailwind `translate-x` + `transition` |
| Angular Animations (`@trigger`) | CSS `transition-all duration-300` |
| `router-outlet` | `<Outlet />` de react-router |
| `inject(Auth)` | Import directo de `lib/firebase/auth.ts` |
| Lazy `loadChildren` | `React.lazy()` + `<Suspense>` |

### Session Store (Zustand)
```ts
// Estado identico al Angular SessionSignalStore
interface SessionState {
  profile: ProfileModel | null
  facilities: FacilityModel[]
  selectedFacility: FacilityModel | null
  loading: boolean
  error: { profileError: unknown; facilityError: unknown } | null
}
// initAsEmployer: async (userId) => Promise.all([getProfile, getFacilities])
```

### Auth Guard
Componente wrapper que verifica auth state. Sin user -> redirect a `/login`. Loading -> spinner. Autenticado -> render children.

### Iconos
Angular usa Material Icons (strings). React usara `lucide-react`. Mapeo:
- `home` -> `Home`, `group` -> `Users`, `lock` -> `Lock`, `fitness_center` -> `Dumbbell`, `card_membership` -> `CreditCard`, `bar_chart` -> `BarChart`

### shadcn/ui components necesarios
`button`, `input`, `card`, `label`

### Verificacion
- Login form valida y muestra errores en espanol
- Login exitoso redirige a `/home/users`
- Sidebar renderiza menu items correctamente
- Sidebar colapsa/expande en desktop, hamburger en mobile
- Logo se muestra en sidebar
- Session store tiene profile y facilities
- Logout redirige a `/login`

---

## Fase 2: Usuarios/Empleados (Feature CRUD simple)

### Que se hace
Migrar el modulo mas simple para establecer el patron que seguiran todos los demas features.

### Estructura React
```
features/users/
  users-routes.tsx
  stores/users.store.ts
  services/
    employee.service.ts          # httpsCallable para create/delete
    roles.service.ts             # Firestore CRUD (compartido con permissions)
  pages/
    users-list.tsx
    users-create.tsx
    users-edit.tsx
```

### Componentes Angular -> React

| Angular | React |
|---------|-------|
| `UsersListComponent` (CDK Table) | `users-list.tsx` con shadcn `<Table>` |
| `UsersCreateComponent` (Reactive Form) | `users-create.tsx` con React Hook Form + Zod |
| `UsersEditComponent` (Reactive Form + MatDialog) | `users-edit.tsx` con RHF + shadcn `AlertDialog` |
| `UsersStore` (NgRx Signals) | `users.store.ts` (Zustand) |
| `EmployeeService` (inject + httpsCallable) | `employee.service.ts` (import directo) |
| `RolesService` (inject + Firestore) | `roles.service.ts` (import directo) |

### Mapeo de patrones clave

**Servicios:** Angular usa `inject(Firestore)` + `collectionData()` (RxJS). React usa `getDocs()`/`getDoc()` con `async/await` importando de `firebase/firestore` directamente. Cloud Functions se llaman igual: `httpsCallable(functions, 'createEmployee')`.

**Store:** Angular `UsersStore` usa `rxMethod` + `pipe`. React Zustand usa `async` methods directos:
```ts
loadEmployees: async (facilityId) => {
  set({ isLoading: true })
  const employees = await employeeService.getEmployees(facilityId)
  set({ employees, isLoading: false })
}
```

**Computed:** Angular `employeesWithRoles` es `withComputed`. Zustand: funcion selector derivada.

**Forms:** Angular `FormBuilder.group({name: [null, Validators.required]})` -> Zod schema + `useForm`:
```ts
const schema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  roleId: z.string().min(1),
  userType: z.string().min(1),
})
```

**Confirm Dialog:** Angular `MatDialog.open(ConfirmComponent)` -> shadcn `<AlertDialog>` declarativo.

### shadcn/ui components necesarios
`table`, `select`, `alert-dialog`, `badge`

### Verificacion
- Lista muestra empleados con sus roles
- Crear empleado valida form y llama Cloud Function
- Editar pre-popula form y guarda cambios
- Eliminar muestra confirm dialog y ejecuta via Cloud Function
- Estados de loading y error funcionan correctamente

---

## Fase 3: Permisos/Roles (Matriz de permisos)

### Que se hace
Migrar gestion de roles, que introduce el patron de matriz de checkboxes (sections x actions).

### Estructura React
```
features/permissions/
  permissions-routes.tsx
  stores/permissions.store.ts
  pages/
    permissions-list.tsx
    permissions-create.tsx
    permissions-edit.tsx
  components/
    permissions-matrix.tsx       # Grid sections x actions (checkboxes)
```

### Componentes Angular -> React

| Angular | React |
|---------|-------|
| `PermissionsListComponent` | `permissions-list.tsx` (tabla con badges por seccion) |
| `PermissionsCreateComponent` | `permissions-create.tsx` (nombre + matriz) |
| `PermissionsEditComponent` | `permissions-edit.tsx` (igual + delete) |
| `permissionsStore` | `permissions.store.ts` (Zustand) |

### Componente clave: Permissions Matrix
Tabla/grid reutilizable. Filas = `PermissionSection` (roles, employees, services, programming). Columnas = `PermissionAction` (create, read, update, delete). Celdas = shadcn `<Checkbox>`.

El store maneja un array `UiPermission[]` con metodos `addPermission(action, section)` y `removePermission(index)`. Al guardar, convierte array -> `PermissionsBySection` map para Firestore.

**Reutiliza** `roles.service.ts` de Fase 2.

### shadcn/ui components necesarios
`checkbox`

### Verificacion
- Lista muestra roles con badges de permisos agrupados por seccion
- Crear rol con matriz de permisos funciona
- Editar carga permisos existentes en la matriz
- Toggle permisos on/off funciona
- Delete rol con confirm dialog funciona

---

## Fase 4: Planes (Forms anidados + multiples stores)

### Que se hace
Migrar planes, que introduce forms anidados (equivalente FormArray) y stores por pagina.

### Estructura React
```
features/plans/
  plans-routes.tsx
  stores/
    plans-list.store.ts
    plans-create.store.ts
    plans-detail.store.ts
    plans-edit.store.ts
  services/plans.service.ts
  pages/
    plans-list.tsx
    plans-create.tsx
    plans-detail.tsx
    plans-edit.tsx
  components/
    plan-service-form.tsx        # Form anidado para cada servicio
  schemas/plan.schema.ts         # Zod schemas
```

### Mapeo de patrones clave

**FormArray -> useFieldArray:** Angular usa `FormArray` con `FormGroup` children. React Hook Form usa `useFieldArray`:
```tsx
const { fields, append, remove } = useFieldArray({ control, name: 'services' })
// Cada field renderiza <PlanServiceForm index={i} ... />
```

**Validacion dinamica:** Angular habilita/deshabilita `days` segun `duration.type`. React usa `watch()` + renderizado condicional:
```tsx
const durationType = watch('duration.type')
// Si CUSTOM, muestra input days con validacion required
```

**Stores por pagina:** Angular usa `providers: [PlansCreateStore]` a nivel componente. React: crear store con `useMemo(() => createPlansCreateStore(), [])` y cleanup en unmount.

**Zod schema:**
```ts
const planSchema = z.object({
  name: z.string().min(1),
  cost: z.number().min(0),
  description: z.string().default(''),
  duration: z.object({
    type: z.nativeEnum(PlanDuration),
    days: z.number().nullable(),
  }),
  services: z.array(z.object({
    serviceId: z.string().min(1),
    classLimitType: z.nativeEnum(ClassLimitType),
    classLimit: z.number().nullable(),
  })).min(1),
})
```

### shadcn/ui components necesarios
`switch`, `separator`

### Verificacion
- Lista muestra planes con nombre, costo, estado
- Crear plan con array dinamico de servicios funciona
- Add/remove servicios en form anidado funciona
- Toggle classLimitType muestra/oculta input de limite
- Toggle durationType muestra/oculta input de dias
- Detail muestra info del plan y servicios incluidos
- Editar carga datos existentes incluyendo array de servicios

---

## Fase 5: Servicios + Programacion de Clases (mas complejo)

### Que se hace
Migrar el feature mas complejo: CRUD de servicios, gestion de horarios con deteccion de conflictos, calendario semanal, y wizard de 3 pasos para programar clases.

### Estructura React
```
features/services/
  services-routes.tsx
  stores/
    services.store.ts
    schedules.store.ts           # 346 lineas Angular - deteccion conflictos
    programming.store.ts         # 496 lineas Angular - wizard 3 pasos
  services/
    services.service.ts
    schedules.service.ts
    classes.service.ts
  pages/
    services-list.tsx
    services-create.tsx
    services-edit.tsx
    services-detail.tsx
    services-program-classes.tsx  # Wizard 3 pasos
  components/
    schedule-form.tsx
    schedule-edit-modal.tsx
    week-calendar.tsx
    class-week-calendar.tsx
    day-selector.tsx
    switch-selector.tsx
    step-indicator.tsx
    program-information.tsx      # Paso 1
    program-description.tsx      # Paso 2 (rich text editor)
    coach-assignment.tsx         # Paso 3
  utils/
    calendar-utilities.ts        # calculatePosition, getTimeRange, groupSlotsByDate
    schedule-conflict.ts         # checkConflicts, schedulesOverlap, generateTimeSlots
  schemas/
    service.schema.ts
    schedule.schema.ts
```

### Sub-fase 5a: Lista + CRUD basico de servicios

| Angular | React |
|---------|-------|
| `ServicesListComponent` | `services-list.tsx` |
| `ServicesCreateComponent` | `services-create.tsx` |
| `ServicesEditComponent` | `services-edit.tsx` |
| `ServicesDetailComponent` | `services-detail.tsx` |
| `ServicesStore` | `services.store.ts` |
| `ServicesService` | `services.service.ts` |

### Sub-fase 5b: Horarios + Calendario semanal

| Angular | React |
|---------|-------|
| `ScheduleFormComponent` (form dinamico single/multiple) | `schedule-form.tsx` (RHF + Zod refine) |
| `ScheduleEditModalComponent` (MatDialog) | `schedule-edit-modal.tsx` (shadcn Dialog) |
| `SchedulesStore` (conflict detection, Sets tracking) | `schedules.store.ts` (Zustand) |
| `SchedulesService` | `schedules.service.ts` |
| `WeekCalendarComponent` (computed positions) | `week-calendar.tsx` (useMemo) |
| `DaySelectorComponent` (ControlValueAccessor) | `day-selector.tsx` (controlled + RHF Controller) |
| `SwitchSelectorComponent` | `switch-selector.tsx` o shadcn Tabs |
| Calendar utilities (position calc, time range) | `utils/calendar-utilities.ts` |

**Funciones puras a extraer** (son framework-agnostic, copiar directo):
- `generateTimeSlots(start, end, duration)` - genera array de strings "HH:MM"
- `checkScheduleConflicts(existing, new)` - detecta solapamientos
- `schedulesOverlap(s1, s2)` - compara dia + rango horario
- `createSingleSchedule(data)` / `createMultipleSchedules(data)`
- `calculateOverlappingPositions()`, `getTimeRangeFromSlots()`, `groupSlotsByDate()`

**SchedulesStore** es el mas complejo. Estado incluye `Set<string>` para tracking de cambios locales (new/update/delete) y computa `calendarSlots` derivados. El metodo `saveListSchedules` hace batch save de todos los cambios pendientes.

### Sub-fase 5c: Wizard de programacion de clases (3 pasos)

| Angular | React |
|---------|-------|
| `ServicesProgramClassesComponent` | `services-program-classes.tsx` |
| `ProgrammingStore` (496 lineas, 20+ methods) | `programming.store.ts` (Zustand) |
| `StepIndicatorComponent` | `step-indicator.tsx` |
| `ProgramInformationComponent` (Step 1) | `program-information.tsx` |
| `ProgramDescriptionComponent` (Step 2, ngx-editor) | `program-description.tsx` (TipTap) |
| `CoachAssignmentComponent` (Step 3) | `coach-assignment.tsx` |
| `ClassWeekCalendarComponent` | `class-week-calendar.tsx` |
| `DateWeekCalendarComponent` | `date-week-calendar.tsx` (not standard calendar) |
| `ClassesService` | `classes.service.ts` |

**Rich Text Editor:** Angular usa `ngx-editor` (wrapper de ProseMirror). React usa TipTap directamente (`@tiptap/react` + `@tiptap/starter-kit`). Localizar toolbar al espanol.

**ProgrammingStore** maneja maquina de estados del wizard:
- `currentStep` (1-3), `programs: ProgramDraft[]`, `editingProgramId`
- Computed: `confirmedPrograms`, `activeProgram`, `canProceedToStep2`
- Methods: `createProgram`, `confirmProgram`, `editProgram`, `deleteProgram`
- Step 2: `updateProgramDescription`
- Step 3: `setProgramCoachAssignment`, `assignSameCoachToProgram`
- Final: `generateClassesFromPrograms` -> `saveProgramClasses` (batch create en Firestore)

### shadcn/ui components necesarios
`dialog`, `tabs`, `tooltip`

### Verificacion
- CRUD servicios funciona
- Schedule form single/multiple funciona
- Deteccion de conflictos muestra errores apropiados
- Calendario semanal renderiza slots correctamente (posicion, duracion, labels)
- Eliminar schedule desde calendario funciona
- Edit service carga horarios existentes
- Modal de edicion de schedule funciona
- Detail muestra clases programadas en calendario
- Wizard Paso 1: crear programas, seleccionar slots, confirmar
- Wizard Paso 2: agregar descripciones con editor rich text
- Wizard Paso 3: asignar coaches a slots
- Guardar programacion crea clases en Firestore

---

## Fase 6: Polish y Cutover

### Que se hace
- Error Boundary global en React (`<ErrorBoundary>` en app root)
- Locale `es-ES` en `<html lang="es">`
- Portar estilos globales de `libs/assets/styles/` (eliminar los especificos de Angular Material)
- Testing: correr ambas apps contra los mismos Firebase emulators, verificar que producen datos identicos en Firestore
- Lazy loading verificado en todas las rutas (`React.lazy` + `Suspense`)
- Actualizar `firebase.json` para apuntar al build de React
- Deploy a staging, regression test completo
- Switch produccion a React

### Cleanup post-cutover
- Eliminar `apps/admin/`
- Eliminar `libs/front/` (core, state, ui, supabase)
- Eliminar dependencias Angular de `package.json` (`@angular/*`, `@ngrx/*`, `rxjs`, `ngx-editor`, `@angular/fire`)
- Mantener `libs/models/` y `libs/assets/`

---

## Resumen de Fases

| Fase | Feature | Complejidad | Archivos React nuevos (aprox) |
|------|---------|-------------|-------------------------------|
| 0 | Scaffold + Firebase config | Media | ~15 |
| 1 | Auth + Session + Layout | Media-Alta | ~15 |
| 2 | Usuarios/Empleados | Baja-Media | ~8 |
| 3 | Permisos/Roles | Baja-Media | ~7 |
| 4 | Planes | Media | ~12 |
| 5 | Servicios + Programacion | Alta | ~25+ |
| 6 | Polish + Cutover | Baja | ~3 |

## Decisiones Arquitectonicas

1. **Servicios colocados por feature**, excepto los compartidos (`roles.service.ts` usado por users Y permissions) que van en `lib/services/`
2. **Stores globales** (session, layout) se crean una vez. **Stores de feature** se crean por pagina con cleanup en unmount
3. **Data fetching:** `async/await` directo desde Zustand (sin React Query por ahora - el CRUD simple no lo justifica)
4. **Iconos:** `lucide-react` en lugar de Material Icons
5. **CSS:** Solo Tailwind utility classes en JSX, sin archivos SCSS
6. **Rich text:** TipTap directo (`@tiptap/react`) en lugar de wrapper
