"use client";

import { tv } from "tailwind-variants";

import RoomShell from "~components/shell/RoomShell";
import {
    HomeAmbient,
    HomeGreeting,
    HomeMemoryOfTheDay,
    HomeNextPlan,
    HomeWishlistPeek,
} from "~components/widgets/home";
import { MoodPairGlance } from "~components/widgets/pair-glance";
import { RepairWidget } from "~components/widgets/repair";
import { cn } from "~libs/utils";

// Mobile = вертикальный стек. Desktop md+ = 2-колоночный grid (Mood 480px /
// NextPlan fill). RepairWidget рендерится в двух slot'ах: active — full-width
// под greeting (видим сразу при открытом эпизоде), empty — full-width в самом
// низу страницы (низкопрофильное приглашение, фича не для каждого дня). Оба
// slot'а зовут один и тот же query — React Query дедуплицирует.
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

const HomeClientPage = () => {
    const s = layout();
    return (
        <RoomShell roomId="home">
            <HomeAmbient />
            <div className={cn("relative", s.root())}>
                <div className={s.greetingSlot()}>
                    <HomeGreeting />
                </div>
                <div className={s.repairActiveSlot()}>
                    <RepairWidget slot="active" />
                </div>
                <div className={s.moodSlot()}>
                    <MoodPairGlance
                        userFallbackColor="#E8A87C"
                        partnerFallbackColor="#F4A5B9"
                        partnerMissingLabel="ещё не отметилась"
                    />
                </div>
                <div className={s.nextPlanSlot()}>
                    <HomeNextPlan />
                </div>
                <div className={s.memorySlot()}>
                    <HomeMemoryOfTheDay />
                </div>
                <div className={s.wishlistSlot()}>
                    <HomeWishlistPeek />
                </div>
                <div className={s.repairEmptySlot()}>
                    <RepairWidget slot="empty" />
                </div>
            </div>
        </RoomShell>
    );
};

export default HomeClientPage;
