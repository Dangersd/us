-- Phase 0.7: wishlist_items table (3 списка: want/love/shared) + couple-scoped RLS.
--
-- Структурно зеркалит calendar_events (couple_id напрямую, обычный couple-RLS).
-- Особенность: list + owner_id + couple_id + created_by ИММУТАБЕЛЬНЫ через trigger.
-- «Переместить в другой список» = delete + recreate в UI; иначе CHECK
-- (list, owner_id) consistency или SECURITY переписывание становится сложным.
--
-- 5-tab UI (Хочет / Хочу / Наше / Я люблю / Любит) — это просто фильтры
-- по (list, owner_id), DB ничего о tab'ах не знает.

set search_path = public;

-- =========================================================
-- 1. Enums
-- =========================================================

create type public.wishlist_list as enum ('want', 'love', 'shared');

create type public.wishlist_category as enum (
    'clothing', 'fragrance', 'books', 'home',
    'food', 'experience', 'travel', 'other'
);

-- NB: значение 'want' существует и в priority, и в list — это РАЗНЫЕ enum'ы,
-- не путать. Priority — субъективная сила желания; list — какой это список.
create type public.wishlist_priority as enum ('someday', 'want', 'really_want');

-- =========================================================
-- 2. wishlist_items table
-- =========================================================

create table public.wishlist_items (
    id uuid primary key default gen_random_uuid(),
    couple_id uuid not null references public.couples(id) on delete cascade,
    created_by uuid not null references public.users(id) on delete restrict,

    -- null owner_id <=> list = 'shared'. Иначе — uuid владельца личного списка.
    owner_id uuid references public.users(id) on delete cascade,

    list public.wishlist_list not null,
    title text not null check (char_length(title) between 1 and 200),

    -- 0.7: только URL (upload отложен в 0.7.5). Невалидные URL отсекает yup.
    image_url text check (image_url is null or char_length(image_url) <= 2000),

    category public.wishlist_category not null default 'other',
    price_estimate text check (
        price_estimate is null or char_length(price_estimate) <= 60
    ),
    link_url text check (link_url is null or char_length(link_url) <= 2000),
    note text check (note is null or char_length(note) <= 4000),
    priority public.wishlist_priority not null default 'want',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint wishlist_items_list_owner_consistent check (
        (list = 'shared' and owner_id is null)
        or (list <> 'shared' and owner_id is not null)
    )
);

comment on table public.wishlist_items is
'Хотелки пары. 3 списка: want/love/shared. shared <=> owner_id=null. list/owner_id/couple_id/created_by иммутабельны — "переместить в другой список" = delete + recreate.';

create index wishlist_items_couple_list_idx
    on public.wishlist_items (couple_id, list, created_at desc);

create index wishlist_items_owner_idx
    on public.wishlist_items (owner_id)
    where owner_id is not null;

-- =========================================================
-- 3. Trigger: auto-fill couple_id + auto-fill/clear owner_id +
--    immutability + updated_at.
-- =========================================================

create or replace function public.wishlist_items_before_upsert()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
    if tg_op = 'INSERT' then
        new.couple_id := (
            select couple_id from public.users where id = new.created_by
        );
        if new.couple_id is null then
            raise exception 'created_by % has no couple_id', new.created_by;
        end if;

        -- shared всегда без owner; личный список — default к создателю.
        if new.list = 'shared' then
            new.owner_id := null;
        elsif new.owner_id is null then
            new.owner_id := new.created_by;
        end if;

    elsif tg_op = 'UPDATE' then
        if new.couple_id <> old.couple_id then
            raise exception 'wishlist_items.couple_id is immutable';
        end if;
        if new.created_by <> old.created_by then
            raise exception 'wishlist_items.created_by is immutable';
        end if;
        if new.list <> old.list then
            raise exception 'wishlist_items.list is immutable (delete + recreate)';
        end if;
        if new.owner_id is distinct from old.owner_id then
            raise exception 'wishlist_items.owner_id is immutable';
        end if;
    end if;

    new.updated_at := now();
    return new;
end;
$$;

create trigger wishlist_items_before_upsert_trg
    before insert or update on public.wishlist_items
    for each row execute function public.wishlist_items_before_upsert();

-- =========================================================
-- 4. RLS — couple-scoped, оба партнёра видят и редактируют.
--
-- "Партнёр не редактирует мои personal items" — пока client-side enforcement
-- (UI прячет edit/delete affordances в partner-view). DB layer permissive —
-- если abuse появится в реале, добавить partial with check на UPDATE.
-- =========================================================

alter table public.wishlist_items enable row level security;

create policy wishlist_items_select_couple
    on public.wishlist_items for select
    using (couple_id = public.current_couple_id());

create policy wishlist_items_insert_self
    on public.wishlist_items for insert
    with check (
        created_by = auth.uid()
        and (
            list = 'shared'
            or owner_id = auth.uid()
        )
    );

create policy wishlist_items_update_couple
    on public.wishlist_items for update
    using (couple_id = public.current_couple_id())
    with check (couple_id = public.current_couple_id());

create policy wishlist_items_delete_couple
    on public.wishlist_items for delete
    using (couple_id = public.current_couple_id());
