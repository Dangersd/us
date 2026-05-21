"use client";

import LogoutButton from "~components/auth/LogoutButton";
import RoomShell from "~components/shell/RoomShell";
import { BreathProvider } from "~components/ui/breath-context";
import {
    ImportantDatesSection,
    ProfileHeader,
} from "~components/widgets/profile";
import { cn } from "~libs/utils";
import { useCouple } from "~queries/couple/use-couple";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";
import { useCurrentUser } from "~queries/user/use-current-user";

// Profile-комната, фаза 0.10.1: шапка с парными blob'ами + важные даты.
// Остальные подсекции (stats, achievements, theme/account/notif settings) —
// в 0.10.2 / 0.10.3 / 0.10.4. LogoutButton пока в самом низу временно
// (переедет в Account-секцию в 0.10.2).
const ProfileClientPage = () => {
    const { data: me } = useCurrentUser();
    const { data: partner } = usePartnerProfile();
    const { data: couple } = useCouple();

    return (
        <RoomShell roomId="profile">
            <BreathProvider>
                <div className={cn("flex flex-col gap-2")}>
                    {me ? (
                        <>
                            <ProfileHeader
                                me={me}
                                partner={partner ?? null}
                                couple={couple ?? null}
                            />
                            <ImportantDatesSection
                                me={me}
                                partner={partner ?? null}
                                couple={couple ?? null}
                            />
                        </>
                    ) : null}
                    <div className={cn("flex justify-center pt-4")}>
                        <LogoutButton variant="soft" size="md" />
                    </div>
                </div>
            </BreathProvider>
        </RoomShell>
    );
};

export default ProfileClientPage;
