import type { ReactNode } from "react";

import { cn } from "~libs/utils";

// Page-level container. Inspired by indigo-spa/src/components/layout/Container.tsx.
// Все боковые отступы страницы должны идти через этот компонент или через
// `container-padding` utility — никаких хардкодов px-4/md:px-10 в страничных
// компонентах.
//
// variant:
//   - "default" — горизонтальный padding + max-w + center. Базовый случай.
//   - "page"    — вертикальная колонка с gap/padding (для полностраничных
//                 layout'ов где нужны вертикальные отступы тоже).
//
// size — cap content width. md ≈ 768px, lg ≈ 1024px, xl ≈ 1280px.
export interface ContainerProps {
    children: ReactNode;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "default" | "page";
}

const Container = ({
    children,
    className,
    size = "lg",
    variant = "default",
}: ContainerProps) => (
    <div
        className={cn(
            {
                "container-padding mx-auto w-full": variant === "default",
                "container-padding mx-auto w-full flex flex-col gap-2.5 py-3 lg:gap-5 lg:py-5":
                    variant === "page",
            },
            {
                "max-w-screen-sm": size === "sm", // ~640px
                "max-w-3xl": size === "md", // ~768px
                "max-w-5xl": size === "lg", // ~1024px
                "max-w-7xl": size === "xl", // ~1280px
            },
            className,
        )}
    >
        {children}
    </div>
);

export default Container;
