-- Phase 0.10.1 — couples UPDATE policy.
--
-- В init-миграции couples получил SELECT-policy, но не UPDATE. Это блокировало
-- редактирование relationship_start_date / acquaintance_date из Profile-комнаты.
-- Открываем UPDATE для любого члена пары — couples в MVP = 2 user'а на couple_id,
-- даты общие.
--
-- using ограничивает строки, видимые для UPDATE (своя couple).
-- with check предотвращает изменение строки в значение, выходящее за scope
-- (без него Postgres разрешил бы поменять PK id на чужой couple_id). Это
-- зеркалит calendar_events_update_couple pattern из 20260522000000.
--
-- drop-if-exists для re-entry: если миграция применяется поверх частичного
-- предыдущего apply'я (local reset), не падаем на «policy already exists».

set search_path = public;

drop policy if exists couples_update_couple_members on public.couples;

create policy couples_update_couple_members
    on public.couples
    for update
    using (id = public.current_couple_id())
    with check (id = public.current_couple_id());
