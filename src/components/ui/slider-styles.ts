// src/components/ui/slider-styles.ts
// tv() config для <Slider />. Вынесено из Slider.tsx ради file-lines.md (200 max).
//
// 2 ориентации × 2 тона = 4 fill-gradient'а. Gradient-utility-классы зарегистрированы
// в src/styles/utilities.css (bg-slider-{tone}-{h|v}).
//
// Hit-zone: root высота 44px (h-11) для WCAG 2.5.5 touch-target. Видимый track —
// 8px (h-2), центрирован через top-1/2. Slider визуально остаётся "тонкой полосой",
// тапается во всю 44px-зону.
import { tv } from "tailwind-variants";

import { cn } from "~libs/utils";

export const sliderStyles = tv({
    slots: {
        root: cn(
            "relative touch-none select-none",
            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus",
        ),
        track: cn(
            "absolute rounded-full bg-bg-surface-2",
            "transition-colors duration-200",
        ),
        fill: cn("absolute rounded-full"),
        handle: cn(
            "absolute rounded-full bg-glow-warm",
            "border-2 border-bg-base shadow-soft",
            "transition-[box-shadow] duration-200",
            "group-hover:shadow-warm group-focus-visible:shadow-warm",
        ),
        halo: cn("absolute rounded-full opacity-40"),
    },
    variants: {
        orientation: {
            horizontal: {
                // R11: 44px hit-zone (h-11) для WCAG touch-target, видимый track h-2.
                root: cn("h-11 w-full"),
                track: cn("inset-x-0 top-1/2 h-2 -translate-y-1/2"),
                fill: cn("left-0 top-1/2 h-2 -translate-y-1/2"),
                handle: cn("top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2"),
                halo: cn("top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2"),
            },
            vertical: {
                root: cn("h-full w-11"),
                track: cn("inset-y-0 left-1/2 w-2 -translate-x-1/2"),
                fill: cn("bottom-0 left-1/2 w-2 -translate-x-1/2"),
                handle: cn(
                    "left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2",
                ),
                halo: cn("left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2"),
            },
        },
        tone: {
            energy: { halo: cn("bg-glow-warm") },
            stress: { halo: cn("bg-status-success") },
        },
    },
    compoundVariants: [
        {
            tone: "energy",
            orientation: "horizontal",
            class: { fill: "bg-slider-energy-h" },
        },
        {
            tone: "energy",
            orientation: "vertical",
            class: { fill: "bg-slider-energy-v" },
        },
        {
            tone: "stress",
            orientation: "horizontal",
            class: { fill: "bg-slider-stress-h" },
        },
        {
            tone: "stress",
            orientation: "vertical",
            class: { fill: "bg-slider-stress-v" },
        },
    ],
    defaultVariants: { orientation: "horizontal" },
});
