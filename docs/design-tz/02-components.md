# 02 — Components: UI-примитивы

Все bespoke. Без HeroUI/shadcn. Спеки достаточные для отрисовки в Pencil — точные размеры родятся уже в коде, тут — направление.

## Button

Основной action-элемент. Никогда не использовать native `<button>`.

### Варианты

| Variant | Background | Border | Ink | Glow |
|---------|-----------|--------|-----|------|
| **primary** | `bg.surface-2` + warm tint | `border.warm` | `ink.primary` | `shadow-warm` |
| **soft** | transparent | `border.subtle` | `ink.primary` | nothing |
| **ghost** | transparent | nothing | `ink.secondary` | nothing |
| **danger-soft** | transparent | `rgba(216,155,138,0.2)` | `status.error` | nothing |

### Размеры

| Size | Height | Padding-x | Text | Radius | Icon size |
|------|--------|-----------|------|--------|-----------|
| `sm` | 32px | 12px | text-sm | radius-sm (8px) | 16px |
| `md` | 40px | 16px | text-base | radius-sm (8px) | 18px |
| `lg` | 48px | 24px | text-lg | radius-md (16px) | 20px |
| `xl` | 56px | 32px | text-lg | radius-md (16px) | 24px |
| `pill` | 40px | 20px | text-base | radius-full | 18px |

### States

- **Default:** как описано выше
- **Hover** (desktop only): фон `bg.surface-3`, glow усиливается
- **Active / press:** scale 0.97, glow ещё ярче
- **Disabled:** opacity 0.4, no glow, no hover
- **Focus:** outline 2px `border.focus`, offset 2px

### Internals layout

- Icon-only: square (height = width), icon в центре
- Icon + text: icon слева, 8px gap, text
- Text-only: text центрирован

## Card (Glass)

Полупрозрачная карточка с blur. База для виджетов.

### Спецификация

- **Background:** `bg.surface-1` с alpha 0.85
- **Backdrop filter:** `blur(24px)`
- **Border:** 1px `border.warm`
- **Radius:** `radius-lg` (24px) для виджетов на Доме, `radius-md` (16px) для карточек в комнатах
- **Padding:** `space-5` (20px) внутренний

### Hover (desktop)

- Card subtle lift: translateY(-2px)
- Border opacity +50%
- Glow halo: `shadow-warm`

### Variants

- **default** — стандартный glass card
- **hero** — для больших виджетов (Memory of the day на десктопе): radius-xl (32px), padding-8 (32px)
- **compact** — для list items: меньше padding, radius-sm

## Slider

Кастомный, не native. Используется в Mood-чек-ине.

### Горизонтальный slider (Стресс)

- **Track height:** 4px
- **Track background:** `bg.surface-2`
- **Active fill:** градиент по personal hue
- **Thumb:** 24px circle, fill personal hue, white inner dot 8px
- **Total height including padding:** 56px (большая зона для тачей)
- **Метка состояния:** под slider'ом, text-sm, `ink.secondary` — «спокойствие» / «нейтрально» / «напряжение» — меняется при перетаскивании

### Вертикальный «термометр» (Энергия)

- **Width:** 32px
- **Height:** 200px
- **Track:** rounded pill, `bg.surface-2`
- **Fill:** градиент снизу вверх — от тусклого синего `#3A4866` (low) до яркого янтаря `glow.warm` (high)
- **Thumb:** горизонтальная «риска» 40×4px, тёплая
- **Метка значения** справа от термометра, Fraunces text-2xl

## BatteryRing (Social Battery)

Радиальный indicator.

- **Outer diameter:** 120px (mobile), 140px (desktop)
- **Stroke width:** 8px
- **Track:** `bg.surface-2`
- **Fill:** градиент по personal hue, fill % = social battery value
- **Center:** иконка blob'а / простой % число (Fraunces text-2xl, tabular)
- **Метка под:** «никого не хочу» / «нейтрально» / «хочу к ней/нему»

## EmotionPicker

Сетка 4×3 (12 эмоций) или 4×2 (8 эмоций) — bestseller'ов:

