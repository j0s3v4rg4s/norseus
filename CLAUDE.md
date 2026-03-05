# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Norseus is a React 19 facility management application built with Nx monorepo architecture. The project implements comprehensive facility management with RBAC, user/employee management, service scheduling, and class programming. Backend services use Firebase (Auth, Firestore, Cloud Functions, Storage).

## Technology Stack

- **Frontend**: React 19, React Router v7 (SPA mode), Tailwind CSS v4, shadcn/ui
- **Monorepo**: Nx 21.3.9 with pnpm package manager
- **Backend**: Firebase (Auth, Firestore, Functions, Storage)
- **State**: Zustand (global), useState (local)
- **Forms**: React Hook Form + Zod validation
- **UI**: shadcn/ui (Radix primitives + Tailwind) via `@front/cn/`
- **Notifications**: Sileo (ONLY allowed toast library)
- **Rich Text**: Tiptap
- **Icons**: Lucide React

## Common Commands

All commands use Nx task runner. Run from workspace root:

```bash
# Development
pnpm nx serve admin-react              # Start React app dev server
pnpm nx build admin-react              # Build React app for production
pnpm nx test admin-react               # Run unit tests
pnpm nx lint admin-react               # Lint React app

# Firebase
firebase emulators:start --import=./firebase-export  # Start Firebase emulators
pnpm run firebase:emulators                          # Same as above (via package.json)
supabase start                                       # Legacy - project migrated to Firebase

# Nx workspace commands
pnpm nx graph                          # Visualize project graph
pnpm nx affected -t test               # Test affected projects
pnpm nx run-many -t build              # Build all projects
pnpm nx affected -t lint               # Lint affected projects

# Formatting
pnpm run format:changed                # Format changed files with Prettier

# Code generation
pnpm nx g @nx/react:component          # Generate React component
pnpm nx g @nx/js:library              # Generate new library

# Firebase Functions
pnpm nx build functions                # Build Cloud Functions
```

### shadcn/ui Component Installation

**CRITICAL**: Standard `npx shadcn add` will NOT work in this Nx monorepo. Always use:

```bash
TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add <component-name>
```

Examples:
```bash
TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add button
TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add dialog table select
```

## Architecture

### Monorepo Structure

```
norseus/
├── apps/
│   ├── admin-react/       # React 19 SPA (React Router v7)
│   └── functions/         # Firebase Cloud Functions
├── libs/
│   ├── front/
│   │   ├── cn/            # shadcn/ui components (28) + cn() utility
│   │   ├── employees/     # Employee domain services (pure functions)
│   │   ├── facility/      # Facility domain services (pure functions)
│   │   ├── roles/         # Roles domain services (pure functions)
│   │   ├── services/      # Services/schedules/classes domain services
│   │   └── ui-react/      # Shared React components (DaySelector, etc.)
│   ├── models/            # Shared TypeScript models (front + back)
│   └── assets/            # Global styles, fonts
├── components.json        # shadcn/ui config (style: new-york)
└── tsconfig.base.json     # TypeScript path aliases
```

### Path Aliases

Defined in `tsconfig.base.json`:

- `@front/cn/components` → shadcn/ui components
- `@front/cn/utils` → `cn()` utility for class merging
- `@front/cn/hooks` → shadcn/ui hooks
- `@front/employees` → Employee domain services
- `@front/facility` → Facility domain services
- `@front/roles` → Roles domain services
- `@front/services` → Services domain logic
- `@front/ui-react` → Shared React components
- `@models/classes` → Class/program models
- `@models/common` → Common types (SessionStore, etc.)
- `@models/facility` → Facility, Employee, Client models
- `@models/permissions` → Role, Permission models
- `@models/plans` → Plan/pricing models
- `@models/services` → Service/schedule models
- `@models/user` → User profile models

### Domain Library Architecture

Libraries in `libs/front/*` are **pure, framework-agnostic** modules (no React):

- **Purpose**: Encapsulate Firebase/Firestore operations and business logic
- **Design**: Pure functions receive dependencies (`db`, `functions`, `facilityId`) as parameters
- **Export**: All public functions exported through `src/index.ts`
- **Types**: Use models from `@models/*` - never duplicate types
- **Structure**:
  ```
  libs/front/<domain>/
  ├── src/
  │   ├── index.ts              # Public API
  │   └── <domain>.service.ts   # Pure service functions
  ├── project.json
  └── tsconfig.json
  ```

