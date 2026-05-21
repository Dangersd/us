import type { ReactNode } from "react";

import Container from "~components/layout/Container";
import { ROOMS, type RoomId } from "~config/rooms";
import { cn } from "~libs/utils";

// Wrapper каждой комнаты. Ambient glow + content area + placeholder hero.
// Заголовок комнаты НЕ рендерится здесь — каждая комната ставит свой header
// (или не ставит). Если children пуст, показываем нейтральный stub.
//
// Боковые отступы и max-width — через <Container/>. Никаких px-4 md:px-10
// здесь: см. .claude/rules/styles.md → container-padding pattern.

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
                "pt-4 pb-20 md:pt-8 md:pb-8",
            )}
        >
            <Container size="md">
                <div
                    className={cn("flex w-full flex-col items-stretch", {
                        "py-2 md:py-4": hasChildren,
                        "items-center py-16 md:py-24 text-center": !hasChildren,
                    })}
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
            </Container>
        </section>
    );
};

export default RoomShell;
