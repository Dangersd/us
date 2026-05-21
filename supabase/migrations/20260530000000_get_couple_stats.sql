-- Phase 0.10.2 — Stats RPC for Profile «Мы в цифрах».
--
-- Один SECURITY DEFINER вызов возвращает все 6 аггрегатов:
--   topPlaces, topCategories, myTopEmotion, partnerTopEmotion,
--   topWishlistCategory, memoriesCount.
--
-- SECURITY DEFINER нужен потому что:
-- - partner emotion требует доступа к чужому mood_entries (self-only RLS,
--   см. mood_entries_select_self в 20260520000000_mood_entries.sql).
-- - privacy partnership: только emotion с visibility->>'emotion'='full'
--   попадает в выборку — фильтрация в SQL, не на клиенте.
--
-- topPlaces label — first-seen original casing per (array_agg ORDER BY created_at)[1],
-- группировка по lower(trim(location)) — чтобы «Бишкек» и «бишкек» сливались.
-- Решение D4 из plan-eng-review.

set search_path = public;

create or replace function public.get_couple_stats()
returns jsonb
language plpgsql security definer set search_path = public
stable
as $$
declare
    v_couple uuid := public.current_couple_id();
    v_me uuid := auth.uid();
    v_partner uuid;
    v_today date;
    v_30d_ago date;
    v_top_places jsonb;
    v_top_categories jsonb;
    v_my_top_emotion text;
    v_partner_top_emotion text;
    v_top_wishlist_category text;
    v_memories_count bigint;
begin
    if v_couple is null or v_me is null then
        return null;
    end if;

    select id into v_partner from public.users
        where couple_id = v_couple and id <> v_me limit 1;

    v_today := (now() at time zone 'Asia/Bishkek')::date;
    v_30d_ago := v_today - interval '30 days';

    -- topPlaces: top-3 локации, группировка case-insensitive, label = first-seen.
    select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', cnt)
            order by cnt desc), '[]'::jsonb)
    into v_top_places
    from (
        select (array_agg(location order by created_at))[1] as name,
               count(*) as cnt
        from public.calendar_events
        where couple_id = v_couple
          and location is not null
          and length(trim(location)) > 0
        group by lower(trim(location))
        order by count(*) desc
        limit 3
    ) p;

    -- topCategories: top-3 категории событий.
    select coalesce(jsonb_agg(jsonb_build_object('category', category, 'count', cnt)
            order by cnt desc), '[]'::jsonb)
    into v_top_categories
    from (
        select category::text as category, count(*) as cnt
        from public.calendar_events
        where couple_id = v_couple
        group by category
        order by count(*) desc
        limit 3
    ) c;

    -- myTopEmotion: самая частая эмоция текущего юзера за 30d.
    select emotion into v_my_top_emotion
    from public.mood_entries
    where user_id = v_me
      and date >= v_30d_ago
      and emotion is not null
    group by emotion
    order by count(*) desc
    limit 1;

    -- partnerTopEmotion: самая частая эмоция партнёра за 30d,
    -- ТОЛЬКО где visibility.emotion = 'full' (privacy gate).
    if v_partner is not null then
        select emotion into v_partner_top_emotion
        from public.mood_entries
        where user_id = v_partner
          and date >= v_30d_ago
          and emotion is not null
          and visibility->>'emotion' = 'full'
        group by emotion
        order by count(*) desc
        limit 1;
    end if;

    -- topWishlistCategory: самая частая категория в wishlist пары.
    select category::text into v_top_wishlist_category
    from public.wishlist_items
    where couple_id = v_couple
    group by category
    order by count(*) desc
    limit 1;

    -- memoriesCount: total event_memories пары.
    select count(*) into v_memories_count
    from public.event_memories
    where couple_id = v_couple;

    return jsonb_build_object(
        'topPlaces', v_top_places,
        'topCategories', v_top_categories,
        'myTopEmotion', v_my_top_emotion,
        'partnerTopEmotion', v_partner_top_emotion,
        'topWishlistCategory', v_top_wishlist_category,
        'memoriesCount', v_memories_count
    );
end;
$$;

revoke execute on function public.get_couple_stats() from public, anon;
grant execute on function public.get_couple_stats() to authenticated;

comment on function public.get_couple_stats()
is 'Profile «Мы в цифрах»: 6 агрегатов одной поездкой. Partner emotion respects visibility.emotion=full privacy gate.';
