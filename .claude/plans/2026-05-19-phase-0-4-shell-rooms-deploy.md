# Phase 0.4 — Shell + 5 комнат + деплой

> **Для агентов-исполнителей:** ОБЯЗАТЕЛЬНЫЙ САБ-СКИЛЛ — `superpowers:subagent-driven-development` (рекомендуется) или `superpowers:executing-plans`. План идёт по чек-боксам (`- [ ]`).

**Цель:** Поднять каркас MVP — после логина видна оболочка (TopBar / BottomNav / Sidebar) и 5 страниц-плейсхолдеров под `(rooms)` с per-room ambient hue. Profile содержит display_name + Logout. Деплой на Vercel.

**Архитектура:**
- Маршруты `(rooms)` — group-сегмент с общим RSC-layout. Layout тянет current user сервером и пробрасывает в client-side `AppShell`.
- `AppShell` рендерит TopBar (везде), BottomNav (только mobile, `md:hidden`), Sidebar (только desktop, `hidden md:flex`), а тело — children.
- Каждая страница оборачивается собственным `RoomShell` с `roomId` — даёт ambient-glow слой и заголовок-плейсхолдер.
- Vercel-деплой через стандартный Next.js билд. `output: "standalone"` в `next.config.mjs` для Vercel не обязателен, но не мешает.

**Стек:** Next.js 16 App Router, React 19, Tailwind v4, Supabase SSR (уже подключён). Framer Motion в 0.4 не задействуем (атмосферные анимации — 0.5+).

**Про тесты:** В проекте нет тестового фреймворка (CLAUDE.md: «No test framework is configured»). Каждая задача завершается:
1. `yarn lint` (ESLint + `tsc --noEmit --skipLibCheck`)
2. Если задача меняет UI — ручной smoke в `yarn dev` на mobile (390px) и desktop (≥768px)
3. Commit (см. `.claude/rules/commit-messages.md`)

**Правила, которым следуем:**
- `.claude/rules/nextjs-react.md` — RSC по умолчанию, `"use client"` только на листьях, абсолютные импорты `~*`.
- `.claude/rules/styles.md` — `cn()` для one-liner, `tv()` для многострочного, никаких inline `style`.
- `.claude/rules/routes.md` — все пути через `~config/routes`, никаких хардкодов.
- `.claude/rules/svg-icons.md` — один файл = одна иконка, `~icons/<group>/<Name>.tsx`.
- `.claude/rules/file-lines.md` — лимит 200 строк; Sidebar заранее разбиваем на 3 файла.
- `.claude/rules/data-layer.md` — никаких прямых Supabase-вызовов из UI; пользователя берём через существующий `fetchCurrentUserServer()` / `useCurrentUser`.

---

## Структура файлов

**Создаём:**
- `src/config/rooms.ts` — единый реестр комнат (id, title, route, hue-class, icon)
- `src/components/icons/shell/HomeIcon.tsx`
- `src/components/icons/shell/MoodIcon.tsx`
- `src/components/icons/shell/CalendarIcon.tsx`
- `src/components/icons/shell/WishlistIcon.tsx`
- `src/components/shell/PartnerStatus.tsx`
- `src/components/shell/AvatarButton.tsx`
- `src/components/shell/TopBar.tsx`
- `src/components/shell/BottomNavItem.tsx`
- `src/components/shell/BottomNav.tsx`
- `src/components/shell/SidebarNavItem.tsx`
- `src/components/shell/SidebarProfileItem.tsx`
- `src/components/shell/Sidebar.tsx`
- `src/components/shell/AppShell.tsx`
- `src/components/shell/RoomShell.tsx`
- `src/components/shell/use-active-room.ts`
- `src/app/(rooms)/layout.tsx`
- `src/app/(rooms)/page.tsx` (Home)
- `src/app/(rooms)/mood/page.tsx`
- `src/app/(rooms)/calendar/page.tsx`
- `src/app/(rooms)/wishlist/page.tsx`
- `src/app/(rooms)/profile/page.tsx`
- `vercel.json`

**Модифицируем:**
- `src/config/routes.ts` — добавляем `MOOD_R`, `CALENDAR_R`, `WISHLIST_R`, `PROFILE_R`
- `src/styles/utilities.css` — добавляем `bg-ambient-{home,mood,calendar,wishlist,profile}` + `bg-personal-hue-{him,her}`
- `src/libs/utils.ts` — добавляем `initialOf()` (используется в TopBar avatar и Sidebar profile-секции)
- `src/queries/user/fetch-current-user.server.ts` — обернуть в `React.cache()` для дедупа per request
- `src/app/layout.tsx` — `statusBarStyle: "black-translucent"` (TopBar теперь сам уходит под safe-area)

**Удаляем:**
- `src/app/page.tsx` — переезжает в `src/app/(rooms)/page.tsx`

---

## Задача 0: Подготовительные правки query-слоя и shared utils

Из eng-review: устраняем дублирование и снижаем стоимость двойного `fetchCurrentUserServer()` per request.

**Файлы:**
- Изменить: `src/queries/user/fetch-current-user.server.ts`
- Изменить: `src/libs/utils.ts`

- [ ] **Шаг 1: обернуть fetchCurrentUserServer в React.cache()**

Заменить файл целиком:

```typescript
// src/queries/user/fetch-current-user.server.ts
import "server-only";

import { cache } from "react";

import type { AppUser } from "~interfaces/user";
import { getServerSupabase } from "~libs/supabase/server";
import {
    USER_COLUMNS,
    type UserRow,
    mapUserRow,
} from "~queries/user/map-user-row";

export const fetchCurrentUserServer = cache(
    async (): Promise<AppUser | null> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return null;

        const { data, error } = await supabase
            .from("users")
            .select(USER_COLUMNS)
            .eq("id", auth.user.id)
            .maybeSingle<UserRow>();
        if (error) throw error;
        return data ? mapUserRow(data) : null;
    },
);
```

`React.cache()` мемоизирует функцию per request — повторный вызов в `Profile` page уже не сделает второй Supabase-запрос.

- [ ] **Шаг 2: добавить initialOf в libs/utils.ts**

Прочитать существующий `src/libs/utils.ts`, дописать в конец:

```typescript
// Первая буква display_name для аватаров; «·» если имя пустое.
export const initialOf = (name: string) =>
    name.trim().charAt(0).toUpperCase() || "·";
```

- [ ] **Шаг 3: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 4: Commit**

```bash
git add src/queries/user/fetch-current-user.server.ts src/libs/utils.ts
git commit -m "Cache fetchCurrentUserServer and add initialOf helper"
```

