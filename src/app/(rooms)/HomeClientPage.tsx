"use client";

import RoomShell from "~components/shell/RoomShell";
import { HomeAmbient, HomeGreeting } from "~components/widgets/home";
import { cn } from "~libs/utils";

const HomeClientPage = () => (
    <RoomShell roomId="home">
        <HomeAmbient />
        <div className={cn("relative flex flex-col gap-6")}>
            <HomeGreeting />
        </div>
    </RoomShell>
);

export default HomeClientPage;
