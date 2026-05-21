-- Phase 0.9: repair_episodes.
-- «После разговора» — кнопка-сигнал для пары: один из партнёров помечает,
-- что ему не ок после разговора, второй получает push-like-видимость и
-- может «заметить» + «помириться». Закрытие эпизода — оба нажали
-- «Помирились». Подробнее: ~/.gstack/projects/Dangersd-us/founded-Dangersd-cody-design-*.md
--
-- Архитектурные решения, важные для будущих читателей:
--  - couple_id выставляется триггером из users.couple_id инициатора (как в
--    mood_entries). Клиент не пишет couple_id вручную — иначе trust-boundary:
--    можно было бы создать эпизод в чужой паре.
--  - closed_at ставится в самом UPDATE через case-when, без триггера. Когда
--    второй из партнёров пишет свой *_resolved_at, тот же statement ставит
--    closed_at = now() если первый partner уже зарешолвил. Это даёт явное
--    поведение в коде вместо триггер-магии.
--  - Partial unique index на (couple_id) where closed_at is null держит
--    инвариант «один открытый эпизод на пару». Одновременный insert второго
--    партнёра ловится 23505 unique_violation — UI делает refetch и
--    показывает уже существующий эпизод.

set search_path = public;

-- =========================================================
-- 1. enum repair_availability — «готов(а) поговорить» / «нужна пауза»
-- =========================================================

create type repair_availability as enum ('ready_to_talk', 'need_pause');

-- =========================================================
-- 2. repair_episodes table
-- =========================================================

create table repair_episodes (
    id uuid primary key default gen_random_uuid(),
    couple_id uuid not null references couples(id) on delete cascade,
    initiator_id uuid not null references users(id) on delete cascade,

    intensity smallint not null check (intensity between 1 and 3),
    note text,
    availability repair_availability not null,

    -- Партнёр (не инициатор) нажал «Я заметил». Идемпотентно: повторное
    -- нажатие не перезаписывает существующий timestamp.
    acknowledged_at timestamptz,

    -- Каждая сторона может пометить «помирились». closed_at заполняется
    -- в той же мутации, что ставит второй *_resolved_at.
    initiator_resolved_at timestamptz,
    partner_resolved_at timestamptz,
    closed_at timestamptz,

    created_at timestamptz not null default now()
);

comment on table repair_episodes
is 'One emotional-repair signal between couple partners. Closed when both sides press «Помирились». Reopen via new row after closed_at is set.';

-- Инвариант: один открытый эпизод на пару.
-- При одновременной попытке второго insert — 23505 unique_violation; UI
-- ловит, делает refetch и показывает уже-открытый.
create unique index repair_episodes_one_open_per_couple
    on repair_episodes (couple_id) where closed_at is null;

-- Для будущего журнала (Approach B): эффективная выборка эпизодов пары по
-- created_at desc.
create index repair_episodes_couple_created_idx
    on repair_episodes (couple_id, created_at desc);

-- =========================================================
-- 3. Trigger: auto-fill couple_id from users + immutability guard
-- =========================================================

create or replace function repair_episodes_before_upsert()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
    if tg_op = 'INSERT' then
        -- couple_id derived from initiator's users row на INSERT.
        -- Клиент не может «прокинуть» эпизод в чужую пару — даже если
        -- передаст другой couple_id, мы его перепишем.
        new.couple_id := (select couple_id from users where id = new.initiator_id);
        if new.couple_id is null then
            raise exception 'initiator % has no couple_id', new.initiator_id;
        end if;
        -- Инициатор должен быть текущим юзером (защита от подделки чужих
        -- эпизодов на стороне партнёра).
        if new.initiator_id <> auth.uid() then
            raise exception 'initiator_id must be auth.uid()';
        end if;
    elsif tg_op = 'UPDATE' then
        -- Identity fields immutable. couple_id и initiator_id не должны
        -- меняться никогда — это сломало бы semantics эпизода (история
        -- ушла бы из контекста пары).
        if new.couple_id <> old.couple_id then
            raise exception 'repair_episodes.couple_id is immutable';
        end if;
        if new.initiator_id <> old.initiator_id then
            raise exception 'repair_episodes.initiator_id is immutable';
        end if;
        -- intensity/note/availability тоже фиксируем — после submit нельзя
        -- редактировать смысл эпизода (см. design doc «Удаление /
        -- редактирование note»).
        if new.intensity <> old.intensity then
            raise exception 'repair_episodes.intensity is immutable';
        end if;
        if new.availability <> old.availability then
            raise exception 'repair_episodes.availability is immutable';
        end if;
        if (new.note is distinct from old.note) then
            raise exception 'repair_episodes.note is immutable';
        end if;
        -- created_at тоже фиксируем.
        if new.created_at <> old.created_at then
            raise exception 'repair_episodes.created_at is immutable';
        end if;
    end if;
    return new;
end;
$$;

create trigger repair_episodes_before_upsert_trg
    before insert or update on repair_episodes
    for each row execute function repair_episodes_before_upsert();

-- =========================================================
-- 3a. Trigger: auto-fill closed_at when both *_resolved_at are set
-- =========================================================
-- Зачем нужно: одновременные UPDATE с разных сторон. Без триггера каждая
-- сторона читала бы строку, видела бы closed_at=NULL, ставила бы свою
-- *_resolved_at и оставляла closed_at=NULL — эпизод бы не закрылся.
-- С триггером Postgres сериализует UPDATE через row-lock: вторая UPDATE
-- ждёт первую, видит уже-выставленный *_resolved_at первой стороны, и
-- триггер выставляет closed_at в той же транзакции.
create or replace function repair_episodes_set_closed_at()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
    if new.initiator_resolved_at is not null
       and new.partner_resolved_at is not null
       and new.closed_at is null then
        new.closed_at := now();
    end if;
    return new;
end;
$$;

create trigger repair_episodes_set_closed_at_trg
    before update on repair_episodes
    for each row execute function repair_episodes_set_closed_at();

-- =========================================================
-- 4. RLS — оба члена пары видят и могут UPDATE; INSERT только за себя.
-- =========================================================

alter table repair_episodes enable row level security;

create policy repair_episodes_select_couple
    on repair_episodes for select
    using (couple_id = public.current_couple_id());

create policy repair_episodes_insert_self
    on repair_episodes for insert
    with check (initiator_id = auth.uid());

create policy repair_episodes_update_couple
    on repair_episodes for update
    using (couple_id = public.current_couple_id())
    with check (couple_id = public.current_couple_id());

-- No DELETE policy: эпизод нельзя удалить, только закрыть через resolved_at.