| Эмоция | Цвет blob'a |
|--------|-------------|
| Радость | `#FFD080` тёплый жёлтый |
| Спокойствие | `#A8C5A0` шалфей |
| Любовь | `#F4A5B9` роза |
| Грусть | `#7B9BD4` приглушённый синий |
| Тревога | `#9B7EBD` слива |
| Усталость | `#6F6677` muted purple |
| Восторг | `#FFB47A` коралл-оранжевый |
| Злость | `#D89B8A` коралл (приглушённый) |
| Нежность | `#FFB4D1` персик |
| Скука | `#BFB3A8` бежевый |
| Стыд | `#C9A87B` тёплый бежевый |
| Гордость | `#E8C77B` золото |

### Item spec

- **Size:** 64×64px (включая padding)
- **Blob inside:** 48×48px, organic shape, цвет согласно таблице
- **Label:** text-xs под blob'ом, `ink.secondary`
- **Selected state:** blob увеличен до 56px, добавляется тёплый glow halo
- **Layout:** grid с gap 12px

## Blob (универсальный morphing blob)

Используется для аватара-настроения, mood-glance виджета.

### Базовые spec

- **Default size:** 80px (small avatar), 120px (medium glance), 200px (hero на Mood-комнате)
- **Shape:** organic 4-6 point closed curve (в коде — SVG path с randomness, в Pencil — рисовать как unique blob)
- **Fill:** градиент (radial или mesh) — personal hue + сдвиг от текущей эмоции
- **Stroke:** none
- **Glow halo:** soft outer-glow 20-40px, цвет = blob fill с alpha 0.3

### Состояния

| State | Что меняется |
|-------|--------------|
| **Active** (отмечен сегодня) | Full opacity, glow halo |
| **Sleeping** (не отмечен ещё / партнёр не отмечен) | Opacity 0.5, dim glow, slight inner shadow |
| **Hidden** (партнёр не разрешил видеть) | Серый blob `ink.muted`, no glow |

### Анимация

В макетах рисуем несколько frames (или просто 1 default state). Поведение описано в [04-motion.md](./04-motion.md).

## ToastSoft

Мягкий toast снизу для ачивок и success-feedback. Без cross-кнопки, авто-исчезает.

- **Position:** bottom-center, 24px от низа (выше bottom-nav)
- **Width:** 320px (mobile), 360px (desktop)
- **Height:** auto (min 56px)
- **Background:** `bg.surface-2` с alpha 0.95 + blur 32px
- **Border:** 1px `border.warm` + glow halo тёплый
- **Padding:** 16px 20px
- **Layout:**
    - Иконка (24px) слева — соответствует контексту (звёздочка для ачивки, галка для success)
    - 12px gap
    - Text: title (text-base, weight 500) + optional sub (text-sm, secondary)
- **Animation:** fade-in + slide-up 8px, держится 4s, fade-out

## Avatar

Круглый аватар пользователя.

| Size | Diameter | Где |
|------|----------|-----|
| `xs` | 24px | Inline в тексте («он добавил...») |
| `sm` | 32px | List items |
| `md` | 48px | Header secondary |
| `lg` | 64px | Top-bar |
| `xl` | 96px | Profile header |

- **Background:** personal hue с alpha 0.6 (gradient radial)
- **Initials inside:** text-base / text-lg, Fraunces, weight 500, `ink.primary`
- **Border:** 1px `border.warm`
- **Glow halo (только для собственного / active):** soft outer-glow personal hue

Альтернатива initials — фото. В MVP — initials достаточно.

## Input (text field)

Bespoke, не native.

- **Height:** 48px (md), 56px (lg)
- **Padding:** 16px горизонтальный, 12px вертикальный
- **Background:** `bg.surface-1`
- **Border:** 1px `border.subtle`
- **Border (focus):** 1px `border.focus`
- **Radius:** `radius-sm` (8px)
- **Text:** text-base, `ink.primary`
- **Placeholder:** `ink.muted`
- **Label** (сверху): text-sm, `ink.secondary`, margin-bottom 8px

## Textarea

