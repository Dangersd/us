"use client";

import RoomShell from "~components/shell/RoomShell";
import { WishlistRoom } from "~components/widgets/wishlist";
import type { WishlistTabId } from "~config/wishlist";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";
import { useCurrentUser } from "~queries/user/use-current-user";

interface WishlistClientPageProps {
    initialTab: WishlistTabId;
}

const WishlistClientPage = ({ initialTab }: WishlistClientPageProps) => {
    const { data: user } = useCurrentUser();
    const { data: partner } = usePartnerProfile();

    return (
        <RoomShell roomId="wishlist">
            <WishlistRoom
                initialTab={initialTab}
                currentUserId={user?.id ?? null}
                partnerUserId={partner?.id ?? null}
            />
        </RoomShell>
    );
};

export default WishlistClientPage;
