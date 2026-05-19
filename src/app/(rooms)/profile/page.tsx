import LogoutButton from "~components/auth/LogoutButton";
import RoomShell from "~components/shell/RoomShell";
import { cn } from "~libs/utils";
import { fetchCurrentUserServer } from "~queries/user/fetch-current-user.server";

const ProfilePage = async () => {
    // Layout уже гарантирует наличие user; повторный вызов дедуплицируется
    // через React.cache() в самом fetchCurrentUserServer.
    const user = await fetchCurrentUserServer();

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

export default ProfilePage;
