---
description: Data layer rules (Supabase + React Query): no direct Supabase calls from UI
globs:
  - "src/app/api/**/*.ts"
  - "src/app/api/**/*.tsx"
  - "src/queries/**/*.ts"
  - "src/queries/**/*.tsx"
  - "src/libs/supabase/**/*.ts"
---

# Data layer: Supabase + `src/queries` (no direct Supabase calls in UI)

## 0) Why this rule exists

In this project all data goes through Supabase, but UI must not call Supabase client directly. Instead, UI consumes hooks/functions from `src/queries/**`, which wrap Supabase calls in React Query.

This keeps:
- query keys consistent
- caching predictable
- Server vs Client branching centralized

## 1) Forbidden

Inside `src/components/**` or `src/app/**` (outside route handlers):

- Importing `createBrowserClient` / `createServerClient` directly
- Calling `.from()`, `.rpc()`, `.storage` directly
- Hardcoding any Supabase table names

## 2) Allowed places for Supabase calls

- **Server client wrapper**: `src/libs/supabase/server.ts` — exports a `getServerSupabase()` factory that reads cookies via `@supabase/ssr`. Used by Server Components and Route Handlers.
- **Browser client wrapper**: `src/libs/supabase/client.ts` — exports `getBrowserSupabase()` singleton for client-side use. Used by query functions inside `src/queries/**`.
- **Service-role client**: only inside Route Handlers when admin operations are needed. Never imported in components.
- **Data layer**: `src/queries/**` — the single source of truth for queries/mutations and React Query configs.

## 3) Query layer structure

```
src/queries/
├── <domain>/
│   ├── keys.ts              # query keys factory
│   ├── fetch-<thing>.ts     # raw fetch function (server + client branch if needed)
│   ├── use-<thing>.ts       # React Query hook (useQuery / useMutation)
│   └── index.ts             # barrel export
```

## 4) Server / Client branching

Most queries can use the browser client (with RLS). Some need server-side execution (Server Component prefetch). The pattern:

```typescript
// src/queries/mood/fetch-today-mood.ts
import { getBrowserSupabase } from "~libs/supabase/client";
import { getServerSupabase } from "~libs/supabase/server";

export async function fetchTodayMood(userId: string) {
    const supabase =
        typeof window === "undefined"
            ? await getServerSupabase()
            : getBrowserSupabase();

    const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", new Date().toISOString().slice(0, 10))
        .maybeSingle();

    if (error) throw error;
    return data;
}
```

## 5) Query keys

Keep all keys in `keys.ts` per domain:

```typescript
// src/queries/mood/keys.ts
export const moodKeys = {
    all: ["mood"] as const,
    today: (userId: string) => [...moodKeys.all, "today", userId] as const,
    history: (userId: string, range: string) =>
        [...moodKeys.all, "history", userId, range] as const,
};
```

## 6) Types / Interfaces for queries

- All TypeScript types used by query responses **must** live in `src/interfaces/**` (e.g. `src/interfaces/mood.ts`).
- **Forbidden**: defining response types inside `src/queries/**` files.
- Import with the `~interfaces/` alias: `import type { MoodEntry } from "~interfaces/mood"`.

## 7) When to add a Route Handler instead of a query

Use a Route Handler (`src/app/api/<name>/route.ts`) only when:
- You need the service-role key (admin operations)
- You need server-only logic that can't run with RLS
- You need to perform multi-step transactions with secrets

Otherwise, keep it in `src/queries/**` with the regular Supabase client + RLS.

## 8) RLS as the source of truth

All access control happens via Supabase Row Level Security policies, not client-side checks. The client trusts the database to return only what the user is allowed to see. UI must never assume RLS doesn't exist.
