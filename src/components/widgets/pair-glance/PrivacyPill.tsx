import { HiddenIcon, VibeIcon, VisibleIcon } from "~icons/privacy";
import type { VisibilityLevel } from "~interfaces/mood";
import { cn } from "~libs/utils";

// Read-only бэйдж под блобом в pair-glance, показывающий privacy-уровень
// (этой эмоции на этот день). НЕ интерактивный — отличается от PrivacyToggle
// в MoodCheckinCard. Per design untitled.pen → Jtmiv → mteH1/wYQHA.

interface PrivacyPillProps {
    level: VisibilityLevel;
    className?: string;
}

const LABELS: Record<VisibilityLevel, string> = {
    full: "видно полностью",
    vibe: "только vibe",
    hidden: "скрыто",
};

const Icon = ({ level }: { level: VisibilityLevel }) => {
    if (level === "full") return <VisibleIcon className={cn("h-3 w-3")} />;
    if (level === "vibe") return <VibeIcon className={cn("h-3 w-3")} />;
    return <HiddenIcon className={cn("h-3 w-3")} />;
};

const PrivacyPill = ({ level, className }: PrivacyPillProps) => (
    <span
        className={cn(
            "inline-flex items-center gap-1",
            "rounded-full bg-bg-base/40 px-2 py-1",
            "text-[10px] font-normal text-ink-muted",
            className,
        )}
    >
        <Icon level={level} />
        {LABELS[level]}
    </span>
);

export default PrivacyPill;
