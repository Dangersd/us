"use client";

import { tv } from "tailwind-variants";

import HomeWishlistPeekCard from "~components/widgets/home/HomeWishlistPeekCard";
import { cn } from "~libs/utils";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";
import { useWishlistPeek } from "~queries/wishlist/use-wishlist-peek";

// D9: dative-хелпер дропнут — он давал mixed-script мусор для латинских
// displayName. Заголовок в номинативе («Имя сейчас хочет...»).

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-3 py-4"),
        heading: cn("text-sm text-ink-secondary"),
        row: cn(
            "flex gap-3 overflow-x-auto md:overflow-visible md:flex-wrap",
            "container-padding-bleed md:p-0 -mx-4 md:mx-0 px-4 md:px-0",
        ),
    },
});

const HomeWishlistPeek = () => {
    const partner = usePartnerProfile();
    const peek = useWishlistPeek(partner.data?.id);
    const { root, heading, row } = styles();

    const partnerWants = peek.data?.partnerWants ?? [];
    const shared = peek.data?.shared ?? [];
    if (partnerWants.length === 0 && shared.length === 0) return null;

    const partnerName = partner.data?.displayName ?? "";

    return (
        <section className={root()}>
            {partnerWants.length > 0 && partnerName ? (
                <>
                    <p className={heading()}>
                        {`${partnerName} сейчас хочет...`}
                    </p>
                    <div className={row()}>
                        {partnerWants.map((item) => (
                            <HomeWishlistPeekCard key={item.id} item={item} />
                        ))}
                    </div>
                </>
            ) : null}
            {shared.length > 0 ? (
                <>
                    <p className={heading()}>Наше</p>
                    <div className={row()}>
                        {shared.map((item) => (
                            <HomeWishlistPeekCard key={item.id} item={item} />
                        ))}
                    </div>
                </>
            ) : null}
        </section>
    );
};

export default HomeWishlistPeek;
