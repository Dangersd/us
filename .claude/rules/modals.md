---
description: Правила работы с модалками в проекте us (bespoke ModalProvider stack)
globs:
    - "src/components/modal/**"
    - "src/**/*Modal.tsx"
    - "src/**/*Wizard.tsx"
    - "src/components/shell/AppShell.tsx"
    - "src/styles/globals.css"
alwaysApply: false
---

# Modals — Правила

Bespoke design system, **без HeroUI / Radix / shadcn**. Stack модалок управляется
через собственный `ModalProvider` (см. `src/components/modal/ModalProvider.tsx`).

## Layout invariant — обязательно (золотое правило #9)

> Любой layout приложения обязан содержать `<div id="global_content">` обёртку контента.

`ModalProvider` через `lockBodyScroll()` (см. `src/components/modal/modalUtils.ts`)
добавляет класс `.open_modal` на `<body>` при открытии модалки. CSS правило в
`src/styles/globals.css`:

```css
.open_modal #global_content {
    position: fixed !important;
    width: 100%;
}
```

фиксирует контентный wrapper, блокируя скролл и сохраняя `scrollY`. Без этого:

- скролл body не блокируется при открытой модалке
- focus trap может вылетать
- touch-events могут проскакивать на нижний layer

Реализация — `src/components/shell/AppShell.tsx`. Проверка в любом новом layout:

```tsx
<div id="global_content">{children}</div>
```

ESLint правило для этого инварианта пока не написано — соблюдаем вручную, при
добавлении нового layout файла обязательно проверить.

## Единственный правильный способ открыть модалку

Используй `openModal` из `useModalManager()` — **всегда**:

```tsx
import { useModalManager } from "~components/modal";

const { openModal } = useModalManager();

openModal(({ onClose }) => (
    <CalendarEventModal mode="edit" eventId={id} onClose={onClose} />
));
```

В большинстве доменов есть helper-хук, encapsulating openModal вызов:

```tsx
import { useOpenEventModal } from "~components/widgets/calendar/event-modal";

const openEventModal = useOpenEventModal();
openEventModal({ mode: "new", initialDate: today });
```

Модалки **не** управляются через `useState(isOpen)` и **не** через URL searchparams
— `ModalProvider` управляет стеком, Escape-хендлерами и блокировкой скролла.

## Form Modal паттерн (адаптирован под react-hook-form)

Стек модалки с формой:

```
CalendarEventModal              ← Outer: знает mode/eventId, тянет данные
  BottomSheetModal              ← обёртка с анимацией + scroll-lock + backdrop
    [MemoryCapture]             ← опц. секция (past occurrences)
    EventForm                   ← react-hook-form, репортит isDirty наверх
      EventFormFields           ← только поля формы (Controller'ы)
      <footer>                  ← Save / Cancel / Delete кнопки
  DiscardDialog                 ← Confirm перед закрытием если isDirty
```

- Inner-форма (`EventForm`) принимает `onDirtyChange?: (dirty: boolean) => void`
  callback и репортит `form.formState.isDirty` наверх через useEffect.
- Outer-модалка (`CalendarEventModal`) держит локальный `isDirty` state и
  показывает `<DiscardDialog>` если пользователь пытается закрыть с unsaved.
- `BottomSheetModal` для мобильных form-flow (свайп-handle сверху, backdrop click
  закрывает); `Modal` (центрированный) для confirm-диалогов и desktop-форм.

## Outer/Inner паттерн для edit-модалок

Edit-модалка разделена на два уровня:

- **Outer** (`CalendarEventModal`) — принимает `mode`, `eventId`, `onClose`;
  делает `useEvent(id)` для получения данных. Не рендерит форму до получения
  данных (или рендерит с loading-state seed).
- **Inner** (`EventForm`) — вся форма + footer. Получает `existing` пропом.
  При смене `existing.id` делается `form.reset(defaultValues)` через useEffect
  (см. EventForm.tsx).

Это предотвращает stale state при навигации между разными entity-записями.

## Discard dialog

Если форма "dirty" (есть unsaved изменения), backdrop-click и Escape должны
**сначала** открыть `<DiscardDialog>` (confirm-перед-закрытием), не закрывать
модалку сразу. Паттерн:

```tsx
const requestClose = () => {
    if (isDirty) {
        setShowDiscard(true);
        return;
    }
    onClose();
};

<BottomSheetModal onClose={requestClose} ... />
<DiscardDialog
    open={showDiscard}
    onConfirm={() => { setShowDiscard(false); onClose(); }}
    onCancel={() => setShowDiscard(false)}
/>
```

## Wizard (multi-step) паттерн

Для multi-step flow (пример: setup wizard, onboarding):

- Отдельный top-level компонент, **не** использует CRUD-форменный паттерн
- Состояние шагов — локальный `useState` или Zustand store
- Progress indicator в заголовке (steps + completion status)
- Каждый шаг — свой `<XxxStepForm>` c собственной `useForm`
- Close-flow с `DiscardDialog` если есть unsaved на текущем шаге

Для wizard footer не действует правило стандартного `Save/Cancel` — может быть
кастомным (`Next/Back/Skip/Finish`).

## Чеклист

1. Layout содержит `id="global_content"` (см. раздел Layout invariant выше).
2. Модалка открывается через `openModal()` из `useModalManager`, не через
   `useState(isOpen)` и не через URL searchparams.
3. Outer-модалка тянет данные (`useEvent` / `useFetchX`), Inner — только форма.
4. Inner-форма репортит `isDirty` наверх через `onDirtyChange` callback.
5. Outer показывает `<DiscardDialog>` при попытке закрыть с unsaved.
6. `BottomSheetModal` для form-flow, `Modal` (центр) для confirm-диалогов.
7. Escape закрывает только верхнюю модалку в стеке (`ModalProvider` handles).
8. `onClose` callback вызывается явно (caller decides), без fallback на
   `router.back()`.
9. Reset формы при смене `existing.id` через `form.reset(defaultValues)` в
   useEffect — иначе stale state при навигации.

## ЗАПРЕЩЕНО

- **Не удалять** `id="global_content"` из layout — сломает scroll-lock.
- **Не использовать** `useState(isOpen)` / `useState(showModal)` для управления
  видимостью модалки.
- **Не использовать** URL searchparams (`?event=`, `?modal=`) для управления
  модалкой — это смешивает navigation state и UI state.
- **Не добавлять** `window.addEventListener("keydown", ...)` для Escape —
  `ModalProvider` уже управляет Escape по стеку.
- **Не создавать** кастомный backdrop / overlay — `Modal` / `BottomSheetModal`
  управляют overlay и анимацией.
- **Не использовать** `router.back()` или `router.replace()` для закрытия
  модалки — используй `onClose` из `useModalManager`.
- **Не оборачивать** `<ModalProvider>` внутри RoomShell или page-уровня — он
  живёт в `src/components/providers/Providers.tsx` на app-root.
