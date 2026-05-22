"use client";

import { tv } from "tailwind-variants";

import { useGrainSetting } from "~hooks/use-grain-setting";
import { useWeatherSetting } from "~hooks/use-weather-setting";
import { cn } from "~libs/utils";

// Profile → Тема: атмосферные toggle'ы. Каждый persisted в localStorage
// через свой hook. Label-wrap даёт touch-target ≥44px (min-h-11), htmlFor
// явно ассоциирует label с checkbox для screen readers.

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-3 py-4"),
        title: cn(
            "text-[11px] uppercase tracking-wider text-ink-muted",
            "px-1",
        ),
        row: cn(
            "flex items-center justify-between gap-3",
            "rounded-xl bg-bg-surface-1 px-4 py-3",
        ),
        label: cn(
            "flex items-center gap-3 min-h-11 cursor-pointer",
            "flex-1 text-sm text-ink-primary",
        ),
        checkbox: cn("h-5 w-5 cursor-pointer", "accent-glow-warm"),
        hint: cn("text-xs text-ink-muted px-1"),
    },
});

const ThemeSection = () => {
    const grain = useGrainSetting();
    const weather = useWeatherSetting();
    const { root, title, row, label, checkbox, hint } = styles();

    return (
        <section className={root()}>
            <h2 className={title()}>Тема</h2>
            <div className={row()}>
                <label htmlFor="grain-toggle" className={label()}>
                    <input
                        id="grain-toggle"
                        type="checkbox"
                        className={checkbox()}
                        checked={grain.enabled}
                        onChange={(e) => grain.setEnabled(e.target.checked)}
                    />
                    <span>Тёплая зернистость</span>
                </label>
            </div>
            <p className={hint()}>
                Лёгкое плёночное зерно поверх фона. Снимает «цифровой» привкус.
            </p>
            <div className={row()}>
                <label htmlFor="weather-toggle" className={label()}>
                    <input
                        id="weather-toggle"
                        type="checkbox"
                        className={checkbox()}
                        checked={weather.enabled}
                        onChange={(e) => weather.setEnabled(e.target.checked)}
                    />
                    <span>Погода за окном</span>
                </label>
            </div>
            <p className={hint()}>
                Дождь, снег и тинт по реальной погоде Бишкека.
            </p>
        </section>
    );
};

export default ThemeSection;
