# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm nx serve admin` - Start the Angular admin app in development mode
- `pnpm nx build admin` - Build the admin app for production
- `pnpm nx lint admin` - Run ESLint on the admin app
- `pnpm nx lint` - Run ESLint on all projects

### Supabase Database
- `supabase start` - Start local Supabase instance (requires Docker)
- `supabase db reset` - Reset database, run all migrations, and seed data
- `supabase gen types typescript --db-url <url> > libs/front/supabase/src/interfaces/types.ts` - Generate TypeScript types from database

### Formatting
- `pnpm format:changed` - Format only changed files with Prettier

## Architecture Overview

### Monorepo Structure
This is an Nx monorepo with Angular 19 using standalone components, signals, and new control flow syntax (`@if`, `@for`, etc.).

### Applications
- `apps/admin/` - Main Angular admin dashboard application
  - Uses lazy-loaded routes for permissions and users management
  - Environment-specific configurations in `src/environments/`
  - Main routes: login, home (with nested permissions/users routes)

### Libraries

#### Frontend UI (`libs/front/ui/`)
- Shared UI components and layout system
- Exports: layout components, modals, actions (buttons, nav items)
- Built with basecoat-css component system
- Uses Tailwind CSS v4 and basecoat-css for styling

#### Frontend Core (`libs/front/core/`)
- `profile/` - User profile state management using NgRx signals

#### Supabase Integration (`libs/front/supabase/`)
- Database types and interfaces
- Supabase provider and client configuration
- Permissions dictionary for role-based access control
- Generated types from Supabase schema

#### Assets (`libs/assets/`)
- `fonts/` - Montserrat font files
- `styles/` - Global Tailwind CSS and SCSS styles

### Database & Backend
- **Supabase**: Backend-as-a-Service with Postgres, Auth, and Storage
- **Migrations**: Located in `supabase/migrations/` with role, permission, and facility tables
- **RLS**: Row Level Security policies defined in migrations
- **Functions**: Edge functions in `supabase/functions/` for user creation and permission checking

## Technology Stack

### Core Framework
- **Angular 19**: Standalone components, signals, new control flow
- **Nx 20.8.1**: Monorepo tooling and build system
- **TypeScript 5.8.3**: Strongly typed JavaScript

### Styling & UI
- **TailwindCSS v4**: Utility-first CSS framework
- **basecoat-css**: Primary UI component system with JavaScript enhancements
- **Angular Material**: UI components and CDK

### State Management
- **NgRx Signals**: Modern reactive state management
- **RxJS 7.8.2**: Reactive programming

### Backend & Database
- **Supabase**: Database, authentication, and storage
- **PostgreSQL**: Database with RLS policies
- **Supabase Edge Functions**: Serverless functions

## Development Patterns

### Component Architecture
- Use standalone Angular components exclusively
- Leverage signals for reactive state management
- Use new control flow syntax (`@if`, `@for`) instead of structural directives
- Follow the project's store pattern for complex state (see `permissions.store.ts`, `users.store.ts`)

### UI Component Usage
Always use basecoat-css components via the custom classes defined in `.cursor/rules/ui-components.mdc`. Follow these standardized patterns:

#### Input Components
- **Primary Class**: Always use `input` class for consistent styling
- **Form Integration**: Use within `form` class containers for proper spacing (`form space-y-6 w-full`)
- **Layout Patterns**: Use `grid gap-3` for vertical layouts with labels
- **Accessibility**: Include proper `id` and `for` attributes when using labels
- **Validation States**: Use `aria-invalid="true"` for error states
- **Helper Text**: Use `text-muted-foreground text-sm` classes for descriptive text

```html
<!-- Standard input with label -->
<div class="grid gap-3">
  <label for="input-id" class="label">Label</label>
  <input class="input" id="input-id" type="text" placeholder="Placeholder">
</div>
```

