# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Commands

```bash
yarn dev              # Dev server with Turbopack
yarn build            # Prettier + Next.js production build
yarn lint             # ESLint + TypeScript strict check (tsc --noEmit --skipLibCheck)
yarn test             # Vitest one-shot run
yarn test:watch       # Vitest watch mode
yarn prettier         # Format all source files
```

## Testing

Vitest (introduced Phase 0.6.1). **Scope intentionally narrow**: pure-utility
functions and query expansion logic only — `expand-recurring`, `map-*-row`,
date helpers in `src/libs/date.ts`. Component testing (React Testing Library)
is **out of scope** until a separate decision is made.

Test files live next to the code: `expand-recurring.ts` + `expand-recurring.test.ts`.
Both `yarn lint` and `yarn test` are gates before merge.

## Project Overview

**us** — a private, two-person digital home. PWA-first web app for a single couple. Mobile-first with strong desktop. Cozy/atmospheric night-mode aesthetic. Russian-only UI.

Stack:

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion
- **Backend**: Supabase (Postgres + Auth + Storage), Row Level Security as the source of truth
- **Data**: React Query wrapping Supabase calls (see `.claude/rules/data-layer.md`)
- **State**: Zustand for UI state, React Query for server state
- **Forms**: react-hook-form + yup

Design philosophy: see `docs/01-concept.md`. Bespoke component library — no HeroUI/shadcn/Material.

## Project Structure

```
src/
├── app/                  # App Router (RU-only, no [lng] segment)
│   ├── api/              # Route handlers (privileged Supabase, signed URLs)
│   └── (rooms)/          # Home, Mood, Calendar, Wishlist, Profile
├── components/
│   ├── ui/               # Bespoke primitives (Button, Card, Slider, Blob)
│   ├── icons/            # SVG icons as components
│   ├── form/             # Form field wrappers (react-hook-form)
│   └── widgets/          # Composed widgets (mood-pair-glance, memory-card, etc.)
├── config/               # Routes, breakpoints, Supabase config
├── hooks/                # Shared React hooks
├── interfaces/           # Domain types (mood, event, wishlist-item, ...)
├── libs/
│   ├── supabase/         # server.ts, client.ts (factories)
│   └── utils.ts          # cn() and helpers
├── queries/              # React Query layer (one folder per domain)
│   ├── mood/
│   ├── calendar/
│   ├── wishlist/
│   └── ...
└── styles/               # globals.css, utilities.css
```

## Data Flow

1. **Server Component prefetch (optional)** → `getServerSupabase()` → `prefetchQuery` → `<HydrationBoundary>`
2. **Client fetch** → React Query hook from `src/queries/<domain>` → uses `getBrowserSupabase()` under the hood
3. **Mutations** → `useMutation` from `src/queries/<domain>` → invalidates relevant query keys
4. **Authorization** → Supabase RLS policies, not client-side checks

## Key Conventions

- **No native `<button>`** — use the `Button` primitive from `~components/ui/Button`
- **No native `<input>` / `<textarea>`** — use form fields from `~components/form/fields/`
- **Absolute imports only** — `~components`, `~libs`, `~queries`, etc. (see `tsconfig.json`)
- **No inline SVG** — see `.claude/rules/svg-icons.md`
- **Routes only via `~config/routes`** — never hardcode paths
- **Styles** — `cn()` for one-liners, `tv()` for multi-line and variants

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key (safe for browser)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role (server-only, Route Handlers)

## Rules

Detailed coding conventions are in `.claude/rules/`. Always-apply rules:

- **nextjs-react** — Architecture layers, absolute imports, Server Components by default
- **styles** — `cn()` + `tailwind-variants` patterns
- **file-lines** — Max 200 lines per file
- **routes** — All paths via `~config/routes`
- **svg-icons** — No inline SVG, one icon per file

## Design Source of Truth

- `docs/01-concept.md` — Philosophy, principles, what is NOT in scope
- `docs/02-design-system.md` — Palette, typography, animations, per-room atmosphere
- `docs/03-rooms/*.md` — Each room (Home, Mood, Calendar, Wishlist, Profile)
- `docs/04-privacy-and-notifications.md` — Granular privacy model
- `docs/05-tech.md` — Stack details, data model sketch
- `docs/06-roadmap.md` — MVP / v0.2 (cycle) / future
- `docs/07-open-questions.md` — TBDs
