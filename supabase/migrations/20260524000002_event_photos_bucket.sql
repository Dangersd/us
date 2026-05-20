-- Phase 0.6.1: Storage bucket для фото событий + path-prefix-by-couple policies.
--
-- Путь storage: ${couple_id}/${event_id}/${photo_id}.jpg
-- Storage-policies проверяют (storage.foldername(name))[1] = couple_id::text
-- — path-prefix enforcement на storage layer, дополнительно к event_photos RLS.

insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', false)
on conflict (id) do nothing;

-- SELECT: signed download URL берёт только если path в твоей couple.
create policy "event-photos couple-scoped read"
    on storage.objects for select
    using (
        bucket_id = 'event-photos'
        and (storage.foldername(name))[1] = public.current_couple_id()::text
    );

-- INSERT: upload только в свою couple-папку.
create policy "event-photos couple-scoped insert"
    on storage.objects for insert
    with check (
        bucket_id = 'event-photos'
        and (storage.foldername(name))[1] = public.current_couple_id()::text
    );

-- UPDATE: модификация (caption, content-type) только в своей папке.
create policy "event-photos couple-scoped update"
    on storage.objects for update
    using (
        bucket_id = 'event-photos'
        and (storage.foldername(name))[1] = public.current_couple_id()::text
    );

-- DELETE: cleanup из use-delete-event-photo (клиент удаляет storage object
-- перед row delete; row CASCADE от event delete отдельно).
create policy "event-photos couple-scoped delete"
    on storage.objects for delete
    using (
        bucket_id = 'event-photos'
        and (storage.foldername(name))[1] = public.current_couple_id()::text
    );
