# Design TZ — детальная спецификация для макетов

Это техническое задание для дизайна **us** в Pencil. Здесь живут все спеки, нужные чтобы начать рисовать макеты: палитра с точными HEX, шрифты, sizing, layout каждого экрана, состояния.

Если читаешь концепт впервые — сначала иди в [../01-concept.md](../01-concept.md), оттуда вниз. Сюда — за конкретными размерами.

## Структура

| Файл | Что внутри |
|------|------------|
| [01-foundations.md](./01-foundations.md) | Палитра (общая + per-room ambient + personal hue), типографика, spacing scale, breakpoints, grid |
| [02-components.md](./02-components.md) | UI-примитивы со спеками: Button, Card, Slider, Blob, ToastSoft, etc. |
| [03-iconography.md](./03-iconography.md) | Иконки навигации (5 кастомных) + UI-иконки (стиль, размеры) |
| [04-motion.md](./04-motion.md) | Анимации и переходы — что движется, как (заметки для пометок в макетах) |
| [05-screens/](./05-screens/) | Каждый экран отдельно — layout, элементы, состояния |
| [06-states.md](./06-states.md) | Сводно: loading / empty / error / focus / hover / active |
| [07-assets-checklist.md](./07-assets-checklist.md) | Что подготовить отдельно (фото-плейсхолдеры, иллюстрации, иконки) |

## Что рисуем в MVP

**Экраны:**
- [Login](./05-screens/auth-login.md)
- [Shell — Bottom-nav + Sidebar + Top bar](./05-screens/shell-navigation.md)
- [Home — Дом](./05-screens/room-home.md)
- [Mood — Настроение](./05-screens/room-mood.md)
- [Calendar — Календарь](./05-screens/room-calendar.md)
- [Wishlist — Хотелки](./05-screens/room-wishlist.md)
- [Profile — Профиль](./05-screens/room-profile.md)

Cycle-модуль — рисуем после MVP, в v0.2.

## Breakpoints

| Breakpoint | Ширина | Когда |
|------------|--------|-------|
| **Mobile** (default) | 375-430px | Рисуем при **390px** (iPhone 13-15 reference) |
| **Desktop** | 1280px+ | Рисуем при **1440px** (стандарт MBP) |

В MVP без отдельного tablet-вью — он использует mobile-layout, растянутый максимум до 480px по центру.

## Тёмная тема — единственная в MVP

Light theme — пост-MVP. Все макеты на тёмном фоне (`#0E0B14`).

## Соглашения о копи

- Язык интерфейса — русский
- Названия комнат в навигации — без подписей, только иконки
- В тексте — тёплый, не формальный (см. примеры empty-states в [06-states.md](./06-states.md))
- Никаких «эмодзи», «ОК», «Submit». Используем «готово», «сохранить», «отправить»

## Что использовать как референсы (наша эстетика)

- Apple visionOS UI (glassmorphism + warm spatial feel)
- Linear (полированность, density)
- Things 3 (типографика, дыхание, mobile-first)
- Cozy game UIs — Animal Crossing menu, Stardew Valley UI (тепло, blob'ы)
- Late-night Spotify, Discord night theme
- Pinterest moody aesthetic (для room-wishlist)

Чего **избегаем:**
- Material Design (плоский, утилитарный)
- iOS native (стандартизированный)
- Bootstrap / Tailwind UI templates (corporate)
- Crypto / web3 эстетика (агрессивная)

## Что НЕ нужно в макетах

- Логотип «us» в каждом экране — он только на login, дальше избыточен
- Email / username — нигде не показываем
- Корпоративные элементы: progress bars в стиле «complete profile», банеры, баджи «Pro»
- Эмодзи как UI-элементы (только blob'ы в эмоциях и кастомные SVG)
- Подписи под иконками навигации
