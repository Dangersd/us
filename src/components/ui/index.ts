// Barrel для UI-примитивов проекта. Импорт через `~components/ui` вместо
// per-file путей делает форму импортов в widget-слое 0.5.4+ ровной:
//   import { Slider, Thermometer, BatteryRing, Blob } from "~components/ui";

export {
    default as BatteryRing,
    type BatteryRingProps,
} from "~components/ui/BatteryRing";
export { default as Blob } from "~components/ui/Blob";
export { default as Button, type ButtonProps } from "~components/ui/Button";
export { default as Card, type CardProps } from "~components/ui/Card";
export { default as LogoUs } from "~components/ui/LogoUs";
export {
    default as Slider,
    type SliderOrientation,
    type SliderProps,
    type SliderTone,
} from "~components/ui/Slider";
export {
    default as Thermometer,
    type ThermometerProps,
} from "~components/ui/Thermometer";
export { blobPath, type BlobPathOpts } from "~components/ui/blob-path";
