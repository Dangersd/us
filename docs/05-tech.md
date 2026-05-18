# 05 — Тех. эскиз

Не полная спецификация — концептуальный набросок. Детали родятся в плане реализации.

## Стек

| Слой | Технология | Зачем |
|------|------------|-------|
| Hosting | Vercel | Родной деплой Next.js, бесплатный tier подходит |
| Backend | Supabase | Postgres + Auth + Storage + (опц.) Realtime, free tier |
| Framework | Next.js 16 (App Router) | Server Components, route handlers, PWA support |
| UI | React 19 + Tailwind CSS v4 | Без HeroUI/shadcn — bespoke design |
| Animations | Framer Motion | Сложные кастомные жесты для blobs, переходов |
| Data | @tanstack/react-query + @supabase/ssr | Кэширование + SSR-фрэндли |
| UI state | Zustand | Лёгкий стор для UI-стейта (nav, modals) |
| Forms | react-hook-form + yup | Стандартный паттерн с типизацией |
| Dates | dayjs | Лёгкая работа с датами |

## Структура проекта

```
src/
├── app/                  # App Router (RU-only, без [lng])
│   ├── api/              # Route handlers (privileged operations)
│   ├── login/            # Login screen
│   └── (rooms)/          # Группа маршрутов комнат
│       ├── layout.tsx    # Shell с bottom-nav / sidebar
│       ├── page.tsx      # Дом
│       ├── mood/
│       ├── calendar/
│       ├── wishlist/
│       └── profile/
├── components/
│   ├── ui/               # Bespoke primitives (Button, Card, Slider, Blob, ...)
│   ├── icons/            # SVG icons как компоненты
│   ├── form/
│   │   ├── fields/       # Wrap'd под react-hook-form
│   │   └── validation.ts
│   └── widgets/          # Композиции (MoodPairGlance, MemoryCard, NextPlanCard, ...)
├── config/
│   ├── routes.ts         # Все пути приложения
│   └── breakpoints.ts
├── hooks/                # Shared React hooks
├── interfaces/           # Domain types (Mood, CalendarEvent, WishlistItem, ...)
├── libs/
│   ├── supabase/
│   │   ├── server.ts     # getServerSupabase() — для Server Components, Route Handlers
│   │   ├── client.ts     # getBrowserSupabase() — для client components / queries
│   │   └── admin.ts      # service-role client (только Route Handlers)
│   └── utils.ts          # cn() и helpers
├── queries/              # React Query слой (одна папка на домен)
│   ├── mood/
│   ├── calendar/
│   ├── wishlist/
│   ├── achievements/
│   └── ...
└── styles/
    ├── globals.css
    └── utilities.css
```

Структура копирует подход из indigo-spa с поправками: без `[lng]` сегмента, без Strapi-специфичного слоя, Supabase вместо REST-проксей.

## Data flow

1. **Server Component prefetch (опционально):** `getServerSupabase()` → React Query `prefetchQuery` → `<HydrationBoundary>` → клиент получает гидратированные данные
2. **Client fetch:** Hook из `src/queries/<domain>` → внутри использует `getBrowserSupabase()` под капотом
3. **Mutations:** `useMutation` из `src/queries/<domain>` → инвалидирует релевантные query keys
4. **Authorization:** Supabase RLS policies, не клиентские проверки

См. правило [.claude/rules/data-layer.md](../.claude/rules/data-layer.md).

## Data model (sketch)

Одна пара = одна `couple` запись. Два пользователя — `users`, привязанные к `couple_id`. Все доменные таблицы имеют `couple_id` для row-level security (даже если пара в MVP одна — архитектура с `couple_id` готова к масштабу, если когда-нибудь).

