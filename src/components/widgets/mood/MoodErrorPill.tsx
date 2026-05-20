"use client";

import Button from "~components/ui/Button";
import { cn } from "~libs/utils";

interface MoodErrorPillProps {
    visible: boolean;
    onRetry: () => void;
}

// Wrapper всегда смонтирован с role="status" — иначе AT не услышит появление
// (review P1: некоторые скринридеры не анонсируют fresh-mount live region'ы).
const MoodErrorPill = ({ visible, onRetry }: MoodErrorPillProps) => (
    <div
        role="status"
        aria-live="polite"
        aria-hidden={!visible}
        className={cn(
            visible
                ? cn(
                      "flex items-center justify-between gap-3",
                      "px-3 py-2 rounded-sm",
                      "bg-bg-surface-2 border border-[rgba(216,155,138,0.2)]",
                      "text-status-error text-sm",
                  )
                : "sr-only",
        )}
    >
        {visible ? (
            <>
                <span>Не сохранилось. Связь?</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRetry}
                    className={cn(
                        "text-ink-primary hover:text-status-error text-xs",
                    )}
                >
                    Повторить
                </Button>
            </>
        ) : null}
    </div>
);

export default MoodErrorPill;
