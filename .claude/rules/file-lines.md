---
description: Maximum file size rule
alwaysApply: true
---

# File Size Rule

The maximum file size is 200 lines of code. If exceeded, split into separate logical files following the single responsibility principle (types, utils, services, handlers). Use descriptive file names, barrel exports via index.ts, and avoid mixing different logic layers in one file.
