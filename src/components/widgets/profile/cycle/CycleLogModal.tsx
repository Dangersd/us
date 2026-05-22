"use client";

import { useState } from "react";

import { tv } from "tailwind-variants";

import { BottomSheetModal, DiscardDialog } from "~components/modal";
import Button from "~components/ui/Button";
import Textarea from "~components/ui/Textarea";
import CycleSymptomChips from "~components/widgets/profile/cycle/CycleSymptomChips";
import { FLOW_LABELS } from "~config/cycle";
import type { CycleEntry, CycleSymptom, PeriodFlow } from "~interfaces/cycle";
import { formatRuFullDate } from "~libs/date";
import { cn } from "~libs/utils";
import { useCycleToday } from "~queries/cycle/use-cycle-today";
import { useUpsertCycleEntry } from "~queries/cycle/use-upsert-cycle-entry";

interface CycleLogModalProps {
    open: boolean;
    onClose: () => void;
    date: string;
}

const styles = tv({
    slots: {
        body: cn("flex flex-col gap-6 px-2 pb-6 pt-2"),
        title: cn("font-display text-ink-primary text-[18px] px-2"),
        section: cn("flex flex-col gap-3 px-2"),
        sectionLabel: cn("text-ink-muted text-[10px] uppercase tracking-wider"),
        flowRow: cn("flex gap-2"),
        flowBtn: cn(
            "flex-1 rounded-xl py-3 text-[13px] border transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-glow-warm/40",
        ),
        flowOn: cn("bg-glow-warm/20 border-glow-warm/50 text-ink-primary"),
        flowOff: cn(
            "bg-bg-surface-2/60 border-border-warm/40 text-ink-secondary",
        ),
        flowNone: cn(
            "flex-1 rounded-xl py-3 text-[13px] border-2 border-dashed",
            "border-border-warm/40 text-ink-muted",
        ),
        footer: cn("flex items-center justify-between gap-2 px-2 pt-2"),
    },
});

// Outer-модалка: тянет existing entry, передаёт key чтобы Inner сбрасывался
// при смене date/existing — без useEffect+setState (React-hooks rule).
const CycleLogModal = ({ open, onClose, date }: CycleLogModalProps) => {
    const { data: existing, isLoading } = useCycleToday(date);

    if (isLoading) {
        // Пока fetch — пустой sheet; контракт open/onClose сохранён.
        return (
            <BottomSheetModal
                open={open}
                onClose={onClose}
                ariaLabel={`лог цикла — ${date}`}
            >
                <div className="px-4 py-8 text-ink-muted text-[13px]">
                    Загрузка...
                </div>
            </BottomSheetModal>
        );
    }

    return (
        <CycleLogModalInner
            key={`${date}-${existing?.updatedAt ?? "new"}`}
            open={open}
            onClose={onClose}
            date={date}
            existing={existing ?? null}
        />
    );
};

interface InnerProps extends CycleLogModalProps {
    existing: CycleEntry | null;
}

const CycleLogModalInner = ({ open, onClose, date, existing }: InnerProps) => {
    const {
        body,
        title,
        section,
        sectionLabel,
        flowRow,
        flowBtn,
        flowOn,
        flowOff,
        flowNone,
        footer,
    } = styles();
    const upsert = useUpsertCycleEntry();

    const [periodFlow, setPeriodFlow] = useState<PeriodFlow | null>(
        existing?.periodFlow ?? null,
    );
    const [symptoms, setSymptoms] = useState<CycleSymptom[]>(
        existing?.symptoms ?? [],
    );
    const [note, setNote] = useState<string>(existing?.note ?? "");
    const [isDirty, setIsDirty] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);

    const requestClose = () => {
        if (isDirty) {
            setShowDiscard(true);
            return;
        }
        onClose();
    };

    const updateFlow = (next: PeriodFlow | null) => {
        setPeriodFlow(next);
        setIsDirty(true);
    };

    const toggleSymptom = (s: CycleSymptom) => {
        setSymptoms((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
        );
        setIsDirty(true);
    };

    const handleNoteChange = (value: string) => {
        setNote(value);
        setIsDirty(true);
    };

    const handleSave = async () => {
        await upsert.mutateAsync({
            date,
            periodFlow,
            symptoms,
            note: note.trim() === "" ? null : note.trim(),
        });
        onClose();
    };

    return (
        <>
            <BottomSheetModal
                open={open}
                onClose={requestClose}
                ariaLabel={`лог цикла — ${date}`}
            >
                <div className={body()}>
                    <h2 className={title()}>
                        {formatRuFullDate(date) ?? date}
                    </h2>

                    <div className={section()}>
                        <span className={sectionLabel()}>Период</span>
                        <div className={flowRow()}>
                            <button
                                type="button"
                                onClick={() => updateFlow(null)}
                                className={cn(
                                    flowBtn(),
                                    periodFlow === null ? flowOn() : flowNone(),
                                )}
                            >
                                Нет
                            </button>
                            {([1, 2, 3] as PeriodFlow[]).map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => updateFlow(f)}
                                    className={cn(
                                        flowBtn(),
                                        periodFlow === f ? flowOn() : flowOff(),
                                    )}
                                >
                                    {FLOW_LABELS[f]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={section()}>
                        <span className={sectionLabel()}>Симптомы</span>
                        <CycleSymptomChips
                            selected={symptoms}
                            onToggle={toggleSymptom}
                            disabled={upsert.isPending}
                        />
                    </div>

                    <div className={section()}>
                        <span className={sectionLabel()}>Заметка</span>
                        <Textarea
                            value={note}
                            onChange={(e) => handleNoteChange(e.target.value)}
                            placeholder="..."
                            rows={3}
                        />
                    </div>

                    <div className={footer()}>
                        <Button
                            type="button"
                            variant="soft"
                            size="sm"
                            onClick={requestClose}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleSave}
                            disabled={upsert.isPending}
                        >
                            {upsert.isPending ? "Сохраняю..." : "Сохранить"}
                        </Button>
                    </div>
                </div>
            </BottomSheetModal>
            <DiscardDialog
                open={showDiscard}
                onConfirm={() => {
                    setShowDiscard(false);
                    onClose();
                }}
                onCancel={() => setShowDiscard(false)}
            />
        </>
    );
};

export default CycleLogModal;