---

## Задача 1: Расширить routes.ts

**Файлы:**
- Изменить: `src/config/routes.ts`

- [ ] **Шаг 1: Заменить файл целиком**

```typescript
// src/config/routes.ts
// Все маршруты приложения. Никаких хардкодов в компонентах.
export const HOME_R = () => "/";
export const MOOD_R = () => "/mood";
export const CALENDAR_R = () => "/calendar";
export const WISHLIST_R = () => "/wishlist";
export const PROFILE_R = () => "/profile";
export const LOGIN_R = () => "/login";

// Публичные пути, на которые proxy пускает анонимного гостя.
export const AUTH_PATHS: readonly string[] = [LOGIN_R()];
```

- [ ] **Шаг 2: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 3: Commit**

```bash
git add src/config/routes.ts
git commit -m "Add room routes to config"
```

---

## Задача 2: Реестр комнат в config/rooms.ts

Единый источник правды для shell-компонентов. Используется TopBar (заголовок), BottomNav (4 mobile-таба), Sidebar (5 пунктов), RoomShell (hue-класс), use-active-room (id ↔ pathname).

**Файлы:**
- Создать: `src/config/rooms.ts`

- [ ] **Шаг 1: Написать файл**

```typescript
// src/config/rooms.ts
import type { ComponentType, SVGProps } from "react";

import CalendarIcon from "~icons/shell/CalendarIcon";
import HomeIcon from "~icons/shell/HomeIcon";
import MoodIcon from "~icons/shell/MoodIcon";
import WishlistIcon from "~icons/shell/WishlistIcon";
import {
    CALENDAR_R,
    HOME_R,
    MOOD_R,
    PROFILE_R,
    WISHLIST_R,
} from "~config/routes";

export type RoomId = "home" | "mood" | "calendar" | "wishlist" | "profile";

export interface RoomConfig {
    id: RoomId;
    title: string;
    route: string;
    // Tailwind-класс ambient-фона (см. styles/utilities.css)
    hueClass: string;
    // Иконка для nav. У profile иконки нет — он рендерится через avatar
    // (в TopBar и в Sidebar profile-секции).
    Icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export const ROOMS: Record<RoomId, RoomConfig> = {
    home: {
        id: "home",
        title: "Дом",
        route: HOME_R(),
        hueClass: "bg-ambient-home",
        Icon: HomeIcon,
    },
    mood: {
        id: "mood",
        title: "Настроение",
        route: MOOD_R(),
        hueClass: "bg-ambient-mood",
        Icon: MoodIcon,
    },
    calendar: {
        id: "calendar",
        title: "Календарь",
        route: CALENDAR_R(),
        hueClass: "bg-ambient-calendar",
        Icon: CalendarIcon,
    },
    wishlist: {
        id: "wishlist",
        title: "Хотелки",
        route: WISHLIST_R(),
        hueClass: "bg-ambient-wishlist",
        Icon: WishlistIcon,
    },
    profile: {
        id: "profile",
        title: "Профиль",
        route: PROFILE_R(),
        hueClass: "bg-ambient-profile",
    },
};

// Комнаты в основной навигации (BottomNav mobile + Sidebar desktop nav).
// Profile везде через avatar, не в этом списке.
export const NAV_ROOMS: readonly RoomConfig[] = (
    ["home", "mood", "calendar", "wishlist"] as const
).map((id) => ROOMS[id]);
```

- [ ] **Шаг 2: Lint упадёт — это нормально**

Запустить: `yarn lint`
Ожидаемо: FAIL — иконки ещё не созданы, починим в Задаче 3.

- [ ] **Шаг 3: Коммит откладываем**

Закоммитим вместе с иконками в Задаче 3.

---

## Задача 3: 4 SVG-иконки для shell-навигации

Outline-стиль, weight ~1.5px (см. `docs/02-design-system.md → Иконки`). В Pencil использовался Lucide (`house`, `sparkles`, `calendar`, `heart`) — мы делаем близкие по форме custom-SVG, чтобы соответствовать правилу `svg-icons.md` (никаких внешних icon-libs в 0.4). У profile иконки нет — он всегда рендерится через avatar. Финальная палитра (метафоры «дверь / огонь / окно / луна») — апдейт за пределами 0.4.

**Файлы:**
- Создать: `src/components/icons/shell/HomeIcon.tsx`
- Создать: `src/components/icons/shell/MoodIcon.tsx`
- Создать: `src/components/icons/shell/CalendarIcon.tsx`
- Создать: `src/components/icons/shell/WishlistIcon.tsx`

- [ ] **Шаг 1: HomeIcon — домик**

```tsx
// src/components/icons/shell/HomeIcon.tsx
import type { SVGProps } from "react";

const HomeIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M3.5 10.5 12 3.5l8.5 7v9a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9Z" />
    </svg>
);

export default HomeIcon;
```

- [ ] **Шаг 2: MoodIcon — мягкая «искра»**

```tsx
// src/components/icons/shell/MoodIcon.tsx
import type { SVGProps } from "react";

const MoodIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 3c1.5 3 3 4.5 6 6-3 1.5-4.5 3-6 6-1.5-3-3-4.5-6-6 3-1.5 4.5-3 6-6Z" />
    </svg>
);

export default MoodIcon;
```

- [ ] **Шаг 3: CalendarIcon**

```tsx
// src/components/icons/shell/CalendarIcon.tsx
import type { SVGProps } from "react";

const CalendarIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path d="M3.5 10h17" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
    </svg>
);

export default CalendarIcon;
```

- [ ] **Шаг 4: WishlistIcon — звезда**

```tsx
// src/components/icons/shell/WishlistIcon.tsx
import type { SVGProps } from "react";

const WishlistIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 3.5 14.6 9l6 .8-4.4 4.2 1.1 6L12 17.2 6.7 20l1.1-6L3.4 9.8 9.4 9Z" />
    </svg>
);

export default WishlistIcon;
```

- [ ] **Шаг 5: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS (теперь rooms.ts резолвит импорты)

- [ ] **Шаг 6: Commit**

```bash
git add src/config/rooms.ts src/components/icons/shell/
git commit -m "Add room registry and shell navigation icons"
```

---

## Задача 4: Per-room ambient-утилиты в utilities.css

Радиальный градиент на фоне `bg-base`. Position: центр сверху viewport, ~70% width × 60% height, opacity ~0.15. Согласно `docs/design-tz/05-screens/shell-navigation.md → Ambient layer`.

**Файлы:**
- Изменить: `src/styles/utilities.css`

