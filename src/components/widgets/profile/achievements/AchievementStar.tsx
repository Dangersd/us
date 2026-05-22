"use client";

import StarIcon from "~components/icons/StarIcon";
import type { AchievementDef } from "~config/achievements";
import { cn } from "~libs/utils";

export interface AchievementStarProps {
    def: AchievementDef;
    unlocked: boolean;
    onSelect: (def: AchievementDef) => void;
}

// Звезда в «созвездии». Locked — едва видна. Unlocked — тёплый glow.
// Тап/клик открывает detail-модалку с описанием и критерием (см.
// AchievementDetailModal).
const AchievementStar = ({ def, unlocked, onSelect }: AchievementStarProps) => {
    const isDormant = !def.enabled;
    return (
        <button
            type="button"
            onClick={() => onSelect(def)}
            className={cn(
                "flex flex-col items-center gap-1.5 text-center",
                "rounded-md p-1",
                "transition-colors duration-200",
                "hover:bg-bg-surface-1/60",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
            )}
            aria-label={`${def.title}${unlocked ? " — получено" : ""}`}
        >
            <StarIcon
                className={cn(
                    "transition-opacity duration-500",
                    unlocked
                        ? "text-glow-warm opacity-100 drop-shadow-[0_0_8px_rgba(255,201,168,0.5)]"
                        : isDormant
                          ? "text-ink-muted opacity-10"
                          : "text-ink-muted opacity-25",
                )}
            />
            <span
                className={cn(
                    "text-[10px] leading-tight px-1",
                    unlocked ? "text-ink-secondary" : "text-ink-muted",
                )}
            >
                {def.title}
            </span>
        </button>
    );
};

export default AchievementStar;
