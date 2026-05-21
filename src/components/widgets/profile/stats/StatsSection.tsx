"use client";

import { tv } from "tailwind-variants";

import DaysCard from "~components/widgets/profile/stats/DaysCard";
import MemoriesCountCard from "~components/widgets/profile/stats/MemoriesCountCard";
import TopCategoriesCard from "~components/widgets/profile/stats/TopCategoriesCard";
import TopEmotionsCard from "~components/widgets/profile/stats/TopEmotionsCard";
import TopPlacesCard from "~components/widgets/profile/stats/TopPlacesCard";
import TopWishlistCategoryCard from "~components/widgets/profile/stats/TopWishlistCategoryCard";
import type { Couple } from "~interfaces/couple";
import type { AppUser } from "~interfaces/user";
import { COUPLE_TZ, todayDateString } from "~libs/date";
import { daysBetween } from "~libs/days-counter";
import { cn } from "~libs/utils";
import { useCoupleStats } from "~queries/stats/use-couple-stats";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-3 py-4"),
        title: cn("text-[11px] uppercase tracking-wider text-ink-muted px-1"),
        grid: cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"),
    },
});

export interface StatsSectionProps {
    me: AppUser;
    partner: AppUser | null;
    couple: Couple | null;
    className?: string;
}

const StatsSection = ({
    me,
    partner,
    couple,
    className,
}: StatsSectionProps) => {
    const { root, title, grid } = styles();
    const { data: stats } = useCoupleStats();
    const today = todayDateString(COUPLE_TZ);

    const acquaintedDays = couple?.acquaintanceDate
        ? daysBetween(couple.acquaintanceDate, today)
        : null;
    const togetherDays = couple?.relationshipStartDate
        ? daysBetween(couple.relationshipStartDate, today)
        : null;

    // Graceful empty-state: если RPC ничего не вернул — секция всё равно
    // показывает DaysCard (он работает на couple-данных без RPC) + пустые
    // карточки. Если хочется полной тишины — early-return null.
    return (
        <section className={cn(root(), className)}>
            <h2 className={title()}>Мы в цифрах</h2>
            <div className={grid()}>
                <DaysCard
                    acquaintedDays={acquaintedDays}
                    togetherDays={togetherDays}
                />
                <TopPlacesCard places={stats?.topPlaces ?? []} />
                <TopCategoriesCard categories={stats?.topCategories ?? []} />
                <TopEmotionsCard
                    myEmotion={stats?.myTopEmotion ?? null}
                    partnerEmotion={stats?.partnerTopEmotion ?? null}
                    myGender={me.gender}
                    partnerGender={partner?.gender ?? null}
                    partnerName={partner?.displayName ?? null}
                />
                <TopWishlistCategoryCard
                    category={stats?.topWishlistCategory ?? null}
                />
                <MemoriesCountCard count={stats?.memoriesCount ?? 0} />
            </div>
        </section>
    );
};

export default StatsSection;
