"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MAX_IMAGE_DIMENSION } from "~config/calendar";
import type { EventPhoto } from "~interfaces/calendar";
import { getBrowserSupabase } from "~libs/supabase/client";
import { calendarKeys } from "~queries/calendar/keys";
import {
    EVENT_PHOTO_COLUMNS,
    type EventPhotoRow,
    mapEventPhotoRow,
} from "~queries/calendar/map-event-photo-row";

interface UploadEventPhotoInput {
    eventId: string;
    occurrenceDate: string;
    file: File;
}

// Client-side compress + EXIF strip через canvas re-encode. Затем upload
// напрямую в Supabase Storage (path-prefix-by-couple enforce'ится storage
// policies). Затем insert event_photos row — trigger derive'ит couple_id
// из event и проверит max-3 per occurrence.
//
// Path convention: ${couple_id}/${event_id}/${random}.jpg
export function useUploadEventPhoto() {
    const qc = useQueryClient();

    return useMutation<EventPhoto, Error, UploadEventPhotoInput>({
        mutationFn: async ({ eventId, occurrenceDate, file }) => {
            const supabase = getBrowserSupabase();
            const { data: auth } = await supabase.auth.getUser();
            if (!auth?.user) throw new Error("not_authenticated");

            const { blob, width, height } = await compressImage(file);

            // Couple_id берём из cached user (page-level prefetch'ит).
            // Безопасный fallback — fetch fresh row, но в hot path не нужно.
            const { data: userRow } = await supabase
                .from("users")
                .select("couple_id")
                .eq("id", auth.user.id)
                .single<{ couple_id: string }>();
            if (!userRow) throw new Error("user_row_missing");

            const photoId = crypto.randomUUID();
            const path = `${userRow.couple_id}/${eventId}/${photoId}.jpg`;

            const { error: uploadErr } = await supabase.storage
                .from("event-photos")
                .upload(path, blob, {
                    contentType: "image/jpeg",
                    upsert: false,
                });
            if (uploadErr) throw uploadErr;

            const { data: row, error: insertErr } = await supabase
                .from("event_photos")
                .insert({
                    id: photoId,
                    event_id: eventId,
                    occurrence_date: occurrenceDate,
                    storage_path: path,
                    width,
                    height,
                    created_by: auth.user.id,
                })
                .select(EVENT_PHOTO_COLUMNS)
                .single<EventPhotoRow>();

            if (insertErr) {
                // Row insert failed (constraint, max-3, etc.) — cleanup
                // storage object чтобы не оставить orphan.
                await supabase.storage
                    .from("event-photos")
                    .remove([path])
                    .catch(() => undefined);
                throw insertErr;
            }
            return mapEventPhotoRow(row);
        },

        onSuccess: (data) => {
            qc.invalidateQueries({
                queryKey: calendarKeys.eventPhotos(
                    data.eventId,
                    data.occurrenceDate,
                ),
            });
        },
    });
}

interface CompressResult {
    blob: Blob;
    width: number;
    height: number;
}

async function compressImage(file: File): Promise<CompressResult> {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(
        1,
        MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.round(bitmap.width * ratio);
    const height = Math.round(bitmap.height * ratio);

    const canvas =
        typeof OffscreenCanvas !== "undefined"
            ? new OffscreenCanvas(width, height)
            : (() => {
                  const c = document.createElement("canvas");
                  c.width = width;
                  c.height = height;
                  return c;
              })();
    const ctx = (canvas as HTMLCanvasElement).getContext("2d");
    if (!ctx) throw new Error("canvas_2d_unavailable");
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await (canvas instanceof OffscreenCanvas
        ? canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 })
        : new Promise<Blob>((resolve, reject) => {
              (canvas as HTMLCanvasElement).toBlob(
                  (b) => (b ? resolve(b) : reject(new Error("toBlob_failed"))),
                  "image/jpeg",
                  0.85,
              );
          }));

    return { blob, width, height };
}
