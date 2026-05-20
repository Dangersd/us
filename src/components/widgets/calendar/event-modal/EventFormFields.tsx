"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import { tv } from "tailwind-variants";

import Input from "~components/form/fields/Input";
import Textarea from "~components/ui/Textarea";
import ChipGroup from "~components/widgets/calendar/event-modal/ChipGroup";
import type { EventFormValues } from "~components/widgets/calendar/event-modal/event-form-schema";
import { AVAILABLE_REMINDER_OFFSETS, EVENT_CATEGORIES } from "~config/calendar";
import type {
    EventCategory,
    RecurrenceRule,
    ReminderOffset,
} from "~interfaces/calendar";
import { maskDate, maskTime } from "~libs/form/masks";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-4"),
        row: cn("flex flex-col gap-1.5"),
        rowPair: cn("grid grid-cols-2 gap-3"),
        label: cn("text-[11px] uppercase tracking-wide text-ink-muted"),
        hint: cn("text-[11px] text-ink-muted"),
        err: cn("text-[12px] text-status-error"),
    },
});

const RECURRENCE_OPTIONS = [
    { id: "" as const, label: "никогда" },
    { id: "MONTHLY" as const, label: "каждый месяц" },
    { id: "YEARLY" as const, label: "каждый год" },
];

interface EventFormFieldsProps {
    form: UseFormReturn<EventFormValues>;
    isEditingRecurring: boolean;
}

const EventFormFields = ({
    form,
    isEditingRecurring,
}: EventFormFieldsProps) => {
    const { root, row, rowPair, label, hint, err } = styles();
    const {
        register,
        control,
        watch,
        formState: { errors },
    } = form;

    const recurrenceRule = watch("recurrenceRule");

    return (
        <div className={root()}>
            <div className={row()}>
                <label className={label()} htmlFor="ev-title">
                    название
                </label>
                <Input
                    id="ev-title"
                    placeholder="что задумали"
                    {...register("title")}
                />
                {errors.title && (
                    <span className={err()}>{errors.title.message}</span>
                )}
            </div>

            <div className={rowPair()}>
                <div className={row()}>
                    <label className={label()} htmlFor="ev-date">
                        дата
                    </label>
                    <Controller
                        control={control}
                        name="date"
                        render={({ field }) => (
                            <Input
                                id="ev-date"
                                placeholder="ДД-ММ-ГГГГ"
                                inputMode="numeric"
                                autoComplete="off"
                                maxLength={10}
                                disabled={isEditingRecurring}
                                value={field.value ?? ""}
                                onBlur={field.onBlur}
                                onChange={(e) =>
                                    field.onChange(maskDate(e.target.value))
                                }
                            />
                        )}
                    />
                    {isEditingRecurring && (
                        <span className={hint()}>
                            у повторяющегося события дату не меняем
                        </span>
                    )}
                    {errors.date && (
                        <span className={err()}>{errors.date.message}</span>
                    )}
                </div>
                <div className={row()}>
                    <label className={label()} htmlFor="ev-time">
                        время
                    </label>
                    <Controller
                        control={control}
                        name="time"
                        render={({ field }) => (
                            <Input
                                id="ev-time"
                                placeholder="ЧЧ:ММ"
                                inputMode="numeric"
                                autoComplete="off"
                                maxLength={5}
                                value={field.value ?? ""}
                                onBlur={field.onBlur}
                                onChange={(e) =>
                                    field.onChange(maskTime(e.target.value))
                                }
                            />
                        )}
                    />
                    {errors.time && (
                        <span className={err()}>{errors.time.message}</span>
                    )}
                </div>
            </div>

            <div className={rowPair()}>
                <div className={row()}>
                    <label className={label()} htmlFor="ev-duration">
                        длительность, мин
                    </label>
                    <Input
                        id="ev-duration"
                        placeholder="например 90"
                        inputMode="numeric"
                        {...register("durationMinutes", {
                            setValueAs: (v) =>
                                v === "" || v == null ? null : Number(v),
                        })}
                    />
                    {errors.durationMinutes && (
                        <span className={err()}>
                            {errors.durationMinutes.message}
                        </span>
                    )}
                </div>
                <div className={row()}>
                    <label className={label()} htmlFor="ev-location">
                        место
                    </label>
                    <Input
                        id="ev-location"
                        placeholder="где"
                        {...register("location")}
                    />
                </div>
            </div>

            <div className={row()}>
                <span className={label()}>категория</span>
                <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                        <ChipGroup<EventCategory>
                            options={EVENT_CATEGORIES.map((c) => ({
                                id: c.id,
                                label: c.label,
                                color: c.color,
                            }))}
                            selected={field.value}
                            onChange={(id) => field.onChange(id)}
                            ariaLabel="категория события"
                        />
                    )}
                />
            </div>

            <div className={row()}>
                <label className={label()} htmlFor="ev-note">
                    заметка
                </label>
                <Textarea
                    id="ev-note"
                    rows={3}
                    placeholder="что хочется запомнить"
                    {...register("note")}
                />
                {errors.note && (
                    <span className={err()}>{errors.note.message}</span>
                )}
            </div>

            <div className={row()}>
                <span className={label()}>повтор</span>
                <Controller
                    control={control}
                    name="recurrenceRule"
                    render={({ field }) => (
                        <ChipGroup<RecurrenceRule | "">
                            options={RECURRENCE_OPTIONS}
                            selected={field.value}
                            onChange={(id) => {
                                field.onChange(id);
                                form.setValue("isRecurring", id !== "");
                            }}
                            ariaLabel="повторяемость"
                        />
                    )}
                />
                {recurrenceRule !== "" && (
                    <span className={hint()}>
                        повторяющееся — изменения коснутся всех годов
                    </span>
                )}
            </div>

            <div className={row()}>
                <span className={label()}>напомнить</span>
                <Controller
                    control={control}
                    name="reminderOffsets"
                    render={({ field }) => (
                        <ChipGroup<ReminderOffset>
                            options={AVAILABLE_REMINDER_OFFSETS.map((r) => ({
                                id: r.id,
                                label: r.label,
                            }))}
                            selected={field.value}
                            onChange={(id) => {
                                const set = new Set(field.value);
                                if (set.has(id)) set.delete(id);
                                else set.add(id);
                                field.onChange(
                                    AVAILABLE_REMINDER_OFFSETS.filter((r) =>
                                        set.has(r.id),
                                    ).map((r) => r.id),
                                );
                            }}
                            multi
                            ariaLabel="напоминания"
                        />
                    )}
                />
                <span className={hint()}>уведомления появятся позже</span>
            </div>
        </div>
    );
};

export default EventFormFields;