### React Route Structure

React Router v7 with file-based routing in `apps/admin-react/app/routes/`:

```
routes/
├── routes.ts                  # Root route config (RouteConfig)
├── <layout>.tsx               # Layout components
└── <section>/                 # e.g., home/
    └── <feature>/             # e.g., employees/
        ├── index.tsx          # List/index page
        ├── <feature>-create.tsx   # Create form
        ├── <feature>-edit.tsx     # Edit form (:id param)
        ├── components/        # Feature-specific components
        │   ├── index.ts       # Barrel export (REQUIRED)
        │   └── *.tsx
        └── <feature>.config.ts    # Optional: feature constants
```

Routes registered in `routes.ts` using `route()`, `layout()`, `index()`:

```typescript
import { type RouteConfig, route, layout } from '@react-router/dev/routes';

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

### Component Structure (CRITICAL)

**Every component MUST have an `index.ts` file** for proper module organization:

```
component-name/
├── component-name.tsx
└── index.ts                   # REQUIRED - exports component
```

Example `index.ts`:
```typescript
export { ComponentName } from './component-name';
export type { ComponentNameProps } from './component-name';
```

Library-level `index.ts` must export all public components:
```typescript
// libs/front/ui-react/src/index.ts
export * from './day-selector';
export * from './week-calendar';
```

### Toast Notifications (Sileo)

**CRITICAL**: Sileo is the ONLY allowed toast library. Never use react-hot-toast, sonner, react-toastify, etc.

`<Toaster />` already placed in app root. Import and use:

```typescript
import { toast } from 'sileo';

toast.success('Operation completed');
toast.error('Something went wrong');
toast.warning('Be careful');
toast.info('Information');
toast.loading('Processing...');

