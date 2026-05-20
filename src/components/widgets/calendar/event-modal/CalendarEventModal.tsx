"use client";

import { useCallback, useState } from "react";

import { BottomSheetModal, DiscardDialog } from "~components/modal";
import EventForm, {
    type EventFormSubmitPayload,
} from "~components/widgets/calendar/event-modal/EventForm";
import MemoryCapture from "~components/widgets/calendar/event-modal/MemoryCapture";
import { useTodayDate } from "~hooks/use-today-date";
import {
    useCancelEvent,
    useDeleteEvent,
    useEvent,
    usePromoteIdea,
    useUpsertEvent,
} from "~queries/calendar";

// Edit-модалка следует Outer/Inner паттерну (см. modals.md):
// этот компонент — Outer, тянет данные по eventId. Inner = EventForm.
// Открывается через openModal() из useModalManager — НЕ через useState.
//
// Props mode: 'new' | 'edit' | 'promote'.
//   - new: чистая форма; initialDate если из календарной ячейки.
//   - edit: подтягивает event по id; при recurring передаём occurrenceDate
//     для memory attribution.
//   - promote: pre-fill из idea, на submit делает RPC promote_idea_to_event.

export interface CalendarEventModalProps {
    mode: "new" | "edit" | "promote";
    /** Из ModalProvider — управляет exit-анимацией. */
    open: boolean;
    onClose: () => void;
    /** Для mode='edit' — обязателен. */
    eventId?: string;
    /** Для mode='edit' recurring — конкретная дата occurrence. */
    occurrenceDate?: string;
    /** Для mode='new' — pre-fill date поля. */
    initialDate?: string;
    /** Для mode='promote'. */
    promotion?: {
        ideaId: string;
        ideaTitle: string;
    };
}

const CalendarEventModal = ({
    mode,
    open,
    onClose,
    eventId,
    occurrenceDate,
    initialDate,
    promotion,
}: CalendarEventModalProps) => {
    const today = useTodayDate();
    const { data: existing } = useEvent(
        mode === "edit" ? (eventId ?? null) : null,
    );

    const upsertEvent = useUpsertEvent();
    const cancelEvent = useCancelEvent();
    const deleteEvent = useDeleteEvent();
    const promoteIdea = usePromoteIdea();

    const [isDirty, setIsDirty] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);

    const requestClose = useCallback(() => {
        if (isDirty) {
            setShowDiscard(true);
            return;
        }
        onClose();
    }, [isDirty, onClose]);

    const handleSubmit = useCallback(
        async (payload: EventFormSubmitPayload) => {
            if (mode === "promote" && promotion) {
                await promoteIdea.mutateAsync({
                    ideaId: promotion.ideaId,
                    payload,
                });
            } else if (mode === "edit" && eventId) {
                await upsertEvent.mutateAsync({ id: eventId, ...payload });
            } else {
                await upsertEvent.mutateAsync(payload);
            }
            onClose();
        },
        [eventId, mode, onClose, promoteIdea, promotion, upsertEvent],
    );

    const handleCancelEvent = useCallback(async () => {
        if (!eventId) return;
        await cancelEvent.mutateAsync(eventId);
        onClose();
    }, [cancelEvent, eventId, onClose]);

    const handleDeleteEvent = useCallback(async () => {
        if (!eventId) return;
        await deleteEvent.mutateAsync(eventId);
        onClose();
    }, [deleteEvent, eventId, onClose]);

    const submitting =
        upsertEvent.isPending ||
        cancelEvent.isPending ||
        deleteEvent.isPending ||
        promoteIdea.isPending;

    const effectiveOccurrenceDate =
        mode === "edit" ? (occurrenceDate ?? existing?.date ?? null) : null;
    const isPastOccurrence =
        mode === "edit" &&
        effectiveOccurrenceDate !== null &&
        effectiveOccurrenceDate < today;

    return (
        <>
            <BottomSheetModal
                open={open}
                onClose={requestClose}
                ariaLabel="редактор события"
            >
                <div className="flex flex-col gap-4">
                    {mode === "edit" &&
                        eventId &&
                        isPastOccurrence &&
                        effectiveOccurrenceDate && (
                            <MemoryCapture
                                eventId={eventId}
                                occurrenceDate={effectiveOccurrenceDate}
                            />
                        )}
                    <EventForm
                        existing={mode === "edit" ? (existing ?? null) : null}
                        initialDate={initialDate ?? null}
                        initialTitle={
                            mode === "promote"
                                ? (promotion?.ideaTitle ?? null)
                                : null
                        }
                        isPromotion={mode === "promote"}
                        onSubmit={handleSubmit}
                        onCancel={requestClose}
                        onCancelEvent={
                            mode === "edit" ? handleCancelEvent : undefined
                        }
                        onDeleteEvent={
                            mode === "edit" ? handleDeleteEvent : undefined
                        }
                        submitting={submitting}
                        onDirtyChange={setIsDirty}
                    />
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

export default CalendarEventModal;
