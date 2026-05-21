"use client";

import StarIcon from "~components/icons/StarIcon";
import type { AchievementDef } from "~config/achievements";
import { cn } from "~libs/utils";

export interface AchievementStarProps {
    def: AchievementDef;
    unlocked: boolean;
}

// Звезда в «созвездии». Locked — едва видна. Unlocked — тёплый glow.
// title-атрибут на native level даёт нативный hover-hint в десктоп-браузерах.
// На мобиле — текст под звездой («Первая луна») всегда показан мелким.
const AchievementStar = ({ def, unlocked }: AchievementStarProps) => {
    const isDormant = !def.enabled;
    return (
        <div
            className={cn("flex flex-col items-center gap-1.5 text-center")}
            title={`${def.title} — ${def.description}`}
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
        </div>
    );
};

export default AchievementStar;
