import { fileURLToPath } from "node:url";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Scope (Phase 0.6, TEST-1b): pure-utility, query expansion и factories.test
// (queryKey shape). Component testing — отдельным решением позже. См.
// CLAUDE.md → Testing.
export default defineConfig({
    plugins: [tsconfigPaths()],
    resolve: {
        // server-only — маркерный пакет Next.js, кидает при импорте из client
        // bundle. В vitest он не нужен (тестируем pure-функции и queryKey
        // shape фабрик) — алиасим в no-op.
        alias: {
            "server-only": fileURLToPath(
                new URL("./test/server-only-noop.ts", import.meta.url),
            ),
        },
    },
    test: {
        environment: "node",
        include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
        globals: false,
    },
});
