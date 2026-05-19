# 06 — States: loading / empty / error / focus / hover

Сводно по всем состояниям, чтобы не повторяться в каждом экране.

## Loading

### Принцип

Никаких спиннеров iOS-style. Только наш визуальный язык.

### Variants

#### 1. Pulsing blob

- Маленький blob 24×24 в personal hue или warm
- Slow morphing + glow halo pulsation
- Использовать **внутри кнопок**: «Войти» → loading state, blob где обычно text
- Использовать **внутри widget'ов**: pulsing blob в центре пустой карточки

#### 2. Breathing card

- Карточка полностью отображается, но с opacity 0.4 + slow breathing (opacity 0.4 → 0.6 → 0.4)
- Полезно когда данные **уже примерно знаешь** что будут — карточка показывает skeleton-like структуру

#### 3. Page-level (initial load)

- Большой blob 80×80 в центре экрана
- Под ним тёплый текст «Дом просыпается...»
- Background = ambient hue какой комнаты вошёл
- Long-load (>3s) — текст может смениться: «Чуть-чуть...»

### Когда что использовать

| Use case | Variant |
|----------|---------|
| Login submit | Pulsing blob в кнопке |
| Initial app load после login | Page-level |
| Виджет грузит данные | Breathing card |
| Опять открываем известную комнату | НЕТ loader'a — старые данные сразу, refresh в фоне |
| Image loading | Gradient placeholder (`bg.surface-1` → `bg.surface-2`) + fade-in после load |

## Empty states

### Принцип

**Никогда «No data», никогда «Empty list».** Всегда тёплая фраза + опциональное действие.

### Universal template

```
┌──────────────────────────────┐
│                              │
│      (optional иллюстрация)  │
│                              │
│      Тёплая фраза            │  ← text-xl Fraunces ink.primary
│      описывающая ситуацию    │
│                              │
│      Подзаголовок если нужен │  ← text-sm ink.secondary
│                              │
│      ┌──────────────┐        │
│      │ Действие     │        │  ← Опциональная CTA (ghost button)
│      └──────────────┘        │
│                              │
└──────────────────────────────┘
```

### Конкретные фразы по экранам

#### Home

- **Все виджеты пустые (первый день):** в каждом виджете своё (см. ниже)

#### Mood

- **Пара sleeping, оба не отмечались:** «Сегодня ещё тихо. Никто не отметился.»
- **Партнёр не отмечался:** «[имя] ещё не зашла сегодня. Появится — увидишь.»

#### Calendar

- **Нет событий вообще:** «Календарь пока пустой. Может, придумаем первый план?»
- **Только идеи, нет событий:** «Никаких планов на ближайшее время — спокойствие.»
- **Selected day без событий:** «На [дату] событий нет.»
- **Нет идей:** «Что-то, что хотелось бы как-нибудь?» + кнопка «добавить идею»

#### Wishlist

- **Список Её / Его пустой:** «Здесь пока пусто. Когда [имя] добавит что-то — появится тут.»
- **Список Мои пустой:** «Что хотелось бы? Большое или маленькое — всё считается.»
- **Список Наше пустой:** «Это место для того, что мы хотим вместе.»
- **Список Я люблю пустой:** «Что я уже люблю. Любимая парфюмерия, любимая марка кофе, любимое место.»

#### Profile

- **Stats без данных:** «Скоро тут появятся цифры. Сейчас всё ещё считается.»
- **Achievements: 0 unlocked:** созвездие dim, текст «Звёзды только зажигаются»

#### Memory of the day

- **Нет данных за сегодня:** виджет скрывается полностью **или** показывает «Совсем скоро тут появятся ваши моменты»

### Empty state иллюстрации (опц.)

