import Link from "next/link";
import { type VariantProps, tv } from "tailwind-variants";

import type { RoomConfig } from "~config/rooms";
import { cn } from "~libs/utils";

// RSC — никаких хуков, active передаётся пропсом из BottomNav.

const item = tv({
    slots: {
        wrapper: cn(
            "inline-flex h-12 w-14 items-center justify-center",
            "rounded-md transition-colors duration-300",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
        ),
        icon: cn(
            "h-6 w-6 transition-[color,transform,filter] duration-300",
            "ease-[cubic-bezier(0.22,1,0.36,1)]",
        ),
    },
    variants: {
        active: {
            true: {
                wrapper: cn("bg-border-warm"),
                icon: cn(
                    "text-ink-primary scale-110",
                    "drop-shadow-[0_0_10px_rgba(255,201,168,0.35)]",
                ),
            },
            false: {
                wrapper: cn("bg-transparent"),
                icon: cn("text-ink-secondary"),
            },
        },
    },
    defaultVariants: { active: false },
});

type ItemVariants = VariantProps<typeof item>;

interface BottomNavItemProps extends ItemVariants {
    room: RoomConfig;
}

const BottomNavItem = ({ room, active }: BottomNavItemProps) => {
    const { wrapper, icon } = item({ active });
    const Icon = room.Icon;
    if (!Icon) return null;
    return (
        <Link
            href={room.route}
            aria-label={room.title}
            aria-current={active ? "page" : undefined}
            className={wrapper()}
        >
            <Icon className={icon()} />
        </Link>
    );
};

export default BottomNavItem;
