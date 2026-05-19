// Слева в TopBar: 2 маленьких blob'а с personal hue (его + её).
// 0.4 — статический плейсхолдер (оба full opacity). Реальные данные — 0.5+ из mood-query.
import { cn } from "~libs/utils";

const blob = cn(
    "h-3 w-3 rounded-full",
    "shadow-[0_0_8px_rgba(255,201,168,0.25)]",
);

const PartnerStatus = () => (
    <div className={cn("flex items-center gap-1.5")} aria-hidden>
        <span className={cn(blob, "bg-hue-him")} />
        <span className={cn(blob, "bg-hue-her")} />
    </div>
);

export default PartnerStatus;
