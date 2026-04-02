# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Warning

This project uses **Next.js 16.2.1** which has breaking changes from earlier versions. Before writing any code that touches Next.js APIs (routing, data fetching, middleware, etc.), read the relevant guide in `node_modules/next/dist/docs/` — organized as `01-app/`, `02-pages/`, `03-architecture/`. Heed deprecation notices.

## Commands

```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint (flat config, eslint.config.mjs)
```

No test runner is configured. Run all commands from the `syneria/` directory (the Next.js project root, not the parent folder).

## Environment Variables

Copy `.env.example` to `.env.local`. Required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`.

## Stack

- **Next.js 16** (App Router, RSC) + **React 19** + **TypeScript 5**
- **Supabase** (PostgreSQL, Auth, Storage) via `@supabase/ssr`
- **Tailwind CSS 4** + **shadcn/ui** (base-nova style, Lucide icons)
- **next-intl** for i18n (6 locales: es, en, pt, fr, de, ar)
- **Framer Motion** for animations
- **React Hook Form** + **Zod 4** for forms/validation
- **Recharts** for charts, **@react-pdf/renderer** for PDF generation
- Deployed on **Vercel** with cron jobs and security headers

## Code Style

Prettier enforced: double quotes, semicolons, 2-space indent, trailing commas (es5), Tailwind class sorting via `prettier-plugin-tailwindcss`. ESLint uses flat config with `next/core-web-vitals` and `next/typescript` presets.

## Architecture

### Two-Portal Marketplace

Syneria connects migrant workers with international employers. Routes are grouped by role:

- `src/app/(public)/` — Landing page
- `src/app/(auth)/` — Login, reset password, auth callback
- `src/app/(worker)/` — Worker dashboard, jobs, applications, wallet, messages, network, profile
- `src/app/(employer)/` — Employer dashboard, vacancies, candidates, contracts, company profile, wallet

Middleware (`src/middleware.ts`) enforces role-based access: workers can't access employer routes and vice versa. Unauthenticated users are redirected to `/login`. Worker routes use top-level paths (`/dashboard`, `/jobs`, etc.), employer routes are prefixed with `/employer/`.

### Page Pattern: Server + Client Split

Pages follow a consistent pattern: a server component (`page.tsx`) fetches data, then passes it to a client component (`page-client.tsx` or `*-client.tsx`) for interactivity.

### Data Layer

- **Server data fetching**: `await createClient()` from `src/lib/supabase/server.ts` in page components
- **Client-side Supabase**: `createBrowserClient()` from `src/lib/supabase/client.ts`
- **Mutations**: Server Actions in `src/lib/actions/` (contracts, wallet, jobs, applications, messages, network, reviews)
- **Client hooks**: `src/hooks/` (useAuth, useProfile, useNetwork, useMessages, useNotifications)
- **Admin operations**: `src/lib/supabase/admin.ts` (service role key — server-only)
- **Validation schemas**: `src/lib/validations/` (Zod schemas for profile, company)
- **No global state library** — Supabase is the source of truth

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Authentication

Supabase Auth with Email/password, Google OAuth, and LinkedIn OIDC. Session managed via middleware (`updateSession` from `src/lib/supabase/middleware.ts`). Profile created in `profiles` table on signup with role (worker/employer).

### Database

21 PostgreSQL tables via Supabase. Core entities: profiles, companies, jobs, applications, contracts, wallets, transactions, messages, connections, endorsements, reviews, notifications, network_activity. Contracts have a lifecycle: pendiente → activo → completado/expirado/cancelado. Schema migrations live in `supabase/migrations/`.

### i18n

Default locale is Spanish (`es`). Locale prefix strategy is `as-needed` (no `/es/` prefix for default locale). Config in `src/i18n/routing.ts`, request handler in `src/i18n/request.ts`. Translations organized as `src/i18n/locales/{locale}/{namespace}.json`. Namespaces: common, auth, worker, employer. Use `useTranslations()` hook in client components, `getTranslations()` in server components.

### Styling

Tailwind v4 with CSS variables for theming in `src/app/globals.css`. Brand colors are a green palette. Fonts: Syne (headings), DM Sans (body). Use `cn()` utility from `src/lib/utils` for conditional classes. shadcn/ui components configured via `components.json` (base-nova style, RSC-aware).

### Components Organization

- `src/components/ui/` — shadcn/ui primitives (button, card, dialog, etc.)
- `src/components/shared/` — Reusable business components (barrel-exported via `index.ts`): GlassCard, StatCard, StatusBadge, PageHeader, messaging components, review system, etc. Import from `@/components/shared`.
- `src/components/worker/` — Worker-specific feature components (dashboard, jobs, profile tabs, wallet)
- `src/components/employer/` — Employer-specific feature components (dashboard, vacancies, contracts, candidates)
- `src/components/auth/` — Auth-related components

### API Routes

Only for special cases: auth callbacks (`src/app/api/auth/`, `src/app/auth/`), sign-out, storage init, contract PDF generation (`src/app/api/contracts/`), webhook handling (`src/app/api/webhooks/`), and a daily cron job (`/api/cron/expire-contracts` — runs at midnight UTC via Vercel cron).

### Supabase Migrations

Located in `supabase/migrations/` with numeric prefix ordering. Current migrations: initial schema, storage buckets, profile settings, active role. Apply locally with `supabase db push` or manage via Supabase dashboard.

### Toast Notifications

Uses **Sonner** (not shadcn/ui toast). Import `toast` from `sonner` directly. The `<Toaster>` provider is in the root layout.
