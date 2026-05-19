"use client";

import type { ReactNode } from "react";

import BottomNav from "~components/shell/BottomNav";
import Sidebar from "~components/shell/Sidebar";
import TopBar from "~components/shell/TopBar";
import { useActiveRoom } from "~components/shell/use-active-room";
import type { AppUser } from "~interfaces/user";
import { cn } from "~libs/utils";

// Корневой shell для всех (rooms)-страниц.
// Layout: [Sidebar (md+)] + [main column: TopBar / children / BottomNav (mobile)]
// Единственное место, где вызывается useActiveRoom() — потом activeId
// прокидывается в дочерние nav-компоненты пропсами.

interface AppShellProps {
    user: AppUser;
    children: ReactNode;
}

const AppShell = ({ user, children }: AppShellProps) => {
    const activeId = useActiveRoom();

    return (
        <div className={cn("flex min-h-dvh w-full")}>
            <Sidebar user={user} activeId={activeId} />

            <div className={cn("flex min-w-0 flex-1 flex-col")}>
                <TopBar user={user} />
                <main className={cn("flex flex-1 flex-col")}>{children}</main>
                <BottomNav activeId={activeId} />
            </div>
        </div>
    );
};

export default AppShell;
