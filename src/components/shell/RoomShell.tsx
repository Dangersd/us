import type { ReactNode } from "react";

import { ROOMS, type RoomId } from "~config/rooms";
import { cn } from "~libs/utils";

// Wrapper каждой комнаты. Ambient glow + content area + placeholder hero.
// Заголовок комнаты НЕ рендерится здесь — каждая комната ставит свой header
// (или не ставит). Если children пуст, показываем нейтральный stub.

interface RoomShellProps {
    roomId: RoomId;
    children?: ReactNode;
}

const RoomShell = ({ roomId, children }: RoomShellProps) => {
    const room = ROOMS[roomId];
    const hasChildren = Boolean(children);
    return (
        <section
            aria-label={room.title}
            className={cn(
                "relative flex-1",
                room.hueClass,
                "px-4 pt-4 pb-20",
                "md:px-10 md:pt-8 md:pb-8",
            )}
        >
            <div
                className={cn(
                    "mx-auto flex w-full max-w-3xl flex-col items-stretch",
                    {
                        // Шиппнутые комнаты — компактный layout без dead-space.
                        "py-2 md:py-4": hasChildren,
                        // Stub-комнаты (calendar/wishlist/profile/home) пока висят
                        // в центре с placeholder-копией.
                        "items-center py-16 md:py-24 text-center": !hasChildren,
                    },
                )}
            >
                {hasChildren ? (
                    children
                ) : (
                    <p
                        className={cn(
                            "text-ink-secondary text-base max-w-md text-center",
                        )}
                    >
                        Комната скоро откроется.
                    </p>
                )}
            </div>
        </section>
    );
};

export default RoomShell;