То же что Input, но `min-height: 96px`, `padding-top: 12px`. Autosize до 240px max.

## ChipFilter (для категорий)

Для фильтров в wishlist / calendar.

- **Height:** 32px
- **Padding:** 12px horizontal
- **Background (default):** `bg.surface-1`
- **Background (active):** personal hue с alpha 0.2 + border personal hue
- **Border:** 1px `border.subtle`
- **Radius:** `radius-full`
- **Text:** text-sm, weight 500
- **Layout:** category dot (8px) + 6px gap + text

## CategoryDot

Маленькая цветная точка для категории.

- **Size:** 8px (стандарт), 10px (large для cards), 6px (compact для chips)
- **Shape:** circle, solid fill из палитры категорий

## TabBarSegment (top-tabs в Wishlist)

Сегмент-контрол сверху комнаты.

- **Height:** 40px
- **Container background:** `bg.surface-1`, radius-full
- **Container padding:** 4px
- **Segment (default):** transparent, text `ink.secondary`
- **Segment (active):** `bg.surface-2`, text `ink.primary`, glow halo
- **Segment padding:** 8px 16px
- **Animation:** активный фон skids по контейнеру при переключении

## ListItem (для событий в Calendar agenda)

Карточка-строка для item'а в листе.

- **Height:** auto (min 64px)
- **Padding:** 16px
- **Background:** `bg.surface-1` (subtle, не делает явной «карточкой»)
- **Border:** 1px bottom только (`border.subtle`) — это часть list view
- **Layout:**
    - Левая колонка: category dot (10px), затем content
    - Правая колонка: meta (время, и т.д.), text-xs `ink.muted`
- **Tap-area:** весь list-item кликабельный

## EventCard (расширенная карточка события)

Когда событие важное / hero (свидание сегодня).

- **Spec:** как Card hero variant
- **Внутри:**
    - Большое имя события (text-2xl Fraunces)
    - Дата + время (text-sm `ink.secondary`)
    - Локация (text-sm с пин-иконкой)
    - Заметка (если есть, text-base, max 3 line clamp)
    - Фото (если есть) — 16:9 ratio, radius-md, в нижней части карточки
    - Категория-точка в верхнем-правом углу

## WishCard

Карточка в wishlist'е.

- **Width:** flexible (grid item)
- **Aspect ratio:** 3:4 для карточек с фото; 1:1 для текстовых
- **Background:** `bg.surface-1`
- **Border:** 1px `border.warm`
- **Radius:** `radius-md`
- **Padding:** 12px
- **Image:** top-section, radius внутри (12px), aspect 1:1 для квадратных
- **Title:** text-base, weight 500, max 2 lines
- **Meta:** category dot + price (text-xs, `ink.muted`)
- **Note:** text-xs, `ink.secondary`, max 2 lines
- **Hover (desktop):** lift + glow halo

## MoodGlance (composite виджет на Доме)

Главный виджет Дома.

- **Background:** Card hero variant
- **Layout (mobile):** 2 blob'а рядом по центру, имена под ними
- **Layout (desktop):** blob'ы крупнее, расстояние между ~120px
- **Blob size:** 96px (mobile), 140px (desktop)
- **Между blob'ами:** thin glowing thread, появляется если оба чекнулись
- **Под blob'ами:** имя + tiny vibe-tag («тёплая», «насыщенная») с visibility-respecting

## CountUp / StatNumber

Большие числа в Stats.

- **Font:** Fraunces 500
- **Size:** text-4xl (72px) для главных, text-3xl (48px) для secondary
- **Color:** `ink.primary` или `glow.warm` для hero
- **Tabular numbers**: Yes (Inter fallback)
- **Animation:** number rolling при появлении (количество прокручивается от 0 до значения)

## Common patterns

- **Спейсинг между виджетами на Доме:** 16px mobile, 24px desktop
- **Спейсинг между секциями в Профиле:** 32px
- **Спейсинг между chip'ами фильтров:** 8px
- **Минимальная зона тача:** 44×44px (везде, даже у маленьких иконок)
- **Focus ring:** всегда 2px `border.focus`, offset 2px