```sql
-- couples (одна запись в MVP)
couples (
    id uuid PK,
    created_at timestamp,
    relationship_start_date date,
    acquaintance_date date
)

-- users (два аккаунта, оба ссылаются на одну couple)
users (
    id uuid PK,  -- = auth.users.id
    couple_id uuid FK -> couples,
    gender 'male' | 'female',
    display_name text,
    birthday date,
    personal_hue_variant text,  -- одна из 3 предустановок (см. open-questions)
    settings jsonb              -- mood-defaults, notification toggles, theme prefs
)

-- mood entries
mood_entries (
    id uuid PK,
    couple_id uuid FK,
    user_id uuid FK,
    date date,
    energy int,         -- 0-100
    stress int,
    social_battery int,
    emotion text,
    visibility jsonb,   -- per-field: 'full' | 'vibe' | 'hidden'
    created_at timestamp,
    UNIQUE (user_id, date)
)

-- calendar events
calendar_events (
    id uuid PK,
    couple_id uuid FK,
    created_by uuid FK -> users,
    title text,
    date date,
    time time,
    duration_minutes int,
    location text,
    category text,
    note text,
    state 'planned' | 'past' | 'cancelled',
    is_recurring bool,
    recurrence_rule text,  -- e.g. 'YEARLY'
    source 'manual' | 'birthday' | 'anniversary'
)

-- event photos (для Memory of the day)
event_photos (
    id uuid PK,
    event_id uuid FK,
    storage_path text,
    caption text,
    mood_tag text
)

-- идеи без даты
event_ideas (
    id uuid PK,
    couple_id uuid FK,
    created_by uuid FK,
    title text,
    note text
)

-- wishlist
wishlist_items (
    id uuid PK,
    couple_id uuid FK,
    owner_id uuid FK,           -- кому принадлежит (null = 'наше')
    list 'want' | 'love' | 'shared',
    title text,
    image_url text,
    category text,
    price_estimate numeric,
    link text,
    note text,
    priority 'someday' | 'want' | 'really_want'
)

-- ачивки
achievements (
    id uuid PK,
    couple_id uuid FK,
    user_id uuid FK,            -- null = "couple achievement"
    code text,                  -- 'first_moon', 'parallel', '100_days', ...
    unlocked_at timestamp
)

-- v0.2: cycle tracking (только для её аккаунта)
cycle_logs (
    id uuid PK,
    user_id uuid FK,            -- RLS: только = auth.uid()
    date date,
    flow_intensity 'light' | 'medium' | 'heavy' | null,
    symptoms text[],
    note text
)

cycle_settings (
    user_id uuid PK,
    average_cycle_length int,
    average_period_length int,
    last_period_start date,
    shared_phase_indicator bool DEFAULT false
)
```

## Auth

- Supabase email + password (стандартный flow)
- Регистрации нет — два аккаунта создаются вручную через Supabase admin (UI или CLI) с **email-алиасами** вида `he@us.local` / `she@us.local`
- Login screen: две кнопки «Я» / «Она», каждая автозаполняет соответствующий email-алиас в скрытое поле; пользователю остаётся ввести только пароль
- Email-алиас существует только под капотом (Supabase Auth требует email-поле). В UI Профиля и нигде ещё email не отображается
- После login — redirect в Дом
- Persist через `@supabase/ssr` (cookie-based)
- Server Components и Route Handlers читают сессию из cookies
- Пароли запоминает браузер → второй и следующие входы = один клик

## RLS политики (эскиз)

Все таблицы — RLS включён, дефолт DENY.

- `couples` — readable users where `users.couple_id = couples.id`
- `users` — каждый видит обоих в своей couple
- `mood_entries` — каждый видит свои + видит партнёрские с фильтром по `visibility` field
- `calendar_events`, `event_photos`, `event_ideas` — оба в couple
- `wishlist_items` — оба в couple (даже personal — по дизайну видим)
- `achievements` — оба в couple
- `cycle_logs`, `cycle_settings` — только `user_id = auth.uid()`
- Phase-индикатор для партнёра — отдельная Postgres function `get_partner_phase(user_id)` с SECURITY DEFINER, выдаёт только enum фазы

## Storage

- Bucket `event-photos` — для фото к событиям
- Public bucket с подписанными URL для прямого доступа (не оптимизированных), плюс `next/image` через Vercel для трансформаций
- В MVP без E2E encryption; чувствительный контент (cycle, mood notes) можно шифровать в v2 если понадобится

## PWA

- Service worker для offline shell + asset caching
- Manifest с tinted theme color (тёмный warm-night)
- Installable на iOS/Android home screen
- Иконка приложения — кастомная (TBD design)

## Realtime

- В MVP не используем (async-only философия)
- Можно опционально подключить для wishlist и календаря, чтобы у партнёра обновлялось без refresh — но это nice-to-have

## State management

- **Server state** → React Query (всё, что приходит из Supabase)
- **UI state** → Zustand (открытые modal'ы, текущая таб в Хотелках, активная mood-форма)
- **Form state** → react-hook-form (локально в формах)

## Bespoke component library

Без HeroUI/shadcn/Material. Все примитивы — свои, в `src/components/ui/`:

- `Button` — основной элемент действия
- `Card` — карточка-glass с warm border
- `Slider` — горизонтальный (и кастомный «термометр» вертикальный для энергии)
- `BatteryRing` — radial battery для social-battery
- `EmotionPicker` — grid эмодзи-blobs
- `Blob` — sva svg/canvas компонент с morphing animation
- `MoonPhase` — мини-индикатор фазы луны (для cycle ambient, v0.2)
- `ToastSoft` — мягкий toast снизу для ачивок
- `BottomNav`, `Sidebar` — навигация
- `RoomShell` — обёртка с ambient hue + grain + particles

См. правило [.claude/rules/nextjs-react.md](../.claude/rules/nextjs-react.md).
