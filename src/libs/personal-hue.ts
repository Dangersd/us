import type { Gender } from "~interfaces/user";

// Resolver hex-значения personal hue текущего пользователя/партнёра по
// gender. Читает из CSS-переменных --color-hue-him / --color-hue-her
// (см. styles/globals.css:35-36) — единственный источник правды. Без
// дублирования hex в JS.
//
// Client-only: использует getComputedStyle(document.documentElement).
// Вызывающие компоненты (EdgeGlow через CSS, PartnerStatus в JS) уже client.
//
// Кеширование per-process: первый вызов делает DOM read, остальные —
// hashmap lookup. CSS-vars в проекте не меняются runtime (тёмная тема
// фиксирована), поэтому invalidation не нужен.
//
// SSR-fallback: на сервере document не существует — возвращаем хардкод
// hex. После hydrate компонент перерендерится и получит значение из CSS.
const FALLBACK: Record<Gender, string> = {
    male: "#e8a87c",
    female: "#f4a5b9",
};

const cache = new Map<Gender, string>();

export const getPersonalHue = (gender: Gender): string => {
    const cached = cache.get(gender);
    if (cached) return cached;

    if (typeof window === "undefined") {
        return FALLBACK[gender];
    }

    const varName = gender === "male" ? "--color-hue-him" : "--color-hue-her";
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();

    const resolved = value || FALLBACK[gender];
    cache.set(gender, resolved);
    return resolved;
};
