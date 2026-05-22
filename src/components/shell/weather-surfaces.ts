// Surface tracker для Phase 2 splash physics. Pure module — никакого React.
// Поверхности — DOM-элементы с `data-weather-surface="true"`. Кэш хранит
// ССЫЛКИ на элементы + mountedAt; getBoundingClientRect читается ЖИВЬЁМ при
// каждом запросе из RAF. Это обязательно для cards внутри scrollable main —
// при скролле viewport rect меняется, а кэшированный — нет (bug-fix после
// первого live-теста, где капли разбивались на "исходной" высоте).
//
// Grace period (350ms) гасит первые ~300ms после mount модалки/карточки,
// пока scale/y анимация не settle'ится — иначе splash прицеливается в
// "будущее место" surface'а. См. eng review D3.

export interface SurfaceSnapshot {
    id: string;
    rect: { top: number; left: number; right: number; bottom: number };
    edge: "top" | "all";
    mountedAt: number; // epoch ms
}

interface CachedEntry {
    id: string;
    el: HTMLElement;
    edge: "top" | "all";
    mountedAt: number;
    isVisible: boolean; // обновляется IntersectionObserver'ом
}

let cached: CachedEntry[] = [];
let intersectionObserver: IntersectionObserver | null = null;

const ensureIntersectionObserver = (): IntersectionObserver | null => {
    if (typeof window === "undefined") return null;
    if (intersectionObserver) return intersectionObserver;
    intersectionObserver = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                const id = (entry.target as HTMLElement).dataset
                    .weatherSurfaceId;
                if (!id) continue;
                const c = cached.find((x) => x.id === id);
                if (c) c.isVisible = entry.isIntersecting;
            }
        },
        // rootMargin даёт 100px-буфер сверху/снизу, чтобы surfaces которые
        // только что появились/исчезли не давали мерцание.
        { rootMargin: "100px" },
    );
    return intersectionObserver;
};

export const GRACE_PERIOD_MS = 350;

// Debug — включается через NEXT_PUBLIC_WEATHER_DEBUG_LOG="1" в .env.local.
// Логи rate-limited: ~раз в 2 сек на каждый bucket.
const DEBUG_LOG =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_WEATHER_DEBUG_LOG === "1";

const lastLogAt = new Map<string, number>();
const rateLimitedLog = (bucket: string, ...args: unknown[]): void => {
    if (!DEBUG_LOG) return;
    const now = Date.now();
    const last = lastLogAt.get(bucket) ?? 0;
    if (now - last < 2000) return;
    lastLogAt.set(bucket, now);
    console.log(`[weather:${bucket}]`, ...args);
};

export const __debugLog = rateLimitedLog;

const generateId = (): string => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `ws-${Math.random().toString(36).slice(2)}-${Date.now()}`;
};

// Перечисляет surface-элементы и обновляет cache ссылок + IDs. НЕ читает
// rect'ы здесь — это делает getActiveSurfaces() при каждом запросе.
// Каждый элемент попадает под IntersectionObserver для visibility tracking.
export const refreshSurfaceCache = (): void => {
    if (typeof document === "undefined") return;
    const els = document.querySelectorAll<HTMLElement>(
        '[data-weather-surface="true"]',
    );
    const now = Date.now();
    const prev = new Map(cached.map((s) => [s.id, s]));
    const observer = ensureIntersectionObserver();
    // Найдём добавленные/исчезнувшие элементы для observe/unobserve.
    const nextCached: CachedEntry[] = [];
    const seenIds = new Set<string>();
    for (const el of Array.from(els)) {
        if (!el.dataset.weatherSurfaceId) {
            el.dataset.weatherSurfaceId = generateId();
        }
        const id = el.dataset.weatherSurfaceId;
        seenIds.add(id);
        const edge = el.dataset.weatherSurfaceEdge === "all" ? "all" : "top";
        const prevEntry = prev.get(id);
        if (prevEntry) {
            // already cached — keep entry, but update edge if changed
            prevEntry.edge = edge;
            prevEntry.el = el;
            nextCached.push(prevEntry);
        } else {
            const entry: CachedEntry = {
                id,
                el,
                edge,
                mountedAt: now,
                isVisible: false, // станет true когда IO зарегистрирует
            };
            nextCached.push(entry);
            observer?.observe(el);
        }
    }
    // Unobserve элементы которые исчезли из DOM
    for (const old of cached) {
        if (!seenIds.has(old.id)) observer?.unobserve(old.el);
    }
    cached = nextCached;
    rateLimitedLog(
        "surfaces",
        `count=${cached.length} visible=${cached.filter((c) => c.isVisible).length}`,
    );
};

export const getActiveSurfaces = (): SurfaceSnapshot[] => {
    const now = Date.now();
    const result: SurfaceSnapshot[] = [];
    for (const entry of cached) {
        // Cull off-viewport surfaces — IntersectionObserver сообщает что они
        // не видны, значит drops по ним не попадают визуально. Это драматически
        // снижает getBoundingClientRect calls per tick (Wishlist: 30 cards
        // total, ~5 visible — 5 reads вместо 30).
        if (!entry.isVisible) continue;
        if (now - entry.mountedAt < GRACE_PERIOD_MS) continue;
        const r = entry.el.getBoundingClientRect();
        result.push({
            id: entry.id,
            rect: {
                top: r.top,
                left: r.left,
                right: r.right,
                bottom: r.bottom,
            },
            edge: entry.edge,
            mountedAt: entry.mountedAt,
        });
    }
    return result;
};

// Test-only helpers
export const __resetSurfaceCache = (): void => {
    cached = [];
    lastLogAt.clear();
    if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
    }
};
export const __seedSurfaceCache = (snapshots: SurfaceSnapshot[]): void => {
    // Тестовый seed: создаём fake-элементы с getBoundingClientRect возвращающим
    // фиксированный rect. Все seed'нутые surfaces считаются visible=true.
    cached = snapshots.map((s) => ({
        id: s.id,
        el: {
            getBoundingClientRect: () => s.rect,
            dataset: { weatherSurfaceId: s.id, weatherSurfaceEdge: s.edge },
        } as unknown as HTMLElement,
        edge: s.edge,
        mountedAt: s.mountedAt,
        isVisible: true,
    }));
};

// Reverse iteration: surfaces позже в DOM (DiscardDialog поверх Modal) выигрывают.
// Particle с prevY < surface.top и y >= surface.top пересекла верхнее ребро
// этим кадром. Проверка x ограничивает попадание horizontal'но.
export const findTopEdgeHit = (
    x: number,
    prevY: number,
    y: number,
    surfaces: SurfaceSnapshot[],
): SurfaceSnapshot | null => {
    for (let i = surfaces.length - 1; i >= 0; i -= 1) {
        const s = surfaces[i];
        if (x < s.rect.left || x > s.rect.right) continue;
        if (prevY < s.rect.top && y >= s.rect.top) return s;
    }
    return null;
};
