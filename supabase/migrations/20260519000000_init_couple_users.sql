-- couples: одна строка в MVP, архитектурно готова к большему
create table public.couples (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    relationship_start_date date,
    acquaintance_date date
);

-- gender enum (управляет personal hue + cycle-доступом в v0.2)
create type public.user_gender as enum ('male', 'female');

-- users: app-уровень профиля, 1:1 с auth.users
create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    couple_id uuid not null references public.couples(id) on delete cascade,
    gender public.user_gender not null,
    display_name text not null,
    birthday date,
    personal_hue_variant text default 'default',
    settings jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

alter table public.couples enable row level security;
alter table public.users enable row level security;

-- helper: получить couple_id текущего пользователя.
-- ВАЖНО: `security definer` обязательно — функция читает public.users,
-- а на public.users есть policy users_select_couple, которая САМА вызывает
-- эту функцию. Без `security definer` получили бы бесконечную RLS-рекурсию.
-- `set search_path = public` блокирует search-path-инъекции (best practice
-- для security definer функций).
create or replace function public.current_couple_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
    select couple_id from public.users where id = auth.uid()
$$;

create policy couples_select_own
    on public.couples
    for select
    using (id = public.current_couple_id());

create policy users_select_couple
    on public.users
    for select
    using (couple_id = public.current_couple_id());

create policy users_update_self
    on public.users
    for update
    using (id = auth.uid());
