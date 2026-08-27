"use client";

import Container from "~components/layout/Container";
import AvatarLink from "~components/shell/AvatarLink";
import PartnerStatus from "~components/shell/PartnerStatus";
import { useActiveRoom } from "~components/shell/use-active-room";
import { ROOMS } from "~config/rooms";
import type { AppUser } from "~interfaces/user";
import { cn } from "~libs/utils";

// Sticky top bar: partner status + room title (mobile) + avatar.
// PartnerStatus в 0.4 — статический stub. Real-time — 0.5+.

interface TopBarProps {
    user: AppUser;
}

const TopBar = ({ user }: TopBarProps) => {
    const activeId = useActiveRoom();
    // Fallback на «Дом» — если pathname неизвестен (transient state на 404),
    // показываем нейтральный заголовок вместо пустоты.
    const title = ROOMS[activeId ?? "home"].title;

    return (
        <header
            className={cn(
                "sticky top-0 z-30 w-full",
                "bg-bg-base/60 backdrop-blur-2xl",
                "pt-[env(safe-area-inset-top)]",
            )}
        >
            <Container size="md">
                <div
                    className={cn(
                        "relative flex h-14 items-center justify-between",
                        "md:h-16",
                    )}
                >
                    <PartnerStatus />

                    <h1
                        className={cn(
                            "absolute left-1/2 -translate-x-1/2",
                            "font-display text-base lowercase tracking-wide",
                            "text-ink-secondary",
                            "md:hidden",
                        )}
                    >
                        {title}
                    </h1>

                    <AvatarLink
                        gender={user.gender}
                        displayName={user.displayName}
                    />
                </div>
            </Container>
        </header>
    );
};

export default TopBar;
