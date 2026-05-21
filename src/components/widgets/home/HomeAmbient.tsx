import { cn } from "~libs/utils";

// Dust-mote particles drifting in peach-glow + 1 radial ellipse.
// Mobile glow ~300×400 top-left, desktop ~700×600. Оба absolute, pointer-
// events-none, behind everything. Particle-drift уважает prefers-reduced-motion.
// Delays разнесены по 0/-3/-6/-9/-12/-15s чтобы движение не выглядело
// синхронным «толпой».
//
// Inline style используется для per-particle позиций и animation-delay —
// тот же exception-паттерн, что в WishlistItemCard для category-dot.

const PARTICLES = [
    { top: "8%", left: "18%", size: 5, delay: "0s" },
    { top: "14%", left: "55%", size: 4, delay: "-9s" },
    { top: "22%", left: "82%", size: 6, delay: "-3s" },
    { top: "30%", left: "32%", size: 5, delay: "-12s" },
    { top: "44%", left: "68%", size: 6, delay: "-6s" },
    { top: "52%", left: "12%", size: 4, delay: "-15s" },
    { top: "58%", left: "44%", size: 5, delay: "-2s" },
    { top: "66%", left: "88%", size: 6, delay: "-8s" },
    { top: "74%", left: "26%", size: 5, delay: "-11s" },
    { top: "82%", left: "62%", size: 4, delay: "-5s" },
] as const;

const HomeAmbient = () => (
    <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 overflow-hidden")}
    >
        <div
            className={cn(
                "absolute -left-12 -top-12",
                "h-80 w-72 md:h-[600px] md:w-[700px]",
                "rounded-full",
                "bg-home-ambient-glow",
                "opacity-50 md:opacity-70 blur-3xl",
            )}
        />
        {PARTICLES.map((p, i) => (
            <span
                key={i}
                className={cn(
                    "absolute rounded-full bg-glow-soft/40",
                    "particle-drift",
                )}
                style={{
                    top: p.top,
                    left: p.left,
                    width: p.size,
                    height: p.size,
                    animationDelay: p.delay,
                }}
            />
        ))}
    </div>
);

export default HomeAmbient;
