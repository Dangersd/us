"use client";

import LogoutButton from "~components/auth/LogoutButton";
import RoomShell from "~components/shell/RoomShell";
import { cn } from "~libs/utils";
import { useCurrentUser } from "~queries/user/use-current-user";

const ProfileClientPage = () => {
    const { data: user } = useCurrentUser();

    return (
        <RoomShell roomId="profile">
            <div className={cn("flex flex-col items-center gap-6")}>
                <p className={cn("text-ink-secondary text-base")}>
                    Привет,{" "}
                    <span className="text-ink-primary">
                        {user?.displayName}
                    </span>
                    .
                </p>
                <LogoutButton variant="soft" size="md" />
            </div>
        </RoomShell>
    );
};

export default ProfileClientPage;
