# Norseus Project - AI Agent Guidelines

## Project Overview

Norseus is a modern enterprise application built with **React 19** and **Nx monorepo** architecture. The project implements a comprehensive facility management system with role-based access control (RBAC), user management, employee management, service scheduling, and class programming. It uses **Firebase** for backend services and **Tailwind CSS v4** with **shadcn/ui** for the user interface.

## Architecture

### Technology Stack

- **Frontend**: React 19 with functional components and hooks
- **Router**: React Router v7 (SPA mode, no SSR)
- **Monorepo**: Nx 21.3.9 with pnpm package manager
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth, Firestore, Cloud Functions, Storage)
- **Database**: Firebase Firestore
- **State Management**: Zustand for global state, `useState` for local state
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind) via `libs/front/cn/`
- **Forms**: React Hook Form + Zod for validation
- **Toast Notifications**: Sileo (the only allowed toast library)
- **Rich Text Editor**: Tiptap
- **Icons**: Lucide React

### Project Structure

```
norseus/
├── apps/
│   ├── admin-react/      # React 19 application (React Router v7, SPA mode)
│   └── functions/        # Firebase Cloud Functions
├── libs/
│   ├── front/
│   │   ├── cn/           # shadcn/ui components & utilities (28 components)
│   │   ├── employees/    # Employee domain services (pure functions)
│   │   ├── facility/     # Facility domain services (pure functions)
│   │   ├── roles/        # Roles domain services (pure functions)
│   │   ├── services/     # Services/schedules/classes/plans domain services (pure functions)
│   │   └── ui-react/     # Shared React components (DaySelector, WeekCalendar, etc.)
│   ├── models/           # Shared TypeScript models (front + back)
│   └── assets/           # Global styles
├── components.json       # shadcn/ui configuration
├── tsconfig.base.json    # TypeScript path aliases
└── nx.json              # Nx workspace configuration
```

## Development Standards

### TypeScript Best Practices

- **Strict Type Checking**: Use strict type checking configuration
- **Type Inference**: Prefer type inference when the type is obvious
- **Avoid `any` Type**: Avoid the `any` type; use `unknown` when type is uncertain
- **Type Safety**: Ensure proper TypeScript typing with interfaces and models from `@models/*`

### React 19 Best Practices

#### Component Architecture

- **Functional Components**: All components are functional components using hooks
- **Single Responsibility**: Keep components small and focused on a single responsibility
- **File Structure**: Separate `.tsx` files for components
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Props Typing**: Use TypeScript interfaces for props

#### Component File Structure

**CRITICAL**: Every React component MUST have its corresponding `index.ts` file for proper module organization and clean imports.

##### Standard Component Structure

```
component-name/
├── component-name.tsx
└── index.ts                    # REQUIRED - Export file
```

##### Index.ts File Requirements

- **Purpose**: Centralizes exports for clean import statements
- **Location**: Must be placed in the same directory as the component file
- **Content**: Export the main component and any related types/interfaces
- **Naming**: Always named `index.ts` (lowercase)

##### Import Benefits

- **Clean Imports**: Enables `import { ComponentName } from './component-name'` instead of `import { ComponentName } from './component-name.tsx'`
- **Module Organization**: Essential for proper library structure in Nx monorepo
- **Tree Shaking**: Improves bundle optimization
- **Consistency**: Maintains uniform import patterns across the project

##### Library-Level Index Files

Each library should have a main `index.ts` that exports all public components:

```typescript
// libs/front/ui-react/src/index.ts
export * from './day-selector';
export * from './week-calendar';
export * from './date-week-calendar';
// ... other components
```

##### AI Agent Guidelines for Index Files

1. **Always Create**: Never create a component without its `index.ts` file
2. **Export Everything**: Export the main component and any related types/interfaces
3. **Update Parent**: When adding new components, update the parent library's `index.ts`
4. **Type Exports**: Export TypeScript interfaces and types used by the component
5. **Clean Structure**: Keep exports organized and well-documented

##### Common Mistakes to Avoid

- ❌ Creating components without `index.ts` files
- ❌ Forgetting to update parent `index.ts` files when adding new components
- ❌ Not exporting related types and interfaces

#### React Hooks and State

- **useState**: For local component state
- **useEffect**: For side effects (API calls, subscriptions)
- **useMemo**: For expensive computations
- **useCallback**: For memoized callbacks
- **Custom Hooks**: Extract reusable stateful logic

#### Naming Conventions

