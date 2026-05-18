# us

Цифровой дом для двоих. Приватное место в интернете, которое существует только для нас — и ощущается как наша общая комната.

Не «приложение для пар». Не productivity-таск-менеджер. Не социальная сеть. Просто тихое место, куда мы заходим, когда хотим.

## Принципы

- **Async by design.** Никакой тревоги «он онлайн, но не пишет». Никаких read-receipts. Никаких «печатает...».
- **Granular intimacy.** Сам решаешь, что и насколько глубоко показать. Дефолты мягкие, контроль точный.
- **No streaks, no FOMO.** Приложение никогда не давит и не наказывает за пропуск. Ачивки приходят как подарки, не как награды.

## Что внутри

Четыре «комнаты» в bottom-nav на мобиле / sidebar на десктопе, плюс профиль через аватар:

- **Дом** — главные виджеты, mood pair-glance, ближайший план, memory of the day, peek в хотелки
- **Настроение** — daily mood check-in (энергия / стресс / social battery / эмоция), живые blob-аватары, гранулярная приватность
- **Календарь** — общие события и идеи, прошедшие планы → memory of the day
- **Хотелки** — три списка: мои желания, я люблю, наше
- **Профиль** — статистика, тихая коллекция ачивок, общие даты, настройки

## Стек

- Next.js 16 (App Router, React 19, PWA)
- Supabase (Postgres + Auth + Storage, RLS как источник правды)
- Tailwind CSS v4 + Framer Motion
- React Query + Zustand
- Бесповоротно bespoke — без HeroUI/shadcn/Material

Деплой — Vercel.

## Документация

Концепт продукта живёт в [docs/](./docs/):

- [01-concept.md](./docs/01-concept.md) — философия и принципы
- [02-design-system.md](./docs/02-design-system.md) — палитра, типографика, анимации
- [03-rooms/](./docs/03-rooms/) — каждая комната подробно
- [04-privacy-and-notifications.md](./docs/04-privacy-and-notifications.md) — сводный privacy-model
- [05-tech.md](./docs/05-tech.md) — стек и data model
- [06-roadmap.md](./docs/06-roadmap.md) — MVP / v0.2 / будущее
- [07-open-questions.md](./docs/07-open-questions.md) — TBDs

## Скрипты

```bash
yarn dev
yarn build
yarn lint
yarn prettier
```
