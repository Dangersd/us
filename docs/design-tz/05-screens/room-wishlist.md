# Wishlist — Хотелки

Розово-персиковая комната. Pinboard желаний и любимых вещей.

**Ambient hue:** `#FFB4D1` розово-персиковое
**Effects:** glow вокруг сохранённых вещей, «звёздочки» при добавлении новых, pinboard-сетка

## Mobile layout

```
┌──────────────────────────────────┐
│  ●  ●                  [Avatar]  │  ← Top bar
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │ Её │ Мои │Наше│Я люблю    │  │  ← Segmented control top tabs
│  └────────────────────────────┘  │
│                                  │
│  [одежда] [дом] [еда] [...]      │  ← Filter chips
│                                  │
│  ┌──────┐ ┌──────┐               │
│  │      │ │      │               │  ← Grid карточек 2 cols
│  │ свеча│ │ плед │               │
│  │      │ │      │               │
│  │ ● дом│ │ ● дом│               │
│  └──────┘ └──────┘               │
│                                  │
│  ┌──────┐ ┌──────┐               │
│  │      │ │      │               │
│  │духи  │ │книга │               │
│  │      │ │      │               │
│  └──────┘ └──────┘               │
│                                  │
│         ┌──────────────┐         │
│         │  + добавить  │         │  ← FAB
│         └──────────────┘         │
│                                  │
├──────────────────────────────────┤
│   [○] [○] [○] [●○]               │
└──────────────────────────────────┘
```

## Desktop layout

- 4 колонки карточек
- Sidebar/segmented control сверху как на mobile

## Top segmented control

### Spec

- См. [02-components.md → TabBarSegment](../02-components.md#tabbarsegment-top-tabs-в-wishlist)
- **4 пункта:** «Её» / «Мои» / «Наше» / «Я люблю»
- **Порядок зеркальный для каждого аккаунта:**
    - Когда я залогинен как ОН: «Её» / «Мои» / «Наше» / «Я люблю»
    - Когда залогинен как ОНА: «Его» / «Мои» / «Наше» / «Я люблю»
- **Default selected:** «Её» (или «Его») — список партнёра первый, чтобы видеть что им хочется

## Filter chips

Под segmented control — категории-фильтры.

### Spec

- См. [02-components.md → ChipFilter](../02-components.md#chipfilter-для-категорий)
- **Layout:** horizontal scroll-row (mobile), wrap (desktop)
- **Chips:** «всё» (default selected, без category-dot), затем categories которые есть в текущем списке

### Tap

- Tap → фильтр применяется, grid обновляется
- Tap на «всё» — фильтр снимается

## Wish Card

Главный элемент.

### Spec

- См. [02-components.md → WishCard](../02-components.md#wishcard)
- **Aspect ratio:** 3:4 (если есть image), 1:1 (если только text)
- **Grid:** 2 cols на mobile, 4 cols на desktop, gap 12px

### Layout внутри карточки

```
┌────────────────────────┐
│                        │
│        [image]         │  ← Top section (image, square aspect)
│                        │
│                        │
├────────────────────────┤
│ Свеча Diptyque         │  ← Title (text-base 500, max 2 lines)
│ ● Дом · ~5000₽         │  ← Category dot + meta
│ «обожаю запах...»      │  ← Note (text-xs secondary, 2 lines max)
└────────────────────────┘
```

### Priority indicator

В правом верхнем углу карточки — маленькая «звёздочка» или dot, показывающая приоритет:
- **someday** — no indicator
- **want** — мягкая звезда (text-warm subtle)
- **really_want** — заполненная звезда с glow

### Tap

- Tap → expand: full screen detail с большим image + полной заметкой + link button

### Hover (desktop)

- Card lifts (`shadow-warm`)
- Glow halo вокруг
- «Subtle» reveal: иконки edit/delete в углу

### States

| State | Visual |
|-------|--------|
| **New (added recently)** | Subtle glow halo на 24h после добавления |
| **Edited (recently)** | Subtle indicator that был updated |
| **No image** | Background `bg.surface-2` с большой иконкой category в центре |

## FAB (как в Calendar)

См. [room-calendar.md → FAB](./room-calendar.md#fab-floating-add-button)

### Tap → Add item modal

#### Form fields

- **К какому списку:** segmented (Мои / Наше / Я люблю) — pre-selected на текущей вкладке
- **Название:** Input
- **Ссылка:** Input (если введён URL — попробуем парс OG image, name, описание)
- **Изображение:** upload или OG-image preview
- **Категория:** Select/dropdown с category dots
- **Цена примерная:** Input (number, опционально)
- **Приоритет:** segmented (когда-нибудь / хочется / очень хочется)
- **Заметка:** Textarea

## Wish Detail (full screen)

Когда tap на карточку.

### Layout

```
┌──────────────────────────────────┐
│  ← назад              ⋯          │
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │                            │  │
│  │       [большое image]      │  │
│  │       (1:1 aspect)         │  │
│  │                            │  │
│  └────────────────────────────┘  │
│                                  │
│  Свеча Diptyque                  │  ← Title (text-3xl Fraunces)
│  ● Дом · ~5000₽                  │  ← Meta строка
│                                  │
│  ─────                           │
│                                  │
│  «обожаю запах, нашла на Озоне,  │  ← Full note
│   у неё такие нотки бергамота...»│
│                                  │
│  ─────                           │
│                                  │
│  ★ хочется                       │  ← Priority indicator
│                                  │
│  ┌──────────────────────────┐   │
│  │   открыть ссылку →       │   │  ← Link button (если есть)
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │       редактировать      │   │  ← Edit button
│  └──────────────────────────┘   │
│                                  │
│  Добавлено 3 дня назад           │  ← Meta in footer
│                                  │
└──────────────────────────────────┘
```

## Empty states

### Пустой список «Её» / «Его»

- Иллюстрация: пустая полочка с тёплой лампой
- Текст: «Здесь пока пусто. Когда [имя] добавит что-то — появится тут.»

### Пустой список «Мои»

- Текст: «Что хотелось бы? Большое или маленькое — всё считается.»
- Большая ghost-кнопка «добавить первое»

### Пустой список «Наше»

- Текст: «Это место для того, что мы хотим вместе — путешествие, ужин, плед.»
- Кнопка «добавить»

### Пустой список «Я люблю»

- Текст: «Что я уже люблю — что любимая парфюмерия, любимая марка кофе, любимый ресторан. Подсказки [имени партнёра] для подарков.»
- Кнопка «добавить»

## Sort menu (через ⋯ в top corner)

Опции сортировки:
- Новые сверху (default)
- По приоритету
- По категории (групировка)
- По цене (asc/desc)

## Search

В MVP — без отдельного search-экрана. В top-bar можно добавить subtle search-icon, которая открывает inline search row.

**Спецификация (если есть):**
- Tap on search icon → input bar заменяет filter chips temporarily
- Поиск по title + note
- Эскейп / Х → возврат к filter chips

(Можно отложить search до v0.2, если нет урент потребности.)

## Anti-pattern

- ❌ Никаких Amazon-style звёзд reviews
- ❌ Никаких «купить сейчас», integrated shopping
- ❌ Никаких «trending wishes» / social proof
- ❌ Surprise-механики (была отвергнута)
- ❌ Полученные подарки tracking (тоже была отвергнута)
- ❌ Цены в крупный шрифт — это просто tiny meta
