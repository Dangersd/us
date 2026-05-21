"use client";

import { useMemo } from "react";

import { tv } from "tailwind-variants";

import AchievementStar from "~components/widgets/profile/achievements/AchievementStar";
import { useAchievementToasts } from "~components/widgets/profile/achievements/useAchievementToasts";
import { ACHIEVEMENTS } from "~config/achievements";
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

const AchievementsSection = ({ me, className }: AchievementsSectionProps) => {
    const { root, title, grid } = styles();
    const { data: unlocks } = useAchievements();
    useAchievementToasts();

    // unlockKeysForViewer — что считается «зажжённой звездой» для текущего юзера.
    // couple-scope unlock зажжён всегда (общий). user-scope зажжён только если
    // unlockedByUserId === me.id.
    const lit = useMemo(() => {
        const set = new Set<string>();
        for (const u of unlocks ?? []) {
            if (u.scope === "couple") {
                set.add(u.key);
            } else if (u.unlockedByUserId === me.id) {
                set.add(u.key);
            }
        }
        return set;
    }, [unlocks, me.id]);

    return (
        <section className={cn(root(), className)}>
            <h2 className={title()}>Созвездие</h2>
            <div className={grid()}>
                {ACHIEVEMENTS.map((def) => (
                    <AchievementStar
                        key={def.key}
                        def={def}
                        unlocked={lit.has(def.key)}
                    />
                ))}
            </div>
        </section>
    );
};

export default AchievementsSection;
