import Container from "~components/layout/Container";
import BottomNavItem from "~components/shell/BottomNavItem";
import { NAV_ROOMS, type RoomId } from "~config/rooms";
import { cn } from "~libs/utils";

// Mobile-only fixed bottom nav. На desktop скрыт через md:hidden.
// activeId приходит пропсом — RSC, без хуков.

interface BottomNavProps {
    activeId: RoomId | null;
}

const BottomNav = ({ activeId }: BottomNavProps) => (
    <nav
        aria-label="Основная навигация"
        className={cn(
            "fixed bottom-0 left-0 right-0 z-30",
            "md:hidden",
            "bg-bg-base/70 backdrop-blur-2xl",
            "border-t border-border-subtle",
            "pb-[env(safe-area-inset-bottom)] pt-2",
        )}
    >
        <Container size="xl">
            <ul className={cn("flex h-16 items-center justify-around")}>
                {NAV_ROOMS.map((room) => (
                    <li key={room.id}>
                        <BottomNavItem
                            room={room}
                            active={activeId === room.id}
                        />
                    </li>
                ))}
            </ul>
        </Container>
    </nav>
);

export default BottomNav;
