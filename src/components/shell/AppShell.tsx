"use client";

import type { CSSProperties, ReactNode } from "react";

import BottomNav from "~components/shell/BottomNav";
import EdgeGlow from "~components/shell/EdgeGlow";
import Sidebar from "~components/shell/Sidebar";
import TopBar from "~components/shell/TopBar";
import WeatherLayer from "~components/shell/WeatherLayer";
import { useActiveRoom } from "~components/shell/use-active-room";
import { BreathProvider } from "~components/ui/breath-context";
import { useGrainSetting } from "~hooks/use-grain-setting";
import type { AppUser } from "~interfaces/user";
import { cn } from "~libs/utils";

// Корневой shell для всех (rooms)-страниц.
// Layout: [Sidebar (md+)] + [main column: TopBar / children / BottomNav (mobile)]
// Единственное место, где вызывается useActiveRoom() — потом activeId
// прокидывается в дочерние nav-компоненты пропсами.
//
// BreathProvider живёт здесь (а не в Providers.tsx), чтобы RAF-тик
// крутился только в authenticated (rooms) routes — на /login его нет.
// Все подписчики (MoodBlob, SidebarWordmark, PartnerStatus) внутри AppShell.

interface AppShellProps {
    user: AppUser;
    children: ReactNode;
}

const AppShell = ({ user, children }: AppShellProps) => {
    const activeId = useActiveRoom();
    useGrainSetting(); // toggle .grain-off на <html> через useEffect

    // --user-hue: personal hue текущего юзера, читается EdgeGlow'ом
    // через var(). См. globals.css:35-36 за hex-значениями.
    const hueVar =
        user.gender === "male"
            ? "var(--color-hue-him)"
            : "var(--color-hue-her)";
    const style = { "--user-hue": hueVar } as CSSProperties;

    // global_content — обязательный wrapper для modal scroll-lock (golden
    // rule #9). См. .claude/rules/modals.md → Layout invariant.
    return (
        <BreathProvider>
            <div
                id="global_content"
                className={cn("relative flex min-h-dvh w-full")}
                style={style}
            >
                <EdgeGlow />
                <WeatherLayer />
                <Sidebar user={user} activeId={activeId} />

                <div className={cn("flex min-w-0 flex-1 flex-col")}>
                    <TopBar user={user} />
                    <main className={cn("flex flex-1 flex-col")}>
                        {children}
                    </main>
                    <BottomNav activeId={activeId} />
                </div>
            </div>
        </BreathProvider>
    );
};

export default AppShell;
