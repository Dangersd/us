# Profile — Профиль

Ночное небо. Stats + ачивки + общие даты + настройки + аккаунт. Доступ через avatar в top-right.

**Ambient hue:** `#A8C9FF` ночное небо
**Effects:** мерцающее звёздное поле (мелкие тонкие звёздочки), ачивки как созвездия

## Mobile layout

Scrollable page с секциями. Каждая секция разделена divider'ами / большим margin.

```
┌──────────────────────────────────┐
│  ← назад                         │  ← Top bar (без avatar — мы тут)
├──────────────────────────────────┤
│                                  │
│         ⬤                        │  ← Hero avatar (большой)
│      [имя]                       │
│   связаны 150 дней               │
│   в отношениях 84 дня            │
│                                  │
│   ┌────────────────────────┐    │
│   │ Аватар партнёра + имя  │    │  ← Partner reference
│   │ ⬤  Аня                 │    │
│   └────────────────────────┘    │
│                                  │
│  ─── МЫ В ЦИФРАХ ───             │  ← Section header
│                                  │
│  ┌──────────┐ ┌──────────┐       │
│  │   142    │ │    84    │       │
│  │   дни    │ │ вместе   │       │
│  │ знакомы  │ │          │       │
│  └──────────┘ └──────────┘       │
│                                  │
│  ┌────────────────────────┐      │
│  │ ЛЮБИМЫЕ МЕСТА          │      │
│  │ 1. Кафе «Утро»  (8)    │      │
│  │ 2. Площадь Победы (5)  │      │
│  │ 3. Кинотеатр Радуга (4)│      │
│  └────────────────────────┘      │
│                                  │
│  ┌────────────────────────┐      │
│  │ ЖАНРЫ                  │      │
│  │ Свидания · Ужины · Кино│      │
│  └────────────────────────┘      │
│                                  │
│  ─── СОЗВЕЗДИЕ ───               │
│                                  │
│  ┌────────────────────────┐      │
│  │ ★ ☆ ☆ ★ ★ ☆ ☆ ☆        │      │
│  │ ☆ ★ ☆ ☆ ★ ☆ ★ ☆        │      │  ← Grid of achievements (filled/dim)
│  │ ☆ ☆ ☆ ★ ☆ ☆ ☆ ☆        │      │
│  │                        │      │
│  │ 11 из 30               │      │
│  └────────────────────────┘      │
│                                  │
│  ─── ОБЩИЕ ДАТЫ ───              │
│                                  │
│  Знакомство:    23 декабря 2025  │
│  Начало отнош.: 5 марта 2026     │
│  Её др:         12 августа       │
│  Его др:        17 ноября        │
│  + добавить нежную дату          │
│                                  │
│  ─── УВЕДОМЛЕНИЯ ───             │
│                                  │
│  Календарь напоминания      ●—   │
│  Когда партнёр чекнулся     ●—   │  ← Toggle switches
│  Если она 3 дня не отметка   —●  │
│  Когда добавляет в хотелки  ●—   │
│  «Этот день в прошлом»      ●—   │
│                                  │
│  ─── ТЕМА ───                    │
│                                  │
│  Personal hue: [○○●○○]            │  ← 5 preset chips (1 selected)
│  Particles            ●—          │
│  Grain overlay        ●—          │
│  Анимации: auto reduced off       │
│                                  │
│  ─── АККАУНТ ───                 │
│                                  │
│  Сменить пароль                  │
│  Выйти                           │
│                                  │
└──────────────────────────────────┘
```

## Desktop layout

Двух-колоночный: левая колонка (40%) — hero avatar + Stats + Achievements; правая (60%) — Settings sections.

## Секция: Hero header

### Spec

- **Padding:** 32px 20px (mobile), 48px 32px (desktop)
- **Background:** transparent

### Layout

