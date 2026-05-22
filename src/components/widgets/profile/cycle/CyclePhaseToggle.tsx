"use client";

import { tv } from "tailwind-variants";

import { DEFAULT_CYCLE_SETTINGS } from "~interfaces/cycle";
import type { CycleSettings } from "~interfaces/cycle";
import { cn } from "~libs/utils";
import { useCurrentUser } from "~queries/user/use-current-user";
import { useUpdateCycleSettings } from "~queries/user/use-update-cycle-settings";

const styles = tv({
    slots: {
        root: cn("flex items-center gap-3 rounded-2xl", "bg-bg-surface-1 p-4"),
        moonWrap: cn("relative h-5 w-5"),
        moonOuter: cn("absolute inset-0 rounded-full bg-hue-female"),
        moonInner: cn(
            "absolute right-0 top-0 h-5 w-4 rounded-full bg-bg-surface-1",
        ),
        text: cn("flex flex-1 flex-col"),
        label: cn("text-ink-primary text-[13px]"),
        sub: cn("text-ink-muted text-[10px]"),
        switch: cn(
            "relative h-6 w-11 rounded-full transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow-warm/40",
        ),
        switchOn: cn("bg-glow-warm"),
        switchOff: cn("bg-bg-surface-2"),
        knob: cn(
            "absolute top-1 h-4 w-4 rounded-full bg-ink-primary transition-all",
        ),
    },
});

const CyclePhaseToggle = () => {
    const {
        root,
        moonWrap,
        moonOuter,
        moonInner,
        text,
        label,
        sub,
        switch: sw,
        switchOn,
        switchOff,
        knob,
    } = styles();
    const { data: me } = useCurrentUser();
    const update = useUpdateCycleSettings();

    const settings = ((me?.settings.cycle as
        | Partial<CycleSettings>
        | undefined) ?? DEFAULT_CYCLE_SETTINGS) as CycleSettings;
    const isOn = settings.phase_visible_to_partner;

    const handleToggle = () => {
        if (update.isPending) return;
        update.mutate({ phase_visible_to_partner: !isOn });
    };

    return (
        <div className={root()}>
            <div className={moonWrap()} aria-hidden>
                <div className={moonOuter()} />
                <div className={moonInner()} />
            </div>
            <div className={text()}>
                <span className={label()}>Показывать ему мою фазу</span>
                <span className={sub()}>как ambient-луна на blob&apos;е</span>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={isOn}
                onClick={handleToggle}
                disabled={update.isPending}
                className={cn(sw(), isOn ? switchOn() : switchOff())}
            >
                <span
                    className={cn(knob(), isOn ? "left-6" : "left-1", {
                        "bg-bg-surface-1": isOn,
                        "bg-ink-muted": !isOn,
                    })}
                />
            </button>
        </div>
    );
};

export default CyclePhaseToggle;
