# Norseus Project - AI Agent Guidelines

## Project Overview

Norseus is a modern enterprise application built with **Angular 20.1.3** and **Nx monorepo** architecture. The project implements a comprehensive system with role-based access control (RBAC), user management, and facility management capabilities. It uses **Firebase** for backend services and database operations, with **Tailwind CSS v4** for styling.

## Architecture

### Technology Stack
- **Frontend**: Angular 20.1.3 with standalone components
- **Monorepo**: Nx 21.3.9 with pnpm package manager
- **Styling**: Tailwind CSS v4 (primary), SCSS (fallback)
- **Backend**: Firebase (Auth, Firestore, Functions, Storage)
- **Database**: Firebase Firestore
- **State Management**: Angular Signals with @ngrx/signals
- **UI Components**: Custom component library with basecoat-css

### Project Structure
```
norseus/
├── apps/
│   ├── admin/          # Main Angular application
│   └── functions/      # Firebase Cloud Functions
├── libs/
│   ├── front/          # Frontend libraries
│   │   ├── core/       # Business logic (employee, facility, profile, roles)
│   │   ├── state/      # State management (session)
│   │   ├── ui/         # UI component library
│   │   └── utils/      # Utilities (logger)
│   └── models/         # Shared data models
```

## Development Standards

### Angular 20.1.3 Best Practices

#### TypeScript Best Practices
- **Strict Type Checking**: Use strict type checking configuration
- **Type Inference**: Prefer type inference when the type is obvious
- **Avoid `any` Type**: Avoid the `any` type; use `unknown` when type is uncertain
- **Type Safety**: Ensure proper TypeScript typing with interfaces and models

#### Component Architecture
- **Standalone Components**: All components are standalone by default (no `standalone: true` needed in v20.1.3)
- **Single Responsibility**: Keep components small and focused on a single responsibility
- **File Structure**: Separate `.ts`, `.html`, and `.scss` files for components (prefer inline templates for small components)
- **Dependency Injection**: Use `inject()` function instead of constructor injection
- **Change Detection**: Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- **Host Bindings**: Do NOT use `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead

#### Component File Structure and Index Files

**CRITICAL**: Every Angular component, directive, pipe, or service MUST have its corresponding `index.ts` file for proper module organization and clean imports.

##### Standard Component Structure
```
component-name/
├── component-name.component.ts
├── component-name.component.html
├── component-name.component.scss
└── index.ts                    # REQUIRED - Export file
```

##### Index.ts File Requirements
- **Purpose**: Centralizes exports for clean import statements
- **Location**: Must be placed in the same directory as the component files
- **Content**: Export the main component class and any related types/interfaces
- **Naming**: Always named `index.ts` (lowercase)

##### Import Benefits
- **Clean Imports**: Enables `import { ComponentNameComponent } from './component-name'` instead of `import { ComponentNameComponent } from './component-name.component'`
- **Module Organization**: Essential for proper library structure in Nx monorepo
- **Tree Shaking**: Improves bundle optimization
- **Consistency**: Maintains uniform import patterns across the project

##### Library-Level Index Files
Each library should have a main `index.ts` that exports all public components:

```typescript
// libs/front/ui/src/index.ts
export * from './button';
export * from './select';
export * from './input';
// ... other components
```

##### AI Agent Guidelines for Index Files
1. **Always Create**: Never create a component without its `index.ts` file
2. **Export Everything**: Export the main class and any related types/interfaces
3. **Consistent Naming**: Use the same naming pattern as the component file
4. **Update Parent**: When adding new components, update the parent library's `index.ts`
5. **Type Exports**: Export TypeScript interfaces and types used by the component
6. **Clean Structure**: Keep exports organized and well-documented

##### Common Mistakes to Avoid
- ❌ Creating components without `index.ts` files
- ❌ Forgetting to update parent `index.ts` files when adding new components
- ❌ Not exporting related types and interfaces
- ❌ Inconsistent naming between component files and index exports

#### Signal-Based Development
- **Inputs/Outputs**: Use `input()` and `output()` functions instead of decorators
- **Computed State**: Use `computed()` for derived state
- **State Management**: Use Angular Signals for reactive state management
- **Signal Updates**: Do NOT use `mutate` on signals, use `update` or `set` instead
- **Pure Transformations**: Keep state transformations pure and predictable

#### Template Standards
- **Control Flow**: Use built-in control flow (`@if`, `@for`, `@switch`) instead of structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`)
- **Track Expressions**: Always include `track` in `@for` loops for performance
- **Template Variables**: Use `@let` for local variables and `#var` for template references
- **Empty States**: Include `@empty` blocks with `@for` loops
- **Template Logic**: Keep templates simple and avoid complex logic
- **Async Pipe**: Use the async pipe to handle observables
- **Class Bindings**: Do NOT use `ngClass`, use `class` bindings instead
- **Style Bindings**: Do NOT use `ngStyle`, use `style` bindings instead

