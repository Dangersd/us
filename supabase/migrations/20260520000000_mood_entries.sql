-- Phase 0.5.1: mood_entries table, RLS (self-only), vibe_bucket() helper.
-- Partner read access via get_partner_mood_range() SECURITY DEFINER
-- function will be added in Phase 0.5.5.

set search_path = public;

-- =========================================================
-- 1. vibe_bucket(field, value) — immutable helper
-- Rounds 0..100 numeric mood value into semantic bucket label
-- used by the privacy='vibe' rendering path. Mirrored on the
-- TypeScript side in src/config/mood.ts.
-- =========================================================

create or replace function vibe_bucket(p_field text, p_value smallint)
returns text
language sql immutable
as $$
    select case
        when p_value is null then null
        when p_field = 'energy' then case
            when p_value < 25 then 'drained'
            when p_value < 50 then 'calm'
            when p_value < 75 then 'energetic'
            else 'fire'
        end
        when p_field = 'stress' then case
            when p_value < 25 then 'relaxed'
            when p_value < 50 then 'neutral'
            when p_value < 75 then 'tense'
            else 'burning'
        end
        when p_field = 'social_battery' then case
            when p_value < 25 then 'empty'
            when p_value < 50 then 'low'
            when p_value < 75 then 'open'
            else 'full'
        end
        else null
    end;
$$;

comment on function vibe_bucket(text, smallint)
is 'Round numeric mood value to semantic bucket label for privacy=vibe rendering. Mirrors TypeScript helpers in src/config/mood.ts.';

-- =========================================================
-- 2. mood_entries table
-- =========================================================

create table mood_entries (
    user_id uuid not null references users(id) on delete cascade,
    couple_id uuid not null references couples(id) on delete cascade,
    date date not null,

    energy smallint check (energy is null or (energy >= 0 and energy <= 100)),
    stress smallint check (stress is null or (stress >= 0 and stress <= 100)),
    social_battery smallint
        check (social_battery is null or (social_battery >= 0 and social_battery <= 100)),
    emotion text check (
        emotion is null
        or emotion in (
            'warm', 'calm', 'sad', 'anxious',
            'joyful', 'tired', 'tender', 'empty'
        )
    ),

    -- Per-field privacy: 'full' | 'vibe' | 'hidden'
    visibility jsonb not null default '{
        "energy": "vibe",
        "stress": "vibe",
        "social_battery": "full",
        "emotion": "full"
    }'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    primary key (user_id, date)
);

comment on table mood_entries
is 'One mood check-in per user per day. Upsert by (user_id, date).';

create index mood_entries_couple_date_idx
    on mood_entries (couple_id, date desc);

-- =========================================================
-- 3. Trigger: auto-fill couple_id from users + bump updated_at
-- =========================================================

create or replace function mood_entries_before_upsert()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
    -- couple_id is derived from the user, not user-supplied.
    new.couple_id := (select couple_id from users where id = new.user_id);
    if new.couple_id is null then
        raise exception 'user % has no couple_id', new.user_id;
    end if;

    new.updated_at := now();
    return new;
end;
$$;

create trigger mood_entries_before_upsert_trg
    before insert or update on mood_entries
    for each row execute function mood_entries_before_upsert();

-- =========================================================
-- 4. RLS — self-only.
-- Partner read access will be added in Phase 0.5.5 via
-- get_partner_mood_range() SECURITY DEFINER function, which
-- reads mood_entries directly using owner privileges.
-- =========================================================

alter table mood_entries enable row level security;

create policy mood_entries_select_self
    on mood_entries for select
    using (user_id = auth.uid());

create policy mood_entries_insert_self
    on mood_entries for insert
    with check (user_id = auth.uid());

create policy mood_entries_update_self
    on mood_entries for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- No DELETE policy intentionally: overwrite via upsert is the only mutation path.
