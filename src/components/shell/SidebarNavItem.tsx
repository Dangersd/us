import Link from "next/link";
import { type VariantProps, tv } from "tailwind-variants";

import type { RoomConfig } from "~config/rooms";

// RSC — active пропсом из Sidebar; никаких хуков.

const item = tv({
    slots: {
        wrapper: [
            "flex h-12 items-center gap-3 px-3 rounded-sm",
            "transition-colors duration-300",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
            "hover:bg-bg-surface-1",
        ].join(" "),
        icon: "h-5 w-5",
        label: "text-base font-normal",
    },
    variants: {
        active: {
            true: {
                wrapper: "bg-bg-surface-1",
                icon: "text-glow-warm drop-shadow-[0_0_10px_rgba(255,201,168,0.5)]",
                label: "text-ink-primary",
            },
            false: {
                wrapper: "",
                icon: "text-ink-secondary",
                label: "text-ink-secondary",
            },
        },
    },
    defaultVariants: { active: false },
});

type ItemVariants = VariantProps<typeof item>;

interface SidebarNavItemProps extends ItemVariants {
    room: RoomConfig;
}

const SidebarNavItem = ({ room, active }: SidebarNavItemProps) => {
    const { wrapper, icon, label } = item({ active });
    const Icon = room.Icon;
    if (!Icon) return null;
    return (
        <Link
            href={room.route}
            aria-current={active ? "page" : undefined}
            className={wrapper()}
        >
            <Icon className={icon()} />
            <span className={label()}>{room.title}</span>
        </Link>
    );
};

export default SidebarNavItem;
