"use client";

import Button from "~components/ui/Button";
import { cn } from "~libs/utils";

interface GhostControlProps {
    label: string;
    onEngage: () => void;
}

// Заглушка untouched-state: пунктирная полоса с приглашением. Клик/Enter
// инициализирует поле значением-по-умолчанию (50) и помечает hasInteracted.
// Не Slider с disabled — disabled блокирует pointer events.
const GhostControl = ({ label, onEngage }: GhostControlProps) => (
    <Button
        variant="soft"
        size="md"
        onClick={onEngage}
        className={cn(
            "w-full h-11 rounded-sm",
            "border-dashed border-border-subtle",
            "text-ink-muted text-sm",
            "hover:border-border-warm hover:text-ink-secondary",
        )}
    >
        {label}
    </Button>
);

export default GhostControl;
