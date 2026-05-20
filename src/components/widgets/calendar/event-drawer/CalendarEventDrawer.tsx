"use client";

import { useCallback, useMemo } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Sheet from "~components/ui/Sheet";
import EventForm, {
    type EventFormSubmitPayload,
} from "~components/widgets/calendar/event-drawer/EventForm";
import MemoryCapture from "~components/widgets/calendar/event-drawer/MemoryCapture";
import {
    CALENDAR_DATE_PARAM,
    CALENDAR_EVENT_PARAM,
    CALENDAR_IDEA_PARAM,
} from "~config/routes";
import { useTodayDate } from "~hooks/use-today-date";
import {
    useCancelEvent,
    useDeleteEvent,
    useEvent,
    useIdeas,
    usePromoteIdea,
    useUpsertEvent,
} from "~queries/calendar";

// occurrenceId = `${baseId}` для non-recurring, `${baseId}:${date}` для recurring.
function parseOccurrenceId(value: string): {
    baseId: string;
    occurrenceDate: string | null;
} {
    const colonIdx = value.indexOf(":");
    if (colonIdx === -1) return { baseId: value, occurrenceDate: null };
    return {
        baseId: value.slice(0, colonIdx),
        occurrenceDate: value.slice(colonIdx + 1),
    };
}

const CalendarEventDrawer = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const rawEvent = searchParams.get(CALENDAR_EVENT_PARAM);
    const rawIdeaId = searchParams.get(CALENDAR_IDEA_PARAM);
    const initialDate = searchParams.get(CALENDAR_DATE_PARAM);

    const isOpen = Boolean(rawEvent);
    const isNew = rawEvent === "new";
    const editingId =
        isOpen && !isNew ? parseOccurrenceId(rawEvent!).baseId : null;

    const { data: existing } = useEvent(editingId);
    const { data: ideas } = useIdeas();
    const promotionIdea = useMemo(() => {
        if (!rawIdeaId || !ideas) return null;
        return ideas.find((i) => i.id === rawIdeaId) ?? null;
    }, [rawIdeaId, ideas]);

    const today = useTodayDate();
    const occurrenceDate = useMemo(() => {
        if (!isOpen || isNew) return null;
        const parsed = parseOccurrenceId(rawEvent!);
        return parsed.occurrenceDate ?? existing?.date ?? null;
    }, [existing?.date, isNew, isOpen, rawEvent]);
    const isPastOccurrence =
        editingId !== null && occurrenceDate !== null && occurrenceDate < today;

    const upsertEvent = useUpsertEvent();
    const cancelEvent = useCancelEvent();
    const deleteEvent = useDeleteEvent();
    const promoteIdea = usePromoteIdea();

    const closeDrawer = useCallback(() => {
        const sp = new URLSearchParams(searchParams.toString());
        sp.delete(CALENDAR_EVENT_PARAM);
        sp.delete(CALENDAR_IDEA_PARAM);
        const qs = sp.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, [pathname, router, searchParams]);

    const handleSubmit = useCallback(
        async (payload: EventFormSubmitPayload) => {
            if (promotionIdea) {
                await promoteIdea.mutateAsync({
                    ideaId: promotionIdea.id,
                    payload,
                });
            } else if (editingId) {
                await upsertEvent.mutateAsync({ id: editingId, ...payload });
            } else {
                await upsertEvent.mutateAsync(payload);
            }
            closeDrawer();
        },
        [closeDrawer, editingId, promoteIdea, promotionIdea, upsertEvent],
    );

    const handleCancelEvent = useCallback(async () => {
        if (!editingId) return;
        await cancelEvent.mutateAsync(editingId);
        closeDrawer();
    }, [cancelEvent, closeDrawer, editingId]);

    const handleDeleteEvent = useCallback(async () => {
        if (!editingId) return;
        await deleteEvent.mutateAsync(editingId);
        closeDrawer();
    }, [closeDrawer, deleteEvent, editingId]);

    const submitting =
        upsertEvent.isPending ||
        cancelEvent.isPending ||
        deleteEvent.isPending ||
        promoteIdea.isPending;

    return (
        <Sheet open={isOpen} onClose={closeDrawer} ariaLabel="редактор события">
            {isOpen && (
                <div className="flex flex-col gap-4">
                    {editingId && isPastOccurrence && occurrenceDate && (
                        <MemoryCapture
                            eventId={editingId}
                            occurrenceDate={occurrenceDate}
                        />
                    )}
                    <EventForm
                        existing={editingId ? (existing ?? null) : null}
                        initialDate={initialDate ?? null}
                        initialTitle={promotionIdea?.title ?? null}
                        isPromotion={Boolean(promotionIdea)}
                        onSubmit={handleSubmit}
                        onCancel={closeDrawer}
                        onCancelEvent={
                            editingId && !promotionIdea
                                ? handleCancelEvent
                                : undefined
                        }
                        onDeleteEvent={
                            editingId && !promotionIdea
                                ? handleDeleteEvent
                                : undefined
                        }
                        submitting={submitting}
                    />
                </div>
            )}
        </Sheet>
    );
};

export default CalendarEventDrawer;