- [ ] **Шаг 1: Дописать 5 утилит в конец файла**

```css
/* === Per-room ambient — radial glow center-top поверх bg-base === */
/* Используется RoomShell для атмосферы комнаты. Дыхание/анимация — в v0.5+. */

@utility bg-ambient-home {
    background:
        radial-gradient(
            ellipse 70% 60% at 50% 0%,
            rgba(255, 201, 168, 0.15) 0%,
            transparent 70%
        ),
        var(--color-bg-base);
}

@utility bg-ambient-mood {
    background:
        radial-gradient(
            ellipse 70% 60% at 50% 0%,
            rgba(232, 180, 255, 0.15) 0%,
            transparent 70%
        ),
        var(--color-bg-base);
}

@utility bg-ambient-calendar {
    background:
        radial-gradient(
            ellipse 70% 60% at 50% 0%,
            rgba(244, 208, 138, 0.15) 0%,
            transparent 70%
        ),
        var(--color-bg-base);
}

@utility bg-ambient-wishlist {
    background:
        radial-gradient(
            ellipse 70% 60% at 50% 0%,
            rgba(255, 180, 209, 0.15) 0%,
            transparent 70%
        ),
        var(--color-bg-base);
}

@utility bg-ambient-profile {
    background:
        radial-gradient(
            ellipse 70% 60% at 50% 0%,
            rgba(168, 201, 255, 0.15) 0%,
            transparent 70%
        ),
        var(--color-bg-base);
}

/* === Personal-hue градиенты для аватаров (TopBar + Sidebar profile-секция) === */
/* Также пригодится в 0.5+ для mood-blob'ов. */

@utility bg-personal-hue-him {
    background: radial-gradient(
        circle at 30% 30%,
        #ffd5a8 0%,
        #e8a87c 100%
    );
}

@utility bg-personal-hue-her {
    background: radial-gradient(
        circle at 30% 30%,
        #ffc4d2 0%,
        #f4a5b9 100%
    );
}
```

- [ ] **Шаг 2: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 3: Commit**

```bash
git add src/styles/utilities.css
git commit -m "Add per-room ambient background utilities"
```

---

## Задача 5: PartnerStatus — индикатор «оба чекнулись»

Два маленьких glow-blob'а 12px, gap 6px. В 0.4 — статичный плейсхолдер: оба full opacity (≡ оба «чекнулись»), без real-time данных. В 0.5+ будет питаться из mood-query.

**Файлы:**
- Создать: `src/components/shell/PartnerStatus.tsx`

- [ ] **Шаг 1: Написать компонент**

```tsx
// src/components/shell/PartnerStatus.tsx
// Слева в TopBar: 2 маленьких blob'а с personal hue (его + её).
// 0.4 — статический плейсхолдер (оба full opacity). Реальные данные — 0.5+ из mood-query.
import { cn } from "~libs/utils";

const blob = cn(
    "h-3 w-3 rounded-full",
    "shadow-[0_0_8px_rgba(255,201,168,0.25)]",
);

const PartnerStatus = () => (
    <div className={cn("flex items-center gap-1.5")} aria-hidden>
        <span className={cn(blob, "bg-hue-him")} />
        <span className={cn(blob, "bg-hue-her")} />
    </div>
);

export default PartnerStatus;
```

- [ ] **Шаг 2: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 3: Commit**

```bash
git add src/components/shell/PartnerStatus.tsx
git commit -m "Add PartnerStatus indicator stub"
```

---

## Задача 6: AvatarLink — навигация в Profile

Круглый аватар с personal-hue градиентом, инициал внутри. Используется в TopBar — рендерится как `<Link>` (не `<button>`), чтобы получить prefetch Next.js + поддержку «открыть в новой вкладке». Это также делает компонент server-renderable (без `"use client"`), уменьшая client bundle.

Sidebar profile-секция использует визуально-идентичный аватар, но **вложенный в свой собственный `<Link>`** — поэтому там аватар не отдельный link, а декоративный `<span>` (см. Задачу 10).

Personal-hue градиент берётся из `@utility bg-personal-hue-*` (см. Задачу 4) — никакого дублирования inline-цветов.

**Файлы:**
- Создать: `src/components/shell/AvatarLink.tsx`

- [ ] **Шаг 1: Написать компонент**

```tsx
// src/components/shell/AvatarLink.tsx
// Аватар в TopBar — кликабельный <Link> в Profile.
// RSC — никаких хуков, prefetch работает из коробки.
import Link from "next/link";

import { type VariantProps, tv } from "tailwind-variants";

import { PROFILE_R } from "~config/routes";
import type { Gender } from "~interfaces/user";
import { cn, initialOf } from "~libs/utils";

const avatar = tv({
    base: cn(
        "inline-flex items-center justify-center",
        "rounded-full border border-border-warm",
        "font-display font-medium text-ink-primary select-none",
        "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "active:scale-[0.95]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
    ),
    variants: {
        size: {
            sm: cn("h-8 w-8 text-sm"),
            md: cn("h-10 w-10 text-base"),
        },
        hue: {
            male: cn("bg-personal-hue-him"),
            female: cn("bg-personal-hue-her"),
        },
    },
    defaultVariants: { size: "sm", hue: "male" },
});

type AvatarVariants = VariantProps<typeof avatar>;

interface AvatarLinkProps extends AvatarVariants {
    gender: Gender;
    displayName: string;
    className?: string;
}

const AvatarLink = ({
    gender,
    displayName,
    size,
    className,
}: AvatarLinkProps) => (
    <Link
        href={PROFILE_R()}
        aria-label={`Профиль: ${displayName}`}
        className={cn(avatar({ size, hue: gender }), className)}
    >
        {initialOf(displayName)}
    </Link>
);

export default AvatarLink;
```

- [ ] **Шаг 2: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 3: Commit**

```bash
git add src/components/shell/AvatarLink.tsx
git commit -m "Add AvatarLink with personal-hue gradient"
```

---

## Задача 7: use-active-room — хук подсветки активной комнаты

По `usePathname()` определяет, какой `RoomId` сейчас открыт. Сегменты сопоставляем по `startsWith(route)` — это переживёт future nested-routes (например `/calendar/2026-05-19`). `/` совпадает только при exact-match, иначе home подсветился бы везде.

**Файлы:**
- Создать: `src/components/shell/use-active-room.ts`

- [ ] **Шаг 1: Написать хук**

