import { Fraunces, Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";

// Variable, weights 400/500. Кириллица в поставке.
export const fraunces = Fraunces({
    subsets: ["latin", "cyrillic"],
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
