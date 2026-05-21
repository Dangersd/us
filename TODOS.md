# TODOS

Отложенные задачи. Каждая запись: что, зачем, контекст, зависимости.

## Performance follow-ups

### Widget-split для Mood / Calendar / Wishlist page'ей

- **What:** Применить тот же widget-server-component паттерн, что и Home, к
  оставшимся «толстым» page'ам: `src/app/(rooms)/{mood,calendar,wishlist}/page.tsx`.
  Каждый widget — отдельный async server-component с локальным prefetch +
  HydrationBoundary, обёрнут в `<Suspense fallback={<Skeleton/>}>`.
- **Why:** Сейчас эти страницы по-прежнему делают `await Promise.all([...все prefetch'и...])`
  на странице перед отправкой первого байта. С widget-split'ом каждый блок
  стримился бы independently, ускоряя TTFB на 100-300ms.
- **Pros:** Equal-class streaming со страницей Home; уменьшает blocking time на
  всех heavy-route переходах.
- **Cons:** Требует переделки `MoodClientPage`/`CalendarClientPage`/`WishlistClientPage` —
  каждая из них сейчас hoist'ит `useCurrentUser` и/или `usePartnerProfile` наверх
  и пробрасывает данные через props в дочерние widget'ы. Чтобы расщепить, нужно
  либо вернуть эти queries в каждый widget (дешевле теперь с staleTime 5min),
  либо передавать `currentUser`/`partner` пропсами из server-orchestrator'а.
- **Context:** Часть perf-фикса (ветка `Dangersd/investigate-page-navigation-lag`)
  была развёрнута в Phase 0.10. Home полностью переписан, оставшиеся page'и пока
  работают по-старому, но уже получают cross-cutting win'ы: новый `loading.tsx`,
  T4 (`refetchOnWindowFocus:true` снят с wishlist/calendar/own-mood-range), T5
  (5-min `staleTime` на currentUser+partnerProfile), T6 (middleware matcher
  исключает RSC-prefetch'и). Plan-eng-review зафиксировал эту работу как
  отложенную ради scoping.
- **Depends on:** Ship Phase 0.10 perf-фикса → собрать real-world numbers с
  Lighthouse/Network panel → понять, какие из остающихся 3 страниц достаточно
  тормозят, чтобы оправдать widget-split. Возможно, для одной/двух будет достаточно.

## Phase 2 — после ship’а Repair Episodes MVP

### Web Push + Notification API

- **What:** Доставлять уведомления о новом repair-эпизоде даже когда PWA закрыта.
- **Why:** В MVP partner видит активный эпизод только при открытой вкладке (polling
  30s). Если Кристина нажала кнопку и Alex не открывал PWA — он узнает только
  через час/два. В кризисные моменты эта задержка критична — кнопка обесценивается.
- **Pros:** Надёжная доставка, лаг → секунды независимо от состояния PWA.
- **Cons:** Целый отдельный PR: Service Worker, VAPID keys, push server endpoint,
  permission prompt UX в Profile/Settings, тестирование на iOS/Android Safari.
- **Context:** В MVP нет ни Notification.requestPermission() flow, ни Service
  Worker, ни push infrastructure. Грэп по `src/` → пусто. Это значит реально
  с нуля, не «доделать». Делать только когда по практике станет ясно, что
  пропуски эпизодов реальны (через 2–3 недели после ship).
- **Depends on:** Repair Episodes Approach A shipped + 2 недели жизни с ним +
  Кристинин фидбэк «я нажимаю, но Alex не видит часами».

### Episode log + tag visualization (Approach B из /office-hours)

- **What:** Журнал всех repair-эпизодов с тегами темы («внешность»,
  «коммуникация», «время вместе», «другое»). Мини-страница `/repair` с лентой
    - 1-2 простых чарта типа «N эпизодов в месяц, M по теме X».
- **Why:** Loop awareness — видеть, что один и тот же триггер повторяется.
  В office-hours это было «Approach B», отделено от MVP сознательно: сначала
  проверяем, что Approach A прижился, потом строим над ним. Цель — нельзя
  починить паттерн, который ты не видишь как паттерн.
- **Pros:** Помогает увидеть рекуррентные темы (например, «загоны по внешности»
  как класс), не реагировать на 8-й раз как на 1-й.
- **Cons:** «8 эпизодов за месяц» может ощущаться угнетающе. Фрейминг важен:
  «мы прошли это вместе 8 раз» vs «у нас 8 проблем». Нужно отдельно подумать
  как преподнести.
- **Context:** Спецификация уже есть в дизайн-доке office-hours
  (`~/.gstack/projects/Dangersd-us/founded-Dangersd-cody-design-20260521-162941.md`,
  раздел «Approach B»). Не строить раньше чем через 3+ недели жизни с
  Approach A — без накопленного dataset’а чарты бессмысленны.
- **Depends on:** Repair Episodes Approach A shipped + 3+ недели данных +
  ощущение «я хочу увидеть, что повторяется».
