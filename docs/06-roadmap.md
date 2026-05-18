# 06 — Roadmap

## MVP (v0.1)

Первая выкатываемая версия. Цель — рабочий тёплый дом, в который оба заходят и пользуются ежедневно.

### Что входит

**Комнаты:**
- ✅ Дом (5 виджетов: шапка, mood pair-glance, ближайший план, memory of the day, wishlist peek)
- ✅ Настроение (4 базовых поля: энергия / стресс / social battery / эмоция)
- ✅ Календарь (события, идеи без даты, повторяющиеся, прошедшие → Memory)
- ✅ Хотелки (3 списка: хочу / люблю / наше)
- ✅ Профиль (Stats, ачивки, общие даты, настройки, аккаунт)

**Фичи:**
- Granular per-field privacy в Mood (full / vibe / hidden) с дефолтами
- Memory of the day виджет на Доме (питается из photo-attached calendar events)
- Personal hue per account (по гендеру)
- Тихая коллекция ачивок
- Time-aware shuffling на Доме
- Dark theme
- In-app уведомления (badge при заходе)
- 2 аккаунта вручную через Supabase admin
- Bottom-nav на мобиле (4 иконки без подписей) + аватар-профиль
- Sidebar на десктопе (240px, сворачиваемый)
- PWA (installable, offline shell)

**Стек:**
- Next.js на Vercel
- Supabase (Postgres + Auth + Storage)
- Tailwind v4 + Framer Motion + Fraunces + Geist
- Bespoke component library

**Намеренно НЕ в MVP:**
- Cycle tracking (выносим в v0.2)
- AI Companion
- Light theme
- Web push notifications (только in-app)
- Внешние календари (Google/Apple sync)
- Map-интеграция в локациях
- Multi-language (только RU)
- Pregnancy / postpartum
- Soft presence / online-индикаторы
- Surprise-механика подарков
- Streak механики любого рода
- Полная encryption beyond Supabase defaults

## v0.2 — Cycle module

Делаем сразу после первого деплоя. Полная замена Flo для её аккаунта.

**Что добавляется:**
- Раздел «Цикл» в её Профиле (календарь цикла, лог менструаций, симптомы, предсказания, статистика)
- Cycle-поля в Mood-чек-ине (период + симптомы), приватные по умолчанию
- Cycle overlay в её Календаре (точки фаз, только для неё)
- Ambient phase-индикатор на её mood blob'е для партнёра (toggle ON/OFF, дефолт OFF)
- Ачивка «Двенадцать лун» (12 циклов отслежено, приватно)
- Postgres function `get_partner_phase()` с SECURITY DEFINER для безопасной выдачи фазы партнёру

## Future ideas (parking lot)

Не запланировано в конкретный релиз — копилка идей, которые пока не дозрели.

### AI Companion

Отдельное проектирование. Решить:
- Floating layer поверх комнат vs 5-я комната?
- Какой персонаж/тон?
- Какие триггеры (проактивный vs только по запросу)?
- Какая модель / провайдер?
- Как защищается приватность данных при передаче LLM?

Возможные roles:
- Подсказки на Доме («не виделись 4 дня — может зайти к ней?»)
- Идеи в Wishlist на основе истории
- Замечание паттернов в Mood
- Подсказка планов в Календаре

### Light theme

Дневная тёплая палитра, не инверсия dark. Кремовые фоны, землистые акценты. Только когда захочется.

### Web push notifications + quiet hours

Если in-app badge окажется недостаточно для критичного (напоминания за час до свидания).

### Pregnancy / postpartum

Расширение cycle-модуля. Отдельный режим с другими полями.

### External calendar import

Read-only Google/Apple Calendar — чтобы видеть рабочие/чужие планы рядом с нашими. Опционально, не интрузивно.

### Кастомные seasonal themes

Зимний / осенний ambient. Тонкая модификация палитры по сезону или вручную.

### Voice notes / голосовые

Если когда-нибудь захочется async-аудио в Memory of the day или к событиям.

### Real-time soft presence (если когда-нибудь)

«Свеча горит» — простой ambient-индикатор того, что партнёр в приложении. Без read-receipts, без typing. Только если оба захотим — сейчас async-only.

### Мемы / стикеры свои

Загружаешь любимые гифки/стикеры пары как мини-коллекцию. Используется в заметках к событиям.

## Расписание (rough)

| Релиз | ETA | Ключевое |
|-------|-----|----------|
| **v0.1 MVP** | ~6-8 недель | 4 комнаты + профиль, dark only, all core features |
| **v0.2 Cycle** | ~2-3 недели после v0.1 | Полный cycle module |
| **v0.3+** | по желанию | AI Companion, light theme, etc. |

Сроки ориентировочные, без жёстких deadline'ов. Качество > скорость.