См. [03-iconography.md → Empty state illustrations](../03-iconography.md#empty-state-illustrations).

В MVP можно ограничиться только текстом + опц. ghost-button. Иллюстрации — bonus.

## Error states

### Принцип

Никаких красных алёртов / agressive iOS-error UI. Тёплый, спокойный тон.

### Variants

#### 1. Inline error (под input)

- Text-sm `status.error` (приглушённый коралл, **НЕ красный**)
- Иконка слева (subtle warning-circle) 14px
- Появляется fade-in 200ms
- Дружелюбный текст:
    - Не «Invalid email» — «Что-то не так с этим. Проверим?»
    - Не «Required field» — «Это поле нужно»
    - Не «Password too short» — «Пароль чуть короче, чем хотелось бы (от 8 символов)»

#### 2. Card-level error (когда не загрузилось)

- В карточке виджета: «Что-то пошло не так. Перезагрузить?»
- Маленькая ghost-кнопка «обновить»

#### 3. Page-level error (полный fallback)

- Большая центральная зона
- Текст в Fraunces text-xl: «Похоже, мы споткнулись...»
- Подзаголовок: техническая mini-фраза («Не удалось загрузить данные»)
- Кнопка «попробовать ещё раз»

### Network / offline state

- **PWA detection:** offline status bar внизу экрана
- Background: `bg.surface-2` с warm border
- Text: «Сейчас офлайн — изменения сохраняются локально»

## Focus state

### Принцип

Всегда показывать focus ring, особенно для keyboard-навигации (a11y).

### Spec

- **Outline:** 2px `border.focus` (`rgba(232, 180, 255, 0.4)`)
- **Outline offset:** 2px
- **Transition:** 250ms
- Применяется на: buttons, inputs, links, tabs, segmented control items

## Hover state (desktop only)

### Принцип

Subtle hover, не агрессивный. Подсветка скорее намёк, чем явное действие.

### Specs

| Element | Hover effect |
|---------|--------------|
| Button | Background → `bg.surface-3` (если applicable), glow усиливается |
| Card | translateY(-2px), border opacity +50%, glow halo появляется |
| ListItem | Background → `bg.surface-2` (subtle) |
| Tab / Segment | Background → `bg.surface-2` если не active |
| ChipFilter | Background tint warm, border opacity +50% |
| Link (text-button) | Underline appears, color shifts +brightness |

## Active / Pressed state

### Spec

- **Scale:** 0.97 (slight)
- **Glow:** усиливается
- **Длительность press:** 150ms in, 250ms out

Применяется на: buttons, tap-able cards, list items.

## Disabled state

### Spec

- **Opacity:** 0.4
- **Cursor:** not-allowed (desktop)
- **All transitions:** suppressed
- **No hover effect**

## Selected state (для list items, chips, options)

### Spec

| Element | Selected visual |
|---------|-----------------|
| Tab | Background `bg.surface-2`, text `ink.primary`, glow halo на иконке |
| Segmented control item | Background `bg.surface-2`, text `ink.primary` |
| ChipFilter | Background personal hue alpha 0.2, border personal hue |
| EmotionPicker item | Blob увеличен +12%, warm glow halo |
| List item (calendar selected day) | Background `bg.surface-2`, slight border accent |

## Skeleton state (placeholder во время load)

Когда мы знаем структуру, но данные грузятся.

### Spec

- **Background:** градиент `bg.surface-1` → `bg.surface-2` → `bg.surface-1`, медленно двигается
- **Дюрация:** 2s loop
- **Применять для:** карточек wishlist при load, фото в Memory of the day

## Toast/notification states

### Success toast

- Иконка checkmark (`status.success` color)
- Text: «Готово»

### Warning toast

- Иконка warning-circle (`status.warn` color)
- Text: например «Снова без интернета»

### Error toast

- Иконка x-circle (`status.error` color)
- Text: дружелюбный
- **НЕ красный**, тёплый коралл

### Achievement toast

- Иконка sparkle (gold)
- Text: «★ Параллель — отметились в один день»
- Glow halo более выраженный

## Modal / Drawer states

### Open transition

- **Backdrop:** opacity 0 → 0.6, blur 0 → 32px, 300ms
- **Modal content:** scale 0.95 → 1.0, opacity 0 → 1.0, 400ms

### Close transition

- Reverse, 300ms

### Drawer (bottom-sheet) — для FAB form

- Slide-up from bottom
- Дюрация: 400ms
- Soft ease-out
- Тяга закрытия — swipe-down handle сверху (4×40px индикатор)
