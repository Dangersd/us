import Link from "next/link";

import { PROFILE_R } from "~config/routes";
import type { AppUser } from "~interfaces/user";
import { cn, initialOf } from "~libs/utils";

interface SidebarProfileItemProps {
    user: AppUser;
    active: boolean;
}

const SidebarProfileItem = ({ user, active }: SidebarProfileItemProps) => {
    const initial = initialOf(user.displayName);
    return (
        <Link
            href={PROFILE_R()}
            aria-current={active ? "page" : undefined}
            className={cn(
                "flex h-12 items-center gap-3 px-3 rounded-sm",
                "transition-colors duration-300 hover:bg-bg-surface-1",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
                { "bg-bg-surface-1": active },
            )}
        >
            <span
                aria-hidden
                className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full",
                    "border border-border-warm",
                    "font-display text-sm font-medium text-ink-primary select-none",
                    {
                        "bg-personal-hue-him": user.gender === "male",
                        "bg-personal-hue-her": user.gender === "female",
                    },
                )}
            >
                {initial}
            </span>
            <span
                className={cn("text-base", {
                    "text-ink-primary": active,
                    "text-ink-secondary": !active,
                })}
            >
                {user.displayName}
            </span>
        </Link>
    );
};

export default SidebarProfileItem;
