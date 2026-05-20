"use client";

import Slider, { type SliderProps } from "~components/ui/Slider";

/**
 * Vertical energy Slider. PARENT MUST DEFINE EXPLICIT HEIGHT — без bounded
 * контейнера thermometer схлопывается в 0px (root наследует `h-full`).
 * Типовое использование:
 *
 *     <div className="h-48"><Thermometer value={energy} onChange={...} /></div>
 *
 * Тонкая обёртка над <Slider /> с зафиксированным `tone="energy"` и
 * `orientation="vertical"`. В Mood-комнате это «термометр» из
 * docs/03-rooms/mood.md:14-25. Все остальные пропсы (value/onChange/
 * onValueCommit/disabled/aria-label/className) пробрасываются 1-в-1.
 */
export type ThermometerProps = Omit<SliderProps, "tone" | "orientation">;

const Thermometer = (props: ThermometerProps) => (
    <Slider {...props} tone="energy" orientation="vertical" />
);

export default Thermometer;
