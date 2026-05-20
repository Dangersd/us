"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { tv } from "tailwind-variants";

import Button from "~components/ui/Button";
import EventFormFields from "~components/widgets/calendar/event-modal/EventFormFields";
import {
    type EventFormValues,
    eventFormSchema,
} from "~components/widgets/calendar/event-modal/event-form-schema";
import { DEFAULT_REMINDER_OFFSETS } from "~config/calendar";
import type {
    CalendarEvent,
    EventCategory,
    RecurrenceRule,
    ReminderOffset,
} from "~interfaces/calendar";
import { COUPLE_TZ, todayDateString } from "~libs/date";
import { displayDateToIso, isoToDisplayDate } from "~libs/form/masks";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-4"),
        footer: cn(
            "sticky bottom-0 -mx-4 -mb-3 mt-2",
            "flex items-center justify-between gap-2",
            "border-t border-border-subtle bg-bg-surface-1",
            "px-4 py-3",
        ),
        actionLeft: cn("flex items-center gap-2"),
    },
});

export interface EventFormSubmitPayload {
    title: string;
    date: string;
    time: string | null;
    durationMinutes: number | null;
    location: string | null;
    category: EventCategory;
    customCategoryLabel: string | null;
    note: string | null;
    isRecurring: boolean;
    recurrenceRule: RecurrenceRule | null;
    recurrenceAnchorDate: string | null;
    reminderOffsets: ReminderOffset[];
}

interface EventFormProps {
    existing: CalendarEvent | null;
    initialDate: string | null;
    initialTitle: string | null;
    isPromotion: boolean;
    onSubmit: (payload: EventFormSubmitPayload) => Promise<void> | void;
    onCancel: () => void;
    onCancelEvent?: () => void;
    onDeleteEvent?: () => void;
    submitting?: boolean;
    /** Notify parent о form-dirty для DiscardDialog gating. */
    onDirtyChange?: (dirty: boolean) => void;
}

const toEmptyOrTime = (t: string | null) => (t ? t.slice(0, 5) : "");

const EventForm = ({
    existing,
    initialDate,
    initialTitle,
    isPromotion,
    onSubmit,
    onCancel,
    onCancelEvent,
    onDeleteEvent,
    submitting,
    onDirtyChange,
}: EventFormProps) => {
    const { root, footer, actionLeft } = styles();

    // Form хранит дату как display ДД-ММ-ГГГГ; existing.date / initialDate
    // приходят в ISO YYYY-MM-DD из БД и URL — конвертируем.
    const rawIsoDate = existing?.date ?? initialDate ?? "";
    const hasCustomLabel = Boolean(existing?.customCategoryLabel);
    const defaultValues: EventFormValues = {
        title: existing?.title ?? initialTitle ?? "",
        date: rawIsoDate ? isoToDisplayDate(rawIsoDate) : "",
        time: existing?.time ? toEmptyOrTime(existing.time) : "",
        durationMinutes: existing?.durationMinutes ?? null,
        location: existing?.location ?? "",
        category: hasCustomLabel ? "custom" : (existing?.category ?? "generic"),
        customCategoryLabel: existing?.customCategoryLabel ?? "",
        note: existing?.note ?? "",
        isRecurring: existing?.isRecurring ?? false,
        recurrenceRule: existing?.recurrenceRule ?? "",
        reminderOffsets: existing?.reminderOffsets ?? [
            ...DEFAULT_REMINDER_OFFSETS,
        ],
    };

    const form = useForm<EventFormValues>({
        resolver: yupResolver(eventFormSchema),
        defaultValues,
    });

    // Re-seed когда existing подгружается асинхронно (useEvent loading).
    // Ключ — только id; defaultValues пересчитывается из существующего
    // объекта на каждом рендере, dependency на сам объект приведёт к loop.
    const existingId = existing?.id ?? null;
    useEffect(() => {
        if (existing) form.reset(defaultValues);
    }, [existingId, existing, form, defaultValues]);

    // Notify parent (CalendarEventModal) о dirty state — Outer показывает
    // DiscardDialog при попытке закрыть с unsaved changes.
    const isDirty = form.formState.isDirty;
    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    const handleSubmit = form.handleSubmit(async (values) => {
        // Конвертация display ДД-ММ-ГГГГ → ISO YYYY-MM-DD перед мутацией.
        // Yup уже валидировал паттерн; displayDateToIso безопасен.
        const isoDate = displayDateToIso(values.date);

        // Past-date guard: запрещаем создавать новые non-recurring события
        // в прошлом. Для existing разрешаем (можно править прошедшее).
        // Для recurring anchor в прошлом легитимен (годовщина из 2020).
        const isNew = !existing;
        const isRecurring = values.recurrenceRule !== "";
        if (isNew && !isRecurring) {
            const today = todayDateString(COUPLE_TZ);
            if (isoDate < today) {
                form.setError("date", {
                    type: "manual",
                    message: "дата уже прошла",
                });
                return;
            }
        }

        const customLabel = values.customCategoryLabel.trim();
        const dbCategory: EventCategory =
            values.category === "custom" ? "generic" : values.category;
        const payload: EventFormSubmitPayload = {
            title: values.title.trim(),
            date: isoDate,
            time: values.time ? `${values.time}:00` : null,
            durationMinutes: values.durationMinutes,
            location: values.location.trim() || null,
            category: dbCategory,
            customCategoryLabel:
                values.category === "custom" ? customLabel || null : null,
            note: values.note.trim() || null,
            isRecurring: values.recurrenceRule !== "",
            recurrenceRule:
                values.recurrenceRule === "" ? null : values.recurrenceRule,
            recurrenceAnchorDate: values.recurrenceRule === "" ? null : isoDate,
            reminderOffsets: values.reminderOffsets,
        };
        await onSubmit(payload);
    });

    const isEditingRecurring = Boolean(existing?.isRecurring);
    const isExistingNonCancelled =
        existing && existing.state !== "cancelled" && !isPromotion;

    return (
        <form className={root()} onSubmit={handleSubmit} noValidate>
            <EventFormFields
                form={form}
                isEditingRecurring={isEditingRecurring}
            />
            <div className={footer()}>
                <div className={actionLeft()}>
                    {isExistingNonCancelled && onCancelEvent && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onCancelEvent}
                            disabled={submitting}
                        >
                            отменить
                        </Button>
                    )}
                    {existing && onDeleteEvent && (
                        <Button
                            type="button"
                            variant="danger-soft"
                            size="sm"
                            onClick={onDeleteEvent}
                            disabled={submitting}
                        >
                            удалить
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="soft"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        закрыть
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={submitting}
                    >
                        {existing && !isPromotion ? "сохранить" : "добавить"}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default EventForm;
