-- Phase 0.6.1: event_ideas — "parking lot" идей без даты.
-- Оба партнёра видят и редактируют. Promoted в calendar_events через
-- promote_idea_to_event() RPC (см. 20260523000001).

set search_path = public;

create table public.event_ideas (
    id uuid primary key default gen_random_uuid(),
    couple_id uuid not null references public.couples(id) on delete cascade,
    created_by uuid not null references public.users(id) on delete restrict,

    title text not null check (char_length(title) between 1 and 200),
    note text check (note is null or char_length(note) <= 4000),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.event_ideas
is 'Идеи без даты. Promotion в calendar_events через RPC promote_idea_to_event.';

create index event_ideas_couple_created_idx
    on public.event_ideas (couple_id, created_at desc);

-- Trigger: auto-fill couple_id, immutability, bump updated_at.
create or replace function public.event_ideas_before_upsert()
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
            raise exception 'event_ideas.couple_id is immutable';
        end if;
        if new.created_by <> old.created_by then
            raise exception 'event_ideas.created_by is immutable';
        end if;
    end if;

    new.updated_at := now();
    return new;
end;
$$;

create trigger event_ideas_before_upsert_trg
    before insert or update on public.event_ideas
    for each row execute function public.event_ideas_before_upsert();

-- RLS — couple-scoped.
alter table public.event_ideas enable row level security;

create policy event_ideas_select_couple
    on public.event_ideas for select
    using (couple_id = public.current_couple_id());

create policy event_ideas_insert_self
    on public.event_ideas for insert
    with check (
        couple_id = public.current_couple_id()
        and created_by = auth.uid()
    );

create policy event_ideas_update_couple
    on public.event_ideas for update
    using (couple_id = public.current_couple_id())
    with check (couple_id = public.current_couple_id());

create policy event_ideas_delete_couple
    on public.event_ideas for delete
    using (couple_id = public.current_couple_id());