// With options
toast.success('Done!', { position: 'bottom-right', duration: 3000 });
```

Positions: `top-left` | `top-right` | `bottom-left` | `bottom-right` | `center`

### Firebase Integration

Firebase initialized in `apps/admin-react/app/firebase.ts`:

```typescript
import { app, auth, db, functions } from '~/firebase';
```

Emulator configuration (environment variables):
- `VITE_USE_EMULATORS=true` - Enable emulators
- Emulator hosts: `localhost:9099` (auth), `localhost:8080` (firestore), `localhost:5001` (functions)

### Firestore Database Structure

**CRITICAL**: Complete database schema, collections structure, security rules, and business logic validation are documented in `/docs/firestore-collections.md`.

This document contains:
- All Firestore collections and subcollections hierarchy
- Field definitions, types, and requirements for each collection
- Security rules and access control patterns
- Helper functions used in Firestore rules
- Business logic validation rules
- Reference enums and constants

**MANDATORY**: When creating new collections, modifying existing collections, or implementing database-related business logic, you MUST update `/docs/firestore-collections.md` to reflect these changes.

Key collections:
- `profiles/{uid}` - User profiles
- `facilities/{facilityId}` - Facilities with subcollections:
  - `employees/{uid}` - Facility employees
  - `clients/{uid}` - Facility clients
  - `roles/{roleId}` - Roles with permissions
  - `services/{serviceId}` - Services with nested `schedules/{scheduleId}`
  - `classes/{classId}` - Class instances
  - `plans/{planId}` - Subscription plans

## Development Standards

### TypeScript

- Strict type checking enabled
- Prefer type inference when obvious
- Use `unknown` instead of `any`
- Import types from `@models/*` - never duplicate

### React 19 Patterns

- **Components**: Functional components with hooks only
- **State**: Zustand for global state, `useState` for local state
- **Hooks**: `useState`, `useEffect`, `useMemo`, `useCallback`, custom hooks
- **Props**: TypeScript interfaces for all props

### Naming Conventions

- **Files**: `feature-name.tsx` (kebab-case)
- **Components**: `FeatureName` (PascalCase)
- **Functions**: `handleSubmit` (camelCase)
- **Constants**: `MAX_RETRIES` (UPPER_SNAKE_CASE)
- **Interfaces**: `UserProfileProps` (PascalCase)

### Comment Standards (CRITICAL)

- **NO inline comments**: Do NOT use `//` or `/* */` in any files
- **JSDoc ONLY**: Only JSDoc comments (`/** */`) allowed in `.ts`/`.tsx` files
- **Purpose**: Document functions, components, interfaces, public APIs
- Write self-documenting code with clear names instead of comments

### Styling Priority

1. **Primary**: shadcn/ui components from `@front/cn/components`
2. **Secondary**: Standard HTML + Tailwind CSS v4 utilities
3. **Fallback**: Custom CSS modules when Tailwind insufficient

Use `cn()` from `@front/cn/utils` for conditional class merging.

## MCP (Model Context Protocol) Tools

The project has MCP servers providing real-time access to documentation and workspace information:

### Nx MCP Server (`nx-mcp`)

- `nx_docs` - Get up-to-date Nx documentation for configuration and best practices
- `nx_workspace` - Workspace analysis (project graph, dependencies, configuration)
- `nx_project_details` - Detailed project configuration for specific apps/libraries
- `nx_current_running_tasks_details` - Monitor running tasks
- `nx_current_running_task_output` - Get terminal output for specific tasks
- `nx_visualize_graph` - Generate project/task dependency graphs

### Context7 MCP Server (`claude_ai_context7`)

- `resolve-library-id` - Resolve package name to Context7-compatible library ID
- `query-docs` - Get comprehensive documentation for any library/framework version

**CRITICAL**: Before suggesting libraries, check `package.json` first. If version is unknown, use Context7 MCP for up-to-date documentation.

### shadcn MCP Server (`shadcn`)

- `get_project_registries` - Get configured registry names from `components.json`
- `search_items_in_registries` - Search for components using fuzzy matching
- `view_items_in_registries` - View detailed component information
- `get_item_examples_from_registries` - Find usage examples with complete code
- `get_add_command_for_items` - Get correct CLI command to add components
- `get_audit_checklist` - Get checklist after creating new components

### Stitch MCP Server (`stitch`)

- AI-powered UI generation from natural language descriptions
- Generate complete React screens with proper component structure
- Create design variations and iterations
- Export as React + Tailwind CSS code

## Key Patterns

### State Management

- **Global**: Zustand stores (e.g., session store with selected facility)
- **Local**: `useState` for forms and UI state
- **Side effects**: `useEffect` for API calls, subscriptions

### Authentication & Authorization

- Firebase Auth for authentication
- Zustand session store for user state and selected facility
- Firestore security rules for database-level authorization
- Role-based permissions with per-section, per-action granularity
- Custom claims for super admin role

### Data Flow

1. Domain services (`@front/*`) handle Firestore operations
2. Components call services, passing `db`, `functions`, `facilityId` as arguments
3. Models (`@models/*`) define all data structures
4. React Hook Form + Zod for form validation

## Critical Rules for AI Agents

1. **Check AGENTS.md first** - It is the primary source of truth
2. **Update database documentation** - MANDATORY: Update `/docs/firestore-collections.md` when creating/modifying collections or database business logic
3. **Always create index.ts files** - Every component needs `index.ts` for exports
4. **Update parent index.ts** - When adding components, update library's `index.ts`
5. **NO inline comments** - Only JSDoc (`/** */`) allowed
6. **Use special shadcn command** - `TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add`
7. **Import shadcn from @front/cn** - Use `@front/cn/components/<name>`
8. **Sileo ONLY for toasts** - Never use other toast libraries
9. **Keep domain libs pure** - No React in `libs/front/*`, only pure functions
10. **Use MCP tools first** - Consult `nx_docs` and Context7 before assumptions
11. **Check package.json** - Verify libraries exist before suggesting installation
12. **Use path aliases** - `@front/*`, `@models/*`, `@front/cn/components`
13. **Follow route structure** - Use `index.tsx`, `*-create.tsx`, `*-edit.tsx` pattern

## Reference Documentation

- **Primary source of truth**: `/AGENTS.md` - comprehensive project guidelines
- **Database schema**: `/docs/firestore-collections.md` - complete Firestore structure, security rules, and business logic (MUST be updated when modifying database)
- **README**: `/README.md` - setup instructions (partially outdated)
- **Nx configuration**: `/nx.json`, `apps/*/project.json`, `libs/*/project.json`
- **TypeScript paths**: `/tsconfig.base.json`
- **shadcn config**: `/components.json`
