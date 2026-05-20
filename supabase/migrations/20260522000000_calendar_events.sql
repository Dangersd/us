-- Phase 0.6.1: calendar_events table, RLS (couple-scoped), trigger.
--
-- Отличие от mood_entries: события имеют couple_id напрямую, обa партнёра
-- видят и редактируют всё. SECURITY DEFINER bypass не нужен — обычный
-- couple-RLS достаточен.
--
-- past-state НЕ хранится: вычисляется в query layer как
-- `occurrence_date < today_in_couple_tz AND state <> 'cancelled'`.
-- Без триггера/cron — проще + не зависит от времени.

set search_path = public;

-- =========================================================
-- 1. Enums
-- =========================================================

create type public.event_category as enum (
    'date', 'dinner', 'cinema', 'trip', 'anniversary', 'birthday', 'generic'
);

create type public.event_state as enum ('planned', 'cancelled');

create type public.event_source as enum ('manual', 'birthday', 'anniversary');

create type public.event_memory_mood_tag as enum ('warm', 'funny', 'hard', 'magical');

create type public.event_recurrence_rule as enum ('YEARLY', 'MONTHLY');

-- =========================================================
-- 2. calendar_events table
-- =========================================================

create table public.calendar_events (
    id uuid primary key default gen_random_uuid(),
    couple_id uuid not null references public.couples(id) on delete cascade,
    created_by uuid not null references public.users(id) on delete restrict,

    title text not null check (char_length(title) between 1 and 200),
    date date not null,
    "time" time,
    duration_minutes int
        check (duration_minutes is null
            or (duration_minutes between 5 and 1440)),
    location text check (location is null or char_length(location) <= 200),
    category public.event_category not null default 'generic',
    note text check (note is null or char_length(note) <= 4000),
    state public.event_state not null default 'planned',
    source public.event_source not null default 'manual',
    is_recurring boolean not null default false,
    recurrence_rule public.event_recurrence_rule,
    recurrence_anchor_date date,
    reminder_offsets jsonb not null default '["1d","1h"]'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- recurring → правило+anchor обязательны
    check (
        is_recurring = false
        or (recurrence_rule is not null and recurrence_anchor_date is not null)
    ),
    -- auto-seeded (birthday/anniversary) всегда повторяются
    check (source = 'manual' or is_recurring = true)
);

comment on table public.calendar_events
is 'Календарные события пары. Оба партнёра редактируют. Past — computed в query layer.';

create index calendar_events_couple_date_idx
    on public.calendar_events (couple_id, date);

-- partial: для expand-recurring достаточно загрузить только recurring rows
create index calendar_events_couple_recurring_idx
    on public.calendar_events (couple_id, is_recurring)
    where is_recurring = true;

-- partial: для seed-recurring идемпотентности — быстрый lookup по якорю
create unique index calendar_events_anchor_unique_idx
    on public.calendar_events (couple_id, source, category, recurrence_anchor_date)
    where source <> 'manual';

-- =========================================================
-- 3. Trigger: auto-fill couple_id + immutability + updated_at
-- =========================================================

create or replace function public.calendar_events_before_upsert()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
    if tg_op = 'INSERT' then
        new.couple_id := (select couple_id from public.users where id = new.created_by);
        if new.couple_id is null then
            raise exception 'created_by % has no couple_id', new.created_by;
        end if;
    elsif tg_op = 'UPDATE' then
        if new.couple_id <> old.couple_id then
            raise exception 'calendar_events.couple_id is immutable';
        end if;
        if new.created_by <> old.created_by then
            raise exception 'calendar_events.created_by is immutable';
        end if;
    end if;

    new.updated_at := now();
    return new;
end;
$$;

create trigger calendar_events_before_upsert_trg
    before insert or update on public.calendar_events
    for each row execute function public.calendar_events_before_upsert();

-- =========================================================
-- 4. RLS — couple-scoped (оба партнёра видят и редактируют).
-- =========================================================

alter table public.calendar_events enable row level security;

create policy calendar_events_select_couple
    on public.calendar_events for select
    using (couple_id = public.current_couple_id());

create policy calendar_events_insert_self
    on public.calendar_events for insert
    with check (
        couple_id = public.current_couple_id()
        and created_by = auth.uid()
    );

create policy calendar_events_update_couple
    on public.calendar_events for update
    using (couple_id = public.current_couple_id())
    with check (couple_id = public.current_couple_id());

create policy calendar_events_delete_couple
    on public.calendar_events for delete
    using (couple_id = public.current_couple_id());