```typescript
// src/components/shell/use-active-room.ts
"use client";

import { usePathname } from "next/navigation";

import { ROOMS, type RoomId } from "~config/rooms";

export function useActiveRoom(): RoomId | null {
    const pathname = usePathname();
    if (!pathname) return null;

    // / — только exact-match (иначе home будет матчить всё)
    if (pathname === ROOMS.home.route) return "home";

    // Остальные комнаты: совпадение по префиксу
    for (const room of Object.values(ROOMS)) {
        if (room.id === "home") continue;
        if (
            pathname === room.route ||
            pathname.startsWith(room.route + "/")
        ) {
            return room.id;
        }
    }
    return null;
}
```

- [ ] **Шаг 2: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 3: Commit**

```bash
git add src/components/shell/use-active-room.ts
git commit -m "Add useActiveRoom hook for nav highlighting"
```

---

## Задача 8: TopBar

Sticky bar: 56px (mobile) / 64px (desktop). Слева — PartnerStatus. По центру (только mobile) — название текущей комнаты (Inter 14, ink-secondary). Справа — AvatarButton. Стеклянный фон с blur, граница снизу. На mobile добавляем safe-area-inset-top через `pt-[env(safe-area-inset-top)]`.

**Файлы:**
- Создать: `src/components/shell/TopBar.tsx`

- [ ] **Шаг 1: Написать компонент**

```tsx
// src/components/shell/TopBar.tsx
// Sticky top bar: partner status + room title (mobile) + avatar.
// PartnerStatus в 0.4 — статический stub. Real-time — 0.5+.
"use client";

import AvatarLink from "~components/shell/AvatarLink";
import PartnerStatus from "~components/shell/PartnerStatus";
import { useActiveRoom } from "~components/shell/use-active-room";
import { ROOMS } from "~config/rooms";
import type { AppUser } from "~interfaces/user";
import { cn } from "~libs/utils";

interface TopBarProps {
    user: AppUser;
}

const TopBar = ({ user }: TopBarProps) => {
    const activeId = useActiveRoom();
    // Fallback на «Дом» — если pathname неизвестен (transient state на 404),
    // показываем нейтральный заголовок вместо пустоты.
    const title = ROOMS[activeId ?? "home"].title;

    return (
        <header
            className={cn(
                "sticky top-0 z-30 w-full",
                "bg-bg-base/60 backdrop-blur-2xl",
                "border-b border-border-subtle",
                "pt-[env(safe-area-inset-top)]",
            )}
        >
            <div
                className={cn(
                    "relative flex h-14 items-center justify-between px-4",
                    "md:h-16 md:px-10",
                )}
            >
                <PartnerStatus />

                <h1
                    className={cn(
                        "absolute left-1/2 -translate-x-1/2",
                        "font-sans text-sm font-medium text-ink-secondary",
                        "md:hidden",
                    )}
                >
                    {title}
                </h1>

                <AvatarLink
                    gender={user.gender}
                    displayName={user.displayName}
                />
            </div>
        </header>
    );
};

export default TopBar;
```

- [ ] **Шаг 2: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 3: Commit**

```bash
git add src/components/shell/TopBar.tsx
git commit -m "Add TopBar with partner status, room title, avatar"
```

---

## Задача 9: BottomNavItem + BottomNav (только mobile)

4 таба: home / mood / calendar / wishlist. Без подписей. Active = `ink.primary` + warm-glow halo + scale 1.1, default = `ink.secondary`. Profile тут НЕТ — он через avatar справа сверху.

**Файлы:**
- Создать: `src/components/shell/BottomNavItem.tsx`
- Создать: `src/components/shell/BottomNav.tsx`

- [ ] **Шаг 1: BottomNavItem (RSC, без хуков)**

```tsx
// src/components/shell/BottomNavItem.tsx
// RSC — никаких хуков, active передаётся пропсом из BottomNav.
import { type VariantProps, tv } from "tailwind-variants";

import Link from "next/link";

import type { RoomConfig } from "~config/rooms";
import { cn } from "~libs/utils";

const item = tv({
    slots: {
        wrapper: cn(
            "inline-flex h-12 w-14 items-center justify-center",
            "rounded-md transition-colors duration-300",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
        ),
        icon: cn(
            "h-6 w-6 transition-[color,transform,filter] duration-300",
            "ease-[cubic-bezier(0.22,1,0.36,1)]",
        ),
    },
    variants: {
        active: {
            true: {
                wrapper: cn("bg-border-warm"),
                icon: cn(
                    "text-ink-primary scale-110",
                    "drop-shadow-[0_0_10px_rgba(255,201,168,0.35)]",
                ),
            },
            false: {
                wrapper: cn("bg-transparent"),
                icon: cn("text-ink-secondary"),
            },
        },
    },
    defaultVariants: { active: false },
});

type ItemVariants = VariantProps<typeof item>;

interface BottomNavItemProps extends ItemVariants {
    room: RoomConfig;
}

const BottomNavItem = ({ room, active }: BottomNavItemProps) => {
    const { wrapper, icon } = item({ active });
    const Icon = room.Icon;
    if (!Icon) return null;
    return (
        <Link
            href={room.route}
            aria-label={room.title}
            aria-current={active ? "page" : undefined}
            className={wrapper()}
        >
            <Icon className={icon()} />
        </Link>
    );
};

export default BottomNavItem;
```

- [ ] **Шаг 2: BottomNav**

`activeId` приходит пропсом из `AppShell` — там единственный вызов `useActiveRoom()` на всё дерево. BottomNav сам тогда тоже может быть RSC.

```tsx
// src/components/shell/BottomNav.tsx
// Mobile-only fixed bottom nav. На desktop скрыт через md:hidden.
// activeId приходит пропсом — RSC, без хуков.
import BottomNavItem from "~components/shell/BottomNavItem";
import { NAV_ROOMS, type RoomId } from "~config/rooms";
import { cn } from "~libs/utils";

interface BottomNavProps {
    activeId: RoomId | null;
}

const BottomNav = ({ activeId }: BottomNavProps) => (
    <nav
        aria-label="Основная навигация"
        className={cn(
            "fixed bottom-0 left-0 right-0 z-30",
            "md:hidden",
            "bg-bg-base/70 backdrop-blur-2xl",
            "border-t border-border-subtle",
            "px-4 pb-[env(safe-area-inset-bottom)] pt-2",
        )}
    >
        <ul className={cn("flex h-16 items-center justify-around")}>
            {NAV_ROOMS.map((room) => (
                <li key={room.id}>
                    <BottomNavItem
                        room={room}
                        active={activeId === room.id}
                    />
                </li>
            ))}
        </ul>
    </nav>
);

export default BottomNav;
```

