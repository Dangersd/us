-- Phase 0.6.1: current_couple_anchor_dates — single source of truth
-- для auto-seed годовщин и дней рождения в /api/calendar/seed-recurring.
--
-- Возвращает все «якорные» даты пары (anniversary + birthdays обоих
-- партнёров). NULL значения отфильтрованы — auto-seed не создаёт
-- события без anchor.
--
-- View, не функция: проще тестировать через `select * from view`,
-- и SELECT-RLS на couples/users работает автоматически.

set search_path = public;

create or replace view public.current_couple_anchor_dates as
    select
        'anniversary'::text as label,
        c.relationship_start_date as anchor_date,
        'anniversary'::public.event_category as category,
        -- created_by для anniversary — любой из couple. В seed выбираем
        -- наиболее «давнего» (по users.created_at) для детерминизма.
        (
            select id from public.users
            where couple_id = c.id
            order by created_at asc
            limit 1
        ) as owner_user_id
    from public.couples c
    where c.id = public.current_couple_id()
      and c.relationship_start_date is not null

    union all

    select
        'birthday'::text as label,
        u.birthday as anchor_date,
        'birthday'::public.event_category as category,
        u.id as owner_user_id
    from public.users u
    where u.couple_id = public.current_couple_id()
      and u.birthday is not null;

comment on view public.current_couple_anchor_dates
is 'Single source of truth для auto-seed recurring events (годовщина + birthdays).';