#### Forms and Images
- **Reactive Forms**: Prefer Reactive forms instead of Template-driven ones
- **Image Optimization**: Use `NgOptimizedImage` for all static images (does not work for inline base64 images)

#### Naming Conventions
- **Files**: `feature.type.ts` pattern (e.g., `user-profile.component.ts`)
- **Classes**: PascalCase with descriptive names
- **Variables/Methods**: camelCase
- **Constants**: UPPER_SNAKE_CASE

#### Comment Standards
- **No Inline Comments**: Do NOT add inline comments (`//` or `/* */`) in any files
- **JSDoc Only**: The ONLY comments allowed are JSDoc comments (`/** */`) in `.ts` files
- **JSDoc Purpose**: Use JSDoc for documenting functions, classes, interfaces, and public APIs
- **Clean Code**: Write self-documenting code with clear variable and function names instead of relying on comments
- **Documentation**: For complex logic, prefer clear code structure and meaningful names over explanatory comments

### Styling Guidelines

#### Priority Order
1. **Primary**: Custom UI components (see UI Components section)
2. **Secondary**: Standard HTML with Tailwind CSS v4 classes
3. **Fallback**: Custom SCSS when Tailwind is insufficient

#### Tailwind CSS v4 Usage
- Use utility classes for styling
- Follow responsive design principles
- Maintain consistent spacing and typography
- Ensure accessibility standards (ARIA labels, semantic HTML)

### UI Components Library

The project includes a custom UI component library with the following components:

#### Input Component
```html
<input class="input" type="email" placeholder="Email">
<input class="input" aria-invalid="true" type="email" placeholder="Email"> <!-- Invalid state -->
```

#### Button Component
```html
<button class="btn">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-destructive">Destructive</button>
<button class="btn-outline">Outline</button>
<button class="btn-ghost">Ghost</button>
<button class="btn-link">Link</button>
<button class="btn-icon-outline"><svg><!-- icon --></svg></button>
```

#### Select Component
```html
<ui-select placeholder="Select an option">
  <ui-option value="apple">Apple</ui-option>
  <ui-option value="banana">Banana</ui-option>
</ui-select>
```

### Code Organization

#### Services
- **Single Responsibility**: Design services around a single responsibility
- **Singleton Services**: Use `@Injectable({ providedIn: 'root' })` for singleton services
- **Dependency Injection**: Use the `inject()` function instead of constructor injection
- **Data Operations**: Delegate data operations to dedicated services
- **Component Logic**: Keep components lean by moving complex logic to services

#### Models and Interfaces
- All model definitions reside under `@models/` namespace
- Use TypeScript interfaces for type safety
- Follow consistent naming patterns

#### Logging
- Use `@logger` library instead of `console.*` methods
- Implement proper error handling with global error handler

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- pnpm package manager
- Firebase CLI

### Installation
```bash
# Install dependencies
pnpm install

# Install Firebase CLI globally
npm install -g firebase-tools
```

### Running the Project Locally

#### 1. Start Firebase Emulators
```bash
# Start Firebase emulators
firebase emulators:start

# This will start:
# - Auth emulator on port 9099
# - Firestore emulator on port 8080
# - Functions emulator on port 5001
# - Storage emulator on port 9199
# - Firebase UI on port 4000
```

#### 2. Build and Serve the Application
```bash
# Build any application (replace 'app-name' with actual app name)
pnpm nx build app-name

# Serve the application (development)
pnpm nx serve app-name

# Or serve with specific configuration
pnpm nx serve app-name --configuration=development
```

#### 3. Build and Deploy Functions (if needed)
```bash
# Build functions
pnpm nx build functions

```

### Database Setup

