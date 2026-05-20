import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Scope (Phase 0.6, TEST-1b): только pure-utility и query expansion logic
// (expand-recurring, map-row хелперы, date-функции). Component testing —
// отдельным решением позже. См. CLAUDE.md → Testing.
export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: "node",
        include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
        globals: false,
    },
});
