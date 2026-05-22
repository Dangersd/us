-- Phase 0.11 — Cycle module (v0.2)
--
-- Полный cycle-tracker для аккаунта users.gender='female'. Privacy by
-- default: cycle_entries — self-only RLS, никаких сырых дат партнёру.
-- Партнёр получает ТОЛЬКО текущую фазу через get_partner_phase() и
-- ТОЛЬКО если она явно включила toggle phase_visible_to_partner.
--
-- Архитектура (см. /plan-eng-review D1): compute_phase — IMMUTABLE
-- single source of truth для логики фазы. Дублирования JS↔SQL нет:
-- клиент вызывает compute_my_phase() RPC, partner — get_partner_phase().
--
-- Helper cycle_period_starts(p_user_id) — INTERNAL (revoke от authenticated):
-- иначе male user мог бы вызвать cycle_period_starts(partner_id) и
-- получить сырой массив дат периодов. Только SECURITY DEFINER функции
-- compute_my_phase/get_partner_phase/evaluate_achievements могут его дёргать.

set search_path = public;

-- =========================================================
-- 1) cycle_entries — per-day log менструаций + симптомов + note
-- =========================================================

create table public.cycle_entries (
    user_id uuid not null references public.users(id) on delete cascade,
    couple_id uuid not null references public.couples(id) on delete cascade,
    date date not null,
    period_flow smallint check (period_flow between 1 and 3),
    symptoms text[] not null default '{}',
    note text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, date)
);

create index cycle_entries_user_date_idx
    on public.cycle_entries (user_id, date desc);

-- =========================================================
-- 2) RLS — self-only (никаких partner-shared записей)
-- =========================================================

alter table public.cycle_entries enable row level security;

create policy cycle_entries_self_select on public.cycle_entries
    for select using (user_id = auth.uid());

create policy cycle_entries_self_insert on public.cycle_entries
    for insert with check (user_id = auth.uid());

create policy cycle_entries_self_update on public.cycle_entries
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy cycle_entries_self_delete on public.cycle_entries
    for delete using (user_id = auth.uid());

-- =========================================================
-- 3) BEFORE INSERT trigger — gender guard + auto-set user_id/couple_id.
--    Клиент НЕ передаёт user_id/couple_id: они выводятся из auth.uid().
--    Male user → raise exception (defense-in-depth поверх RLS).
-- =========================================================

create or replace function public.cycle_entries_before_insert()
returns trigger
language plpgsql
as $$
declare
    v_gender public.user_gender;
    v_couple_id uuid;
begin
    select gender, couple_id into v_gender, v_couple_id
        from public.users where id = auth.uid();

    if v_gender is null then
        raise exception 'cycle_entries: no users row for auth.uid()';
    end if;
    if v_gender <> 'female' then
        raise exception 'cycle_entries: gender restriction (only female)';
    end if;

    new.user_id := auth.uid();
    new.couple_id := v_couple_id;
    new.updated_at := now();
    return new;
end;
$$;

create trigger cycle_entries_before_insert_t
    before insert on public.cycle_entries
    for each row execute function public.cycle_entries_before_insert();

-- BEFORE UPDATE — обновляем updated_at, защищаем user_id/couple_id от подделки.
create or replace function public.cycle_entries_before_update()
returns trigger
language plpgsql
as $$
begin
    new.user_id := old.user_id;
    new.couple_id := old.couple_id;
    new.updated_at := now();
    return new;
end;
$$;

create trigger cycle_entries_before_update_t
    before update on public.cycle_entries
    for each row execute function public.cycle_entries_before_update();

-- =========================================================
-- 4) cycle_period_starts(user_id) — INTERNAL helper.
--    Возвращает DESC-array дат начала периодов (день с period_flow и
--    без period_flow в date-1). Используется compute_my_phase,
--    get_partner_phase, evaluate_achievements.
--    REVOKE от authenticated/anon: privacy — сырые даты только для SECURITY
--    DEFINER функций.
-- =========================================================

create or replace function public.cycle_period_starts(p_user_id uuid)
returns date[]
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(array_agg(c.date order by c.date desc), '{}'::date[])
        from public.cycle_entries c
        where c.user_id = p_user_id
          and c.period_flow is not null
          and not exists (
              select 1 from public.cycle_entries c2
                  where c2.user_id = p_user_id
                    and c2.date = c.date - 1
                    and c2.period_flow is not null
          );
$$;

revoke execute on function public.cycle_period_starts(uuid) from public, anon, authenticated;

comment on function public.cycle_period_starts(uuid) is
'INTERNAL helper: DESC-array дат начала периодов. Только для SECURITY DEFINER функций (privacy).';

-- =========================================================
-- 5) compute_phase — IMMUTABLE, pure-SQL single source of truth.
--    Принимает period_starts (DESC), avg_len, today.
--    Возвращает фазу + день цикла + дни до периода + cycle_length.
-- =========================================================

create or replace function public.compute_phase(
    p_period_starts date[],
    p_avg_len int,
    p_today date
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
begin
    if p_period_starts is null or array_length(p_period_starts, 1) is null then
        return query select null::text, null::int, null::int, p_avg_len;
        return;
    end if;

    v_last_start := p_period_starts[1];
    v_day := (p_today - v_last_start)::int + 1;
    v_ovulation_day := p_avg_len - 14;
    v_days_to := greatest(p_avg_len - v_day + 1, 0);

    if v_day between 1 and 5 then
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

comment on function public.compute_phase(date[], int, date) is
'IMMUTABLE pure phase logic. Single source of truth для menstrual/follicular/ovulation/luteal.';

-- =========================================================
-- 6) compute_my_phase — клиентский RPC для собственного UI.
--    Читает period_starts + avg_len из своих данных, вызывает compute_phase.
-- =========================================================

create or replace function public.compute_my_phase()
returns table (
    phase text,
    day_of_cycle int,
    days_to_next_period int,
    cycle_length int
)
language sql
stable
security definer
set search_path = public
as $$
    select * from public.compute_phase(
        public.cycle_period_starts(auth.uid()),
        coalesce(
            ((select settings from public.users where id = auth.uid())
                #>> '{cycle,avg_cycle_length}')::int,
            28
        ),
        ((now() at time zone 'Asia/Bishkek')::date)
    );
$$;

revoke execute on function public.compute_my_phase() from public, anon;
grant execute on function public.compute_my_phase() to authenticated;

comment on function public.compute_my_phase() is
'RPC для her собственного UI: текущая фаза + день цикла. Защищён auth.uid().';

-- =========================================================
-- 7) get_partner_phase — партнёрский ambient.
--    Возвращает фазу ТОЛЬКО если она явно включила toggle.
--    Никаких сырых дат — только phase + day_of_cycle (для текста типа
--    "день 14 · фолликулярная").
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

    return query select * from public.compute_phase(
        public.cycle_period_starts(v_partner_id),
        v_avg_len,
        ((now() at time zone 'Asia/Bishkek')::date)
    );
end;
$$;

revoke execute on function public.get_partner_phase() from public, anon;
grant execute on function public.get_partner_phase() to authenticated;

comment on function public.get_partner_phase() is
'Партнёр получает текущую фазу her (без сырых дат). Gated by phase_visible_to_partner toggle (default OFF).';
