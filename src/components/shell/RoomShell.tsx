import type { ReactNode } from "react";

import { ROOMS, type RoomId } from "~config/rooms";
import { cn } from "~libs/utils";

// Wrapper каждой комнаты. Ambient glow + content area + placeholder hero.
// section получает aria-labelledby от h2, чтобы screen reader не дублировал заголовок.

interface RoomShellProps {
    roomId: RoomId;
    children?: ReactNode;
}

const RoomShell = ({ roomId, children }: RoomShellProps) => {
    const room = ROOMS[roomId];
    const titleId = `room-${roomId}-title`;
    return (
        <section
            aria-labelledby={titleId}
            className={cn(
                "relative flex-1",
                room.hueClass,
                "px-4 pt-4 pb-20",
                "md:px-10 md:pt-8 md:pb-8",
            )}
        >
            <div
                className={cn(
                    "mx-auto flex w-full max-w-3xl flex-col items-center",
                    "py-16 md:py-24",
                    "text-center",
                )}
            >
                <h2
                    id={titleId}
                    className={cn(
                        "font-display text-ink-primary",
                        "text-3xl md:text-4xl font-medium tracking-[-0.02em]",
                        "mb-4",
                    )}
                >
                    {room.title}
                </h2>
                <p className={cn("text-ink-secondary text-base max-w-md")}>
                    Комната скоро откроется.
                </p>
                {children ? (
                    <div className={cn("mt-10 w-full")}>{children}</div>
                ) : null}
            </div>
        </section>
    );
};

export default RoomShell;
