"use client";

import MoodBlob from "~components/ui/MoodBlob";
import LightThread from "~components/widgets/profile/LightThread";
import { hueToHex } from "~config/personal-hue";
import type { AppUser } from "~interfaces/user";
import { cn } from "~libs/utils";

// Парные blob'ы в Profile-шапке: его слева, её справа, нитка света между.
// Reuse MoodBlob с idle-параметрами (eng-review D2):
//   energy=100   → breath ~12s (атмосферный спокойный ритм)
//   stress=0     → круглая форма, минимум jitter'а
//   socialBattery=50  → нейтральный scale (1.0)
//
// Размер blob'а реагирует на viewport: на мобиле помельче, на десктопе крупнее.
// Размер light-thread — оптически между blob'ами с overlap'ом по краям.

export interface ProfileBlobPairProps {
    me: AppUser;
    partner: AppUser | null;
    className?: string;
}

// size prop задаёт viewBox-координаты SVG; визуальный размер контролируется
// CSS через className, чтобы SVG масштабировался responsive (w-32 mobile →
// w-40 md+). Без CSS-override блобы 160×160 пушат страницу за viewport на
// узких экранах (sum 160+80+160 = 400px > mobile ~343px usable).
const BLOB_SIZE = 160;
const THREAD_WIDTH = 80;
const THREAD_HEIGHT = 28;

const BLOB_CLASS = "w-32 h-32 md:w-40 md:h-40 shrink-0";
const THREAD_CLASS = "w-12 md:w-20 h-auto -mx-3 md:-mx-6 shrink-0";

const ProfileBlobPair = ({ me, partner, className }: ProfileBlobPairProps) => {
    // Определяем left = him, right = her — независимо от того, кто залогинен.
    // Если по какой-то причине couple состоит из двух same-gender — оставляем
    // me слева, partner справа (визуальный fallback).
    const meIsHim = me.gender !== "female";
    const left = meIsHim ? me : (partner ?? me);
    const right = meIsHim ? (partner ?? me) : me;

    const hueLeft = hueToHex(left.gender, left.personalHueVariant);
    const hueRight = hueToHex(right.gender, right.personalHueVariant);

    return (
        <div
            className={cn(
                "flex flex-row items-center justify-center gap-2",
                className,
            )}
        >
            <MoodBlob
                color={hueLeft}
                size={BLOB_SIZE}
                energy={100}
                stress={0}
                socialBattery={50}
                aura
                aria-label={left.displayName}
                className={BLOB_CLASS}
            />
            <LightThread
                hueLeft={hueLeft}
                hueRight={hueRight}
                width={THREAD_WIDTH}
                height={THREAD_HEIGHT}
                className={THREAD_CLASS}
            />
            {partner ? (
                <MoodBlob
                    color={hueRight}
                    size={BLOB_SIZE}
                    energy={100}
                    stress={0}
                    socialBattery={50}
                    aura
                    aria-label={right.displayName}
                    className={BLOB_CLASS}
                />
            ) : (
                // Партнёр ещё не подгружен — рендерим muted-placeholder blob
                // в правильном hue, без aura, чтобы layout не прыгал.
                <MoodBlob
                    color={hueRight}
                    size={BLOB_SIZE}
                    energy={50}
                    stress={0}
                    socialBattery={40}
                    aura={false}
                    aria-label="партнёр"
                    className={cn(BLOB_CLASS, "opacity-40")}
                />
            )}
        </div>
    );
};

export default ProfileBlobPair;
