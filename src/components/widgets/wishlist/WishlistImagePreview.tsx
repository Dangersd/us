"use client";

import { useState } from "react";

import { WISHLIST_CATEGORY_BY_ID } from "~config/wishlist";
import WishlistIcon from "~icons/shell/WishlistIcon";
import type { WishlistCategory } from "~interfaces/wishlist";
import { cn } from "~libs/utils";

export interface WishlistImagePreviewProps {
    url: string | null;
    title: string;
    category: WishlistCategory;
    // Опц. override классов (для использования вне 1:1 card-cell).
    className?: string;
}

// Рендерит 1:1 превью с тремя ветками:
// 1. url есть и грузится / отобразился — img tag (raw, не next/image — без
//    allowlist remotePatterns в next.config).
// 2. url есть, но 404 / load failed — переключаемся на no-image fallback.
// 3. url нет — no-image fallback с radial-gradient'ом category цвета.
const WishlistImagePreview = ({
    url,
    title,
    category,
    className,
}: WishlistImagePreviewProps) => {
    const [broken, setBroken] = useState(false);
    const showFallback = !url || broken;
    const dot = WISHLIST_CATEGORY_BY_ID[category].dot;

    return (
        <div
            className={cn(
                "relative aspect-square w-full overflow-hidden rounded-2xl",
                "bg-bg-surface-2",
                className,
            )}
        >
            {!showFallback && url ? (
                // Намеренно raw <img>: user-supplied URLs не whitelist'нуты
                // в next.config.images.remotePatterns. Перенос на Next/Image
                // — отдельный 0.7.5 шаг (см. план Open items).
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={url}
                    alt={title}
                    loading="lazy"
                    onError={() => setBroken(true)}
                    className={cn(
                        "absolute inset-0 h-full w-full object-cover",
                    )}
                />
            ) : (
                <div
                    aria-hidden
                    className={cn(
                        "absolute inset-0 flex items-center justify-center",
                    )}
                    style={{
                        backgroundImage: `radial-gradient(circle at 50% 45%, ${dot}14, transparent 70%)`,
                    }}
                >
                    <WishlistIcon className={cn("size-8 text-ink-muted/40")} />
                </div>
            )}
        </div>
    );
};

export default WishlistImagePreview;
