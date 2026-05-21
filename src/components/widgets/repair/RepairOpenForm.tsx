"use client";

import { useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";

import { tv } from "tailwind-variants";

import Textarea from "~components/form/fields/Textarea";
import Button from "~components/ui/Button";
import AvailabilitySegmented from "~components/widgets/repair/AvailabilitySegmented";
import IntensitySelector from "~components/widgets/repair/IntensitySelector";
import type {
    CreateRepairEpisodeInput,
    RepairAvailability,
    RepairIntensity,
} from "~interfaces/repair";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-5"),
        field: cn("flex flex-col gap-2"),
        label: cn("text-sm text-ink-secondary"),
        footer: cn(
            "sticky bottom-0 -mx-4 -mb-3 mt-2",
            "flex items-center justify-between gap-2",
            "border-t border-border-subtle bg-bg-surface-1",
            "px-4 py-3",
        ),
    },
});

interface RepairOpenFormValues {
    intensity: RepairIntensity;
    note: string;
    availability: RepairAvailability;
}

export interface RepairOpenFormProps {
    /** Имя партнёра — подставляется в submit-кнопку «Отправить ${partner}». */
    partnerName: string | null;
    onSubmit: (payload: CreateRepairEpisodeInput) => Promise<void> | void;
    onCancel: () => void;
    submitting?: boolean;
    onDirtyChange?: (dirty: boolean) => void;
}

const emptyToNull = (v: string): string | null => {
    const t = v.trim();
    return t.length === 0 ? null : t;
};

const RepairOpenForm = ({
    partnerName,
    onSubmit,
    onCancel,
    submitting,
    onDirtyChange,
}: RepairOpenFormProps) => {
    const { root, field, label, footer } = styles();
    const intensityLabelId = useId();
    const availabilityLabelId = useId();

    const form = useForm<RepairOpenFormValues>({
        defaultValues: {
            intensity: 2,
            note: "",
            availability: "ready_to_talk",
        },
    });
    const isDirty = form.formState.isDirty;

    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    const submit = form.handleSubmit(async (values) => {
        await onSubmit({
            intensity: values.intensity,
            note: emptyToNull(values.note),
            availability: values.availability,
        });
    });

    const submitLabel = partnerName
        ? `Отправить ${partnerName}`
        : "Отправить партнёру";

    return (
        <form onSubmit={submit} className={root()}>
            <div className={field()}>
                <span id={intensityLabelId} className={label()}>
                    Что произошло (по желанию)
                </span>
                <Textarea
                    {...form.register("note")}
                    rows={2}
                    placeholder="Например: меня задело то, что…"
                />
            </div>

            <div className={field()}>
                <span id={intensityLabelId} className={label()}>
                    Насколько задело
                </span>
                <Controller
                    control={form.control}
                    name="intensity"
                    render={({ field: f }) => (
                        <IntensitySelector
                            value={f.value}
                            onChange={f.onChange}
                            labelledBy={intensityLabelId}
                        />
                    )}
                />
            </div>

            <div className={field()}>
                <span id={availabilityLabelId} className={label()}>
                    Сейчас
                </span>
                <Controller
                    control={form.control}
                    name="availability"
                    render={({ field: f }) => (
                        <AvailabilitySegmented
                            value={f.value}
                            onChange={f.onChange}
                            labelledBy={availabilityLabelId}
                        />
                    )}
                />
            </div>

            <div className={footer()}>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Отмена
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
};

export default RepairOpenForm;
