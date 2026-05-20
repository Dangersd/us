import { QueryClient } from "@tanstack/react-query";

// Shared QueryClient factory. Используется и server-side (page.tsx prefetch),
// и client-side (Providers singleton). Не импортируется из Providers.tsx
// напрямую в server graph — server page'ы зовут makeQueryClient() сами.

export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60_000,
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    });
}