- **Files**: `feature-name.tsx` pattern (e.g., `user-profile.tsx`)
- **Components**: PascalCase with descriptive names (e.g., `UserProfile`)
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Interfaces/Types**: PascalCase with descriptive names (e.g., `UserProfileProps`)

#### Comment Standards

- **No Inline Comments**: Do NOT add inline comments (`//` or `/* */`) in any files
- **JSDoc Only**: The ONLY comments allowed are JSDoc comments (`/** */`) in `.ts` and `.tsx` files
- **JSDoc Purpose**: Use JSDoc for documenting functions, components, interfaces, and public APIs
- **Clean Code**: Write self-documenting code with clear variable and function names instead of relying on comments
- **Documentation**: For complex logic, prefer clear code structure and meaningful names over explanatory comments

### Styling Guidelines

#### Priority Order

1. **Primary**: shadcn/ui components from `@front/cn/components`
2. **Secondary**: Standard HTML with Tailwind CSS v4 utility classes
3. **Fallback**: Custom CSS modules when Tailwind is insufficient

#### Tailwind CSS v4 Usage

- Use utility classes for styling
- Follow responsive design principles with Tailwind breakpoints
- Maintain consistent spacing and typography using Tailwind scales
- Use `cn()` utility from `@front/cn/utils` for conditional class merging
- Ensure accessibility standards (ARIA labels, semantic HTML)

### shadcn/ui Components

The project uses **shadcn/ui** for its UI component library. Components are stored in `libs/front/cn/` and shared across the React app via path aliases.

#### Available Components (28 total)

AlertDialog, Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, Collapsible, DropdownMenu, Empty, Field, Input, Label, Select, Separator, Sheet, Sidebar, Skeleton, Switch, Table, Tabs, Textarea, ToggleGroup, Toggle, Tooltip

#### Configuration

The `components.json` file at the workspace root configures shadcn/ui:

- **Style**: `new-york`
- **RSC**: `false` (no React Server Components)
- **Icon Library**: `lucide`
- **CSS**: `libs/assets/styles/global-react.css`
- **Components alias**: `@front/cn/components`
- **Utils alias**: `@front/cn/utils`

#### Adding New Components

**CRITICAL**: In this Nx monorepo, the standard `npx shadcn add` command will NOT work. You MUST use the following command from the workspace root:

```bash
TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add <component-name>
```

**Examples:**

```bash
TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add button
TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add dialog
TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add table select alert-dialog badge
```

#### AI Agent Guidelines for shadcn/ui

1. **Never install shadcn components manually** — always use the command above
2. **Never modify generated component files directly** unless strictly necessary for customization
3. **Import from `@front/cn/components`** (e.g., `import { Button } from '@front/cn/components/button'`)
4. **Import `cn` utility from `@front/cn/utils`** (e.g., `import { cn } from '@front/cn/utils'`)
5. **Check existing components first** — look in `libs/front/cn/components/` before adding a new one

### Toast Notifications — Sileo

**CRITICAL**: The **only** library allowed for toast notifications is **Sileo**. Do NOT use any other toast library (e.g., react-hot-toast, sonner, react-toastify, etc.).

#### Setup

Add the `<Toaster />` component once at the app root (already configured in `app/root.tsx`):

```tsx
import { Toaster } from 'sileo';

export default function App() {
  return (
    <>
      <Toaster />
      {/* rest of the app */}
    </>
  );
}
```

#### Usage

```tsx
import { toast } from 'sileo';

toast.success('Operation completed');
toast.error('Something went wrong');
toast.warning('Be careful');
toast.info('Here is some info');
toast.loading('Processing...');

toast.success('Done!', {
  position: 'bottom-right',
  duration: 3000,
});
```

#### Available positions

`top-left` | `top-right` | `bottom-left` | `bottom-right` | `center`

#### AI Agent Guidelines for Sileo

1. **Only use Sileo** — never use or suggest any other toast/notification library
2. **`<Toaster />` already added** at the root layout, available globally
3. **Import from `sileo`** — `import { toast, Toaster } from 'sileo'`
4. **Never install Sileo again** — it is already installed at the workspace root

### React Domain Libraries (libs/front/*)

Domain libraries in `libs/front/` encapsulate business logic and data operations. They are **pure, framework-agnostic** modules that do not contain React components or hooks.

#### Purpose and Scope

- **Data operations**: CRUD, queries, and Firebase/Firestore interactions
- **Business logic**: Domain-specific rules and transformations
- **Reusability**: Shared across multiple React apps and routes

