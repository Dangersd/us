# Calendar — Календарь

Тёплая бумажная комната. Наш ежедневник.

**Ambient hue:** `#F4D08A` тёплая бумага
**Effects:** paper-grain текстура, даты с эффектом «вытесненных чернилами», тёплое освещение

## Mobile layout — Agenda view (default)

```
┌──────────────────────────────────┐
│  ●  ●                  [Avatar]  │  ← Top bar
├──────────────────────────────────┤
│                                  │
│  май 2026          [agenda|month]│  ← Header + view toggle
│  Пн Вт Ср Чт Пт Сб Вс            │
│   ·   ·  •  ·  •  ·  ·           │  ← Mini-month strip с маркерами
│                                  │
│  ┌────────────────────────────┐  │
│  │ СЕГОДНЯ • 19 мая           │  │  ← Сегодня (даже если пустой день)
│  │ Тихий день                 │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ ● Пятница • 22 мая         │  │  ← Event card
│  │ Кафе «Утро»                │  │
│  │ 19:00 · ты предложил       │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ ● Воскресенье • 24 мая     │  │
│  │ Кино «Перфект Дэйз»        │  │
│  └────────────────────────────┘  │
│                                  │
│  ─── ИДЕИ ───                    │  ← Section divider
│                                  │
│  ┌────────────────────────────┐  │
│  │ Поехать в Зеленоградск     │  │  ← Idea card (без даты)
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ Попробовать ramen          │  │
│  └────────────────────────────┘  │
│                                  │
│         ┌──────────────┐         │
│         │  + добавить  │         │  ← FAB (floating add button)
│         └──────────────┘         │
│                                  │
├──────────────────────────────────┤
│   [○] [○] [●○] [○]               │
└──────────────────────────────────┘
```

## Mobile layout — Month view

```
┌──────────────────────────────────┐
│                                  │
│  май 2026          [agenda|month]│
│                                  │
│   Пн Вт Ср Чт Пт Сб Вс           │
│    1  2  3  4  5  6  7           │
│    8  9 10 11 12 13 14           │
│   15 16 17 18[19]20 21           │  ← [19] = today, highlighted
│   22*23 24 25 26 27 28           │  ← * = event marker (category color dot)
│   29 30 31                       │
│                                  │
│  ─────────────────────────       │
│                                  │
│  ● на 19 мая событий нет         │  ← Selected day events list
│                                  │
│       + добавить план            │
│                                  │
└──────────────────────────────────┘
```

## Desktop layout

```
┌─────────┬────────────────────────────────────────────┐
│ Sidebar │  Top bar                                   │
├─────────┼────────────────────────────────────────────┤
│         │                                            │
│         │  май 2026                  [agenda|month]  │
│         │                                            │
│         │  ┌──────────────┐  ┌──────────────────┐   │
│         │  │              │  │                  │   │
│         │  │  AGENDA      │  │   MONTH GRID     │   │
│         │  │              │  │                  │   │
│         │  │  Сегодня     │  │   П В С Ч П С В  │   │
│         │  │  19 мая      │  │                  │   │
│         │  │              │  │   1 2 3 4 5 6 7  │   │
│         │  │  Пятница     │  │   8 9 ...        │   │
│         │  │  22 мая      │  │                  │   │
│         │  │  ● Кафе      │  │                  │   │
│         │  │              │  │                  │   │
│         │  │  ─────       │  │                  │   │
│         │  │  ИДЕИ        │  │                  │   │
│         │  │  ...         │  │                  │   │
│         │  └──────────────┘  └──────────────────┘   │
│         │                                            │
└─────────┴────────────────────────────────────────────┘
```

На desktop — обе вьюшки рядом. Agenda 40% width, Month 60% width.

## Header + view toggle

### Spec

- **Layout:** title слева, view toggle справа
- **Title:** «май 2026» (Fraunces text-2xl) или текущий month + год
- **Tap on title:** picker для смены месяца / года

### View toggle

