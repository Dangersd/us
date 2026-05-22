-- Phase 0.11 follow-up — адаптивный cycle module.
--
-- Закрывает 3 алгоритмические дыры из post-ship review:
--
-- #1 (P1): settings.cycle.avg_cycle_length никогда не обновлялся из
--     реальной истории. У женщины с 30-day циклом фаза всегда считалась
--     с 28-day default → овуляция предсказывалась на 2 дня раньше.
--     Фикс: AFTER trigger на cycle_entries auto-sync'ит avg в settings
--     когда период_starts >= 3.
--
-- #3 (P2): Менструация была захардкожена 1..5 дней в compute_phase.
--     Игнорировала реальную длину flow log (3 vs 7 дней). Фикс: новый
--     helper cycle_period_length() считает консекутивные flow-дни
--     начиная с last_start. compute_phase v2 принимает p_period_length
--     параметром.
--
-- Forward-only миграция: compute_phase signature расширена (новый
-- parameter с default), compute_my_phase + get_partner_phase
-- переопределены с новой логикой.

set search_path = public;

-- =========================================================
-- 1) cycle_period_length(user_id, start) — длина текущего периода
--    в днях (consecutive flow days начиная с p_start включительно).
--    INTERNAL — revoke от authenticated (privacy).
-- =========================================================

create or replace function public.cycle_period_length(
    p_user_id uuid,
    p_start date
)
returns int
language sql
stable
security definer
set search_path = public
as $$
    with consecutive as (
        select c.date,
               c.date - (row_number() over (order by c.date))::int as grp
            from public.cycle_entries c
            where c.user_id = p_user_id
              and c.period_flow is not null
              and c.date >= p_start
    ),
    target_grp as (
        select grp from consecutive where date = p_start limit 1
    )
    select coalesce(count(*)::int, 0)
        from consecutive
        where grp = (select grp from target_grp);
$$;

revoke execute on function public.cycle_period_length(uuid, date)
    from public, anon, authenticated;

comment on function public.cycle_period_length(uuid, date) is
'INTERNAL helper: длина периода в днях от p_start (consecutive flow). Для SECURITY DEFINER функций.';

-- =========================================================
-- 2) compute_phase v2 — добавляем p_period_length параметр.
--    Менструация = 1..p_period_length (адаптивно вместо хардкод 1..5).
--    Default p_period_length=5 для backward compat в edge cases.
-- =========================================================

create or replace function public.compute_phase(
    p_period_starts date[],
    p_avg_len int,
    p_today date,
    p_period_length int default 5
)
returns table (
    phase text,
    day_of_cycle int,
    days_to_next_period int,
    cycle_length int
)
language plpgsql
immutable
as $$
declare
    v_last_start date;
    v_day int;
    v_ovulation_day int;
    v_days_to int;
    v_period_len int;
begin
    if p_period_starts is null or array_length(p_period_starts, 1) is null then
        return query select null::text, null::int, null::int, p_avg_len;
        return;
    end if;

    v_last_start := p_period_starts[1];
    v_day := (p_today - v_last_start)::int + 1;
    v_ovulation_day := p_avg_len - 14;
    v_days_to := greatest(p_avg_len - v_day + 1, 0);
    -- Защита от degenerated period_length: minimum 1, maximum 14 (clamp).
    v_period_len := greatest(1, least(coalesce(p_period_length, 5), 14));

    if v_day between 1 and v_period_len then
        return query select 'menstrual'::text, v_day, v_days_to, p_avg_len;
    elsif v_day between (v_ovulation_day - 1) and (v_ovulation_day + 1) then
        return query select 'ovulation'::text, v_day, v_days_to, p_avg_len;
    elsif v_day < v_ovulation_day then
        return query select 'follicular'::text, v_day, v_days_to, p_avg_len;
    else
        return query select 'luteal'::text, v_day, v_days_to, p_avg_len;
    end if;
end;
$$;

comment on function public.compute_phase(date[], int, date, int) is
'IMMUTABLE pure phase logic. Адаптивная менструация через p_period_length (Phase 0.11 follow-up).';

-- =========================================================
-- 3) compute_my_phase — обновлено: подтягивает реальную длину
--    текущего периода через cycle_period_length.
-- =========================================================

