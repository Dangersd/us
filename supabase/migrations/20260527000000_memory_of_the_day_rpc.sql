-- Phase 0.8.3 — Memory of the Day RPC.
--
-- Returns the most recent past event_photo whose MM-DD matches the caller's
-- today, joined to the event title and any event_memory written for that
-- exact (event_id, occurrence_date). One row or zero rows.
--
-- security definer is required because the function reads three RLS-guarded
-- tables (event_photos, event_memories, calendar_events). The caller's couple
-- scope is enforced inside the function via current_couple_id() — never via
-- caller-supplied input.

set search_path = public;

create or replace function public.fetch_memory_of_the_day(p_today_md text)
returns table (
    event_id uuid,
    occurrence_date date,
    event_title text,
    storage_path text,
    caption text,
    note text,
    mood_tag public.event_memory_mood_tag
)
language sql
stable
security definer
set search_path = public
as $$
    select
        p.event_id,
        p.occurrence_date,
        ce.title          as event_title,
        p.storage_path,
        p.caption,
        m.note,
        m.mood_tag
    from public.event_photos p
    join public.calendar_events ce on ce.id = p.event_id
    left join public.event_memories m
        on m.event_id = p.event_id
        and m.occurrence_date = p.occurrence_date
    where p.couple_id = public.current_couple_id()
        and p.occurrence_date < (now() at time zone 'Asia/Bishkek')::date
        and to_char(p.occurrence_date, 'MM-DD') = p_today_md
    order by p.occurrence_date desc
    limit 1
$$;

comment on function public.fetch_memory_of_the_day(text) is
'Returns the most recent past event_photo whose MM-DD matches the input "MM-DD" string, joined to event title and (optional) event_memory note/mood-tag. Couple-scoped via current_couple_id().';

grant execute on function public.fetch_memory_of_the_day(text) to authenticated;
