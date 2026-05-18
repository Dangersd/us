# 01 — Foundations: палитра, типографика, spacing, grid

## Палитра — база (общая для всех комнат)

Все цвета — HEX. Используем oklch / variables в коде, но для дизайна — HEX достаточен.

### Backgrounds

| Токен | HEX | Где |
|-------|-----|-----|
| `bg.base` | `#0E0B14` | Основной фон приложения, body |
| `bg.surface-1` | `#1A1620` | Карточки, виджеты |
| `bg.surface-2` | `#251F2E` | Карточки на карточках, modal'ы, popover'ы |
| `bg.surface-3` | `#302637` | Hover / press состояния surface-1 |

### Ink (текст)

| Токен | HEX | Где |
|-------|-----|-----|
| `ink.primary` | `#F4EDE4` | Основной текст, заголовки. Тёплый off-white, не белый |
| `ink.secondary` | `#BFB3A8` | Подзаголовки, secondary text |
| `ink.muted` | `#6F6677` | Подписи, мета, placeholders |
| `ink.disabled` | `#4A4351` | Disabled state |

### Glow / Accents

| Токен | HEX | Где |
|-------|-----|-----|
| `glow.warm` | `#FFC9A8` | Тёплое янтарное свечение (Дом ambient) |
| `glow.soft` | `#E8B4FF` | Лиловое лунное (Настроение ambient) |
| `glow.gold` | `#E8C77B` | Acent для special events (годовщины) |

### Status

Никаких красных алёртов в iOS-стиле. Тёплые состояния:

| Токен | HEX | Где |
|-------|-----|-----|
| `status.success` | `#A8C5A0` | Шалфейный — успех, completed |
| `status.warn` | `#E8B47B` | Тёплый янтарный — предупреждение |
| `status.error` | `#D89B8A` | Приглушённый коралл — ошибка (не красный!) |

### Borders / dividers

| Токен | HEX (+ alpha) | Где |
|-------|----------------|-----|
| `border.warm` | `rgba(255, 201, 168, 0.08)` | Тёплая граница для glass-surfaces |
| `border.subtle` | `rgba(244, 237, 228, 0.06)` | Очень тонкие divider'ы |
| `border.focus` | `rgba(232, 180, 255, 0.4)` | Focus-ring на input'ах |

## Personal hue (per-account)

Цвет привязан к гендеру аккаунта. Используется для:

- Свечения по краям экрана (subtle vignette)
- Тинта собственного аватара
- Background-glow на login после выбора «Я» / «Она»
- Базы для собственного mood blob'а

| Аккаунт | HEX | Описание |
|---------|-----|----------|
| **Его** (male) | `#E8A87C` | Copper / amber — холоднее, янтарь |
| **Её** (female) | `#F4A5B9` | Rose / peach — теплее, роза |

Когда видишь контент партнёра — на нём partner's hue. Общие виджеты — без personal hue, используют общий warm tone.

## Per-room ambient hue

Каждая комната получает дополнительный ambient hue **поверх** базового фона `bg.base`. Реализация — большой soft radial gradient (~60-70% экрана), opacity ~12-18%.

| Комната | Ambient hue HEX | Текстура / эффект |
|---------|------------------|-------------------|
| **Home** | `#FFC9A8` тёплое янтарное | Floating particles (пылинки в свете), мягкий vignette по краям |
| **Mood** | `#E8B4FF` лиловое лунное | Анимированные blobs / gradient mesh, мягко пульсирующие |
| **Calendar** | `#F4D08A` тёплая бумага | Слегка зернистый paper-grain фон |
| **Wishlist** | `#FFB4D1` розово-персиковое | Glow вокруг сохранённых вещей, pinboard-сетка |
| **Profile** | `#A8C9FF` ночное небо | Звёздное поле (мелкие тонкие звёздочки), ачивки как созвездия |

В дизайне можно показать gradient overlay как отдельный слой над bg.base — это и есть ambient.

## Категории (используются в Calendar и Wishlist)

Категории — цветные точки (8-10px), без эмодзи и без подписи внутри.

| Категория | HEX | Назначение |
|-----------|-----|-----------|
| Свидание | `#FFB4D1` | Персик |
| Ужин | `#FFC9A8` | Янтарь |
| Кино / культура | `#9B7EBD` | Глубокая слива |
| Поездка | `#A8C5A0` | Шалфей |
| Годовщина | `#E8C77B` | Золото (спец, ежегодная) |
| День рождения | `#F4A5B9` | Роза (спец, ежегодная) |
| Просто план | `#D6CCB8` | Кремовый (universal) |
| Одежда (wishlist) | `#C9B8FF` | Лавандовый |
| Парфюм | `#FFD4B8` | Персиковый |
| Книги | `#A8E0C9` | Мятный |
| Дом | `#FFC9A8` | Янтарь (как ужин — ок, разный контекст) |
| Еда | `#FFE0A8` | Светло-жёлтый |
| Опыт | `#C9FFE0` | Светло-мятный |
| Путешествие | `#A8D4FF` | Голубой |

## Типографика

### Шрифты

