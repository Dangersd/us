import { Suspense } from "react";

import { tv } from "tailwind-variants";

import RoomShell from "~components/shell/RoomShell";
import { HomeAmbient } from "~components/widgets/home";
import HomeGreetingServer from "~components/widgets/home/HomeGreetingServer";
import HomeMemoryServer from "~components/widgets/home/HomeMemoryServer";
import HomeNextPlanServer from "~components/widgets/home/HomeNextPlanServer";
import {
    HomeGreetingSkeleton,
    HomeMemorySkeleton,
    HomeMoodSkeleton,
    HomeNextPlanSkeleton,
    HomeRepairActiveSkeleton,
    HomeRepairEmptySkeleton,
    HomeWishlistPeekSkeleton,
} from "~components/widgets/home/HomeWidgetSkeletons";
import HomeWishlistPeekServer from "~components/widgets/home/HomeWishlistPeekServer";
import MoodPairServer from "~components/widgets/pair-glance/MoodPairServer";
import { RepairWidget } from "~components/widgets/repair";
import RepairWidgetServer from "~components/widgets/repair/RepairWidgetServer";
import { cn } from "~libs/utils";

// Home — server-orchestrator. Каждый виджет — отдельный server-component
// внутри собственного <Suspense>, со своим prefetch+HydrationBoundary. React
// streaming отдаёт shell мгновенно (виден loading.tsx → потом skeleton'ы),
// данные доезжают chunks по мере готовности. Медленный widget не блокирует
// соседей.
//
// Repair-данные шарятся между двумя slot'ами (active сверху, empty снизу) —
// один общий <RepairWidgetServer> оборачивает оба <RepairWidget> client-
// инстанции, prefetch активного эпизода случается один раз.
//
// Mobile = вертикальный стек. Desktop md+ = 2-колоночный grid (Mood 480px /
// NextPlan fill).

const layout = tv({
    slots: {
        root: cn(
            "relative flex flex-col gap-6",
            "md:grid md:grid-cols-[480px_1fr] md:gap-6",
        ),
        greetingSlot: cn("md:col-span-2"),
        repairActiveSlot: cn("md:col-span-2"),
        moodSlot: cn("md:col-span-1"),
        nextPlanSlot: cn("md:col-span-1"),
        memorySlot: cn("md:col-span-2"),
        wishlistSlot: cn("md:col-span-2"),
        repairEmptySlot: cn("md:col-span-2"),
    },
});

const HomePage = () => {
    const s = layout();
    return (
        <RoomShell roomId="home">
            <HomeAmbient />
            <div className={cn("relative", s.root())}>
                <div className={s.greetingSlot()}>
                    <Suspense fallback={<HomeGreetingSkeleton />}>
                        <HomeGreetingServer />
                    </Suspense>
                </div>
                <div className={s.repairActiveSlot()}>
                    <Suspense fallback={<HomeRepairActiveSkeleton />}>
                        <RepairWidgetServer>
                            <RepairWidget slot="active" />
                        </RepairWidgetServer>
                    </Suspense>
                </div>
                <div className={s.moodSlot()}>
                    <Suspense fallback={<HomeMoodSkeleton />}>
                        <MoodPairServer
                            userFallbackColor="#E8A87C"
                            partnerFallbackColor="#F4A5B9"
                            partnerMissingLabel="ещё не отметилась"
                        />
                    </Suspense>
                </div>
                <div className={s.nextPlanSlot()}>
                    <Suspense fallback={<HomeNextPlanSkeleton />}>
                        <HomeNextPlanServer />
                    </Suspense>
                </div>
                <div className={s.memorySlot()}>
                    <Suspense fallback={<HomeMemorySkeleton />}>
                        <HomeMemoryServer />
                    </Suspense>
                </div>
                <div className={s.wishlistSlot()}>
                    <Suspense fallback={<HomeWishlistPeekSkeleton />}>
                        <HomeWishlistPeekServer />
                    </Suspense>
                </div>
                <div className={s.repairEmptySlot()}>
                    <Suspense fallback={<HomeRepairEmptySkeleton />}>
                        <RepairWidgetServer>
                            <RepairWidget slot="empty" />
                        </RepairWidgetServer>
                    </Suspense>
                </div>
            </div>
        </RoomShell>
    );
};

export default HomePage;
