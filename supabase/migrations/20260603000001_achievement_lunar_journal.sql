-- Phase 0.11 follow-up — добавляем 13-й критерий «Лунный дневник» в
-- evaluate_and_unlock_achievements. Scope=user, gendered=female,
-- criterion: 3 завершённых цикла (period_starts >= 3).
--
-- Используем helper cycle_period_starts(p_user_id) из 20260603000000 —
-- та же логика отделения новых periods, что в compute_phase. Никакого
-- дублирования where-not-exists.
--
-- 12 циклов было оригинальным замыслом (twelve_moons), но 12 циклов =
-- больше года — слишком долгий unlock для v0.2 retention. 3 цикла =
-- ~3 месяца после старта tracking — достижимо и осмысленно.
--
-- Партнёр-male не увидит этой звезды: фильтр gendered в каталоге
-- (TS-уровень, AchievementsSection). DB-уровень: insert идёт со
-- scope=user (unlocked_by_user_id = v_me), а UI rule «user-scope
-- виден только владельцу» уже скрывает unlock-факт.

set search_path = public;

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
    v_me_gender public.user_gender;
    v_partner_gender public.user_gender;
begin
    if v_couple is null or v_me is null then return; end if;

    select id, gender into v_partner, v_partner_gender from public.users
        where couple_id = v_couple and id <> v_me limit 1;
    select gender into v_me_gender from public.users where id = v_me;
    select * into v_couple_row from public.couples where id = v_couple;
    v_today := (now() at time zone 'Asia/Bishkek')::date;

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

    -- 10. parallel_moods — couple, 7 совпадений эмоции.
    if v_partner is not null and (
        select count(*) from public.mood_entries a
        join public.mood_entries b on a.date = b.date
        where a.user_id = v_me and b.user_id = v_partner
          and a.emotion is not null
          and a.emotion = b.emotion
    ) >= 7 then
        insert into candidates values ('parallel_moods', null);
    end if;

    -- 11. sunrise — couple, событие со временем до 12:00.
    if exists (
        select 1 from public.calendar_events
        where couple_id = v_couple
          and "time" is not null
          and "time" < time '12:00'
    ) then
        insert into candidates values ('sunrise', null);
    end if;

    -- 12. postcard — couple, хотя бы одно фото к событию.
    if exists (
        select 1 from public.event_photos
        where couple_id = v_couple
    ) then
        insert into candidates values ('postcard', null);
    end if;

    -- 13. lunar_journal — user, gender=female, >= 3 завершённых циклов.
    --     Использует cycle_period_starts() helper (та же логика, что в
    --     compute_phase). period_starts >= 3 = три отделённых начала
    --     периодов отслежено. Только для her (scope=user, gendered=female).
    if v_me_gender = 'female'
        and array_length(public.cycle_period_starts(v_me), 1) >= 3
    then
        insert into candidates values ('lunar_journal', v_me);
    end if;
    if v_partner is not null
        and v_partner_gender = 'female'
        and array_length(public.cycle_period_starts(v_partner), 1) >= 3
    then
        insert into candidates values ('lunar_journal', v_partner);
    end if;

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
'13 критериев включая lunar_journal (Phase 0.11). Возвращает только новоразблокированные ключи (toast-материал).';
