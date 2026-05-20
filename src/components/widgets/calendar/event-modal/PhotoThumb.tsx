"use client";

import Image from "next/image";
import { tv } from "tailwind-variants";

import Button from "~components/ui/Button";
import type { EventPhoto } from "~interfaces/calendar";
import { cn } from "~libs/utils";
import { useEventPhotoUrl } from "~queries/calendar";

const styles = tv({
    slots: {
        root: cn(
            "relative shrink-0 overflow-hidden rounded-xl",
            "h-20 w-20 bg-bg-surface-2",
        ),
        img: cn("h-full w-full object-cover"),
        skeleton: cn("h-full w-full animate-pulse bg-bg-surface-3"),
        delete: cn(
            "absolute right-1 top-1",
            "h-6 w-6 rounded-full",
            "bg-black/60 text-ink-primary",
            "text-xs leading-none",
            "flex items-center justify-center",
            "transition-opacity opacity-0 group-hover:opacity-100",
        ),
        wrap: cn("group"),
    },
});

interface PhotoThumbProps {
    photo: EventPhoto;
    onDelete?: (photo: EventPhoto) => void;
}

const PhotoThumb = ({ photo, onDelete }: PhotoThumbProps) => {
    const { root, img, skeleton, delete: del, wrap } = styles();
    const { data: url, isPending } = useEventPhotoUrl(photo.storagePath);

    return (
        <div className={cn(wrap(), "relative")}>
            <div className={root()}>
                {isPending || !url ? (
                    <div className={skeleton()} />
                ) : (
                    <Image
                        src={url}
                        alt={photo.caption ?? "фото события"}
                        fill
                        sizes="80px"
                        className={img()}
                        unoptimized
                    />
                )}
            </div>
            {onDelete && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={del()}
                    onClick={() => onDelete(photo)}
                    aria-label="удалить фото"
                >
                    ×
                </Button>
            )}
        </div>
    );
};

export default PhotoThumb;
