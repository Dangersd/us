import type { Gender } from "~interfaces/user";

// Source of truth для personal-hue палитры. Канонические hex'ы из
// docs/07-open-questions.md.
//
// В 0.10.1 в коде используется только `default` per gender (1 hue per role,
// MVP-state). Остальные 4 пресета (honey/earth для него, blush/wine для неё)
// зарезервированы в типах и map'е — в 0.10.2 hue-picker UI их включит без
// schema-migration (users.personal_hue_variant — text).
//
// Coexistence с CSS-переменными --color-hue-him / --color-hue-her в
// styles/globals.css (используются PartnerStatus shell-компонентом):
// они задают тот же default для каждого gender'а. При смене preset'а в
// 0.10.2 будем синхронизировать обе репрезентации (TS map + inline CSS-vars
// на root) через user settings.

export type HueVariantHim = "default" | "copper" | "honey" | "earth";
export type HueVariantHer = "default" | "rose" | "blush" | "wine";

export const HUE_PRESETS = {
    male: {
        default: "#E8A87C",
        copper: "#E8A87C",
        honey: "#E0B872",
        earth: "#C9967B",
    },
    female: {
        default: "#F4A5B9",
        rose: "#F4A5B9",
        blush: "#F0B8C4",
        wine: "#C77B8A",
    },
} as const;

// Resolves a user's personalHueVariant (raw text из БД) → hex для рендера.
// Fallback на 'default' per gender при невалидном/null значении.
export function hueToHex(
    gender: Gender,
    variant: string | null | undefined,
): string {
    const palette = HUE_PRESETS[gender];
    if (!variant) return palette.default;
    if (variant in palette) {
        return palette[variant as keyof typeof palette];
    }
    return palette.default;
}