- **Hero avatar:** см. [02-components.md → Avatar `xl`](../02-components.md#avatar) (96px)
- **Имя:** Fraunces text-3xl (48px) под avatar'ом, 16px gap
- **Meta:** «связаны 150 дней · в отношениях 84 дня» (text-sm `ink.secondary`)

### Partner reference card

Под hero — небольшая карточка-pill партнёра.

- Avatar md (48px) + имя (text-base, weight 500)
- Background: `bg.surface-1`, radius-full padding
- Не интерактивна (просто индикация — «он/она тоже здесь»)

## Секция: Мы в цифрах (Stats)

### Section header

- Text «МЫ В ЦИФРАХ» (text-xs uppercase, letter-spacing wide, `ink.muted`)
- Под ним 16px gap

### Stat tiles

#### Дни / Вместе (главная пара)

- 2 tiles side by side
- Каждый: 
    - Hero number (Fraunces text-4xl 72px, `ink.primary`, tabular)
    - Подпись (text-sm `ink.secondary`)
    - Background: Card default radius-md, padding 20px
    - Width: 50% each, gap 12px

#### Любимые места

- Card default, radius-md, padding 20px
- Title (text-sm `ink.muted` uppercase): «ЛЮБИМЫЕ МЕСТА»
- List 3 places: ordinal + name + counter в скобках
- text-base, weight 500
- Если меньше 3 мест за всё время — показывать сколько есть + «копим»

#### Жанры

- Card default, radius-md, padding 20px
- Title: «ЖАНРЫ»
- 3 категории inline с разделителями: «Свидания · Ужины · Кино»
- text-base

#### Настроения / Желания / Воспоминания

- Каждое — Card default, может быть в 2-колоночной сетке на desktop
- Содержит: иконка + значение

## Секция: Созвездие (Achievements)

### Section header

- Text «СОЗВЕЗДИЕ» (uppercase, `ink.muted`)

### Achievement grid

- **Container:** Card hero variant, radius-xl, padding 24px
- **Background внутри:** глубокий тёмный с легкой звёздной текстурой
- **Grid:** 8 columns × N rows
- **Cell size:** 40×40px каждая (с padding для glow)
- **Gap:** 12px

### Achievement item

- **Unlocked:** 
    - Filled mini-illustration (см. [03-iconography.md → Achievement badges](../03-iconography.md#achievement-badges-для-коллекции-в-профиле))
    - Warm glow halo
    - Цвет — gold/warm
- **Locked:**
    - Dim outline (opacity 0.2)
    - Силуэт ачивки чуть виден

### Counter под grid'ом

- «11 из 30» (text-sm `ink.secondary`)

### Tap на achievement

- Unlocked: показывает popover с:
    - Большая illustration (88px)
    - Title (text-xl Fraunces)
    - Description (text-base)
    - Дата получения (text-xs `ink.muted`)
- Locked: показывает silhouette + текст «Ещё впереди»

## Секция: Общие даты

### Spec

- Card default, padding 20px
- Title строка (uppercase, `ink.muted`)

### List items

- 2-колоночный layout: name (left) + date (right)
- Name: text-base
- Date: text-base, tabular, `ink.primary`
- Каждая редактируема (tap → date picker)

### Defaults

- **Знакомство** (тап = picker)
- **Начало отношений** (тап = picker)
- **Её др**, **Его др** (тап = picker)
- В нижней части: ghost-button «+ добавить нежную дату» (для optional custom — «первое свидание», «первый поцелуй»)

## Секция: Уведомления

### Spec

- Card default
- Каждая строка — toggle switch + label

### Layout

- Label (text-base left), switch (right)
- Sub-label (text-xs `ink.muted`) под main label если нужно объяснение

### Toggles

| Label | Sub-label (если есть) | Default |
|-------|----------------------|---------|
| Календарь напоминания | За 1 час до события (можно изменить per event) | ON |
| Когда партнёр чекнулся | Badge в Доме / Mood | ON |
| Если она 3 дня не отмечается | Анти-FOMO. Включи только если хочешь сам. | OFF |
| Когда добавляет в хотелки | | ON |
| Когда добавляет/меняет план | | ON |
| «Этот день в прошлом» | Если за сегодня есть отмеченный момент в прошлом | ON |

### Global mute

- В нижней части: «Не беспокоить ничем» — большой toggle

## Секция: Тема

### Spec

- Card default

### Items

- **Personal hue:** 5 preset chips (small circles 32px), 1 selected. См. open-questions — пока 3 preset'а: copper/honey/earth для него; rose/blush/wine для неё. В макете показываем 3 как row of swatches.
- **Particles** — toggle
- **Grain overlay** — toggle
- **Анимации** — 3-segment («авто» / «reduced» / «выкл»)

В MVP — Dark only, поэтому **toggle Dark/Light в макете не нужен**.

## Секция: Аккаунт

### Spec

- Card default

### Items

- «Сменить пароль» (tap → flow смены пароля Supabase)
- «Выйти» (tap → confirm → logout)

**Email НЕ показываем.** Email-алиас known только админу.

## Cycle section (только для её аккаунта, v0.2)

В её Профиле появляется доп. секция между «Общие даты» и «Уведомления». В MVP **не рисовать**.

```
─── ЦИКЛ ───

Текущая фаза: ...
Календарь цикла → ссылка на отдельный экран

Toggle: «Показывать ему фазу на его mood-glance»
```

Полный design — отдельно в v0.2.

## Anti-pattern

- ❌ Activity graph / score
- ❌ «Streak: 47 days» в любой форме
- ❌ Social: подписки, друзья, public profile
- ❌ Premium upgrade блоки
- ❌ Photo / profile-pic upload (initials достаточны в MVP — фото можно в v2)
- ❌ Bio / описание себя
- ❌ Privacy settings отдельной страницей — они тут вместе
