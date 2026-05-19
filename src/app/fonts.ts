import { GeistSans } from "geist/font/sans";
import { Fraunces, Inter } from "next/font/google";

// Variable, weights 400/500. Fraunces в Google Fonts CDN не отдаёт кириллицу —
// для RU-заголовков сработает fallback (Georgia / system serif). v0.2 cycle
// рассмотрит self-host vendored TTF с кириллическими глифами.
export const fraunces = Fraunces({
    subsets: ["latin", "latin-ext"],
    weight: ["400", "500"],
    variable: "--font-fraunces",
    display: "swap",
});

// Fallback + tabular numerics.
export const inter = Inter({
    subsets: ["latin", "cyrillic"],
    weight: ["400", "500", "600"],
    variable: "--font-inter",
    display: "swap",
});

// Geist Sans экспортирует CSS-переменную --font-geist-sans на html.
export const geist = GeistSans;
