import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Первая буква display_name для аватаров; «·» если имя пустое.
export const initialOf = (name: string) =>
    name.trim().charAt(0).toUpperCase() || "·";
