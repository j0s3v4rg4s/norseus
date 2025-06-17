# Norseus

Welcome to the Norseus Monorepo! This document will guide you through the initial setup and key information needed to start developing in this project.

---

## 🛠️ Tech Stack

- **Nx Monorepo**: Project management and orchestration
- **Angular 19**: Main frontend framework (standalone components, signals, new control flow)
- **TailwindCSS v4**: Utility-first CSS framework
- **Supabase**: Backend as a Service (Postgres, Auth, Storage)
- **@p1kka/ui**: Custom UI component library (used throughout the app)
- **TypeScript**: Strongly typed JavaScript

---

## 💻 Minimum System Requirements

- **OS**: macOS Sonoma 14.5+ (or Linux/Windows with Docker support)
- **Node.js**: v20.x or higher
- **pnpm**: v8.x or higher (recommended for monorepo performance)
- **Docker**: Required for running local Supabase instance
- **Supabase CLI**: v1.0.0+ ([Install Guide](https://supabase.com/docs/guides/cli))

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repo-url>
cd norseus
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Local Supabase

- Install the [Supabase CLI](https://supabase.com/docs/guides/cli#install-the-cli) if you haven't already.
- Start a local Supabase instance:

```bash
supabase start
```

- This will spin up a local Postgres database, Auth, and Studio. The CLI will output your local Supabase URL and API key (typically `http://127.0.0.1:54321` and a service key).

### 4. Configure Local Environment

- Update `apps/admin/src/environments/environment.development.ts` with your local Supabase credentials:

```ts
export const environment = {
  supabase: {
    url: 'http://127.0.0.1:54321', // or as provided by CLI
    apiKey: '<your-local-service-role-key>',
  },
};
```

### 5. Apply Database Migrations & Seed Data

- With Supabase running, apply all migrations and seed the database:

```bash
supabase db reset
```

- This will run all migrations and execute the `supabase/seed.sql` script.

### 6. Generate TypeScript Types from Supabase

- The project uses generated types for Supabase tables and enums. To generate/update them, run:

```bash
supabase gen types typescript --db-url <your-supabase-url> > libs/front/supabase/src/interfaces/types.ts
```

### 7. Start the Development Server

```bash
pnpm nx serve admin
```

---

## 📁 Project Structure

- `apps/admin/` — Main Angular app (dashboard, pages, authentication, etc.)
- `libs/front/ui/` — UI components library (wrappers for @p1kka/ui, modals, layout, etc.)
- `libs/front/core/` — Core frontend libraries (signals, stores, domain logic)
  - `profile/` — User profile state management
- `libs/front/supabase/` — Supabase integration (types, providers, interfaces)
- `libs/assets/` — Shared assets
  - `fonts/` — Montserrat font files
  - `styles/` — Global Tailwind and SCSS styles
- `supabase/` — Database migrations and seed scripts

---

## 📝 Coding Standards

- **Angular 19 best practices**: Standalone components, signals, new control flow (`@if`, `@for`, etc.)
- **TailwindCSS**: Use utility classes for styling whenever possible
- **@p1kka/ui**: Always use this UI library for forms, buttons, navigation, etc.
- **English only**: All code, comments, and documentation must be in English
- **Conventional Commits**: All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) standard and mention the affected project or library

---

## 🧑‍💻 First-Time Developer Checklist

- [ ] Install Node.js, pnpm, Docker, and Supabase CLI
- [ ] Clone the repo and install dependencies
- [ ] Start Supabase locally and update `environment.development.ts`
- [ ] Run migrations and seed the database
- [ ] Generate Supabase types
- [ ] Start the app with `pnpm nx serve admin`

---

## 🆘 Troubleshooting

- **Supabase connection issues**: Ensure Docker is running and Supabase CLI is started
- **Types not generated**: Double-check your DB URL and Supabase credentials
- **Port conflicts**: Default Supabase ports are 54321 (API) and 54322 (Postgres)
- **UI issues**: Make sure you are using @p1kka/ui components and Tailwind classes

---

## 📚 Useful Commands

- `pnpm nx serve admin` — Start the Angular app
- `pnpm nx build admin` — Build the Angular app
- `supabase start` — Start local Supabase
- `supabase db reset` — Reset DB, run all migrations, and seed data

---

## 📦 Additional Notes

- **Fonts**: Montserrat is included and loaded from `libs/assets/fonts/`
- **Material Icons**: Loaded via CDN in `index.html`
- **Global Styles**: Tailwind and custom styles in `libs/assets/styles/global.css` and `global.scss`
- **RLS**: Supabase uses Row Level Security (RLS) — policies are defined in migrations

---

## 🤝 Contributing

- Please follow the coding standards and commit message guidelines
- Open issues or pull requests for bugs, features, or questions

---

## 📬 Contact

For help, reach out to the project maintainer or open an issue in the repository.

