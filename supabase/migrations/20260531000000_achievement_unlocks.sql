-- Phase 0.10.3 — Achievements: «тихая коллекция».
--
-- Одна таблица для разлокированных ачивок. Каталог (key → title/description/scope)
-- живёт в TypeScript (src/config/achievements.ts) как single source of truth —
-- DB-сторона просто хранит факт разлокировки.
--
-- scope = 'couple' → одна строка на пару (unlocked_by_user_id IS NULL).
-- scope = 'user'   → одна строка на пользователя пары (unlocked_by_user_id IS uuid).
--
-- `unique nulls not distinct` (Postgres 15+) трактует NULL как обычное значение,
-- что даёт единый unique-индекс на оба scope. Без этого пришлось бы делать
-- два partial-unique-индекса.
--
-- Записи иммутабельны после INSERT'а: ни UPDATE/DELETE-политик нет, ни RPC
-- их не делает. Если criterion позже «отвалится» (юзер удалил локации), star
-- остаётся зажжённой — by design (см. profile.md → «тихая коллекция»).

set search_path = public;

create table public.achievement_unlocks (
    id uuid primary key default gen_random_uuid(),
    couple_id uuid not null references public.couples(id) on delete cascade,
    key text not null,
    unlocked_at timestamptz not null default now(),
    -- null  → couple-scope (одна строка на пару).
    -- uuid  → user-scope (одна строка на пользователя пары).
    unlocked_by_user_id uuid references public.users(id) on delete set null,
    unique nulls not distinct (couple_id, key, unlocked_by_user_id)
);

comment on table public.achievement_unlocks is
'Разлокированные achievements пары. Иммутабельны после INSERT. INSERT-only через SECURITY DEFINER RPC.';

create index achievement_unlocks_couple_idx
    on public.achievement_unlocks (couple_id);

alter table public.achievement_unlocks enable row level security;

-- SELECT через RLS — оба партнёра видят все unlocks своей пары.
-- INSERT через SECURITY DEFINER RPC evaluate_and_unlock_achievements()
-- — RLS-INSERT-policy не нужна.
create policy achievement_unlocks_select_couple
    on public.achievement_unlocks for select
    using (couple_id = public.current_couple_id());