- [ ] **Шаг 3: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 4: Commit**

```bash
git add src/components/shell/BottomNav.tsx src/components/shell/BottomNavItem.tsx
git commit -m "Add mobile BottomNav with 4 room tabs"
```

---

## Задача 10: SidebarNavItem + SidebarProfileItem + Sidebar (только desktop)

Sidebar 240px, скрыт на mobile (`hidden md:flex`). Разбиваем на 3 файла, чтобы Sidebar.tsx уложился в 200 строк. SidebarProfileItem использует визуально-идентичный, но **не-интерактивный** `<span>` внутри `<Link>` — нельзя вкладывать `<button>` или вложенный `<a>` в `<Link>`. Все три файла — RSC (никаких хуков, active/activeId приходит из AppShell).

**Файлы:**
- Создать: `src/components/shell/SidebarNavItem.tsx`
- Создать: `src/components/shell/SidebarProfileItem.tsx`
- Создать: `src/components/shell/Sidebar.tsx`

- [ ] **Шаг 1: SidebarNavItem (RSC)**

```tsx
// src/components/shell/SidebarNavItem.tsx
// RSC — active пропсом из Sidebar; никаких хуков.
import { type VariantProps, tv } from "tailwind-variants";

import Link from "next/link";

import type { RoomConfig } from "~config/rooms";
import { cn } from "~libs/utils";

const item = tv({
    slots: {
        wrapper: cn(
            "flex h-12 items-center gap-3 px-3 rounded-sm",
            "transition-colors duration-300",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
            "hover:bg-bg-surface-1",
        ),
        icon: cn("h-5 w-5"),
        label: cn("text-base font-normal"),
    },
    variants: {
        active: {
            true: {
                wrapper: cn("bg-bg-surface-1"),
                icon: cn(
                    "text-glow-warm",
                    "drop-shadow-[0_0_10px_rgba(255,201,168,0.5)]",
                ),
                label: cn("text-ink-primary"),
            },
            false: {
                wrapper: cn(""),
                icon: cn("text-ink-secondary"),
                label: cn("text-ink-secondary"),
            },
        },
    },
    defaultVariants: { active: false },
});

type ItemVariants = VariantProps<typeof item>;

interface SidebarNavItemProps extends ItemVariants {
    room: RoomConfig;
}

const SidebarNavItem = ({ room, active }: SidebarNavItemProps) => {
    const { wrapper, icon, label } = item({ active });
    const Icon = room.Icon;
    if (!Icon) return null;
    return (
        <Link
            href={room.route}
            aria-current={active ? "page" : undefined}
            className={wrapper()}
        >
            <Icon className={icon()} />
            <span className={label()}>{room.title}</span>
        </Link>
    );
};

export default SidebarNavItem;
```

- [ ] **Шаг 2: SidebarProfileItem (RSC, аватар = `<span>` через @utility)**

`active` приходит пропсом из Sidebar. Personal-hue градиент — `bg-personal-hue-*` (см. Задачу 4).

```tsx
// src/components/shell/SidebarProfileItem.tsx
import Link from "next/link";

import { PROFILE_R } from "~config/routes";
import type { AppUser } from "~interfaces/user";
import { cn, initialOf } from "~libs/utils";

interface SidebarProfileItemProps {
    user: AppUser;
    active: boolean;
}

const SidebarProfileItem = ({ user, active }: SidebarProfileItemProps) => {
    const initial = initialOf(user.displayName);
    return (
        <Link
            href={PROFILE_R()}
            aria-current={active ? "page" : undefined}
            className={cn(
                "flex h-12 items-center gap-3 px-3 rounded-sm",
                "transition-colors duration-300 hover:bg-bg-surface-1",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
                { "bg-bg-surface-1": active },
            )}
        >
            <span
                aria-hidden
                className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full",
                    "border border-border-warm",
                    "font-display text-sm font-medium text-ink-primary select-none",
                    {
                        "bg-personal-hue-him": user.gender === "male",
                        "bg-personal-hue-her": user.gender === "female",
                    },
                )}
            >
                {initial}
            </span>
            <span
                className={cn("text-base", {
                    "text-ink-primary": active,
                    "text-ink-secondary": !active,
                })}
            >
                {user.displayName}
            </span>
        </Link>
    );
};

export default SidebarProfileItem;
```

- [ ] **Шаг 3: Sidebar (RSC, оркестратор)**

```tsx
// src/components/shell/Sidebar.tsx
// Desktop-only sidebar 240px. На mobile скрыт.
// Sidebar — RSC; activeId получает пропсом от AppShell (client),
// чтобы избежать дублирования useActiveRoom().
import SidebarNavItem from "~components/shell/SidebarNavItem";
import SidebarProfileItem from "~components/shell/SidebarProfileItem";
import { NAV_ROOMS, type RoomId } from "~config/rooms";
import type { AppUser } from "~interfaces/user";
import { cn } from "~libs/utils";

interface SidebarProps {
    user: AppUser;
    activeId: RoomId | null;
}

const Sidebar = ({ user, activeId }: SidebarProps) => (
    <aside
        aria-label="Боковая навигация"
        className={cn(
            "hidden md:flex md:w-60 md:flex-col",
            "border-r border-border-subtle bg-bg-base/95",
            "px-4 py-6",
        )}
    >
        <div className={cn("mb-6 px-2")}>
            <span
                className={cn(
                    "font-display text-2xl font-medium text-ink-primary",
                    "tracking-[-0.02em]",
                )}
            >
                us
            </span>
        </div>

        <nav className={cn("flex flex-col gap-1")}>
            {NAV_ROOMS.map((room) => (
                <SidebarNavItem
                    key={room.id}
                    room={room}
                    active={activeId === room.id}
                />
            ))}
        </nav>

        <div className={cn("mt-auto pt-4 border-t border-border-subtle")}>
            <SidebarProfileItem
                user={user}
                active={activeId === "profile"}
            />
        </div>
    </aside>
);

export default Sidebar;
```

- [ ] **Шаг 4: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 5: Commit**

```bash
git add src/components/shell/Sidebar.tsx src/components/shell/SidebarNavItem.tsx src/components/shell/SidebarProfileItem.tsx
git commit -m "Add desktop Sidebar with nav and profile section"
```

---

## Задача 11: RoomShell — ambient layer + placeholder hero

Per-room wrapper: рендерит ambient-glow фон (через `bg-ambient-<id>`) и центрированный hero-заголовок-плейсхолдер. Виджетов внутри нет — придут в 0.5+.

