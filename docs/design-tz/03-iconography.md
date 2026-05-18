# 03 — Iconography

## Базовый стиль

- **Тип:** outline, чуть закруглённый
- **Stroke width:** 1.5px на 24px иконке (масштабируем пропорционально)
- **Stroke-linecap:** round
- **Stroke-linejoin:** round
- **Fill:** none (outline) для UI; some custom — duotone (см. ниже)
- **Цвет по умолчанию:** `currentColor` (наследует от родителя)

Референсы стиля:
- [Phosphor Icons](https://phosphoricons.com/) (Duotone weight)
- [Iconoir](https://iconoir.com/)

**Избегаем:** Material Icons, Fluent, любая Bootstrap-серия.

## Иконки навигации (5 кастомных)

Каждая — уникальная метафора для своей комнаты. Не использовать generic иконки (нет «home/calendar/heart» в стандартном виде).

| Комната | Метафора | Описание |
|---------|----------|----------|
| **Home (Дом)** | Дверь / огонь в камине | Стилизованная арочная дверь с тёплым свечением внутри. Альтернатива — огонёк свечи. Не дом-домик ❌ |
| **Mood (Настроение)** | Blob / луна | Organic blob с мягким glow, или луна-полумесяц в обрамлении мини-blob'ов |
| **Calendar (Календарь)** | Окно с видом / открытая книга | Окно с разделёнными стёклами и тёплым светом внутри, ИЛИ открытая книга с двумя страницами. Не сетка-календарь ❌ |
| **Wishlist (Хотелки)** | Звезда / гирлянда | Многоугольная звезда (5 или 6 лучей) с soft glow, или гирлянда огоньков. Не сердце ❌ |
| **Profile (Профиль) — в top-bar как аватар** | Луна-полумесяц в круге | Простая луна, или половина луны = аватар в круге |

### Размер иконок навигации

- **Mobile bottom-nav:** 28×28px
- **Desktop sidebar:** 24×24px (со sliding label)

### State

- **Default:** `ink.secondary`, opacity 1
- **Active:** `ink.primary` + warm glow halo
- **Hover (desktop):** slight scale 1.05

## UI-иконки (стандартные)

Эти из библиотеки (Phosphor Duotone), 24×24 базовых, masштабируем 16/20/24/32.

### Действия

| Иконка | Назначение | Phosphor (suggested) |
|--------|-----------|----------------------|
| Plus | Добавить | `plus` |
| Edit / Pencil | Редактировать | `pencil-simple` |
| Trash / X / Remove | Удалить | `trash` |
| Check | Подтвердить | `check` |
| Close / X | Закрыть | `x` |
| Chevron-down | Раскрыть | `caret-down` |
| Chevron-right | Перейти | `caret-right` |
| Chevron-left | Назад | `caret-left` |
| More dots (vertical) | Контекстное меню | `dots-three-vertical` |
| Filter | Фильтр | `funnel` |
| Search | Поиск | `magnifying-glass` |
| Settings | Настройки | `gear-six` |
| Logout | Выйти | `sign-out` |

### Контекст

| Иконка | Назначение |
|--------|-----------|
| Map-pin | Локация события |
| Clock | Время события |
| Calendar-blank | Дата picker icon |
| Camera | Прикрепить фото |
| Image | Фото (preview placeholder) |
| Link | Внешняя ссылка |
| Tag | Категория |
| Star (filled) | Приоритет / favorited |
| Eye | Visibility «видно полностью» |
| EyeClosed | Visibility «скрыто» |
| Sparkle | Visibility «vibe-only» (или кастомный туман-иконка) |
| Moon | Цикл / фаза (только Profile / Mood, v0.2) |

## Mood blobs (эмоции) — не «иконки», но визуальный язык

См. [02-components.md → EmotionPicker](./02-components.md#emotionpicker). Каждая эмоция = blob уникальной формы и цвета.

Это рисовать как SVG паттерны:
- 12 уникальных organic shape'ов
- Каждая чуть отличается от строгой круглой формы
- Внутренний градиент — мягкий, центральный glow выделен ярче

В файлах: `/icons/mood/blob-joy.svg`, `blob-calm.svg`, etc.

## Phase indicator (v0.2)

Для cycle ambient-индикатора на her mood blob у партнёра. **Не текстовое**, а **метафора фаз луны:**

| Фаза цикла | Фаза луны | Иконка |
|-----------|-----------|--------|
| Менструация | Новолуние | Полный тёмный круг с тонким контуром |
| Фолликулярная (после) | Растущая | Полумесяц растущий |
| Овуляция | Полнолуние | Полный светлый круг с glow |
| Лютеиновая | Убывающая | Полумесяц убывающий |

Размер — 16×16px, появляется рядом с blob'ом как маленький спутник.

## Custom assets (рисуем в дизайне)

### Login screen

- **Logo:** «us» написано Fraunces 500, text-4xl (48px), `ink.primary`. Точка после «us» — НЕ ставим (мы решили без точки)
- **Иллюстрация (опц.):** floating particles / soft moon — не обязательно, можно только text + glow

### Achievement badges (для коллекции в Профиле)

Каждая ачивка — уникальная маленькая иллюстрация-«звезда»:

- **Default size:** 56×56px (в grid), 88×88px (при tap → preview)
- **Style:** outline + duotone, glow когда unlocked, dim когда locked
- **Палитра:** warm tones, gold для special

Примеры ачивок и их визуальная метафора:

| Ачивка | Метафора |
|--------|----------|
| Первая луна | Маленькая луна с искрой |
| Параллель | Два соединённых blob'a |
| Сто дней знакомства | Число «100» в обрамлении глубокого космоса |
| Год вместе | Спираль / цикл |
| Странники | Дорога с тёплыми огнями |
| Хранитель | Открытая коробка с фотографиями |
| Алхимик | Колба с тёплым свечением |
| Полнолуние | Полная луна с halo |

Рисовать пока не все 30+ — для первой версии хватит 6-8 main + остальные как placeholders (запрограммируем потом).

### Empty state illustrations

Для пустых состояний — простая иллюстрация-вектор. Спокойная, тёплая, не «жалостная». Идеи:

- **Empty Calendar:** одна звезда в небе
- **Empty Wishlist:** пустая полочка с тёплой лампой
- **Empty Mood (партнёр не чекался):** спящий blob под одеялом-облаком
- **Empty Memory of the day:** окно ночью с лунным светом

Не обязательны в MVP — можно текстом обойтись. Но если время есть — добавят шарма.

## Что не используем как иконки

- ❌ Эмодзи как UI-элементы (Apple, Google emoji в категориях)
- ❌ Material Icons (плоские, утилитарные)
- ❌ Filled / solid стиль везде (только outline + selective duotone)
- ❌ Skeumorphic элементы (никаких «3D дверей», «реалистичных календарей»)
- ❌ Iconfonts (вроде Font Awesome) — все иконки = SVG

## Технически (для разработки)

См. [.claude/rules/svg-icons.md](../../.claude/rules/svg-icons.md):
- Все иконки в `src/components/icons/<group>/<Name>.tsx`
- Один SVG = один компонент
- Принимает `className`, `width`, `height` через `...props`
- Цвет через `currentColor`

Передача в дизайнерскую часть — экспортируем из Pencil в SVG, дальше копируем в компоненты.
