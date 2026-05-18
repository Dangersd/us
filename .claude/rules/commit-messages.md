---
description: Git commit message guidelines. Apply when writing a commit message or generating commit text.
---

# Git Commit Message Guidelines

## Action Required

**When this rule is applied, immediately and without asking any questions:**

1. Check git changes: `git diff` and `git diff --staged`
2. Analyze what changed and why
3. Write commit message following format below
4. **Output only the commit message text** (do NOT push)

---

## Format

**Subject line (50-72 chars):**
- Capitalize first letter, no period
- Imperative mood: "Add feature" not "Added feature"

**Body (optional, 2-4 sentences):**
- Separate from subject with blank line
- Explain **what** changed and **why** (not how)
- Wrap at 72 characters

**Language:** English only, clear and professional

---

## Examples

Good:
```
Add mood pair-glance widget to Home

Render both partner mood blobs side-by-side with morphing animation
tied to energy/stress sliders. Respects per-field privacy settings
so hidden values render as muted placeholders.
```

Bad:
```
fix bug              # Too vague
Исправил ошибку      # Not English
```

---

## Guidelines

- Be specific: "Add icon picker" > "Update UI"
- Focus on user impact
- Use present tense: "Add" not "Added"
- One logical change per commit
- Don't include: implementation details, file names (unless needed), WIP/temp/test, emojis, trailing punctuation
