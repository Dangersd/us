-- Phase 0.6.1: promote_idea_to_event — atomic transaction для перехода
-- из event_ideas (parking lot) в calendar_events (с датой).
--
-- Почему SECURITY DEFINER:
-- Клиент-side "transaction" (два parallel-запроса) рискует partial-fail
-- состоянием. RPC внутри одной транзакции — insert event + delete idea
-- либо оба, либо ни один.
--
-- Couple-граница: проверяется через current_couple_id() перед обоими
-- операциями. Если auth.uid() == null или couple_id mismatch, поднимаем
-- exception — клиент видит error pill в drawer.

set search_path = public;

create or replace function public.promote_idea_to_event(
    p_idea_id uuid,
    p_event_payload jsonb
)
returns public.calendar_events
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
    v_couple_id uuid;
    v_caller_couple_id uuid;
    v_new_event public.calendar_events;
begin
    v_caller_couple_id := public.current_couple_id();
    if v_caller_couple_id is null then
        raise exception 'not authenticated';
    end if;

    select couple_id into v_couple_id
    from public.event_ideas
    where id = p_idea_id;

    if v_couple_id is null then
        raise exception 'idea % not found', p_idea_id;
    end if;
    if v_couple_id <> v_caller_couple_id then
        raise exception 'idea % belongs to another couple', p_idea_id;
    end if;

    -- Insert event. couple_id/created_by/updated_at заполнит trigger.
    -- payload передаёт JSON со всеми полями формы; created_by всегда auth.uid()
    -- (overridable на стороне клиента не имеет смысла — другой партнёр
    -- "забирает" идею через свой собственный promote-вызов).
    insert into public.calendar_events (
        created_by, title, date, "time", duration_minutes, location,
        category, note, state, source, is_recurring, recurrence_rule,
        recurrence_anchor_date, reminder_offsets
    )
    values (
        auth.uid(),
        coalesce(p_event_payload->>'title', ''),
        (p_event_payload->>'date')::date,
        nullif(p_event_payload->>'time', '')::time,
        nullif(p_event_payload->>'duration_minutes', '')::int,
        nullif(p_event_payload->>'location', ''),
        coalesce(
            (p_event_payload->>'category')::public.event_category,
            'generic'::public.event_category
        ),
        nullif(p_event_payload->>'note', ''),
        'planned'::public.event_state,
        'manual'::public.event_source,
        coalesce((p_event_payload->>'is_recurring')::boolean, false),
        nullif(p_event_payload->>'recurrence_rule', '')::public.event_recurrence_rule,
        nullif(p_event_payload->>'recurrence_anchor_date', '')::date,
        coalesce(p_event_payload->'reminder_offsets', '["1d","1h"]'::jsonb)
    )
    returning * into v_new_event;

    delete from public.event_ideas where id = p_idea_id;

    return v_new_event;
end;
$$;

revoke execute on function public.promote_idea_to_event(uuid, jsonb) from public, anon;
grant execute on function public.promote_idea_to_event(uuid, jsonb) to authenticated;

comment on function public.promote_idea_to_event(uuid, jsonb)
is 'Atomic: delete idea + insert calendar_event. Both succeed or both rollback.';
