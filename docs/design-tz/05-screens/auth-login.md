# Auth — Login screen

Единственный экран до входа. Простой, тёплый, без отвлечений.

## Layout

### Mobile (390px width)

```
┌────────────────────────────────────┐
│                                    │
│                                    │     ← top padding 80px от safe area
│                                    │
│              us                    │     ← Logo (Fraunces text-4xl 48px, ink.primary)
│                                    │
│                                    │     ← gap 64px
│                                    │
│       Кто пришёл сегодня?          │     ← Fraunces text-xl 24px, ink.secondary, центр
│                                    │
│                                    │     ← gap 32px
│       ┌──────┐    ┌──────┐         │
│       │  Я   │    │ Она  │         │     ← Большие pill-кнопки 120×56, gap 16
│       └──────┘    └──────┘         │
│                                    │
│       (или после tap)              │
│                                    │
│       ┌──────────────────┐         │
│       │ Пароль           │         │     ← Input lg, full width минус padding
│       └──────────────────┘         │
│                                    │
│              ─                     │     ← gap 16
│       ┌──────────────────┐         │
│       │     Войти        │         │     ← Button primary lg, full width
│       └──────────────────┘         │
│                                    │
│       ←  выбрать другого           │     ← Text-sm ink.muted, текстовая кнопка
│                                    │
└────────────────────────────────────┘
```

### Desktop (1440px width)

Тот же контент, но в центре экрана, max-width 400px. Никакого сайдбара или nav — это pre-auth.

## States

### State 1: First time / Logout

- Logo «us» виден
- Два круга-button: «Я» и «Она»
- Под ними пустота (no password field yet)
- Background: bg.base + общий warm glow (no personal hue yet)

### State 2: Selected «Я» (или «Она»)

Триггерится после клика на одну из кнопок:

1. Выбранная кнопка остаётся подсвечена (active state — fill personal hue с alpha 0.2 + glow halo)
2. Другая кнопка fades to opacity 0.3
3. Появляется password input + button «Войти» (slide-down + fade-in 400ms)
4. Background `personal hue` gradient появляется по краям (subtle vignette)
5. Появляется текст-кнопка «← выбрать другого»
6. Под капотом email-алиас (`him@us.local` / `her@us.local`) уже в state, hidden

Если она выбрала Я / Он выбрала Она — поправляется текстом-кнопкой выбрать другого.

### State 3: Password entry

- Input в focus, border `border.focus`
- Browser autofill suggestions могут появиться — на это полагаемся
- Кнопка «Войти» enabled когда хоть что-то введено

### State 4: Logging in

- Кнопка «Войти» disable, текст меняется на «Заходим...»
- Внутри button — pulsing blob loader (24px diameter, personal hue)
- Inputs становятся read-only

### State 5: Error

- Под input'ом появляется text-sm `status.error`: «Пароль не подошёл. Попробуй ещё раз.»
- Кнопка возвращается к default
- Input снова enabled, в focus, текст в нём остаётся
- НЕ red, НЕ агрессивный

### State 6: Success

- Page-level fade-out 400ms
- Redirect → /home (комната Дом)

## Detailed specs

### Logo «us»

- **Font:** Fraunces 500
- **Size:** 48px
- **Color:** `ink.primary`
- **Letter-spacing:** -0.02em
- **Position:** центр горизонтально, 80-120px от top safe area
- **Под logo (optional, subtle):** маленький glow halo, soft warm

### Subtitle «Кто пришёл сегодня?»

- **Font:** Fraunces 400
- **Size:** 24px
- **Color:** `ink.secondary`
- **Position:** центр, 64px ниже logo
- **Только в State 1.** В State 2+ исчезает (fade-out).

### Account selector buttons «Я» / «Она»

- **Size:** 120×56px each, gap 16px
- **Type:** pill (`radius-full`)
- **Background (default):** `bg.surface-1`
- **Background (active):** personal hue с alpha 0.2 + glow halo (personal hue)
- **Border:** 1px `border.warm`
- **Text:** Fraunces 500, text-xl 24px, `ink.primary`
- **Inner layout:** только text, центр

### Password input

- **Type:** Input (см. [02-components.md → Input](../02-components.md#input-text-field))
- **Size:** lg (height 56)
- **Width:** full container (max 320px)
- **Placeholder:** `Пароль`
- **Type:** password (с native iOS show/hide button)
- **Label сверху:** нет (placeholder достаточно)

### Login button

- **Type:** Button primary lg
- **Width:** full container
- **Text:** «Войти» → «Заходим...»

### Text-link «← выбрать другого»

- **Type:** ghost-text-button
- **Text:** text-sm, `ink.muted`
- **Подчёркивание:** none, но на hover (desktop) — opacity 1.0
- **Tap:** возвращает в State 1, password clears

## Background эффекты

### State 1 (no selection)

- `bg.base` + общий тёплый radial gradient (warm `glow.warm` alpha 0.05)
- Subtle grain overlay
- Несколько floating particles

### State 2+ (account selected)

- Личный hue gradient появляется по краям (vignette-style — слабее в центре, ярче по периметру)
- Particles становятся в hue выбранного аккаунта
- Эффект «дом узнал тебя»

## Anti-pattern (что не делать на login)

- ❌ «Зарегистрироваться» / «Sign up» — НЕТ
- ❌ «Забыли пароль?» — пока нет (для двух аккаунтов смысла мало, ты как админ можешь reset)
- ❌ «Войти через Google» / «Apple Sign In» — нет
- ❌ Большие маркетинговые блоки с описанием продукта
- ❌ Анимация-loader spinner — только наш blob breathing
- ❌ Уведомления / banner'ы / cookie consent
