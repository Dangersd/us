# 04 — Motion: анимации и переходы

В статических макетах Pencil движения не покажешь, но они должны быть учтены — где-то нужно оставить место для glow, где-то указать что элемент пульсирует. Этот файл — заметки и пометки для макета.

## Базовые принципы

- Длительность UI: **250-450ms**
- Длительность атмосферных: **600-900ms**
- Атмосферные loops (particles, gradient): **20-40s** (очень медленные)
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` — мягкий ease-out
- **Никогда не «прыгает»** — никакой spring с overshoot
- Под `prefers-reduced-motion: reduce` — упрощается, см. ниже

## Microinteractions (нужно оставить место в макете)

### Кнопки

- **Press:** scale 0.97, glow усиливается. Длительность 150ms in / 250ms out.
- **Hover (desktop):** glow halo появляется. 250ms.
- **Disabled:** opacity transition 200ms.

### Карточки

- **Hover (desktop):** translateY(-2px) + glow halo. 300ms.
- **Tap (mobile):** scale 0.98. 150ms in.

### Slider / Battery

- **Drag:** thumb glow intensifies, метка состояния fade-cross-fade меняется при пересечении границ. 250ms.
- **Released:** thumb settles с lightspring (без overshoot). 350ms.

### Input focus

- **Focus:** border-color transition + glow halo появляется. 250ms.
- **Blur:** обратно. 250ms.

## Blob anatomy

Это сердце визуального языка. Blob'ы должны быть **живыми**, постоянно дышать.

### Idle morph

- Каждый blob — постоянно медленно morphing (changing shape слегка)
- Длительность одного цикла morph: **8-15 секунд**
- Амплитуда: very subtle — 5-10% от диаметра
- В Pencil: нарисовать 2-3 frame variant'а одной blob'и, для guidance

### Breathing (синхронизировано с energy / mood)

- Lower energy = медленнее, deeper breathing (12s cycle)
- Higher energy = живее (5s cycle)
- Sleeping blob (партнёр не отметился) = очень медленно, едва заметно (20s+)

### Glow halo pulse

- Активные blob'ы имеют subtle glow halo, который слегка пульсирует
- Амплитуда glow opacity: 0.3 → 0.5
- Длительность: 4s cycle

### Появление blob'а

- Initial: scale 0.8, opacity 0
- Final: scale 1.0, opacity 1.0
- Длительность: 600ms, easing soft ease-out
- Trail: glow halo fade-in отдельно, чуть позже (200ms delay)

## Переходы между комнатами

Важно — сделать чтобы ощущалось «вошёл в другую комнату», не «переключил вкладку».

### Шаги (по фазам, в сумме ~600ms)

1. **0-200ms:** Текущая комната slide-left 8px + fade out до opacity 0.6
2. **150-450ms:** Glassmorphism overlay поверх (затемнение всего экрана blur 60px, opacity 0.3)
3. **300-600ms:** Новая комната slide-in (от right +8px, scale 0.98 → 1.0), fade-in
4. **400-700ms:** Ambient hue в фоне cross-fades с глобального бэкграунда

В Pencil — указать что транзишн есть, точные таймy в коде.

## Атмосферные эффекты (постоянно работают на фоне)

### Floating particles (Home + Mood)

- 8-15 мелких частиц-«пылинок»
- Размер: 1-3px
- Цвет: ambient hue с alpha 0.3
- Движение: drift вверх-вниз medium speed, в случайном паттерне
- Loop: 20-30s per particle (не одновременный, разные phase)
- **В макете:** обозначить точками на фоне, или TextNote «floating particles overlay»

### Ambient gradient breathing

- Большой radial gradient в фоне (ambient hue) — медленно «дышит»
- Opacity: 0.12 → 0.18
- Размер: 70% → 85%
- Loop: 30-40s
- **В макете:** статичный gradient, заметка «slow breathing»

### Grain overlay

- 1-2% noise overlay поверх всего bg
- Статичный (или очень-очень медленно крутится — оптально)
- **В макете:** добавить тонкий noise pattern в Pencil как texture

## Toast appearance (для ачивок)

1. **Initial state:** opacity 0, translateY 24px
2. **Slide-in:** 400ms, soft ease-out, slide + fade
3. **Hold:** 4000ms — toast виден полностью
4. **Slide-out:** 600ms — fade + slight slide-down

## Memory of the day reveal

Когда tap на виджете → разворачивается полноэкранно.

1. **Card scale-up:** 0 → full, 600ms, soft ease-out
2. **Lens-blur effect:** initially blurred 12px → blur 0px, 700ms — даёт «пробуждение из снов» feel
3. **Background dim:** другие виджеты dim до opacity 0.2 + scale 0.95, 400ms

## Number rolling (Stats hero)

Большие числа в Stats анимируются при появлении.

- Roll from 0 → final value
- Длительность: 1200ms
- Easing: ease-out
- В Pencil: показывать final value, в макете заметка «animate rolling on mount»

## Mood blob morph при изменении значения

Когда меняешь stress / energy / эмоцию в check-in'е — blob morphs смотришь как реагирует.

- Длительность morph: 800ms
- Изменение и формы, и цвета одновременно
- Soft ease-out

## Reduced motion override

Для пользователей с `prefers-reduced-motion: reduce`:

| Стандартное | С reduced motion |
|-------------|-----------------|
| Все blob breathing | Static (без morph) |
| Floating particles | Off |
| Ambient gradient breathing | Static (без animation) |
| Переход между комнатами | Instant cross-fade (no slide, no blur) |
| Hover / press transforms | Только color transitions |
| Number rolling | Сразу finale |
| Toast appear | Без slide, только fade |

В Pencil ничего рисовать не надо — это в коде. Заметка только в тех. описании.

## В макете — заметки и аннотации

Когда что-то требует особого внимания motion-стороны, добавлять в Pencil:

- **`// pulse glow`** — рядом с элементом, у которого пульсация
- **`// morph`** — рядом с blob'ом
- **`// number rolling`** — рядом со статами
- **`// floating particles overlay`** — на ambient слое
- **`// blur lens reveal`** — на Memory of the day

Это упростит передачу разработке.
