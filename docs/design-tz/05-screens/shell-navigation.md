# Shell — навигация (bottom-nav, sidebar, top-bar)

Постоянный «каркас» приложения после login. Виден на всех экранах в комнатах.

## Mobile shell

### Top bar

```
┌──────────────────────────────────┐
│  ●     ●                    [A]  │  ← Top bar, 56px height
├──────────────────────────────────┤
│                                  │
│         (комната)                │
│                                  │
├──────────────────────────────────┤
│      [○] [○] [○] [○]             │  ← Bottom nav, 64px + safe area
└──────────────────────────────────┘
```

#### Top bar

- **Height:** 56px (+ safe-area-inset-top)
- **Background:** glass — `bg.base` alpha 0.6 + blur 40px
- **Border bottom:** 1px `border.subtle`
- **Position:** sticky top
- **Padding:** 16px horizontal

**Layout — слева:**
- Маленький **partner status** indicator (два blob'a 16px каждый, gap 4px между ними)
  - Левый — твой blob (personal hue)
  - Правый — её/его blob
  - Сегодня чекнулись = full opacity; не чекнулся = opacity 0.4 (sleeping)
- Tap → переход в Mood

**Layout — справа:**
- **Avatar** (24×24, personal hue, initials Fraunces 12px)
- Tap → Profile

В верхней области могут также появляться:
- Badge dot (warm glow point) над иконкой комнаты, если в ней что-то новое
- Toast-уведомления (ачивки) выезжают ниже из bottom

#### Bottom nav

- **Height:** 64px + `env(safe-area-inset-bottom)`
- **Background:** glass — `bg.base` alpha 0.7 + blur 40px
- **Border top:** 1px `border.subtle`
- **Position:** fixed bottom
- **Padding:** 8px vertical, 16px horizontal

**Layout — 4 иконки**, distributed evenly (justify-around):

```
        [○Home]   [○Mood]   [○Cal]   [○Wish]
```

- Каждый item: 60×48px tap area
- Иконка: 28×28px (см. [03-iconography.md](../03-iconography.md))
- **Default:** иконка `ink.secondary`, scale 1.0
- **Active:** иконка `ink.primary` + warm glow halo + scale 1.1
- Подписей под иконками **нет**
- Если есть unread / new content в комнате — badge dot 6×6 над иконкой (warm glow color)

## Desktop shell

```
┌─────────┬─────────────────────────────────┐
│  us     │                                 │
│         │   Top bar (с partner status)    │
├─────────┼─────────────────────────────────┤
│ ○ Home  │                                 │
│ ○ Mood  │      (комната)                  │
│ ○ Cal   │                                 │
│ ○ Wish  │                                 │
│         │                                 │
│ ─────   │                                 │
│ ● Avatar│                                 │
└─────────┴─────────────────────────────────┘
```

### Sidebar (left)

- **Width:** 240px (expanded), 64px (collapsed)
- **Background:** `bg.base` (slightly tinted with current room ambient hue)
- **Border right:** 1px `border.subtle`
- **Padding:** 16px

**Top section:**
- Logo «us» (Fraunces text-2xl 32px, ink.primary), 24px top margin

**Nav section:**
- Каждый item: 48px height, padding 12px horizontal
- **Default:** иконка 24×24 + label «Дом» / «Настроение» / etc. text-base ink.secondary
- **Active:** иконка + label `ink.primary` + warm glow halo на иконке + background `bg.surface-1`
- **Hover:** background `bg.surface-1`
- Item radius: `radius-sm`

**Bottom section (separated by divider):**
- Avatar 32×32 (personal hue) + label «Профиль» — переход в Profile

### Collapsed sidebar (64px)

- Только иконки, без labels
- Logo сокращается до маленького glow-точки
- Tap на любую иконку → expand back to 240px

### Top bar (desktop)

- **Height:** 64px
- **Background:** glass blur 40px
- **Position:** sticky top within content area
- **Right side:** partner-status indicator (как mobile, но 24×24 каждый) — оба blob'а рядом

## Room shell (внутри каждой комнаты)

Постоянный wrapper:

```
┌──────────────────────────────────┐
│         (Top bar)                │
│                                  │
│  Ambient glow background         │  ← per-room hue
│  + floating particles            │
│  + grain overlay                 │
│                                  │
│  ┌────────────────────────────┐  │
│  │                            │  │
│  │      Room content          │  │
│  │                            │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

### Ambient layer

- Большой radial gradient в фоне room — per-room hue
- Position: center-top of viewport
- Size: ~70% width × 60% height
- Opacity: 0.12-0.18 (varies slightly с breathing)
- См. [04-motion.md](../04-motion.md) — breathing анимация

### Content padding

- **Mobile:** 16px horizontal, 16px top (after top-bar), 80px bottom (before bottom-nav)
- **Desktop:** 40px horizontal, 32px top, 32px bottom

## Transitions

При переходе между комнатами — см. [04-motion.md → Переходы между комнатами](../04-motion.md#переходы-между-комнатами).

В макете показать переход кратко (анимация в коде, в Pencil — статика).

## Что НЕ в shell'е

- **Поиск в top-bar** — не нужен в MVP, можно добавить в v0.2
- **Notification center** — все уведомления = inline в комнатах
- **Settings shortcut** — переход через Профиль
- **Logout shortcut** — там же, в Профиле
- **Branding / logo** на каждом экране — только на login и в sidebar (desktop), на mobile internal экранах logo нет
