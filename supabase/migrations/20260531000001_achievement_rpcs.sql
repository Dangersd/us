-- Phase 0.10.3 — два RPC для achievements:
--
-- 1) get_couple_achievements()         — read-only, SSR/client prefetch.
-- 2) evaluate_and_unlock_achievements() — mutation, fires once per Profile
--    mount; возвращает ТОЛЬКО только-что-вставленные строки (RETURNING из
--    ON CONFLICT DO NOTHING). Это и есть «toast-материал».
--
-- Разделение обязательно: иначе SSR + client refetch вставляет + читает
-- одну и ту же запись дважды, и client получает is_new=false для свежей
-- разлокировки → toast тихо не появляется. См. plan-eng-review D3.
--
-- Каталог критериев — TypeScript (src/config/achievements.ts). Здесь
-- hard-coded 11 enabled-критериев. Order matters только косметически
-- (вывод RETURNING — недетерминирован по умолчанию).

set search_path = public;

-- =========================================================
-- 1) Read-only: вся коллекция разлокированных ачивок пары.
-- =========================================================

create or replace function public.get_couple_achievements()
returns table (
    key text,
    scope text,
    unlocked_by_user_id uuid,
    unlocked_at timestamptz
)
language sql security definer set search_path = public
stable
as $$
    select
        au.key,
        case when au.unlocked_by_user_id is null then 'couple' else 'user' end,
        au.unlocked_by_user_id,
        au.unlocked_at
    from public.achievement_unlocks au
    where au.couple_id = public.current_couple_id();
$$;

revoke execute on function public.get_couple_achievements() from public, anon;
grant execute on function public.get_couple_achievements() to authenticated;

comment on function public.get_couple_achievements() is
'Полный список разблокированных achievements пары. Idempotent, SSR-friendly.';

-- =========================================================
-- 2) Mutation: проверка критериев + INSERT дельт.
--    Возвращает ТОЛЬКО новоразблокированные (RETURNING из ON CONFLICT).
-- =========================================================

create or replace function public.evaluate_and_unlock_achievements()
returns table (
    key text,
    scope text,
    unlocked_by_user_id uuid
)
language plpgsql security definer set search_path = public
as $$
declare
    v_couple uuid := public.current_couple_id();
    v_me uuid := auth.uid();
    v_partner uuid;
    v_couple_row record;
    v_today date;
begin
    if v_couple is null or v_me is null then return; end if;

    select id into v_partner from public.users
        where couple_id = v_couple and id <> v_me limit 1;
    select * into v_couple_row from public.couples where id = v_couple;
    v_today := (now() at time zone 'Asia/Bishkek')::date;

    -- Кандидаты собираются в temp table (drop on commit → транзакция-чистая).
    create temp table candidates (
        c_key text,
        c_user_id uuid
    ) on commit drop;

    -- 1. first_moon — per user, первый mood-checkin.
    if exists (select 1 from public.mood_entries where user_id = v_me) then
        insert into candidates values ('first_moon', v_me);
    end if;
    if v_partner is not null
        and exists (select 1 from public.mood_entries where user_id = v_partner)
    then
        insert into candidates values ('first_moon', v_partner);
    end if;

    -- 2. parallel — couple, день где оба чекнулись.
    if v_partner is not null and exists (
        select 1 from public.mood_entries a
        join public.mood_entries b on a.date = b.date
        where a.user_id = v_me and b.user_id = v_partner
    ) then
        insert into candidates values ('parallel', null);
    end if;

    -- 3. hundred_days_acq — couple, 100 дней знакомства.
    if v_couple_row.acquaintance_date is not null
        and (v_today - v_couple_row.acquaintance_date) >= 100
    then
        insert into candidates values ('hundred_days_acq', null);
    end if;

    -- 4. year_together — couple, год отношений.
    if v_couple_row.relationship_start_date is not null
        and (v_today - v_couple_row.relationship_start_date) >= 365
    then
        insert into candidates values ('year_together', null);
    end if;

    -- 5. first_plan — couple, первое событие в календаре.
    if exists (select 1 from public.calendar_events where couple_id = v_couple)
    then
        insert into candidates values ('first_plan', null);
    end if;

    -- 6. wanderers — couple, 5+ разных локаций.
    if (select count(distinct lower(trim(location)))
            from public.calendar_events
            where couple_id = v_couple
              and location is not null
              and length(trim(location)) > 0) >= 5
    then
        insert into candidates values ('wanderers', null);
    end if;

    -- 7. keeper — couple, 30+ event_memories.
    if (select count(*) from public.event_memories where couple_id = v_couple) >= 30
    then
        insert into candidates values ('keeper', null);
    end if;

    -- 8. alchemist — couple, 50+ wishlist items.
    if (select count(*) from public.wishlist_items where couple_id = v_couple) >= 50
    then
        insert into candidates values ('alchemist', null);
    end if;

    -- 9. full_moon — per user, 30+ mood check-ins.
    if (select count(*) from public.mood_entries where user_id = v_me) >= 30
    then
        insert into candidates values ('full_moon', v_me);
    end if;
    if v_partner is not null
        and (select count(*) from public.mood_entries where user_id = v_partner) >= 30
    then
        insert into candidates values ('full_moon', v_partner);
    end if;

    -- 10. parallel_moods — couple, 7 совпадений эмоции (total, не consecutive).
    --     MVP-семантика: семь дней по жизни, где оба отметили одну и ту же
    --     эмоцию. Consecutive-вариант — потенциальный v0.2.
    if v_partner is not null and (
        select count(*) from public.mood_entries a
        join public.mood_entries b on a.date = b.date
        where a.user_id = v_me and b.user_id = v_partner
          and a.emotion is not null
          and a.emotion = b.emotion
    ) >= 7 then
        insert into candidates values ('parallel_moods', null);
    end if;

    -- 11. sunrise — couple, есть событие со временем до 12:00.
    if exists (
        select 1 from public.calendar_events
        where couple_id = v_couple
          and "time" is not null
          and "time" < time '12:00'
    ) then
        insert into candidates values ('sunrise', null);
    end if;

    -- INSERT дельта. ON CONFLICT DO NOTHING — уже разлокированные строки
    -- пропускаются; RETURNING возвращает ТОЛЬКО реально вставленные.
    return query
    insert into public.achievement_unlocks (couple_id, key, unlocked_by_user_id)
    select v_couple, c.c_key, c.c_user_id from candidates c
    on conflict do nothing
    returning
        public.achievement_unlocks.key,
        case when public.achievement_unlocks.unlocked_by_user_id is null
             then 'couple' else 'user' end,
        public.achievement_unlocks.unlocked_by_user_id;
end;
$$;

revoke execute on function public.evaluate_and_unlock_achievements()
    from public, anon;
grant execute on function public.evaluate_and_unlock_achievements()
    to authenticated;

comment on function public.evaluate_and_unlock_achievements() is
'Проверка критериев + INSERT дельт. Возвращает ТОЛЬКО новоразблокированные ключи (toast-материал).';
