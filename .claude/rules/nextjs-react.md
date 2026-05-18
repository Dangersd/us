---
description: Code writing rules (Next.js App Router, React 19, Supabase)
alwaysApply: true
---

# Code writing rules (Next.js App Router / React 19 / Supabase)

## Scope

- **Framework**: Next.js 16 (App Router), React 19, Supabase (DB + Auth + Storage)
- **Goal**: less client-side JS, predictable data-flow, strong accessibility, consistent imports/styles

## 1) Project architecture (layers and responsibilities)

- **App Router / UI**: `src/app/**`
  - Single locale, no `[lng]` segment (project is RU-only)
  - Default to Server Components; use client components only where hooks/events are required
- **API Route Handlers**: `src/app/api/**/route.ts`
  - Server-only operations that should not run in the browser (privileged Supabase calls, signed URLs, complex business logic)
  - Hide service-role keys inside Route Handlers; never expose to the client
- **Data layer**: `src/queries/**`
  - The only layer where Supabase queries/mutations, query keys, and React Query hooks are defined
  - UI must not call Supabase client directly and must not duplicate query keys
- **UI Components**: `src/components/**`
  - Reusable components/sections/widgets
  - Data access via `src/queries/**` (hooks) and/or Server Components calling Supabase server client
- **Forms**: `src/components/form/**` and `src/components/form/fields/**`
  - Shared fields/validation/UX for forms
- **Shared**:
  - `src/config/**` — configs (routes, Supabase client factories)
  - `src/libs/**` — utilities/wrappers (including server-only), including `cn()` and helpers
  - `src/hooks/**` — shared hooks
- **Types**: `src/interfaces/**`, `types/**`
- **Styles**: `src/styles/**`, `tailwind.config.ts`

## 2) Imports and project structure

- **Only absolute imports via aliases from `tsconfig.json`** (start with `~`, e.g. `~`, `~components/*`, `~libs/*`, `~src/*`).
- **Relative imports are forbidden** (`./`, `../`) — even within the same folder. Enforced by ESLint.
- **Unknown aliases are forbidden** — add them to `tsconfig.json` `paths` first, then use.
- **Import types with `import type`**:

```typescript
import type { ReactNode } from "react";

import { cn } from "~libs/utils";
```

## 3) Client / Server components (App Router)

- **Default to Server Components.** Add `"use client"` only when you need:
  - React hooks (`useState`, `useEffect`, `useRef`, etc.)
  - Browser APIs (`window`, `document`, `localStorage`, `navigator`)
  - Event handlers (`onClick`, `onChange`, drag, etc.)
- **Keep the client boundary at the leaves.** Avoid `"use client"` on entire pages without strong reasons.
- **Do not pull heavy dependencies into the client** (analytics, large SDKs) — load only where needed.

## 4) Supabase client usage

- **Server client** (`src/libs/supabase/server.ts`) — used in Server Components, Route Handlers, Server Actions. Reads cookies for auth.
- **Browser client** (`src/libs/supabase/client.ts`) — used inside `"use client"` components only.
- **Service-role client** — only inside Route Handlers when admin access is required. Never imported in components.

See `data-layer.md` for query layer details.

## 5) Bespoke design system

- The project uses a custom design system (cozy/atmospheric night-mode). **No HeroUI, no shadcn, no Material**.
- Build primitives in `src/components/ui/` (Button, Card, Input, etc.) — keep them small, focused, and styled with `cn()` + `tailwind-variants`.
- See `docs/02-design-system.md` for visual tokens (palette, typography, animations).
