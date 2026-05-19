import type { ComponentType, SVGProps } from "react";

import {
    CALENDAR_R,
    HOME_R,
    MOOD_R,
    PROFILE_R,
    WISHLIST_R,
} from "~config/routes";
import CalendarIcon from "~icons/shell/CalendarIcon";
import HomeIcon from "~icons/shell/HomeIcon";
import MoodIcon from "~icons/shell/MoodIcon";
import WishlistIcon from "~icons/shell/WishlistIcon";

export type RoomId = "home" | "mood" | "calendar" | "wishlist" | "profile";

export interface RoomConfig {
    id: RoomId;
    title: string;
    route: string;
    // Tailwind-класс ambient-фона (см. styles/utilities.css)
    hueClass: string;
    // Иконка для nav. У profile иконки нет — он рендерится через avatar
    // (в TopBar и в Sidebar profile-секции).
    Icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export const ROOMS: Record<RoomId, RoomConfig> = {
    home: {
        id: "home",
        title: "Дом",
        route: HOME_R(),
        hueClass: "bg-ambient-home",
        Icon: HomeIcon,
    },
    mood: {
        id: "mood",
        title: "Настроение",
        route: MOOD_R(),
        hueClass: "bg-ambient-mood",
        Icon: MoodIcon,
    },
    calendar: {
        id: "calendar",
        title: "Календарь",
        route: CALENDAR_R(),
        hueClass: "bg-ambient-calendar",
        Icon: CalendarIcon,
    },
    wishlist: {
        id: "wishlist",
        title: "Хотелки",
        route: WISHLIST_R(),
        hueClass: "bg-ambient-wishlist",
        Icon: WishlistIcon,
    },
    profile: {
        id: "profile",
        title: "Профиль",
        route: PROFILE_R(),
        hueClass: "bg-ambient-profile",
    },
};

// Комнаты в основной навигации (BottomNav mobile + Sidebar desktop nav).
// Profile везде через avatar, не в этом списке.
export const NAV_ROOMS: readonly RoomConfig[] = (
    ["home", "mood", "calendar", "wishlist"] as const
).map((id) => ROOMS[id]);
