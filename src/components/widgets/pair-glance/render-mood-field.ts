import type { VisibilityLevel } from "~interfaces/mood";

export type FieldDisplay =
    | { kind: "hidden" }
    | { kind: "vibe"; label: string }
    | { kind: "full"; label: string; value: number };

// Универсальный рендерер 1 поля mood-записи для partner-view.
// bucketLabel резолвится через ENERGY_LABELS / STRESS_LABELS /
// SOCIAL_BATTERY_LABELS на стороне вызывающего (он знает домен).
export function renderMoodField(args: {
    value: number | null;
    visibility: VisibilityLevel;
    bucketLabel: string | null;
}): FieldDisplay {
    if (args.visibility === "hidden") return { kind: "hidden" };
    if (args.value == null) return { kind: "hidden" };
    if (args.visibility === "vibe") {
        return { kind: "vibe", label: args.bucketLabel ?? "" };
    }
    return { kind: "full", label: args.bucketLabel ?? "", value: args.value };
}
