-- Phase 0.6.1: event_photos — фото attached к событию + occurrence_date.
--
-- Per-occurrence attribution (TENSION-1 fix): 3 фото на каждый occurrence
-- recurring event, не 3 на весь ряд. Для non-recurring occurrence_date = event.date.
--
-- couple_id денормализован из parent event для перф RLS (subselect-in-policy
-- дороже + сложнее аудит).
--
-- Storage cleanup orphan'ов — клиентский флоу в use-delete-event-photo
-- (storage.delete_object SQL API не существует в Supabase Cloud).

set search_path = public;

create table public.event_photos (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.calendar_events(id) on delete cascade,
    couple_id uuid not null references public.couples(id) on delete cascade,
    occurrence_date date not null,

    storage_path text not null,
    caption text check (caption is null or char_length(caption) <= 200),
    mood_tag public.event_memory_mood_tag,
    width int check (width is null or width > 0),
    height int check (height is null or height > 0),

    created_by uuid not null references public.users(id) on delete restrict,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.event_photos
is 'Фото событий. Per-occurrence для recurring (event_id + occurrence_date).';

create index event_photos_event_occurrence_idx
    on public.event_photos (event_id, occurrence_date);

create index event_photos_couple_created_idx
    on public.event_photos (couple_id, created_at desc);

-- Trigger: derive couple_id из event, immutability, max-3 per occurrence,
-- bump updated_at.
create or replace function public.event_photos_before_upsert()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
    v_count int;
begin
    if tg_op = 'INSERT' then
        new.couple_id := (
            select couple_id from public.calendar_events where id = new.event_id
        );
        if new.couple_id is null then
            raise exception 'event % not found', new.event_id;
        end if;

        -- max 3 per (event_id, occurrence_date)
        select count(*) into v_count
        from public.event_photos
        where event_id = new.event_id
          and occurrence_date = new.occurrence_date;
        if v_count >= 3 then
            raise exception 'max 3 photos per event occurrence';
        end if;
    elsif tg_op = 'UPDATE' then
        if new.event_id <> old.event_id then
            raise exception 'event_photos.event_id is immutable';
        end if;
        if new.occurrence_date <> old.occurrence_date then
            raise exception 'event_photos.occurrence_date is immutable';
        end if;
        if new.couple_id <> old.couple_id then
            raise exception 'event_photos.couple_id is immutable';
        end if;
        if new.storage_path <> old.storage_path then
            raise exception 'event_photos.storage_path is immutable';
        end if;
    end if;

    new.updated_at := now();
    return new;
end;
$$;

create trigger event_photos_before_upsert_trg
    before insert or update on public.event_photos
    for each row execute function public.event_photos_before_upsert();

-- RLS — couple-scoped.
alter table public.event_photos enable row level security;

create policy event_photos_select_couple
    on public.event_photos for select
    using (couple_id = public.current_couple_id());

create policy event_photos_insert_self
    on public.event_photos for insert
    with check (
        couple_id = public.current_couple_id()
        and created_by = auth.uid()
    );

create policy event_photos_update_couple
    on public.event_photos for update
    using (couple_id = public.current_couple_id())
    with check (couple_id = public.current_couple_id());

create policy event_photos_delete_couple
    on public.event_photos for delete
    using (couple_id = public.current_couple_id());