#### Library Structure

```
libs/front/<domain>/
├── src/
│   ├── index.ts              # Public API - exports all public functions
│   └── <domain>.service.ts   # Service functions (pure, no React)
├── project.json
├── tsconfig.json
└── tsconfig.lib.json
```

#### Design Principles

- **Pure functions**: Services receive dependencies (e.g., `db`, `functions`, `facilityId`) as parameters instead of using dependency injection
- **No React**: No components, hooks, or React-specific code
- **Models from @models**: Use shared types and interfaces from `@models/*` for consistency
- **Single responsibility**: Each library focuses on one domain (e.g., roles, facility, employees, services)

#### Example Service Function

```typescript
import { Firestore, collection, getDocs } from 'firebase/firestore';
import { EmployeeModel } from '@models/facility';

export async function getEmployees(
  db: Firestore,
  facilityId: string
): Promise<EmployeeModel[]> {
  const employeesRef = collection(
    db,
    `facilities/${facilityId}/employees`
  );
  const snapshot = await getDocs(employeesRef);
  return snapshot.docs.map((doc) => doc.data() as EmployeeModel);
}
```

#### Path Aliases

Domain libraries are consumed via path aliases defined in `tsconfig.base.json`:

- `@front/employees` → `libs/front/employees/src/index.ts`
- `@front/facility` → `libs/front/facility/src/index.ts`
- `@front/roles` → `libs/front/roles/src/index.ts`
- `@front/services` → `libs/front/services/src/index.ts`
- `@front/ui-react` → `libs/front/ui-react/src/index.ts`
- `@front/cn/components` → `libs/front/cn/components`
- `@front/cn/hooks` → `libs/front/cn/hooks`
- `@front/cn/utils` → `libs/front/cn/utils/index.ts`

#### AI Agent Guidelines for Domain Libraries

1. **Create via Nx generator** — use `nx g @nx/js:library` with appropriate options
2. **Export through index.ts** — all public functions must be re-exported from `src/index.ts`
3. **Add path alias** — register the library in `tsconfig.base.json` paths
4. **Use @models for types** — do not duplicate model definitions; import from `@models/*`
5. **Keep services pure** — pass `db`, `functions`, and context (e.g., `facilityId`) as arguments

### React Route and Page Structure

The application uses **React Router v7** with file-based route configuration. Each feature or section has a dedicated folder under the routes hierarchy.

#### Route Folder Structure

```
app/routes/
├── routes.ts                     # Root route config (RouteConfig)
├── <layout>.tsx                  # Layout components
└── <section>/                    # Section (e.g., home)
    └── <feature>/                # Feature folder
        ├── index.tsx             # List/index page (default route)
        ├── <feature>-create.tsx  # Create form page
        ├── <feature>-edit.tsx    # Edit form page (with :id param)
        ├── components/           # Feature-specific components
        │   ├── index.ts          # Barrel export
        │   └── *.tsx             # Shared components for this feature
        └── <feature>.config.ts   # Optional: feature-specific constants and config
```

#### Naming Conventions

- **Index page**: `index.tsx` — main list or overview
- **Create page**: `<feature>-create.tsx` — form to create new entities
- **Edit page**: `<feature>-edit.tsx` — form to edit existing entities (uses `:id` or `:entityId` in route)
- **Config file**: `<feature>.config.ts` — constants, tooltips, business rules used only by this feature

#### Route Registration

Routes are defined in the root `routes.ts` using `route()`, `layout()`, and `index()` from `@react-router/dev/routes`. Nested routes follow the folder hierarchy.

Example:

```typescript
import { type RouteConfig, route, layout, index } from '@react-router/dev/routes';

export default [
  layout('routes/protected-layout.tsx', [
    layout('routes/home/layout.tsx', [
      route('home/employees', 'routes/home/employees/index.tsx'),
      route('home/employees/create', 'routes/home/employees/employees-create.tsx'),
      route('home/employees/:id/edit', 'routes/home/employees/employees-edit.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
```

#### Page and Component Guidelines

- **Pages**: Consume domain libraries (`@front/*`) and models (`@models/*`)
- **Components**: Place feature-specific UI in `components/` with a barrel `index.ts`
- **Config**: Use `*.config.ts` for feature-specific constants (e.g., tooltips, implication rules) instead of hardcoding in components
- **State**: Use Zustand for global state; local state with `useState` for form and UI state
- **Forms**: Use React Hook Form + Zod for validation