#### Button Components
- **Primary Actions**: Use `btn` or `btn-primary` for main actions
- **Secondary Actions**: Use `btn-secondary` for less important actions
- **Destructive Actions**: Use `btn-destructive` for delete/remove actions
- **Variants**: `btn-outline`, `btn-ghost`, `btn-link` for different styles
- **Sizes**: `btn-sm` for compact spaces, `btn-lg` for prominent actions
- **Icon Buttons**: Use `btn-icon` variants with proper accessibility labels
- **Loading States**: Add `disabled` attribute and loading icon for async operations

```html
<!-- Button combinations -->
<button class="btn">Primary</button>
<button class="btn-secondary">Secondary</button>  
<button class="btn-destructive">Delete</button>
<button class="btn-lg-outline">Large Outline</button>
<button class="btn-sm-icon-destructive">
  <svg><!-- icon --></svg>
</button>
```

#### Select Components
- **Native HTML**: Use `<select class="select">` for simple cases
- **Enhanced Select**: Use JavaScript-powered select with popover for complex interactions
- **JavaScript Integration**: Include `basecoat-css` select JavaScript for enhanced functionality
- **Width Control**: Use `w-[180px]` or similar classes to control select width
- **Scrolling**: Add `scrollbar overflow-y-auto max-h-64` classes for long option lists
- **Icons**: Use `flex items-center gap-2` layout for options with icons
- **Accessibility**: Always include proper ARIA attributes for enhanced selects

```html
<!-- Native select -->
<select class="select w-[180px]">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

<!-- Enhanced select with proper ARIA -->
<div class="select">
  <button type="button" popovertarget="select-popover" 
          id="select-trigger" aria-haspopup="listbox">
    Select an option
  </button>
  <div popover class="popover" id="select-popover">
    <div role="listbox" aria-labelledby="select-trigger">
      <div role="option" data-value="value1">Option 1</div>
    </div>
  </div>
</div>
```

#### JavaScript Enhancement
For enhanced components that require JavaScript functionality:
```html
<script src="https://cdn.jsdelivr.net/npm/basecoat-css@latest/dist/js/select.min.js" defer></script>
```

#### General UI Principles
- **Consistency**: Always use the predefined component classes from basecoat-css
- **Accessibility**: Include proper ARIA attributes and semantic HTML
- **Responsive**: Components should work across all screen sizes
- **Spacing**: Use consistent spacing patterns (`space-y-6`, `gap-3`, etc.)
- **Color System**: Follow project color scheme with `text-muted-foreground`, etc.
- **JavaScript Events**: Listen for basecoat events (`basecoat:initialized`, `change`, etc.)

### Routing
- Use lazy-loaded routes with `loadComponent` and `loadChildren`
- Feature modules organized as route groups (permissions, users)
- Each feature has its own routes file (e.g., `permissions.routes.ts`)

### Database Integration
- Use generated TypeScript types from Supabase schema
- Implement RLS policies for data security
- Use Supabase client through the provider in `libs/front/supabase/`

## Environment Setup

### Required Tools
- Node.js v20+
- pnpm v8+
- Docker (for local Supabase)
- Supabase CLI v1.0.0+

### Local Development
1. Start Supabase: `supabase start`
2. Update `apps/admin/src/environments/environment.development.ts` with local Supabase credentials
3. Reset database: `supabase db reset`
4. Generate types: `supabase gen types typescript --db-url <url> > libs/front/supabase/src/interfaces/types.ts`
5. Start app: `pnpm nx serve admin`

## Code Standards

### Language & Commits
- All code, comments, and documentation must be in English
- Follow Conventional Commits format
- Mention affected project/library in commit messages

### Angular Best Practices
- Use standalone components with Angular 19 features
- Prefer signals over observables for state
- Use new control flow syntax
- Implement proper TypeScript typing

### Styling Guidelines
- Use Tailwind CSS utility classes primarily
- Leverage basecoat-css component system for UI components
- Follow the UI component patterns defined in `.cursor/rules/ui-components.mdc`
- Use consistent spacing and typography scales
- Include basecoat-css JavaScript for enhanced component functionality when needed