#### Firestore Rules
- Rules are defined in `firestore.rules`
- Indexes are configured in `firestore.indexes.json`




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
# - Use get-library-docs with the specific version
```

## MCP (Model Context Protocol) Integration

### Angular MCP for Nx Workspace Management

The project is configured with MCP servers that provide real-time access to Angular and Nx documentation and workspace information. This ensures AI agents always have access to the most current information about Angular best practices and Nx monorepo management.

#### Available MCP Tools

**Nx MCP Server (`nx-mcp`)**
- **Workspace Analysis**: Get comprehensive workspace information including project graph, dependencies, and configuration
- **Project Details**: Retrieve detailed project configuration for any app or library in the monorepo
- **Generator Management**: Access available generators and their schemas for code generation
- **Task Management**: Monitor running tasks and their outputs
- **Visualization**: Generate project and task dependency graphs
- **Documentation**: Access up-to-date Nx documentation for configuration and best practices

**Angular MCP Server (`angular-cli`)**
- **Best Practices**: Retrieve current Angular best practices and style guide recommendations
- **Project Listing**: List all Angular applications and libraries in the workspace
- **Documentation Search**: Search official Angular documentation for specific topics and APIs

**Context7 MCP Server (`context7`)**
- **Library Documentation**: Get comprehensive documentation for any library or framework
- **Version-Specific Information**: Access documentation for specific library versions
- **API References**: Retrieve detailed API documentation and usage examples

#### Usage Guidelines for AI Agents

1. **Always Use MCP First**: Before making assumptions about Angular or Nx functionality or any other installer library, use the MCP tools to get current information
2. **Workspace Analysis**: Use `nx_workspace` to understand the current workspace structure and any configuration issues
3. **Project-Specific Help**: Use `nx_project_details` to get detailed information about specific projects before making changes
4. **Generator Discovery**: Use `nx_generators` and `nx_generator_schema` to find the right generators for code generation tasks
5. **Documentation Lookup**: Use `nx_docs` and `angular_search_documentation` for current best practices and API information
6. **Real-Time Monitoring**: Use `nx_current_running_tasks_details` to monitor build, test, or other running processes


#### Benefits of MCP Integration

- **Always Current**: Access to the latest Angular and Nx documentation and features
- **Workspace-Aware**: Real-time information about the specific workspace configuration
- **Error Prevention**: Up-to-date information helps prevent configuration and compatibility issues
- **Best Practices**: Access to current Angular style guide and Nx best practices
- **Efficient Development**: Faster code generation and project management with accurate tooling


## Important Notes for AI Agents

1. **Always use English** for code, comments, and documentation
2. **Follow Angular 20.1.3 standards** with standalone components and signals
3. **Use Tailwind CSS v4** as the primary styling approach
4. **Leverage the custom UI component library** before creating new components
5. **Maintain the monorepo structure** with proper library organization
6. **Use the @logger library** instead of console methods
7. **Follow the established naming conventions** and file structure
8. **Ensure proper TypeScript typing** with interfaces and models
9. **Implement proper error handling** and logging
10. **Test with Firebase emulators** for local development
11. **Check package.json first** before suggesting new libraries
12. **Use Context7 MCP** for library documentation when version is unknown
13. **Be app-agnostic** - commands and examples should work for any app in the monorepo
14. **Use OnPush change detection** for all components
15. **Prefer reactive forms** over template-driven forms
16. **Use NgOptimizedImage** for all static images
17. **Avoid ngClass and ngStyle** - use class and style bindings instead
18. **Use computed() for derived state** in components
19. **Keep templates simple** and avoid complex logic
20. **Use host object** instead of @HostBinding and @HostListener decorators
21. **Use MCP tools first** - Always consult nx_workspace, nx_docs, and angular_search_documentation before making assumptions
22. **Leverage real-time workspace info** - Use nx_project_details and nx_current_running_tasks_details for accurate project state
23. **Follow MCP workflow** - Use generators through nx_run_generator with proper schemas from nx_generator_schema
24. **CRITICAL: Always create index.ts files** - Every component, directive, pipe, or service MUST have its corresponding `index.ts` file for proper module organization and clean imports
25. **Update parent index files** - When creating new components, always update the parent library's `index.ts` file to export the new component
26. **NO inline comments** - Do NOT add inline comments (`//` or `/* */`) in any files. Only JSDoc comments (`/** */`) are allowed in `.ts` files

## Project-Specific Patterns

### State Management
- Use Angular Signals for reactive state
- Implement signal stores for complex state management
- Follow the established patterns in `libs/front/state/`

### Authentication & Authorization
- Firebase Auth for authentication
- Firebase Firestore security rules for database-level authorization
- Role-based permissions system implemented

### Data Flow
- Services handle data operations
- Components consume services
- Models define data structures
- Proper separation of concerns maintained

This documentation should provide AI agents with comprehensive understanding of the project structure, development standards, and local setup requirements.
