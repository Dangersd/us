---
alwaysApply: true
---

# SVG Icons Rule

**Never inline SVG markup directly in components.** All SVG icons must be extracted into dedicated React components under `src/components/icons/`.

## Rules

1. **No inline SVG** — `<svg>` tags are forbidden inside page/section/layout components
2. **One icon = one file** — each SVG lives in its own component (e.g. `BlobIcon.tsx`, `MoonIcon.tsx`)
3. **Path**: `src/components/icons/<group>/<IconName>.tsx` — group by feature/section when appropriate
4. **Props**: accept `className` and spread `SVGProps<SVGSVGElement>` for flexibility
5. **Import and use** the icon component instead of pasting SVG

## Example

```tsx
// src/components/icons/MoonIcon.tsx
import type { SVGProps } from "react";

const MoonIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M14 1a9 9 0 1 0 5 16A9 9 0 0 1 14 1Z" />
    </svg>
);

export default MoonIcon;
```

```tsx
// Usage in a component
import MoonIcon from "~icons/MoonIcon";

<MoonIcon className="text-glow-soft" />;
```
