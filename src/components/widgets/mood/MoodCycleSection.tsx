"use client";

import { useState } from "react";

import { tv } from "tailwind-variants";

import Card from "~components/ui/Card";
import CycleSymptomChips from "~components/widgets/profile/cycle/CycleSymptomChips";
import { useOpenCycleLogModal } from "~components/widgets/profile/cycle/useOpenCycleLogModal";
import { useTodayDate } from "~hooks/use-today-date";
import type { CycleSymptom, PeriodFlow } from "~interfaces/cycle";
import { cn } from "~libs/utils";
import { useCycleToday } from "~queries/cycle/use-cycle-today";
import { useUpsertCycleEntry } from "~queries/cycle/use-upsert-cycle-entry";

interface MoodCycleSectionProps {
    date?: string;
    className?: string;
}

// Top-6 наиболее часто используемых тегов для inline-mood checkin.
// Остальные доступны через «Подробнее» → открывает полный CycleLogModal.
const QUICK_SYMPTOMS: readonly CycleSymptom[] = [
    "cramps",
    "headache",
    "fatigue",
    "bloating",
    "tender_breasts",
    "mood_swings",
];

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-4 p-5"),
        head: cn("flex items-center justify-between"),
        label: cn("text-[11px] uppercase tracking-wider text-ink-muted"),
        moreBtn: cn(
            "text-ink-muted text-[11px] hover:text-ink-secondary",
            "focus-visible:outline-none",
        ),
        row: cn("flex items-center gap-3"),
        periodLabel: cn("text-ink-primary text-[13px]"),
        check: cn(
            "relative h-5 w-5 rounded border border-border-warm",
            "flex items-center justify-center transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-glow-warm/40",
        ),
        checkOn: cn("bg-glow-warm border-glow-warm"),
        sub: cn("text-ink-muted text-[10px]"),
    },
});

// Phase 0.11 D2: Mood checkin cycle section. Prefetches today's cycle_entry
// → chip'ы и checkbox показывают актуальные значения (last-write-wins
// семантика становится «то что вижу — то что будет»).
const MoodCycleSection = ({
    date: dateProp,
    className,
}: MoodCycleSectionProps) => {
    const {
        root,
        head,
        label,
        moreBtn,
        row,
        periodLabel,
        check,
        checkOn,
        sub,
    } = styles();
    const today = useTodayDate();
    const date = dateProp ?? today;
    const { data: existing } = useCycleToday(date);
    const upsert = useUpsertCycleEntry();
    const openFullLog = useOpenCycleLogModal();

    const initialFlow = existing?.periodFlow ?? null;
    const initialSymptoms = existing?.symptoms ?? [];

    return (
        <Card tone="mood" className={cn(root(), className)}>
            <div className={head()}>
                <span className={label()}>Цикл</span>
                <button
                    type="button"
                    className={moreBtn()}
                    onClick={() => openFullLog({ date })}
                >
                    подробнее →
                </button>
            </div>

            <PeriodCheckbox
                key={`flow-${initialFlow ?? "null"}-${existing?.updatedAt ?? "new"}`}
                date={date}
                initialFlow={initialFlow}
                initialSymptoms={initialSymptoms}
                upsertPending={upsert.isPending}
                onCommit={(payload) => upsert.mutate(payload)}
                styles={{ row, periodLabel, check, checkOn }}
            />

            <SymptomsRow
                key={`syms-${initialSymptoms.join(",")}-${existing?.updatedAt ?? "new"}`}
                date={date}
                initialFlow={initialFlow}
                initialSymptoms={initialSymptoms}
                upsertPending={upsert.isPending}
                onCommit={(payload) => upsert.mutate(payload)}
            />

            <p className={sub()}>
                Видно только тебе. Партнёр не получает доступа к этим данным.
            </p>
        </Card>
    );
};

// Inner: checkbox + flow=2 default при первом включении. Key-driven reset
// при смене existing (без useEffect).
interface CommitArgs {
    date: string;
    periodFlow: PeriodFlow | null;
    symptoms: CycleSymptom[];
    note: string | null;
}

interface PeriodCheckboxProps {
    date: string;
    initialFlow: PeriodFlow | null;
    initialSymptoms: CycleSymptom[];
    upsertPending: boolean;
    onCommit: (args: CommitArgs) => void;
    styles: {
        row: () => string;
        periodLabel: () => string;
        check: () => string;
        checkOn: () => string;
    };
}

const PeriodCheckbox = ({
    date,
    initialFlow,
    initialSymptoms,
    upsertPending,
    onCommit,
    styles: s,
}: PeriodCheckboxProps) => {
    const [hasFlow, setHasFlow] = useState<boolean>(initialFlow !== null);

    const toggle = () => {
        if (upsertPending) return;
        const next = !hasFlow;
        setHasFlow(next);
        onCommit({
            date,
            periodFlow: next ? (initialFlow ?? 2) : null,
            symptoms: initialSymptoms,
            note: null,
        });
    };

    return (
        <div className={s.row()}>
            <button
                type="button"
                role="checkbox"
                aria-checked={hasFlow}
                onClick={toggle}
                disabled={upsertPending}
                className={cn(s.check(), hasFlow && s.checkOn())}
            >
                {hasFlow ? (
                    <span className="text-bg-surface-1 text-[10px]">✓</span>
                ) : null}
            </button>
            <span className={s.periodLabel()}>Сегодня период</span>
        </div>
    );
};

// Inner: chips. Toggle сразу commit'ит upsert (no Save button — inline).
interface SymptomsRowProps {
    date: string;
    initialFlow: PeriodFlow | null;
    initialSymptoms: CycleSymptom[];
    upsertPending: boolean;
    onCommit: (args: CommitArgs) => void;
}

const SymptomsRow = ({
    date,
    initialFlow,
    initialSymptoms,
    upsertPending,
    onCommit,
}: SymptomsRowProps) => {
    const [symptoms, setSymptoms] = useState<CycleSymptom[]>(initialSymptoms);

    const handleToggle = (s: CycleSymptom) => {
        if (upsertPending) return;
        const next = symptoms.includes(s)
            ? symptoms.filter((x) => x !== s)
            : [...symptoms, s];
        setSymptoms(next);
        onCommit({
            date,
            periodFlow: initialFlow,
            symptoms: next,
            note: null,
        });
    };

    return (
        <CycleSymptomChips
            selected={symptoms}
            onToggle={handleToggle}
            visible={QUICK_SYMPTOMS}
            disabled={upsertPending}
        />
    );
};

export default MoodCycleSection;