**Файлы:**
- Создать: `src/components/shell/RoomShell.tsx`

- [ ] **Шаг 1: Написать компонент**

```tsx
// src/components/shell/RoomShell.tsx
// Wrapper каждой комнаты. Ambient glow + content area + placeholder hero.
// section получает aria-labelledby от h2, чтобы screen reader не дублировал заголовок.
import type { ReactNode } from "react";

import { ROOMS, type RoomId } from "~config/rooms";
import { cn } from "~libs/utils";

interface RoomShellProps {
    roomId: RoomId;
    children?: ReactNode;
}

const RoomShell = ({ roomId, children }: RoomShellProps) => {
    const room = ROOMS[roomId];
    const titleId = `room-${roomId}-title`;
    return (
        <section
            aria-labelledby={titleId}
            className={cn(
                "relative flex-1",
                room.hueClass,
                "px-4 pt-4 pb-20",
                "md:px-10 md:pt-8 md:pb-8",
            )}
        >
            <div
                className={cn(
                    "mx-auto flex w-full max-w-3xl flex-col items-center",
                    "py-16 md:py-24",
                    "text-center",
                )}
            >
                <h2
                    id={titleId}
                    className={cn(
                        "font-display text-ink-primary",
                        "text-3xl md:text-4xl font-medium tracking-[-0.02em]",
                        "mb-4",
                    )}
                >
                    {room.title}
                </h2>
                <p className={cn("text-ink-secondary text-base max-w-md")}>
                    Комната скоро откроется.
                </p>
                {children ? (
                    <div className={cn("mt-10 w-full")}>{children}</div>
                ) : null}
            </div>
        </section>
    );
};

export default RoomShell;
```

- [ ] **Шаг 2: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 3: Commit**

```bash
git add src/components/shell/RoomShell.tsx
git commit -m "Add RoomShell with ambient hue and placeholder hero"
```

---

## Задача 12: AppShell — собрать chrome

Client-component, оркестрирует TopBar / Sidebar / BottomNav + рендерит children. Берёт user пропсом (от RSC-layout). Sidebar занимает левый столбец на desktop; основной flex-col справа держит TopBar (sticky) + main + BottomNav (mobile, fixed).

**Файлы:**
- Создать: `src/components/shell/AppShell.tsx`

- [ ] **Шаг 1: Написать компонент**

```tsx
// src/components/shell/AppShell.tsx
// Корневой shell для всех (rooms)-страниц.
// Layout: [Sidebar (md+)] + [main column: TopBar / children / BottomNav (mobile)]
// Единственное место, где вызывается useActiveRoom() — потом activeId
// прокидывается в дочерние nav-компоненты пропсами.
"use client";

import type { ReactNode } from "react";

import BottomNav from "~components/shell/BottomNav";
import Sidebar from "~components/shell/Sidebar";
import TopBar from "~components/shell/TopBar";
import { useActiveRoom } from "~components/shell/use-active-room";
import type { AppUser } from "~interfaces/user";
import { cn } from "~libs/utils";

interface AppShellProps {
    user: AppUser;
    children: ReactNode;
}

const AppShell = ({ user, children }: AppShellProps) => {
    const activeId = useActiveRoom();

    return (
        <div className={cn("flex min-h-dvh w-full")}>
            <Sidebar user={user} activeId={activeId} />

            <div className={cn("flex min-w-0 flex-1 flex-col")}>
                <TopBar user={user} />
                <main className={cn("flex flex-1 flex-col")}>{children}</main>
                <BottomNav activeId={activeId} />
            </div>
        </div>
    );
};

export default AppShell;
```

> `TopBar` остаётся client (нужен `useActiveRoom` для заголовка mobile). В будущем можно передать `activeId` пропсом из `AppShell` и сделать TopBar RSC — но тогда `TopBar` будет ре-рендериться от parent re-render'ов; сейчас более чистая изоляция. Оставляем `useActiveRoom` в TopBar.

- [ ] **Шаг 2: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 3: Commit**

```bash
git add src/components/shell/AppShell.tsx
git commit -m "Add AppShell composing TopBar, Sidebar, BottomNav"
```

---

## Задача 13: (rooms)/layout.tsx — auth-guard + AppShell

RSC. Тянет current user через `fetchCurrentUserServer()`. Если orphan (auth есть, но row в `public.users` отсутствует) — рендерит `LoginShell` с «Профиль не настроен» + Logout (переезд логики из текущего `src/app/page.tsx`). Иначе — `AppShell` с детьми.

**Файлы:**
- Создать: `src/app/(rooms)/layout.tsx`

- [ ] **Шаг 1: Написать layout**

```tsx
// src/app/(rooms)/layout.tsx
import type { ReactNode } from "react";

import LoginShell from "~components/auth/LoginShell";
import LogoutButton from "~components/auth/LogoutButton";
import AppShell from "~components/shell/AppShell";
import { cn } from "~libs/utils";
import { fetchCurrentUserServer } from "~queries/user/fetch-current-user.server";

const RoomsLayout = async ({ children }: { children: ReactNode }) => {
    const user = await fetchCurrentUserServer();

    // Orphan-state: auth.user есть, но row в public.users отсутствует.
    // Не редиректим (иначе loop с proxy) — даём выйти.
    if (!user) {
        return (
            <LoginShell>
                <div
                    className={cn(
                        "flex flex-col items-center gap-6 text-center",
                    )}
                >
                    <h1
                        className={cn(
                            "font-display text-ink-primary text-2xl font-medium",
                        )}
                    >
                        Профиль не настроен
                    </h1>
                    <p className={cn("text-ink-secondary text-base")}>
                        Свяжись с админом, чтобы привязать аккаунт к паре.
                    </p>
                    <LogoutButton variant="soft" size="md" />
                </div>
            </LoginShell>
        );
    }

    return <AppShell user={user}>{children}</AppShell>;
};

export default RoomsLayout;
```

- [ ] **Шаг 2: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 3: Commit**

```bash
git add "src/app/(rooms)/layout.tsx"
git commit -m "Add (rooms) layout with auth guard and AppShell"
```

---

## Задача 14: 5 страниц-плейсхолдеров + удаление старой `/`

Каждая комната — RSC, рендерит `<RoomShell roomId="…">`. Profile дополнительно показывает display_name и LogoutButton.

**Файлы:**
- Создать: `src/app/(rooms)/page.tsx` (Home)
- Создать: `src/app/(rooms)/mood/page.tsx`
- Создать: `src/app/(rooms)/calendar/page.tsx`
- Создать: `src/app/(rooms)/wishlist/page.tsx`
- Создать: `src/app/(rooms)/profile/page.tsx`
- Удалить: `src/app/page.tsx`

