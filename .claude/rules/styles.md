---
description: Style writing rules using cn and tailwind-variants
alwaysApply: true
---

# Style Writing Rules

All styles must use `cn` from `~libs/utils` for consistency and proper Tailwind class merging.

## Core Rules

1. **Simple styles (one line)** — use `cn` directly:

    ```tsx
    <div className={cn("flex items-center gap-4")} />
    ```

2. **Multi-line styles** — use `tv` from `tailwind-variants`:

    ```tsx
    const variants = tv({
        base: cn("font-medium rounded-full", "px-4 py-2"),
    });
    ```

    Forbidden: multi-line `cn()` without `tv`

3. **Multiple elements** — use `slots` in `tv`:

    ```tsx
    const variants = tv({
        slots: {
            container: cn("flex flex-col", "p-6"),
            title: cn("text-xl font-bold"),
        },
    });
    const { container, title } = variants();
    ```

4. **Style variations** — use `variants` in `tv`:

    ```tsx
    const variants = tv({
        base: cn("..."),
        variants: {
            color: { primary: "bg-primary", secondary: "bg-secondary" },
            size: { sm: "text-sm", lg: "text-lg" },
        },
        defaultVariants: { color: "primary", size: "sm" },
    });
    ```

5. **Conditional styles** — use object syntax in `cn`:

    ```tsx
    // Correct
    <div className={cn("flex", { "bg-primary": isActive, "bg-gray-200": !isActive })} />

    // Incorrect - ternary or string concatenation
    <div className={cn(isActive ? "bg-primary" : "bg-gray-200")} />
    ```

6. **Override styles** — combine `tv()` result with `cn`:

    ```tsx
    <div className={cn(variants(), "custom-class")} />
    ```

7. **No inline `style` attribute** — never use `style={{...}}` on elements. If a value requires dynamic or complex CSS (e.g. `grid-template-columns`, `transition`), create a custom Tailwind utility via `@utility` in CSS:

    ```css
    /* src/styles/utilities.css */
    @utility grid-cols-bar-normal {
        grid-template-columns: 2fr 3fr;
    }
    ```

    ```tsx
    // Component
    <div className={cn("grid-cols-bar-normal")} />
    ```

    For dynamic values based on state, use conditional classes:

    ```tsx
    <div
        className={cn({
            "grid-cols-bar-normal": !isCompact,
            "grid-cols-bar-compact": isCompact,
        })}
    />
    ```

## Summary

| Scenario                 | Use                          |
| ------------------------ | ---------------------------- |
| One-line styles          | `cn("...")`                  |
| Multi-line styles        | `tv({ base: cn(...) })`      |
| Multiple elements        | `tv({ slots: {...} })`       |
| Variations (color, size) | `tv({ variants: {...} })`    |
| Conditional              | `cn({ "class": condition })` |