#### AI Agent Guidelines for React Pages

1. **Follow folder structure** — use `index.tsx`, `*-create.tsx`, `*-edit.tsx` for CRUD flows
2. **Extract shared components** — put reusable pieces in `components/` with barrel export
3. **Use domain libraries** — import services from `@front/<domain>`, not inline Firebase calls
4. **Use path aliases** — `@front/*`, `@models/*`, `@front/cn/components`
5. **Register routes** — add new routes in `routes.ts` with correct path and nesting
6. **Config for constants** — use `*.config.ts` when a feature needs constants or business rules

### Code Organization

#### Models and Interfaces

- All model definitions reside under `@models/` namespace
- Use TypeScript interfaces for type safety
- Follow consistent naming patterns
- Models are shared between frontend and backend (Firebase Cloud Functions)

Available model namespaces:

- `@models/classes` — Class/program models
- `@models/common` — Common shared types
- `@models/facility` — Facility, Employee, Client models
- `@models/permissions` — Role, Permission models
- `@models/plans` — Plan/pricing models
- `@models/services` — Service/schedule models
- `@models/user` — User profile models

## Library Management and Validation

### Checking Existing Libraries

**CRITICAL**: Before suggesting or implementing any new library, always:

1. **Check package.json first**: Verify if the library already exists in the project
2. **Validate versions**: Check the installed version to understand capabilities
3. **Use Context7 for unknown versions**: If you don't have knowledge about the specific version installed, use the Context7 MCP tool to get up-to-date documentation

#### Example Workflow:

```bash
# 1. Check if library exists
grep "library-name" package.json

# 2. If exists, note the version
# 3. If version is unknown to you, use Context7:
# - Use resolve-library-id to find the library
# - Use query-docs with the specific version
```

## MCP (Model Context Protocol) Integration

### Nx MCP for Workspace Management

The project is configured with MCP servers that provide real-time access to Nx documentation and workspace information. This ensures AI agents always have access to the most current information about Nx monorepo management.

#### Available MCP Tools

**Nx MCP Server (`nx-mcp`)**

- **Workspace Analysis**: Get comprehensive workspace information including project graph, dependencies, and configuration
- **Project Details**: Retrieve detailed project configuration for any app or library in the monorepo
- **Generator Management**: Access available generators and their schemas for code generation
- **Task Management**: Monitor running tasks and their outputs
- **Visualization**: Generate project and task dependency graphs
- **Documentation**: Access up-to-date Nx documentation for configuration and best practices

**Context7 MCP Server (`claude_ai_context7`)**

- **Library Documentation**: Get comprehensive documentation for any library or framework
- **Version-Specific Information**: Access documentation for specific library versions
- **API References**: Retrieve detailed API documentation and usage examples

**shadcn MCP Server (`shadcn`)**

- **Component Management**: Browse and search available shadcn/ui components
- **Installation Commands**: Get correct installation commands for adding components to the project
- **Component Documentation**: Access documentation and usage examples for shadcn/ui components
- **Configuration Help**: Understand and manage `components.json` configuration
- **Registry Management**: Explore component registries and custom component sources

Key tools:
- `get_project_registries`: Get configured registry names from `components.json`
- `list_items_in_registries`: List all available components in registries
- `search_items_in_registries`: Search for components using fuzzy matching
- `view_items_in_registries`: View detailed information about specific components
- `get_item_examples_from_registries`: Find usage examples and demos with complete code
- `get_add_command_for_items`: Get the correct CLI command to add components
- `get_audit_checklist`: Get a checklist after creating new components

**Stitch MCP Server (`stitch`)**

- **UI Generation**: Generate UI designs and React components from text prompts
- **Screen Creation**: Create complete application screens with proper component structure
- **Design Exploration**: Generate design variations and explore different UI approaches
- **Multi-Screen Flows**: Create connected screens for complete user flows
- **Component Export**: Export generated designs as React code

Key features:
- AI-powered UI generation from natural language descriptions
- Automatic React component structure generation
- Design iteration and refinement support
- Multi-screen project management
- Direct integration with React + Tailwind CSS stack

#### Usage Guidelines for AI Agents

