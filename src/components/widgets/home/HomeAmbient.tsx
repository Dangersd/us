import { cn } from "~libs/utils";

// 4 dust-mote particles drifting in peach-glow + 1 radial ellipse.
// Mobile glow ~300×400 top-left, desktop ~700×600. Оба absolute, pointer-
// events-none, behind everything. Particle-drift уважает prefers-reduced-motion.
//
// Inline style используется для per-particle позиций и animation-delay —
// тот же exception-паттерн, что в WishlistItemCard для category-dot.

const PARTICLES = [
    { top: "12%", left: "22%", size: 4, delay: "0s" },
    { top: "28%", left: "65%", size: 3, delay: "-6s" },
    { top: "48%", left: "38%", size: 5, delay: "-3s" },
    { top: "68%", left: "78%", size: 3, delay: "-12s" },
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
