-- Custom category label на событии. Когда не null — отображаемая
-- категория = custom_category_label, dot — нейтральный fallback цвет.
-- Колонка `category` остаётся как fallback enum (для кастомных пишем
-- 'generic'). Никакого reuse, никакого экрана управления — см.
-- /Users/founded/.claude/plans/merry-munching-pond.md

set search_path = public;

alter table public.calendar_events
  add column custom_category_label text
    check (
      custom_category_label is null
      or char_length(custom_category_label) between 1 and 50
    );

-- promote_idea_to_event: пробрасываем custom_category_label из payload
-- в INSERT. Тело пересоздаётся целиком (CREATE OR REPLACE сохраняет
-- grants/revokes/comment из исходной миграции 20260523000001).
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

    insert into public.calendar_events (
        created_by, title, date, "time", duration_minutes, location,
        category, custom_category_label, note, state, source,
        is_recurring, recurrence_rule, recurrence_anchor_date, reminder_offsets
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
        nullif(p_event_payload->>'custom_category_label', ''),
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
