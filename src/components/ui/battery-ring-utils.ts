// src/components/ui/battery-ring-utils.ts
// Чистые helpers для <BatteryRing />. Без React, без DOM.

// R7: NaN-guard + clamp 0..100.
export const clampBatteryValue = (v: number): number => {
    if (!Number.isFinite(v)) return 0;
    return Math.min(100, Math.max(0, v));
};

// Угол центра дота i из N: 12 o'clock = -π/2; по часовой — увеличиваем.
export const dotAngle = (i: number, n: number): number =>
    -Math.PI / 2 + (i / n) * Math.PI * 2;

// Pointer → value 0..100. Угол от 12 o'clock по часовой.
// R5: deadzone ±4° у верха кольца — иначе value прыгает 0/100 при тапе
// прямо над центром (atan2 wrap).
export const pointerToValue = (
    rect: DOMRect,
    clientX: number,
    clientY: number,
): number => {
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;
    const deg = (angle / Math.PI) * 180;
    if (deg < 4) return 0;
    if (deg > 356) return 100;
    return clampBatteryValue(Math.round((deg / 360) * 100));
};
