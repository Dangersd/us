# 02 — Дизайн-система

## Базовая палитра

Тёплый night-mode по умолчанию. Light-mode — пост-MVP.

```
Background base:    #0E0B14   тёплый night, не чистый чёрный
Surface 1:          #1A1620   карточки
Surface 2:          #251F2E   карточки на карточках, modal
Ink primary:        #F4EDE4   тёплый off-white, не белый
Ink secondary:      #BFB3A8   приглушённый
Ink muted:          #6F6677   подписи, мета

Glow warm:          #FFC9A8   свечение каминного огня
Glow soft:          #E8B4FF   свечение луны / настроения
```

Цвет акцента **не фиксированный** — каждая комната имеет свой ambient hue (см. ниже).

## Personal hue (per-account)

Каждый аккаунт имеет свой оттенок из тёплой палитры. Используется для:

- Свечения по краям экрана (очень тонкое)
- Тинта собственного аватара / mood blob'а
- Background-glow на login-экране

```
Его (male account):     copper / amber    #E8A87C   (холоднее, янтарь)
Её (female account):    rose / peach      #F4A5B9   (теплее, роза)
```

Видя контент партнёра, видишь его hue (её mood blob с розовым, его memory-карточка с янтарным) — это создаёт интуитивное узнавание «чьё это» по цвету. Общие виджеты (планы, memory of the day) используют общую тёплую палитру без personal hue.

Возможны 3 предустановки внутри каждого гендерного направления (см. [07-open-questions.md](./07-open-questions.md)) — пока фиксируем по одной.

## Per-room ambient hue

Каждая комната имеет дополнительный ambient hue поверх базы:

| Комната | Ambient hue | Текстура / эффект |
|---------|-------------|-------------------|
| **Дом** | `#FFC9A8` тёплое янтарное свечение | Лёгкие floating particles (пылинки в свете), очень мягкий vignette |
| **Настроение** | `#E8B4FF` лиловое лунное | Анимированные blobs / gradient mesh, мягко пульсирующие |
| **Календарь** | `#F4D08A` тёплая бумага / янтарь | Слегка зернистый фон, даты с эффектом «вытесненной чернилами» |
| **Хотелки** | `#FFB4D1` розово-персиковое | Glow вокруг сохранённых вещей, «звёздочки» при добавлении, pinboard-сетка |
| **Профиль** | `#A8C9FF` ночное небо | Звёздное поле как фон stats, ачивки как созвездия |

## Слои материала

Всё построено на трёх слоях:

1. **Background canvas** — большой мягкий радиальный градиент с цветом текущей комнаты, тонкий grain (1-2% noise), очень медленная анимация (~30s loop)
2. **Glass surfaces** — `backdrop-filter: blur(24px)` + полупрозрачный фон + 1px тёплая граница `rgba(255,201,168,0.08)`
3. **Floating elements** — карточки и виджеты с лёгкой тенью (диффузная, тёплая `rgba(255,201,168,0.04)`)

## Типографика

- **Display / заголовки** — [Fraunces](https://fonts.google.com/specimen/Fraunces). Variable serif, выразительный, отличная кириллица. Используется редко, только в hero-моментах (большие числа в Stats, заголовки Memory of the day, hero-цифры).
- **Body / UI** — [Geist](https://vercel.com/font/sans) (родной для Vercel) с fallback на [Inter](https://fonts.google.com/specimen/Inter) если Geist окажется тонким на маленьких размерах. Обе с кириллицей.
- **Числа / статистика** — `font-variant-numeric: tabular-nums` из Inter.

Размеры — щедрые. UI не плотный.

```
xs:   12px   meta, подписи
sm:   14px   secondary text
base: 16px   body
lg:   18px   inputs, primary labels
xl:   24px   section titles (Fraunces)
2xl:  32px   widget hero (Fraunces)
3xl:  48px   page hero
4xl:  72px   stats hero (Fraunces, tabular)
```

## Анимации

### Принципы

- Длительность: 250-450ms для UI, 600-900ms для атмосферы
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (soft ease-out)
- Никогда не «прыгает» — всё перетекает
- Atmospheric loops (particles, ambient gradients) — медленные (20-40s)

### Конкретные жесты

| Жест | Поведение |
|------|-----------|
| Hover карточки | Light lift + warm glow halo |
| Press кнопки | Subtle inset + ripple из тёплого света |
| Mood blobs | Постоянное мягкое morphing |
| Memory of the day появление | Slow fade-in + lens-blur пробуждение |
| Переход между комнатами | Cross-fade + slight scale 0.98→1.0 + glassmorphism слой кратко затемняется |
| Toast (ачивка) | Soft fade-in снизу, держится 4s, soft fade-out |

### Reduced motion

Под `prefers-reduced-motion: reduce`:
- Атмосферные анимации (particles, gradient loops) отключаются
- Переходы между комнатами — мгновенные cross-fade без scale
- Morphing blobs становятся статичными

## Иконки

Стиль — **outline, чуть закруглённый, weight ~1.5px**, в духе [Phosphor Duotone](https://phosphoricons.com/) или [Iconoir](https://iconoir.com/). Никаких Material/Fluent.

Иконки для табов — кастомные SVG с собственной метафорой:
- Дом — дверь / огонь в камине
- Настроение — blob / луна
- Календарь — окно с видом / открытая книга
- Хотелки — звезда / гирлянда
- Профиль — луна-полумесяц (в правом верхнем углу как аватар)

См. правило [.claude/rules/svg-icons.md](../.claude/rules/svg-icons.md) — иконки лежат в `src/components/icons/`.

## Шум, grain, particles

Опциональны (toggle в Профиле → Тема), включены по умолчанию.

- **Grain** — 1-2% noise overlay на background, не на контенте. SVG `<feTurbulence>` или PNG-текстура.
- **Floating particles** — на Доме и Настроении. Очень редкие, медленные. Реализация через `<canvas>` или light-particles библиотеку (выбор в [07-open-questions.md](./07-open-questions.md)).

## Empty / loading / error states

UI должен сохранять характер даже когда контента мало:

- **Пустые состояния** — никогда не «No data», всегда тёплая фраза («День начинается с тишины»)
- **Loading** — не спиннер, а медленный пульсирующий blob или дыхание свечения
- **Errors** — мягкие, никогда не красные алёрты в стиле iOS. Тёплый оранжевый, спокойный тон.

## Bottom-nav (mobile)

4 иконки без подписей, центр-выровненные:

```
┌──────────────────────────────────┐
│            КОМНАТА               │
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│    [○]    [○]    [○]    [○]      │  ← иконки без подписей
└──────────────────────────────────┘
```

Активная вкладка — слегка ярче glow, чуть увеличена.

Профиль доступен через аватар в правом верхнем углу (вне bottom-nav).

## Sidebar (desktop, 240px)

```
┌─────────┬──────────────────────┐
│ ○ Дом   │                      │
│ ○ Mood  │      КОМНАТА         │
│ ○ Cal   │                      │
│ ○ Wish  │                      │
│         │                      │
│ ─────   │                      │
│ ○ Профи │                      │
└─────────┴──────────────────────┘
```

Sidebar сворачиваемый до 64px (только иконки).