- [ ] **Шаг 1: Home — `src/app/(rooms)/page.tsx`**

```tsx
import RoomShell from "~components/shell/RoomShell";

const HomePage = () => <RoomShell roomId="home" />;

export default HomePage;
```

- [ ] **Шаг 2: Mood — `src/app/(rooms)/mood/page.tsx`**

```tsx
import RoomShell from "~components/shell/RoomShell";

const MoodPage = () => <RoomShell roomId="mood" />;

export default MoodPage;
```

- [ ] **Шаг 3: Calendar — `src/app/(rooms)/calendar/page.tsx`**

```tsx
import RoomShell from "~components/shell/RoomShell";

const CalendarPage = () => <RoomShell roomId="calendar" />;

export default CalendarPage;
```

- [ ] **Шаг 4: Wishlist — `src/app/(rooms)/wishlist/page.tsx`**

```tsx
import RoomShell from "~components/shell/RoomShell";

const WishlistPage = () => <RoomShell roomId="wishlist" />;

export default WishlistPage;
```

- [ ] **Шаг 5: Profile — `src/app/(rooms)/profile/page.tsx`**

Layout уже гарантирует наличие user; запрашиваем ещё раз для отображения имени. Это два дёшевых Supabase-запроса в одном render-pass — приемлемо для 0.4. В 0.5+ можно подтянуть `React.cache()`-обёртку или прокинуть user через context.

```tsx
import LogoutButton from "~components/auth/LogoutButton";
import RoomShell from "~components/shell/RoomShell";
import { cn } from "~libs/utils";
import { fetchCurrentUserServer } from "~queries/user/fetch-current-user.server";

const ProfilePage = async () => {
    const user = await fetchCurrentUserServer();

    return (
        <RoomShell roomId="profile">
            <div className={cn("flex flex-col items-center gap-6")}>
                <p className={cn("text-ink-secondary text-base")}>
                    Привет,{" "}
                    <span className="text-ink-primary">
                        {user?.displayName}
                    </span>
                    .
                </p>
                <LogoutButton variant="soft" size="md" />
            </div>
        </RoomShell>
    );
};

export default ProfilePage;
```

- [ ] **Шаг 6: Удалить старую `/`**

```bash
git rm src/app/page.tsx
```

- [ ] **Шаг 7: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 8: Smoke в браузере**

Запустить: `yarn dev`
Открыть `http://localhost:3000/login`, войти под любым аккаунтом.
Проверить:
- Попадаем на `/` → видим Home с тёплым янтарным ambient, TopBar сверху, BottomNav снизу (mobile)
- На desktop (резайз окна ≥ 768px) — слева Sidebar с 4 пунктами + Профиль внизу
- Tap по каждому табу: переход с подсвеченным active-state
- Tap по аватару справа сверху (mobile) → Profile с display_name + Logout
- Logout → возврат на /login
- У каждой комнаты — свой ambient hue: дом = янтарь, mood = лила, calendar = янтарная бумага, wishlist = розовый, profile = небо
- На mobile проверить, что контент не уезжает под notch (TopBar держит safe-area-inset-top)

- [ ] **Шаг 9: Commit**

```bash
git add "src/app/(rooms)" src/app/page.tsx
git commit -m "Wire up 5 room placeholder pages and remove root duplicate"
```

---

## Задача 15: Status bar → black-translucent

После того как TopBar занимает safe-area-inset-top сам, статус-бар PWA можно сделать прозрачным — тёплый glow Home проступит за ним.

**Файлы:**
- Изменить: `src/app/layout.tsx`

- [ ] **Шаг 1: Заменить блок `appleWebApp`**

```typescript
    appleWebApp: {
        capable: true,
        title: "us",
        // TopBar держит env(safe-area-inset-top), статус-бар может уйти прозрачным.
        statusBarStyle: "black-translucent",
    },
```

- [ ] **Шаг 2: Lint**

Запустить: `yarn lint`
Ожидаемо: PASS

- [ ] **Шаг 3: Smoke**

Открыть в mobile-DevTools или на устройстве. Проверить, что TopBar не уезжает под notch.

- [ ] **Шаг 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "Switch PWA status bar to black-translucent"
```

---

## Задача 16: Vercel-деплой

Vercel автоматически детектит Next.js — `next.config.mjs` уже сконфигурирован. Минимальный `vercel.json` для региона (Франкфурт ближе к нам, чем дефолт США).

**Файлы:**
- Создать: `vercel.json`

- [ ] **Шаг 1: vercel.json**

```json
{
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "regions": ["fra1"],
    "framework": "nextjs"
}
```

- [ ] **Шаг 2: Env vars (задаются в Vercel UI)**

Перечислены в commit-message. В Vercel UI → Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key
- `SUPABASE_SERVICE_ROLE_KEY` — service role (server-side, в 0.4 не используется — кладём заранее)

Все три — для `Production` + `Preview` + `Development`.

- [ ] **Шаг 3: Build локально как проверка**

Запустить: `yarn build`
Ожидаемо: PASS

- [ ] **Шаг 4: Commit**

```bash
git add vercel.json
git commit -m "Configure Vercel deploy region (fra1)"
```

- [ ] **Шаг 5: Подключить проект к Vercel (вручную)**

Через `vercel` CLI или Vercel UI:
1. Импортировать GitHub-репозиторий
2. Установить env vars (см. Шаг 2)
3. Триггернуть деплой
4. Проверить production URL: login → войти → пройтись по всем 5 комнатам → logout

Этот шаг manual, не блокирует merge самой ветки.

---

## Задача 17: Финальный smoke + PR

- [ ] **Шаг 1: Полный lint + build**

```bash
yarn lint && yarn build
```
Ожидаемо: оба PASS

- [ ] **Шаг 2: Полный smoke в `yarn dev`**

Чек-лист:
- [ ] /login отдаётся anon-гостю; авторизованного редиректит на /
- [ ] / показывает Home с янтарным ambient, TopBar, BottomNav (mobile) / Sidebar (desktop)
- [ ] BottomNav: home / mood / calendar / wishlist подсвечиваются по очереди при переходе
- [ ] Sidebar (desktop ≥ 768px): те же 4 пункта + Профиль внизу, active-подсветка корректна
- [ ] Avatar справа сверху на mobile → /profile
- [ ] Профиль в Sidebar внизу → /profile
- [ ] /profile показывает display_name и Logout
- [ ] Logout → /login; повторный заход требует пароля
- [ ] Прямой URL `/mood`, `/calendar`, `/wishlist`, `/profile` без auth → редирект на /login
- [ ] reduced-motion в OS → анимации scale не дёргают (плавность сохраняется)
- [ ] На mobile DevTools (iPhone 14): TopBar не уезжает под notch, BottomNav не уезжает под home-indicator

- [ ] **Шаг 3: Создать PR**

```bash
gh pr create --title "Phase 0.4 — Shell + 5 rooms + Vercel deploy" --body "$(cat <<'EOF'
## Summary

