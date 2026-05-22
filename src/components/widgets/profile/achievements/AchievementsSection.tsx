"use client";

import { useCallback, useMemo } from "react";

import { tv } from "tailwind-variants";

import AchievementStar from "~components/widgets/profile/achievements/AchievementStar";
import { useAchievementToasts } from "~components/widgets/profile/achievements/useAchievementToasts";
import { useOpenAchievementModal } from "~components/widgets/profile/achievements/useOpenAchievementModal";
import { ACHIEVEMENTS, type AchievementDef } from "~config/achievements";
import type { AchievementUnlock } from "~interfaces/achievements";
import type { AppUser } from "~interfaces/user";
import { cn } from "~libs/utils";
import { useAchievements } from "~queries/achievements/use-achievements";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-3 py-4"),
        title: cn("text-[11px] uppercase tracking-wider text-ink-muted px-1"),
        grid: cn("grid grid-cols-4 sm:grid-cols-6 gap-3 pt-1"),
    },
});

export interface AchievementsSectionProps {
    me: AppUser;
    className?: string;
}

// Структура отметок: для каждого known-key хранится статус «зажжённости»
// (lit) и unlocked_at (если разлокирована). couple-scope unlock зажжён
// для обоих партнёров; user-scope — только для своего юзера.
interface StarStatus {
    lit: boolean;
    unlockedAt: string | null;
}

function buildStatusMap(
    unlocks: AchievementUnlock[] | undefined,
    meId: string,
): Map<string, StarStatus> {
    const map = new Map<string, StarStatus>();
    if (!unlocks) return map;
    for (const u of unlocks) {
        const litForMe = u.scope === "couple" || u.unlockedByUserId === meId;
        if (!litForMe) continue;
        // Берём самый ранний unlockedAt если по какой-то причине дубли.
        const prev = map.get(u.key);
        if (!prev || u.unlockedAt < (prev.unlockedAt ?? "9999")) {
            map.set(u.key, { lit: true, unlockedAt: u.unlockedAt });
        }
    }
    return map;
}

const AchievementsSection = ({ me, className }: AchievementsSectionProps) => {
    const { root, title, grid } = styles();
    const { data: unlocks } = useAchievements();
    useAchievementToasts();
    const openAchievement = useOpenAchievementModal();

    const statusMap = useMemo(
        () => buildStatusMap(unlocks, me.id),
        [unlocks, me.id],
    );

    const handleStarClick = useCallback(
        (def: AchievementDef) => {
            if (!def.enabled) {
                openAchievement(def, { kind: "dormant" });
                return;
            }
            const s = statusMap.get(def.key);
            if (s?.lit) {
                openAchievement(def, {
                    kind: "unlocked",
                    unlockedAt: s.unlockedAt,
                });
            } else {
                openAchievement(def, { kind: "locked" });
            }
        },
        [openAchievement, statusMap],
    );

    return (
        <section className={cn(root(), className)}>
            <h2 className={title()}>Созвездие</h2>
            <div className={grid()}>
                {ACHIEVEMENTS.map((def) => (
                    <AchievementStar
                        key={def.key}
                        def={def}
                        unlocked={statusMap.get(def.key)?.lit ?? false}
                        onSelect={handleStarClick}
                    />
                ))}
            </div>
        </section>
    );
};

export default AchievementsSection;
