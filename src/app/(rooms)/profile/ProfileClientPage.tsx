"use client";

import RoomShell from "~components/shell/RoomShell";
import { BreathProvider } from "~components/ui/breath-context";
import {
    AccountSection,
    ImportantDatesSection,
    ProfileHeader,
    StatsSection,
} from "~components/widgets/profile";
import { cn } from "~libs/utils";
import { useCouple } from "~queries/couple/use-couple";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";
import { useCurrentUser } from "~queries/user/use-current-user";

// Profile-комната: шапка → важные даты → stats → account.
// Achievements добавляются в 0.10.3.
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
                            <StatsSection
                                me={me}
                                partner={partner ?? null}
                                couple={couple ?? null}
                            />
                            <AccountSection />
                        </>
                    ) : null}
                </div>
            </BreathProvider>
        </RoomShell>
    );
};

export default ProfileClientPage;