- Segmented control (см. [02-components.md → TabBarSegment](../02-components.md#tabbarsegment-top-tabs-в-wishlist))
- 2 значения: «agenda» / «month»

## Mini-month strip (только в agenda view)

Под header, перед списком событий.

### Spec

- **Height:** 56px
- **Layout:** 7 колонок дней недели
- **Top row:** метки дней (Пн Вт..., text-xs uppercase `ink.muted`)
- **Bottom row:** дни этой недели, цифры (text-sm `ink.primary`)
- **Маркер событий:** маленькая category-точка под цифрой, если в день есть событие
- **Today:** glow halo вокруг цифры

### Tap

- Tap на день → scroll agenda до того дня

## Event card (в agenda)

### Spec

- **Container:** Card default, radius-md, padding 16px
- **Margin-bottom:** 12px между cards
- **Layout:**
    - **Top row:** category dot (10px) + день недели + дата + время (right-aligned)
        - text-sm uppercase, `ink.muted`
    - **Middle:** title (text-xl Fraunces, `ink.primary`)
    - **Optional location:** иконка map-pin + text (text-sm `ink.secondary`)
    - **Bottom row:** «ты предложил» / «она предложила» (text-xs `ink.muted`)

### States

| State | Visual |
|-------|--------|
| **Сегодня + впереди** | Default + slight warm border accent |
| **Будущее** | Default |
| **Прошедшее (есть Memory)** | Slight dim (opacity 0.7), Memory icon в углу |
| **Прошедшее (нет Memory)** | Slight dim + soft CTA «Как было?» в нижней части карточки |
| **Отменено** | Strike-through title, opacity 0.5 |

### Tap

- Tap → переход в Event Detail screen (отдельный экран)

## Idea card (в idea section)

Идеи без даты.

### Spec

- **Container:** Card subtle variant, radius-md, padding 16px
- **Background:** `bg.surface-1` с очень subtle warm tint
- **Layout:**
    - Title (text-base, weight 500, `ink.primary`)
    - Optional note (text-sm `ink.secondary`, 1 line clamp)
    - Right side: маленькая icon-кнопка «add date» (если tap — открывает date picker)

### Tap

- Tap на body → переход в edit / detail
- Tap на date-icon → quick date assignment

### Empty state

- Если нет идей: ghost-блок «Что-то, что хотелось бы как-нибудь...» + ghost-кнопка «добавить идею»

## Month grid (только в month view)

### Spec

- **Grid:** 7×6 (42 cells, заполнены весь month + tails)
- **Cell height:** 80px (mobile), 100px (desktop)
- **Cell background:** transparent / `bg.surface-1` если содержит event

### Cell layout

- **Top-left:** число дня (text-base, Fraunces 500)
    - Today — glow halo вокруг числа
    - Outside-month — opacity 0.3
- **Bottom area:** до 3 event markers как маленькие pill'ы (category color + first 3 chars title) ИЛИ просто 3 цветные точки если места мало

### Tap

- Tap на cell → выбран день (highlighted), под grid показывается events этого дня

## Selected day events (only in month view)

Под grid'ом — events выбранного дня.

- Если пусто — «На [дату] событий нет» + ghost-кнопка «добавить план»
- Если есть — список event cards (compact variant)

## FAB (Floating Add Button)

### Spec

- **Position:** fixed bottom-right, 24px от bottom-nav, 16px от right
- **Size:** 56×56px
- **Shape:** круг (radius-full)
- **Background:** `glow.warm` solid (тёплый янтарь)
- **Glow halo:** strong warm
- **Icon:** plus (24px, `bg.base` color — контраст)
- **Hover (desktop):** scale 1.05 + усиленный glow

### Tap

- Открывает modal «Новый план» с form'ой
- Form fields: тип (событие/идея), название, дата (если событие), время, локация, категория, заметка, фото

## Event Detail screen (отдельный экран)

Когда tap на event card — full screen detail.

### Layout

```
┌──────────────────────────────────┐
│  ← назад              ⋯          │  ← Top bar (back + actions menu)
├──────────────────────────────────┤
│                                  │
│  ● Свидание                      │  ← Category + type
│                                  │
│  Кафе «Утро»                     │  ← Title (text-3xl Fraunces)
│                                  │
│  Пятница, 22 мая · 19:00         │  ← Date + time
│  Площадь Победы, 1               │  ← Location
│                                  │
│  ─────                           │
│                                  │
│  «Помню как ты пробовал ту       │  ← Note (text-base)
│   корицу прошлый раз, давай      │
│   повторим»                      │
│                                  │
│  ─────                           │
│                                  │
│  ФОТО                            │
│  ┌──────┐ ┌──────┐               │  ← Photo thumbnails (если есть)
│  │      │ │      │               │
│  └──────┘ └──────┘               │
│                                  │
│  ─────                           │
│                                  │
│  Напоминание: за 1 час           │  ← Reminder setting
│  Создано: 12 мая, ты             │  ← Meta
│                                  │
│  ┌──────────────────────────┐   │
│  │      редактировать       │   │  ← Edit button
│  └──────────────────────────┘   │
│                                  │
└──────────────────────────────────┘
```

### Past event state — «Как было?»

Если событие прошло и Memory не отмечен:

- Над кнопкой «редактировать» добавляется большая CTA-карточка:
    - Background `bg.surface-2`, glow halo warm
    - Title: «Как было?»
    - Buttons: «добавить фото», «добавить заметку», «не отмечать»

## Cycle overlay (v0.2, её аккаунт)

В её Calendar — в каждой cell на month view добавляется крошечная точка-маркер фазы цикла в одном из углов:

- Менструация — красная точка
- Овуляция — зелёная точка
- Вне фаз — без точки

Только она видит, дёшево в реализации.

## Empty / first-time

- **Календарь пустой:** только agenda с сообщением «Календарь пока пустой. Может, придумаем первый план?» + большая FAB
- **Только идеи, нет событий:** показывается idea section, agenda с тёплым «Никаких планов на ближайшее время — спокойствие»

## Anti-pattern

- ❌ Эмодзи рядом с категориями
- ❌ Цветные блоки на весь день (только маленькие маркеры)
- ❌ Будильники-icons / «не пропусти» urgency
- ❌ Week view (в MVP не нужен — agenda и month покрывают)
