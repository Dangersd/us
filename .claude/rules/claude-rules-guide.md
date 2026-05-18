---
description: Guide for creating and managing Claude Code project rules
---

# Claude Code Rules Guide

## Format

Rules are markdown files in `.claude/rules/`:

```markdown
---
description: Brief description for AI
globs:
  - "**/pattern/**"
alwaysApply: false
---
# Rule Title
Content...
```

## Frontmatter Fields

| Field          | Purpose                     | Example                       |
| -------------- | --------------------------- | ----------------------------- |
| `alwaysApply`  | Always active               | Architecture rules            |
| `globs`        | Auto-attach to files        | `["src/**/*.tsx"]`            |
| `description`  | AI decides when relevant    | Cross-cutting concerns        |

## Rule Types

1. **Always Apply** — `alwaysApply: true` — Universal rules (architecture, imports, styles)
2. **Auto Attached** — `globs: [...]` — Applied when working with matching files
3. **Agent Requested** — `description` only — AI decides when to apply based on context

## Best Practices

- One rule per concern (focused)
- Clear, specific descriptions
- Specific glob patterns (not `**/*`)
- Use kebab-case filenames: `my-rule.md`
- Place all rules in `.claude/rules/`