1. **Always Use MCP First**: Before making assumptions about Nx functionality or any installed library, use the MCP tools to get current information
2. **Workspace Analysis**: Use `nx_docs` to understand Nx configuration and best practices
3. **Project-Specific Help**: Use `nx_project_details` to get detailed information about specific projects before making changes
4. **Documentation Lookup**: Use `nx_docs` for current best practices and `query-docs` from Context7 for library-specific information
5. **Real-Time Monitoring**: Use `nx_current_running_tasks_details` to monitor build, test, or other running processes
6. **shadcn/ui Components**: Use `search_items_in_registries` to find components, `get_item_examples_from_registries` for usage examples, and `get_add_command_for_items` for installation commands
7. **UI Generation**: Use Stitch MCP for generating UI designs and React components from natural language descriptions when appropriate

#### Benefits of MCP Integration

- **Always Current**: Access to the latest Nx documentation and features
- **Workspace-Aware**: Real-time information about the specific workspace configuration
- **Error Prevention**: Up-to-date information helps prevent configuration and compatibility issues
- **Best Practices**: Access to current Nx best practices
- **Efficient Development**: Faster code generation and project management with accurate tooling

## Important Notes for AI Agents

1. **Always use English** for code, comments, and documentation
2. **Follow React 19 standards** with functional components and hooks
3. **Use Tailwind CSS v4** as the primary styling approach
4. **Leverage shadcn/ui components** before creating custom UI components
5. **Maintain the monorepo structure** with proper library organization
6. **Follow the established naming conventions** and file structure
7. **Ensure proper TypeScript typing** with interfaces and models
8. **Test with Firebase emulators** for local development
9. **Check package.json first** before suggesting new libraries
10. **Use Context7 MCP** for library documentation when version is unknown
11. **Be app-agnostic** - commands and examples should work for any app in the monorepo
12. **CRITICAL: Always create index.ts files** - Every component or service MUST have its corresponding `index.ts` file for proper module organization and clean imports
13. **Update parent index files** - When creating new components, always update the parent library's `index.ts` file to export the new component
14. **NO inline comments** - Do NOT add inline comments (`//` or `/* */`) in any files. Only JSDoc comments (`/** */`) are allowed in `.ts` and `.tsx` files
15. **Use shadcn/ui for React** - Always use `TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add <component>` to add new shadcn components. Never install them manually
16. **Import shadcn from `@front/cn`** - Use `@front/cn/components/<name>` for components and `@front/cn/utils` for the `cn` utility
17. **CRITICAL: Use Sileo for all toast notifications** - `import { toast, Toaster } from 'sileo'`. Never use any other toast library. `<Toaster />` is already placed at the app root
18. **React domain libraries** - Keep `libs/front/<domain>` pure: no React, no components. Use pure functions with `db`, `functions`, and context as parameters. Export via `index.ts`
19. **React page structure** - Use `index.tsx` (list), `*-create.tsx`, `*-edit.tsx`, `components/` with barrel export, and optional `*.config.ts` for feature constants
20. **Use MCP tools first** - Always consult `nx_docs` and Context7 `query-docs` before making assumptions
21. **Leverage real-time workspace info** - Use `nx_project_details` and `nx_current_running_tasks_details` for accurate project state
22. **Use shadcn MCP for components** - Before adding shadcn components, use `search_items_in_registries` to find them and `get_add_command_for_items` to get the correct installation command
23. **Consider Stitch MCP for UI generation** - When creating new screens or complex UI, consider using Stitch MCP to generate designs from natural language descriptions

## Project-Specific Patterns

### State Management

- Use Zustand for global state (e.g., session store with selected facility)
- Use `useState` for local component state (forms, UI toggles)
- Use `useEffect` for side effects (API calls, subscriptions)
- Follow the established patterns in session store (`@models/common`)

### Authentication & Authorization

- Firebase Auth for authentication
- Zustand session store for user state and selected facility
- Firebase Firestore security rules for database-level authorization
- Role-based permissions system with per-section, per-action granularity
- Custom claims for super admin role

### Data Flow

- Domain services (`@front/*`) handle Firestore operations
- Components consume services via function calls (pass `db`, `functions`, `facilityId`)
- Models (`@models/*`) define data structures
- Proper separation of concerns maintained

### Firebase Integration

- Firebase initialized in `app/firebase.ts` with emulator support
- Exports: `app`, `auth`, `db`, `functions`
- Use environment variables for configuration (`VITE_USE_EMULATORS`, `VITE_FIREBASE_*`)
- Emulator hosts: `localhost:9099` (auth), `localhost:8080` (firestore), `localhost:5001` (functions)

This documentation provides AI agents with comprehensive understanding of the project structure, development standards, and local setup requirements.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.

<!-- nx configuration end-->
