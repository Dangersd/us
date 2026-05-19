# 07 — Assets checklist

Что нужно подготовить отдельно от макетов в Pencil — для разработки.

## Шрифты

Шрифты подключаются через `next/font` в коде. Для дизайна — установить локально.

- [ ] **Fraunces** (variable) — https://fonts.google.com/specimen/Fraunces
    - Используемые weights: 400, 500
    - Кириллица — должна быть в поставке
- [ ] **Geist Sans** — https://vercel.com/font/sans
    - Weights: 400, 500, 600
- [ ] **Inter** (fallback для Geist + tabular numbers) — https://fonts.google.com/specimen/Inter
    - Weights: 400, 500, 600

## Иконки навигации (кастомные, нужно нарисовать)

5 уникальных SVG-иконок для bottom-nav / sidebar:

- [ ] **Home** — дверь / огонь в камине (28×28 для bottom-nav, 24×24 для sidebar)
- [ ] **Mood** — blob / луна
- [ ] **Calendar** — окно с видом / открытая книга
- [ ] **Wishlist** — звезда / гирлянда
- [ ] **Profile** — луна-полумесяц (отдельный — для top-bar avatar fallback)

Каждая — в 2 версиях (default + active с warm glow).

## UI-иконки (берём из Phosphor Duotone)

Установить набор:
- https://phosphoricons.com/ (Duotone weight)

Используемые (см. [03-iconography.md → UI-иконки](./03-iconography.md#ui-иконки-стандартные)):
- plus, pencil-simple, trash, check, x
- caret-down, caret-right, caret-left
- dots-three-vertical, funnel, magnifying-glass, gear-six, sign-out
- map-pin, clock, calendar-blank, camera, image, link, tag, star, eye, eye-closed, sparkle, moon

## Mood blobs (12 уникальных SVG)

- [ ] blob-joy (радость, тёплый жёлтый)
- [ ] blob-calm (спокойствие, шалфей)
- [ ] blob-love (любовь, роза)
- [ ] blob-sad (грусть, приглушённый синий)
- [ ] blob-anxious (тревога, слива)
- [ ] blob-tired (усталость, muted purple)
- [ ] blob-excited (восторг, коралл-оранжевый)
- [ ] blob-angry (злость, приглушённый коралл)
- [ ] blob-tender (нежность, персик)
- [ ] blob-bored (скука, бежевый)
- [ ] blob-shame (стыд, тёплый бежевый)
- [ ] blob-proud (гордость, золото)

Каждая — organic 4-6 point closed curve, чуть отличается от других. Внутренний radial gradient.

## Universal Blob (для аватара)

- [ ] **Generic blob** SVG path — будет масштабироваться + цвет менять в коде
- Достаточно одной формы, в коде будем менять fill + слегка вертеть для разнообразия

## Phase indicator (v0.2, для cycle)

- [ ] **moon-new** (новолуние) — тёмный круг
- [ ] **moon-waxing** (растущая) — полумесяц растущий
- [ ] **moon-full** (полнолуние) — светлый круг с glow
- [ ] **moon-waning** (убывающая) — полумесяц убывающий

Размер 16×16 base.

## Achievement badges (для коллекции в Профиле)

Минимум 8 на старт MVP, остальные — placeholders / generic stars:

- [ ] **first-moon** — маленькая луна с искрой
- [ ] **parallel** — два соединённых blob'а
- [ ] **hundred-days** — число «100» в обрамлении глубокого космоса
- [ ] **first-year** — спираль / цикл
- [ ] **wanderers** — дорога с тёплыми огнями
- [ ] **keeper** — открытая коробка с фотографиями
- [ ] **alchemist** — колба с тёплым свечением
- [ ] **full-moon** — полная луна с halo

В 2 состояниях: unlocked (filled, glow) + locked (silhouette, dim).

## Empty state иллюстрации (опц.)

Низкий приоритет. Если есть время:

- [ ] **Empty Calendar** — одна звезда в небе
- [ ] **Empty Wishlist** — пустая полочка с тёплой лампой
- [ ] **Empty Mood (sleeping)** — спящий blob под одеялом-облаком
- [ ] **Empty Memory** — окно ночью с лунным светом

Если нет времени — заменяем тёплым текстом без иллюстрации.

## Login screen assets

- [ ] **Logo «us»** — Fraunces 500, text-4xl 48px (это просто typography, ничего не рисуем)
- Optional decorative element: soft moon overhead, или просто particles

## Текстуры

### Grain overlay

- [ ] **noise.png** (или SVG `<feTurbulence>`) — 1-2% noise, tile-able, для overlay на bg

### Paper texture (для Calendar)

- [ ] **paper-grain.png** — слегка более тёплая текстура, имитация тёплой бумаги для ambient слоя Calendar

## Particles

В коде — рисуются программно (canvas / SVG). Никаких заготовленных asset-файлов.

## Photo placeholders (для дизайна)

Нужны реалистичные плейсхолдеры в макетах. Используем:

- [ ] **Unsplash** — категории «warm», «cozy», «night», «couple», «date» (только для design preview, в production будут пользовательские фото)

## Иконка приложения (для PWA)

- [ ] **Икона 512×512** — для manifest, install на home screen
- [ ] **Icon 192×192** — стандартный PWA
- [ ] **Favicon** — 32×32, 16×16

Концепт иконки: маленький **blob с glow** на тёмном фоне (warm личный hue, который не привязан к гендеру — нейтральный warm). Или **луна-полумесяц** на тёмном фоне.

Подобрать в макете отдельно.

## OG image (для shared URL, если он наружу не пойдёт — можно опустить)

В нашем случае приложение не shared наружу. OG image не нужен.

## Что не нужно делать

- ❌ Никаких логотипов / маркетинговых иллюстраций
- ❌ Никаких onboarding-картинок (мы не делаем onboarding)
- ❌ Никаких stock-фото внутри приложения (все фото — пользовательские)
- ❌ Никаких полупустых пресет-аватарок (используем initials в circle)

## Передача asset'ов

Когда асет готов:

1. Экспорт из Pencil в SVG (для иконок и иллюстраций)
2. Копирование в репозиторий → `src/components/icons/<group>/<Name>.tsx`
3. Обёртка в React-компонент по правилам [.claude/rules/svg-icons.md](../../.claude/rules/svg-icons.md)

Для бинарных asset'ов (noise.png, paper-grain.png, app icons) — в `public/`.

## Финальный список приоритетов

| Приоритет | Asset |
|-----------|-------|
| **MUST** | Шрифты (Fraunces, Geist, Inter) |
| **MUST** | 5 navigation icons |
| **MUST** | 12 mood blob SVGs |
| **MUST** | Phosphor UI icons set |
| **MUST** | Grain noise texture |
| **MUST** | App icon (PWA, 512+192) |
| **MUST** | Generic blob shape для аватаров |
| **SHOULD** | 8 achievement badges (минимум на старт) |
| **NICE** | Empty state иллюстрации |
| **NICE** | Paper texture для Calendar |
| **NICE** | Login screen decorative elements |
| **POST-MVP** | 4 moon-phase icons (для v0.2 cycle) |
| **POST-MVP** | Полный set 30+ achievement badges |
