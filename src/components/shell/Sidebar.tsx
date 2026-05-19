import SidebarNavItem from "~components/shell/SidebarNavItem";
import SidebarProfileItem from "~components/shell/SidebarProfileItem";
import { NAV_ROOMS, type RoomId } from "~config/rooms";
import type { AppUser } from "~interfaces/user";
import { cn } from "~libs/utils";

// Desktop-only sidebar 240px. На mobile скрыт.
// Sidebar — RSC; activeId получает пропсом от AppShell (client),
// чтобы избежать дублирования useActiveRoom().

interface SidebarProps {
    user: AppUser;
    activeId: RoomId | null;
}

const Sidebar = ({ user, activeId }: SidebarProps) => (
    <aside
        aria-label="Боковая навигация"
        className={cn(
            "hidden md:flex md:w-60 md:flex-col",
            "border-r border-border-subtle bg-bg-base/95",
            "px-4 py-6",
        )}
    >
        <div className={cn("mb-6 px-2")}>
            <span
                className={cn(
                    "font-display text-2xl font-medium text-ink-primary",
                    "tracking-[-0.02em]",
                )}
            >
                us
            </span>
        </div>

        <nav className={cn("flex flex-col gap-1")}>
            {NAV_ROOMS.map((room) => (
                <SidebarNavItem
                    key={room.id}
                    room={room}
                    active={activeId === room.id}
                />
            ))}
        </nav>

        <div className={cn("mt-auto pt-4 border-t border-border-subtle")}>
            <SidebarProfileItem user={user} active={activeId === "profile"} />
        </div>
    </aside>
);

export default Sidebar;
