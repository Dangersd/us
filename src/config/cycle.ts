// RU-labels для cycle UI (фаза, симптомы, интенсивность).
import type { CyclePhase, CycleSymptom, PeriodFlow } from "~interfaces/cycle";

export const PHASE_LABELS: Record<CyclePhase, string> = {
    menstrual: "Менструация",
    follicular: "Фолликулярная",
    ovulation: "Овуляция",
    luteal: "Лютеиновая",
};

export const SYMPTOM_LABELS: Record<CycleSymptom, string> = {
    cramps: "Спазмы",
    headache: "Голова",
    tender_breasts: "Грудь",
    bloating: "Вздутие",
    fatigue: "Усталость",
    mood_swings: "Перепады",
    low_libido: "Низкое либидо",
    high_libido: "Высокое либидо",
    insomnia: "Бессонница",
    appetite_change: "Аппетит",
};

export const FLOW_LABELS: Record<PeriodFlow, string> = {
    1: "Слабо",
    2: "Средне",
    3: "Сильно",
};

// Цвета фаз — соответствуют дизайну cycCalMob в untitled.pen.
// glow-warm берётся из Tailwind tokens; остальные — design hex.
export const CYCLE_COLORS = {
    period: "#C5546D",
    fertile: "#B98FAA",
    ovulation: "var(--color-glow-warm)",
    prognosisRing: "#6E3F4A",
} as const;
