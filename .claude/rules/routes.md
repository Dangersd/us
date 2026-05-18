---
description: Route paths must come from src/config/routes.ts. Apply when adding links, redirects, or pathname checks.
alwaysApply: true
---

# Routes Rule

All route paths must be defined in `src/config/routes.ts` and imported from `~config/routes`. Never hardcode path strings like `"/login"` or `"/mood"` in components, hooks, or API routes.

## What belongs in routes.ts

- Page route functions: `export const LOGIN_R = () => "/login";`
- Route groups: `export const AUTH_PATHS = [LOGIN_R()];`

## Usage

```tsx
// Correct
import { LOGIN_R } from "~config/routes";

<Link href={LOGIN_R()}>Войти</Link>;
window.location.href = LOGIN_R();

// Incorrect
<Link href="/login">Войти</Link>;
window.location.href = "/login";
```

## Adding a new route

1. Add the route function to `src/config/routes.ts`
2. Import and use it everywhere — components, hooks, API redirects
