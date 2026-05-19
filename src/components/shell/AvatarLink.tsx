// Аватар в TopBar — кликабельный <Link> в Profile.
// RSC — никаких хуков, prefetch работает из коробки.
import Link from "next/link";
import { type VariantProps, tv } from "tailwind-variants";

import { PROFILE_R } from "~config/routes";
import type { Gender } from "~interfaces/user";
import { cn, initialOf } from "~libs/utils";

const avatar = tv({
    base: cn(
        "inline-flex items-center justify-center",
        "rounded-full border border-border-warm",
        "font-display font-medium text-ink-primary select-none",
        "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "active:scale-[0.95]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
    ),
    variants: {
        size: {
            sm: cn("h-8 w-8 text-sm"),
            md: cn("h-10 w-10 text-base"),
        },
        hue: {
            male: cn("bg-personal-hue-him"),
            female: cn("bg-personal-hue-her"),
        },
    },
    defaultVariants: { size: "sm", hue: "male" },
});

type AvatarVariants = VariantProps<typeof avatar>;

interface AvatarLinkProps extends AvatarVariants {
    gender: Gender;
    displayName: string;
    className?: string;
}

const AvatarLink = ({
    gender,
    displayName,
    size,
    className,
}: AvatarLinkProps) => (
    <Link
        href={PROFILE_R()}
        aria-label={`Профиль: ${displayName}`}
        className={cn(avatar({ size, hue: gender }), className)}
    >
        {initialOf(displayName)}
    </Link>
);

export default AvatarLink;
