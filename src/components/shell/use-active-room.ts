"use client";

import { usePathname } from "next/navigation";

import { ROOMS, type RoomId } from "~config/rooms";

export function useActiveRoom(): RoomId | null {
    const pathname = usePathname();
    if (!pathname) return null;

    // / — только exact-match (иначе home будет матчить всё)
    if (pathname === ROOMS.home.route) return "home";

    // Остальные комнаты: совпадение по префиксу
    for (const room of Object.values(ROOMS)) {
        if (room.id === "home") continue;
        if (pathname === room.route || pathname.startsWith(room.route + "/")) {
            return room.id;
        }
    }
    return null;
}
