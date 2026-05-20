"use client";

import { type ChangeEvent, useState } from "react";

import { tv } from "tailwind-variants";

import Button from "~components/ui/Button";
import Textarea from "~components/ui/Textarea";
import ChipGroup from "~components/widgets/calendar/event-drawer/ChipGroup";
import PhotoThumb from "~components/widgets/calendar/event-drawer/PhotoThumb";
import {
    MAX_MEMORY_NOTE_LENGTH,
    MAX_PHOTOS_PER_EVENT,
    MEMORY_MOOD_TAGS,
} from "~config/calendar";
import type {
    EventMemory,
    EventPhoto,
    MemoryMoodTag,
} from "~interfaces/calendar";
import { cn } from "~libs/utils";
import {
    useDeleteEventMemory,
    useDeleteEventPhoto,
    useEventMemory,
    useEventPhotos,
    useUploadEventPhoto,
    useUpsertEventMemory,
} from "~queries/calendar";

interface MemoryCaptureProps {
    eventId: string;
    occurrenceDate: string;
}

const styles = tv({
    slots: {
        root: cn(
            "flex flex-col gap-3",
            "rounded-2xl border border-border-subtle bg-bg-surface-2",
            "p-4",
        ),
        label: cn("text-[11px] uppercase tracking-wide text-ink-muted"),
        hint: cn("text-[11px] text-ink-muted"),
        title: cn("font-serif text-[16px] text-ink-primary"),
        photos: cn("flex flex-wrap items-center gap-2"),
        addPhoto: cn(
            "flex h-20 w-20 items-center justify-center shrink-0",
            "rounded-xl border border-dashed border-border-warm",
            "text-ink-secondary",
            "transition-colors hover:bg-bg-surface-3",
        ),
        actions: cn("flex items-center justify-end gap-2"),
        err: cn("text-[12px] text-status-error"),
    },
});

// Outer: подгружает memory + photos, передаёт через key чтобы Inner
// перемонтился когда memory.id меняется (React 19 anti-pattern setState-in-
// effect: вместо useEffect remount). Loading state: пока memory не пришла,
// рендерим Inner с null seed.
const MemoryCapture = ({ eventId, occurrenceDate }: MemoryCaptureProps) => {
    const { data: memory } = useEventMemory(eventId, occurrenceDate);
    const { data: existingPhotos = [] } = useEventPhotos(
        eventId,
        occurrenceDate,
    );

    return (
        <MemoryCaptureForm
            key={memory?.id ?? "empty"}
            eventId={eventId}
            occurrenceDate={occurrenceDate}
            memory={memory ?? null}
            existingPhotos={existingPhotos}
        />
    );
};

interface MemoryCaptureFormProps {
    eventId: string;
    occurrenceDate: string;
    memory: EventMemory | null;
    existingPhotos: EventPhoto[];
}

const MemoryCaptureForm = ({
    eventId,
    occurrenceDate,
    memory,
    existingPhotos,
}: MemoryCaptureFormProps) => {
    const { root, label, hint, title, photos, addPhoto, actions, err } =
        styles();

    const [moodTag, setMoodTag] = useState<MemoryMoodTag | null>(
        memory?.moodTag ?? null,
    );
    const [note, setNote] = useState(memory?.note ?? "");
    const [uploadError, setUploadError] = useState<string | null>(null);

    const upsertMemory = useUpsertEventMemory();
    const deleteMemory = useDeleteEventMemory();
    const uploadPhoto = useUploadEventPhoto();
    const deletePhoto = useDeleteEventPhoto();

    const canSave = moodTag !== null || note.trim().length > 0;

    const handleSave = async () => {
        if (!canSave) return;
        await upsertMemory.mutateAsync({
            eventId,
            occurrenceDate,
            moodTag,
            note: note.trim() || null,
        });
    };

    const handleClear = async () => {
        if (memory) {
            await deleteMemory.mutateAsync({ eventId, occurrenceDate });
        }
        setMoodTag(null);
        setNote("");
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setUploadError(null);
        try {
            await uploadPhoto.mutateAsync({
                eventId,
                occurrenceDate,
                file,
            });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "загрузка не удалась";
            setUploadError(message);
        }
    };

    const handleDeletePhoto = (photo: EventPhoto) => {
        deletePhoto.mutate(photo);
    };

    const photosFull = existingPhotos.length >= MAX_PHOTOS_PER_EVENT;
    const submitting =
        upsertMemory.isPending ||
        deleteMemory.isPending ||
        uploadPhoto.isPending ||
        deletePhoto.isPending;

    return (
        <div className={root()}>
            <div className="flex flex-col gap-1">
                <span className={title()}>Как было?</span>
                <span className={hint()}>
                    можно отметить настроение, добавить заметку или фото
                </span>
            </div>

            <div className="flex flex-col gap-1.5">
                <span className={label()}>настроение</span>
                <ChipGroup<MemoryMoodTag>
                    options={MEMORY_MOOD_TAGS.map((t) => ({
                        id: t.id,
                        label: t.label,
                        color: t.color,
                    }))}
                    selected={moodTag}
                    onChange={(id) =>
                        setMoodTag((cur) => (cur === id ? null : id))
                    }
                    ariaLabel="настроение воспоминания"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={label()} htmlFor="mem-note">
                    заметка
                </label>
                <Textarea
                    id="mem-note"
                    rows={3}
                    placeholder="что осталось от этого дня"
                    value={note}
                    maxLength={MAX_MEMORY_NOTE_LENGTH}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <span className={label()}>фото</span>
                <div className={photos()}>
                    {existingPhotos.map((p) => (
                        <PhotoThumb
                            key={p.id}
                            photo={p}
                            onDelete={handleDeletePhoto}
                        />
                    ))}
                    {!photosFull && (
                        <label
                            className={cn(addPhoto(), "cursor-pointer")}
                            aria-label="добавить фото"
                        >
                            +
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={uploadPhoto.isPending}
                            />
                        </label>
                    )}
                </div>
                {uploadError && <span className={err()}>{uploadError}</span>}
            </div>

            <div className={actions()}>
                {memory && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        disabled={submitting}
                    >
                        очистить
                    </Button>
                )}
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={!canSave || submitting}
                >
                    {memory ? "обновить" : "сохранить"}
                </Button>
            </div>
        </div>
    );
};

export default MemoryCapture;
