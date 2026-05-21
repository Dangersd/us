// No-op shim для `server-only` пакета в vitest-окружении.
// Реальный server-only кидает при импорте из client bundle, но в vitest мы
// тестируем фабрики (pure queryKey shape) — нам нужно просто чтобы импорт
// прошёл без ошибок. См. vitest.config.ts → resolve.alias.
export {};
