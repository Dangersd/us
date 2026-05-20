"use client";

import Button from "~components/ui/Button";
import { HiddenIcon, VibeIcon, VisibleIcon } from "~icons/privacy";
import type { VisibilityLevel } from "~interfaces/mood";
import { cn } from "~libs/utils";

interface PrivacyToggleProps {
    value: VisibilityLevel;
    onChange: (next: VisibilityLevel) => void;
    fieldLabel: string;
    disabled?: boolean;
}

const NEXT: Record<VisibilityLevel, VisibilityLevel> = {
    full: "vibe",
    vibe: "hidden",
    hidden: "full",
};

const LABELS: Record<VisibilityLevel, string> = {
    full: "видно",
    vibe: "только vibe",
    hidden: "скрыто",
};

const ICONS: Record<VisibilityLevel, typeof VisibleIcon> = {
    full: VisibleIcon,
    vibe: VibeIcon,
    hidden: HiddenIcon,
};

const PrivacyToggle = ({
    value,
    onChange,
    fieldLabel,
    disabled,
}: PrivacyToggleProps) => {
    const Icon = ICONS[value];
    const nextLabel = LABELS[NEXT[value]];
    // aria-label дёргается на каждое изменение value → AT-анонс при focus/change.
    // Отдельного aria-live span'а не делаем (review P1: дубль анонса).
    return (
        <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onChange(NEXT[value])}
            aria-label={`Приватность: ${fieldLabel}, сейчас: ${LABELS[value]}. Нажмите чтобы переключить на: ${nextLabel}.`}
            className={cn("gap-1.5 text-ink-muted hover:text-ink-secondary")}
        >
            <Icon />
            <span className={cn("text-xs leading-none")}>{LABELS[value]}</span>
        </Button>
    );
};

export default PrivacyToggle;