| Семейство | Использование | Источник | Кириллица |
|-----------|---------------|----------|-----------|
| **Fraunces** | Display / заголовки / hero numbers | Google Fonts (variable) | ✅ |
| **Geist Sans** | Body / UI | Vercel Fonts | ✅ |
| **Inter** | Fallback для Geist + tabular numbers | Google Fonts | ✅ |

Загрузка через `next/font` в коде. Для Pencil — установить локально / impooted.

### Размеры (mobile + desktop одинаковые, кроме hero-display)

| Token | Size | Line-height | Weight | Letter-spacing | Family | Use |
|-------|------|-------------|--------|----------------|--------|-----|
| `text-xs` | 12px | 16px | 400 | 0.01em | Geist | Meta, подписи под виджетами |
| `text-sm` | 14px | 20px | 400 | 0 | Geist | Secondary text, заметки в карточках |
| `text-base` | 16px | 24px | 400 | 0 | Geist | Body text, default |
| `text-lg` | 18px | 28px | 500 | 0 | Geist | Form labels, primary actions text |
| `text-xl` | 24px | 32px | 600 | -0.01em | Geist | Section titles в комнатах |
| `text-2xl` | 32px | 40px | 500 | -0.015em | Fraunces | Widget hero (название виджета) |
| `text-3xl` | 48px | 56px | 500 | -0.02em | Fraunces | Большие заголовки на login / empty states |
| `text-4xl` | 72px | 80px | 500 | -0.03em | Fraunces | Stats hero numbers (в Профиле — «142 дня») |
| `text-5xl-display` | 96px (desktop) / 72px (mobile) | 1.0 | 400 | -0.04em | Fraunces | Особый display (использовать редко) |

### Числа (tabular)

Везде где есть числа в потоке (статистика, цены, даты) — `font-variant-numeric: tabular-nums`. Использовать **Inter** для этого, не Geist (у Geist не идеальные tabular numbers).

### Weights

- Geist: 400 (Regular), 500 (Medium), 600 (Semibold) — никакого 700+
- Fraunces: 400 (Regular), 500 (Medium) — никакого 600+ (получается слишком жирно)

## Spacing scale

Базовый шаг — 4px. Все отступы кратны 4.

| Token | Value |
|-------|-------|
| `space-0` | 0 |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |

## Radii (углы)

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 8px | Buttons, chips, small cards |
| `radius-md` | 16px | Карточки в виджетах |
| `radius-lg` | 24px | Большие виджеты, modal cards |
| `radius-xl` | 32px | Hero-карточки, mood-glance виджет |
| `radius-full` | 9999px | Аватары, blobs, pill-buttons |

## Тени

В тёмной теме тени **тёплые, диффузные, низкого контраста**. Не чёрные.

| Token | Spec |
|-------|------|
| `shadow-soft` | `0 4px 24px rgba(255, 201, 168, 0.04)` |
| `shadow-warm` | `0 8px 32px rgba(255, 201, 168, 0.08)` |
| `shadow-glow` | `0 0 32px rgba(232, 180, 255, 0.12)` (для focused / active) |

## Blur (glassmorphism)

| Use case | Value |
|----------|-------|
| Glass surface (default) | `backdrop-filter: blur(24px)` |
| Top bar / sticky elements | `backdrop-filter: blur(40px)` |
| Modal background | `backdrop-filter: blur(60px)` |

## Breakpoints + grid

### Mobile (375-430px, ref 390)

- **Container:** 100% width
- **Padding (horizontal):** 16px по краям экрана
- **Padding (vertical, page):** 16px сверху (после top-bar), 80px снизу (зазор для bottom-nav)
- **Bottom-nav height:** 64px + safe-area-inset
- **Top-bar height:** 56px

### Desktop (1280px+, ref 1440)

- **Sidebar:** 240px (сворачиваемый до 64px)
- **Content max-width:** 1040px (центрированный остаток)
- **Padding (horizontal):** 40px от sidebar и от правого края до content
- **Padding (vertical, page):** 32px сверху, 32px снизу

### Grid внутри комнаты (desktop)

- Колоночная сетка **12 columns**, gutter 24px
- Виджеты могут занимать 4, 6, 8 или 12 колонок
- На mobile всё 1 колонка (full-width)

## Особое: Safe areas (PWA)

Нижний bottom-nav должен быть с `padding-bottom: env(safe-area-inset-bottom)` — для iPhone с notch / home-indicator.

В макетах учитывать 20-30px snake-зону снизу на iPhone 15.

## Сводка цвета — quick reference

```
═══ BACKGROUNDS ═══
#0E0B14   base (тёплый night)
#1A1620   surface-1 (карточки)
#251F2E   surface-2 (modal, popover)

═══ INK ═══
#F4EDE4   primary (тёплый off-white)
#BFB3A8   secondary
#6F6677   muted

═══ AMBIENT (PER-ROOM) ═══
Home       #FFC9A8   янтарь
Mood       #E8B4FF   лунный лиловый
Calendar   #F4D08A   тёплая бумага
Wishlist   #FFB4D1   розово-персиковый
Profile    #A8C9FF   ночное небо

═══ PERSONAL HUE ═══
Его   #E8A87C   copper
Её    #F4A5B9   rose

═══ STATUS ═══
Success   #A8C5A0   шалфей
Warn      #E8B47B   тёплый янтарь
Error     #D89B8A   приглушённый коралл (НЕ красный!)
```
