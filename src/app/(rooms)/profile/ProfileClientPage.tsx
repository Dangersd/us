"use client";

import RoomShell from "~components/shell/RoomShell";
import { BreathProvider } from "~components/ui/breath-context";
import {
    AccountSection,
    AchievementsSection,
    ImportantDatesSection,
    ProfileHeader,
    StatsSection,
} from "~components/widgets/profile";
import { CyclePreviewCard } from "~components/widgets/profile/cycle";
import { cn } from "~libs/utils";
import { useCouple } from "~queries/couple/use-couple";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";
import { useCurrentUser } from "~queries/user/use-current-user";

// Profile-комната: шапка → важные даты → stats → созвездие → account.
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
                            {me.gender === "female" ? (
                                <CyclePreviewCard />
                            ) : null}
                            <AchievementsSection me={me} />
                            <AccountSection />
                        </>
                    ) : null}
                </div>
            </BreathProvider>
        </RoomShell>
    );
};

export default ProfileClientPage;
