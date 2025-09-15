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

#### Component Architecture
- **Standalone Components**: All components are standalone by default (no `standalone: true` needed in v20.1.3)
- **File Structure**: Separate `.ts`, `.html`, and `.scss` files for components
- **Dependency Injection**: Use `inject()` function instead of constructor injection
- **Signals**: Prefer signal-based inputs (`input()`) and outputs (`output()`) over decorators
- **State Management**: Use Angular Signals for reactive state management

#### Template Standards
- **Control Flow**: Use built-in control flow (`@if`, `@for`, `@switch`) instead of structural directives
- **Track Expressions**: Always include `track` in `@for` loops for performance
- **Template Variables**: Use `@let` for local variables and `#var` for template references
- **Empty States**: Include `@empty` blocks with `@for` loops

#### Naming Conventions
- **Files**: `feature.type.ts` pattern (e.g., `user-profile.component.ts`)
- **Classes**: PascalCase with descriptive names
- **Variables/Methods**: camelCase
- **Constants**: UPPER_SNAKE_CASE

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
- Use `@Injectable({ providedIn: 'root' })` for singleton services
- Delegate data operations to dedicated services
- Keep components lean by moving complex logic to services

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

### Development Workflow

1. **Start Services**: Run Firebase emulators
2. **Build Application**: Use `pnpm nx build app-name` or `pnpm nx serve app-name`
3. **Access Applications**:
   - Frontend Apps: `http://localhost:4200` (default port, may vary)
   - Firebase UI: `http://localhost:4000`

### Common Nx Commands

These commands work for any app in the monorepo (replace `app-name` with the actual app name):

```bash
# Generate new component
pnpm nx generate @nx/angular:component component-name --project=app-name

# Generate new service
pnpm nx generate @nx/angular:service service-name --project=app-name

# Generate new library
pnpm nx generate @nx/angular:library library-name

# Lint code
pnpm nx lint app-name

# Build for production
pnpm nx build app-name --configuration=production

# Run tests
pnpm nx test app-name

# Show project graph
pnpm nx graph

# List all projects
pnpm nx show projects
```


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

### Current Key Dependencies
- `@angular/*`: Angular 20.1.3 framework
- `@angular/fire`: Firebase integration
- `@ngrx/signals`: State management
- `tailwindcss`: CSS framework
- `basecoat-css`: UI component foundation
- `firebase`: Backend services
- `@nx/*`: Nx monorepo tools

### Development Dependencies
- `@nx/*`: Nx monorepo tools
- `firebase-tools`: Firebase CLI
- `typescript`: TypeScript compiler

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
