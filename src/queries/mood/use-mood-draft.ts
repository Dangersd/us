"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DEFAULT_PRIVACY } from "~config/mood";
import type { EmotionId, Visibility, VisibilityLevel } from "~interfaces/mood";
import { useTodayMood } from "~queries/mood/use-today-mood";
import {
    type UpsertMoodInput,
    useUpsertMood,
} from "~queries/mood/use-upsert-mood";

export type MoodField = "energy" | "stress" | "socialBattery" | "emotion";

const DEBOUNCE_MS = 600;
const INITIAL_INTERACTED: Record<MoodField, boolean> = {
    energy: false,
    stress: false,
    socialBattery: false,
    emotion: false,
};

interface DraftOverrides {
    energy?: number | null;
    stress?: number | null;
    socialBattery?: number | null;
    emotion?: EmotionId | null;
    visibility?: Visibility;
}

// Хук собирает draft-state поверх useTodayMood + дебаунсит slider-commits
// (600ms trailing + flush). Emotion / privacy — immediate. Полный payload
// собирается перед каждым mutate (контракт useUpsertMood).
export function useMoodDraft(date: string) {
    const today = useTodayMood(date);
    const upsert = useUpsertMood();

    const [draftEnergy, setDraftEnergy] = useState<number | null>(null);
    const [draftStress, setDraftStress] = useState<number | null>(null);
    const [draftSocialBattery, setDraftSocialBattery] = useState<number | null>(
        null,
    );
    const [draftEmotion, setDraftEmotion] = useState<EmotionId | null>(null);
    const [draftVisibility, setDraftVisibility] = useState<Visibility | null>(
        null,
    );
    const [hasInteracted, setHasInteracted] = useState(INITIAL_INTERACTED);

    const todayData = today.data;

    // Display = draft (если поле тронуто) иначе server-cached today.
    // Без useEffect mirror'а — никаких race-condition'ов с invalidate.
    const energy = hasInteracted.energy
        ? draftEnergy
        : (todayData?.energy ?? null);
    const stress = hasInteracted.stress
        ? draftStress
        : (todayData?.stress ?? null);
    const socialBattery = hasInteracted.socialBattery
        ? draftSocialBattery
        : (todayData?.socialBattery ?? null);
    const emotion = hasInteracted.emotion
        ? draftEmotion
        : (todayData?.emotion ?? null);
    const visibility =
        draftVisibility ?? todayData?.visibility ?? DEFAULT_PRIVACY;

    // Debounce manager: один таймер для слайдер/battery commits, накапливает
    // overrides и шлёт после 600ms тишины. Emotion/privacy идут мимо.
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingRef = useRef<DraftOverrides>({});

    const buildPayload = useCallback(
        (overrides: DraftOverrides): UpsertMoodInput => ({
            date,
            energy: overrides.energy !== undefined ? overrides.energy : energy,
            stress: overrides.stress !== undefined ? overrides.stress : stress,
            socialBattery:
                overrides.socialBattery !== undefined
                    ? overrides.socialBattery
                    : socialBattery,
            emotion:
                overrides.emotion !== undefined ? overrides.emotion : emotion,
            visibility: overrides.visibility ?? visibility,
        }),
        [date, energy, stress, socialBattery, emotion, visibility],
    );

    // Все колбэки читают buildPayload + mutate через ref — иначе таймер,
    // зашедуленный в render A, при срабатывании в render B использует stale
    // closure A с устаревшими display values (review P0).
    const buildPayloadRef = useRef(buildPayload);
    const upsertMutateRef = useRef(upsert.mutate);
    useEffect(() => {
        buildPayloadRef.current = buildPayload;
        upsertMutateRef.current = upsert.mutate;
    });

    const flushDebounce = useCallback(() => {
        if (!timerRef.current) return;
        clearTimeout(timerRef.current);
        timerRef.current = null;
        const overrides = pendingRef.current;
        pendingRef.current = {};
        upsertMutateRef.current(buildPayloadRef.current(overrides));
    }, []);

    const scheduleDebounced = useCallback((overrides: DraftOverrides) => {
        pendingRef.current = { ...pendingRef.current, ...overrides };
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            const merged = pendingRef.current;
            pendingRef.current = {};
            timerRef.current = null;
            upsertMutateRef.current(buildPayloadRef.current(merged));
        }, DEBOUNCE_MS);
    }, []);

    const commitImmediate = useCallback((overrides: DraftOverrides) => {
        const pending = pendingRef.current;
        pendingRef.current = {};
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        upsertMutateRef.current(
            buildPayloadRef.current({ ...pending, ...overrides }),
        );
    }, []);

    // Flush on unmount: если есть pending debounce — шлём с текущим snapshot'ом.
    useEffect(
        () => () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
                upsertMutateRef.current(
                    buildPayloadRef.current(pendingRef.current),
                );
                pendingRef.current = {};
            }
        },
        [],
    );

    const markInteracted = (field: MoodField) =>
        setHasInteracted((prev) =>
            prev[field] ? prev : { ...prev, [field]: true },
        );

    return {
        // Display values + interaction flags.
        energy,
        stress,
        socialBattery,
        emotion,
        visibility,
        hasInteracted,
        // Live setters (без commit) — для onChange слайдеров.
        setLiveEnergy: (v: number) => {
            markInteracted("energy");
            setDraftEnergy(v);
        },
        setLiveStress: (v: number) => {
            markInteracted("stress");
            setDraftStress(v);
        },
        setLiveSocialBattery: (v: number) => {
            markInteracted("socialBattery");
            setDraftSocialBattery(v);
        },
        // Debounced commits — для onValueCommit слайдеров/battery.
        commitEnergy: (v: number) => scheduleDebounced({ energy: v }),
        commitStress: (v: number) => scheduleDebounced({ stress: v }),
        commitSocialBattery: (v: number) =>
            scheduleDebounced({ socialBattery: v }),
        // Immediate — emotion / privacy.
        commitEmotion: (e: EmotionId) => {
            markInteracted("emotion");
            setDraftEmotion(e);
            commitImmediate({ emotion: e });
        },
        commitVisibility: (field: keyof Visibility, level: VisibilityLevel) => {
            const next: Visibility = { ...visibility, [field]: level };
            setDraftVisibility(next);
            commitImmediate({ visibility: next });
        },
        flushDebounce,
        upsertState: upsert,
        // Повтор последнего commit'а с текущим snapshot'ом state'а.
        retry: () => {
            upsert.reset();
            commitImmediate({});
        },
    };
}