create or replace function public.compute_my_phase()
returns table (
    phase text,
    day_of_cycle int,
    days_to_next_period int,
    cycle_length int
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
    v_starts date[];
    v_avg int;
    v_today date;
    v_period_len int;
begin
    v_starts := public.cycle_period_starts(auth.uid());
    v_avg := coalesce(
        ((select settings from public.users where id = auth.uid())
            #>> '{cycle,avg_cycle_length}')::int,
        28
    );
    v_today := ((now() at time zone 'Asia/Bishkek')::date);

    if array_length(v_starts, 1) is null then
        v_period_len := 5;
    else
        v_period_len := public.cycle_period_length(auth.uid(), v_starts[1]);
    end if;

    return query select * from public.compute_phase(
        v_starts, v_avg, v_today, v_period_len
    );
end;
$$;

-- =========================================================
-- 4) get_partner_phase — обновлено симметрично.
-- =========================================================

create or replace function public.get_partner_phase()
returns table (
    phase text,
    day_of_cycle int,
    days_to_next_period int,
    cycle_length int
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
    v_partner_id uuid;
    v_visible boolean;
    v_avg_len int;
    v_starts date[];
    v_period_len int;
begin
    select u.id,
           coalesce((u.settings #>> '{cycle,phase_visible_to_partner}')::boolean, false),
           coalesce((u.settings #>> '{cycle,avg_cycle_length}')::int, 28)
        into v_partner_id, v_visible, v_avg_len
        from public.users u
        where u.couple_id = public.current_couple_id()
          and u.id <> auth.uid()
          and u.gender = 'female';

    if v_partner_id is null or not v_visible then
        return;
    end if;

    v_starts := public.cycle_period_starts(v_partner_id);
    if array_length(v_starts, 1) is null then
        v_period_len := 5;
    else
        v_period_len := public.cycle_period_length(v_partner_id, v_starts[1]);
    end if;

    return query select * from public.compute_phase(
        v_starts,
        v_avg_len,
        ((now() at time zone 'Asia/Bishkek')::date),
        v_period_len
    );
end;
$$;

-- =========================================================
-- 5) AUTO-SYNC trigger: после INSERT/UPDATE/DELETE cycle_entries
--    пересчитываем avg_cycle_length из истории и пишем в settings.
--
--    Требуется >= 3 period_starts → 2+ интервала → меняемая статистика.
--    Clamp 20..45 (тот же range, что в yup-schema CycleSettings).
--    Округление: round() до int.
--
--    Срабатывает на ЛЮБОЕ изменение flow-данных (вкл. UPDATE с null↔non-null).
--    На обычных symptom-only update'ах settings не меняется (avg тот же).
-- =========================================================

create or replace function public.cycle_entries_after_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_starts date[];
    v_lengths int[];
    v_avg int;
    v_current_avg int;
    v_new_settings jsonb;
begin
    -- TG_OP может быть INSERT/UPDATE/DELETE. NEW.user_id для INS/UPD,
    -- OLD.user_id для DELETE.
    v_user_id := coalesce(new.user_id, old.user_id);

    v_starts := public.cycle_period_starts(v_user_id);

    if array_length(v_starts, 1) is null or array_length(v_starts, 1) < 3 then
        -- Недостаточно данных — не трогаем settings.
        return null;
    end if;

    -- Cycle lengths: diff между consecutive starts (DESC array).
    select array_agg(diff) into v_lengths from (
        select (v_starts[i] - v_starts[i + 1])::int as diff
            from generate_series(1, array_length(v_starts, 1) - 1) i
    ) t;

    -- Average + clamp 20..45 (соответствует CycleSettingsSchema yup).
    v_avg := greatest(20, least(45, round(
        (select avg(unnest) from unnest(v_lengths))
    )::int));

    -- Текущее значение из settings (для idempotent skip если совпадает).
    select coalesce(
        (settings #>> '{cycle,avg_cycle_length}')::int,
        28
    ) into v_current_avg
        from public.users where id = v_user_id;

    if v_current_avg = v_avg then
        return null;
    end if;

    -- jsonb_set создаст {cycle: {...}} если отсутствует. Безопасно мерджит.
    update public.users
        set settings = jsonb_set(
            coalesce(settings, '{}'::jsonb),
            '{cycle,avg_cycle_length}',
            to_jsonb(v_avg),
            true
        )
        where id = v_user_id;

    return null;
end;
$$;

create trigger cycle_entries_after_change_t
    after insert or update or delete on public.cycle_entries
    for each row execute function public.cycle_entries_after_change();

comment on function public.cycle_entries_after_change() is
'Auto-sync users.settings.cycle.avg_cycle_length из реальной истории. Фикс P1 #1: фаза адаптируется к фактической длине цикла после 3+ периодов.';
