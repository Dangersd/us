"use client";

import { useCallback, useSyncExternalStore } from "react";

import { MoodBlob } from "~components/ui";
import { freshnessFromHours } from "~libs/freshness-from-hours";
import { getPersonalHue } from "~libs/personal-hue";
import { cn } from "~libs/utils";
import { usePartnerTodayMood } from "~queries/mood/use-partner-today-mood";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";

// Декоративный «след» партнёра в TopBar: маленький MoodBlob партнёрского
// hue, дышит на общей breath-clock. Opacity снижается с часами от момента
// последнего mood-checkin партнёра (см. freshnessFromHours). Floor 0.55 —
// чтобы блоб не читался как render-bug в «тихий» день.
//
// aria-hidden: чистая атмосфера, не focusable, не interactive. Соблюдает
// «async by design» (docs/01-concept.md:26-34): никаких presence-индикаторов.
//
// Time-read через useSyncExternalStore: Date.now() — impure для render-фазы
// React 19; useSyncExternalStore — официальный escape для external-state.
// noopSubscribe = одноразовое чтение (нет периодического обновления,
// одна точка в plan/p0-p1-dazzling-bird.md). Navigation между комнатами
// делает re-mount → обновление часов.
//
// Privacy: серверная RLS на get_partner_mood_range() (SECURITY DEFINER, см.
// fetch-partner-today-mood.ts) уже фильтрует поля по visibility.

const noopSubscribe = () => () => {};
const serverSnapshot = (): number | null => null;

const PartnerStatus = () => {
    const partner = usePartnerProfile();
    const mood = usePartnerTodayMood();
    const createdAt = mood.data?.createdAt ?? null;

    const getSnapshot = useCallback((): number | null => {
        if (!createdAt) return null;
        return (Date.now() - new Date(createdAt).getTime()) / 3_600_000;
    }, [createdAt]);

    const hoursSince = useSyncExternalStore(
        noopSubscribe,
        getSnapshot,
        serverSnapshot,
    );

    if (!partner.data) return null;

    const hue = getPersonalHue(partner.data.gender);
    const moodEntry = mood.data ?? null;
    const freshness = freshnessFromHours(hoursSince);

    return (
        <div
            aria-hidden
            className={cn("inline-flex items-center")}
            style={{ opacity: freshness }}
        >
            <MoodBlob
                color={hue}
                size={28}
                aura={false}
                energy={moodEntry?.energy ?? 30}
                stress={moodEntry?.stress ?? 0}
                socialBattery={moodEntry?.socialBattery ?? 50}
            />
        </div>
    );
};

export default PartnerStatus;
