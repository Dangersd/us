-- Phase 0.5.6 — partner mood range read access.
--
-- Зачем SECURITY DEFINER:
-- RLS на mood_entries разрешает SELECT только по `user_id = auth.uid()`
-- (см. policy mood_entries_select_self в migration 20260520000000).
-- Чтобы caller увидел строки партнёра, нужна функция, работающая
-- под privileges владельца, с явной проверкой couple-границы.
--
-- Couple-граница: m.couple_id = current_couple_id() — переиспользуем
-- helper из init_couple_users.sql вместо inline-subselect: одна точка
-- правды + проще аудит.
--
-- p_start/p_end передаются клиентом (browser + server). Если auth.uid()
-- == null (anon), current_couple_id() вернёт null, и WHERE-условие
-- `m.couple_id = null` отфильтрует всё → пустой set, без error leak.

create or replace function public.get_partner_mood_range(
    p_start date,
    p_end date
) returns setof public.mood_entries
language sql
stable
security definer
set search_path = public
as $$
    select m.*
    from public.mood_entries m
    where m.couple_id = public.current_couple_id()
      and m.user_id <> auth.uid()
      and m.date between p_start and p_end
    order by m.date
$$;

revoke execute on function public.get_partner_mood_range(date, date) from public, anon;
grant execute on function public.get_partner_mood_range(date, date) to authenticated;