- Каркас MVP: TopBar / BottomNav (mobile) / Sidebar (desktop) под (rooms) layout
- 5 страниц-плейсхолдеров: /, /mood, /calendar, /wishlist, /profile
- Per-room ambient hue через radial-gradient утилиты
- Profile содержит display_name + Logout (переезд с временной /)
- Vercel-деплой (fra1 регион)

## Test plan

- [ ] yarn lint проходит
- [ ] yarn build проходит
- [ ] Login → попадаем на / с warm ambient
- [ ] 4 таба BottomNav (mobile) / 4 пункта Sidebar (desktop) переключают комнаты с подсветкой
- [ ] Avatar TopBar (mobile) и блок «Профиль» в Sidebar (desktop) ведут на /profile
- [ ] /profile показывает имя и Logout
- [ ] Logout → /login
- [ ] Vercel-деплой поднимается, env vars выставлены, все 5 рутов открываются

EOF
)"
```

---

## Self-Review

### Покрытие спека

| Спек из user-input | Где покрыто |
|---|---|
| После логина — оболочка TopBar / BottomNav / Sidebar | Задачи 8, 9, 10, 12 |
| 5 страниц под (rooms): /, /mood, /calendar, /wishlist, /profile | Задачи 13, 14 |
| RoomShell с per-room ambient hue + заголовок | Задачи 4, 11 |
| Никаких виджетов внутри | Задача 11 (только hero-плейсхолдер) |
| Profile = display_name + Logout | Задача 14, Шаг 5 |
| Удалить временную / | Задача 14, Шаг 6 |
| Деплой на Vercel | Задача 16 |
| .claude/rules/* (nextjs-react / styles / routes / file-lines) | Sidebar разбит на 3 файла; routes.ts расширен; стили через cn/tv; абсолютные импорты |
| svg-icons.md | Задача 3 — 4 отдельных icon-файла (profile через avatar, не через иконку) |

### Изменения после `/plan-eng-review`

- **Задача 0 (новая):** обернуть `fetchCurrentUserServer` в `React.cache()`; вынести `initialOf` в `~libs/utils`.
- **Задача 2:** убрана dead-config (`inBottomNav`/`inSidebarNav`), `BOTTOM_NAV_ROOMS` + `SIDEBAR_NAV_ROOMS` объединены в `NAV_ROOMS`. `RoomConfig.Icon` стал опциональным (у profile иконки нет).
- **Задача 3:** убран `ProfileIcon` (не используется — profile-route рендерится через аватар).
- **Задача 4:** добавлены `@utility bg-personal-hue-him` / `bg-personal-hue-her` — DRY-источник градиентов аватаров.
- **Задача 6:** `AvatarButton` → `AvatarLink`. Использует `<Link>` (prefetch, RSC, accessibility) вместо `useRouter().push()`. Стал RSC — `"use client"` убран. Использует `bg-personal-hue-*` утилиты.
- **Задача 8:** TopBar fallback `ROOMS.home.title` при unknown pathname (вместо пустоты).
- **Задача 9:** BottomNav принимает `activeId` пропсом из AppShell; BottomNavItem стал RSC (без `"use client"`). `bg-[rgba(255,201,168,0.08)]` → `bg-border-warm` (canonical class).
- **Задача 10:** SidebarNavItem + SidebarProfileItem + Sidebar — все три RSC. `useActiveRoom` больше не вызывается дублирующе в SidebarProfileItem — `active: boolean` приходит пропсом.
- **Задача 11:** RoomShell — `aria-labelledby` вместо `aria-label`, чтобы screen reader не дублировал заголовок.
- **Все файлы:** `backdrop-blur-[40px]` → `backdrop-blur-2xl` (canonical Tailwind v4).

### Согласованность типов

- `RoomId` определён в `~config/rooms` (Задача 2), используется в `RoomShell`, `useActiveRoom`, `BottomNav`, `Sidebar`, `AppShell` — везде одинаковая сигнатура.
- `RoomConfig.Icon: ComponentType<SVGProps<SVGSVGElement>> | undefined` (опционально, у profile нет). BottomNavItem / SidebarNavItem делают `if (!Icon) return null` — но `NAV_ROOMS` исключает profile, так что в норме ветка не срабатывает.
- `AppUser` из `~interfaces/user` без изменений; используется в TopBar, AvatarLink, Sidebar, SidebarProfileItem, AppShell, RoomsLayout.
- `Gender` совпадает с `hue`-вариантами в AvatarLink.

### Проверка на placeholders

- Нет «TBD» / «implement later» / «add appropriate error handling».
- В каждой задаче — полный код.
- Каждая ссылка определена раньше использования (Task 0 → 1 → 2 → 3 → ... ).

### Архитектурные риски / отложено в P2

- **Sidebar tint от ambient hue:** дизайн-док обещает `bg.base + tint текущей комнаты`. В 0.4 sidebar нейтральный (`bg-bg-base/95`). TODO 0.5+: пробросить `hueClass` в Sidebar и применить 5–10% opacity overlay.
- **z-index reserve:** TopBar=30, BottomNav=30. Нет конвенции для modal/toast. TODO 0.5+: ввести шкалу (shell=30, modal=40, toast=50) когда появится первый modal.
- **`backdrop-blur-2xl` на low-end Android:** видимое торможение при скролле. TODO 0.5+: `@media (prefers-reduced-transparency)` fallback с solid-bg.
- **Реальные mood-данные в PartnerStatus:** в 0.4 статический stub, оба blob'а full opacity. Будет 0.5+ с mood-query.
- **Финальные иконки** (дверь / огонь / окно / луна-метафоры из `02-design-system.md`) — апдейт за пределами 0.4.
- **Sidebar collapsed-mode 64px** — отложен в 0.5+.
- **Reduced-motion media query** — будет вместе с floating particles в 0.5+.
- **Anchor focus-ring overlap с avatar** — в Sidebar profile-item оба `<Link>` и `<span>` имеют focus стили; оставлено на ручной visual smoke.
