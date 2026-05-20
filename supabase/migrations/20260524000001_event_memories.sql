-- Phase 0.6.1: event_memories — per-occurrence воспоминание (TENSION-1 fix).
--
-- Зачем отдельная таблица:
-- recurring event (годовщина, день рождения) имеет ОДИН base row, но MANY
-- occurrences по годам. Memory столбцы на base row → одно воспоминание
-- на весь ряд (годовщина 5 лет переписала бы годовщину 10 лет).
-- Отдельная таблица с key (event_id, occurrence_date) даёт независимое
-- воспоминание для каждого года.
--
-- Для non-recurring events: occurrence_date = event.date.

set search_path = public;

create table public.event_memories (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.calendar_events(id) on delete cascade,
    occurrence_date date not null,
    couple_id uuid not null references public.couples(id) on delete cascade,
    created_by uuid not null references public.users(id) on delete restrict,

    mood_tag public.event_memory_mood_tag,
    note text check (note is null or char_length(note) <= 2000),
    recorded_at timestamptz not null default now(),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- Хоть что-то должно быть — пустые memories не сохраняются
    check (mood_tag is not null or (note is not null and char_length(note) > 0)),
    -- Одно воспоминание на occurrence
    unique (event_id, occurrence_date)
);

comment on table public.event_memories
is 'Воспоминание о прошедшем occurrence. Per (event_id, occurrence_date).';

create index event_memories_couple_recorded_idx
    on public.event_memories (couple_id, recorded_at desc);

-- Trigger: derive couple_id, immutability, bump updated_at.
create or replace function public.event_memories_before_upsert()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
    if tg_op = 'INSERT' then
        new.couple_id := (
            select couple_id from public.calendar_events where id = new.event_id
        );
        if new.couple_id is null then
            raise exception 'event % not found', new.event_id;
        end if;
    elsif tg_op = 'UPDATE' then
        if new.event_id <> old.event_id then
            raise exception 'event_memories.event_id is immutable';
        end if;
        if new.occurrence_date <> old.occurrence_date then
            raise exception 'event_memories.occurrence_date is immutable';
        end if;
        if new.couple_id <> old.couple_id then
            raise exception 'event_memories.couple_id is immutable';
        end if;
    end if;

    new.updated_at := now();
    return new;
end;
$$;

create trigger event_memories_before_upsert_trg
    before insert or update on public.event_memories
    for each row execute function public.event_memories_before_upsert();

-- RLS — couple-scoped.
alter table public.event_memories enable row level security;

create policy event_memories_select_couple
    on public.event_memories for select
    using (couple_id = public.current_couple_id());

create policy event_memories_insert_self
    on public.event_memories for insert
    with check (
        couple_id = public.current_couple_id()
        and created_by = auth.uid()
    );

create policy event_memories_update_couple
    on public.event_memories for update
    using (couple_id = public.current_couple_id())
    with check (couple_id = public.current_couple_id());

create policy event_memories_delete_couple
    on public.event_memories for delete
    using (couple_id = public.current_couple_id());
