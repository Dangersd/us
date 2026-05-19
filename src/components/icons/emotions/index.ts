import type { ComponentType, SVGProps } from "react";

import AnxiousBlob from "~icons/emotions/AnxiousBlob";
import BlobIcon from "~icons/emotions/BlobIcon";
import CalmBlob from "~icons/emotions/CalmBlob";
import EmptyBlob from "~icons/emotions/EmptyBlob";
import JoyfulBlob from "~icons/emotions/JoyfulBlob";
import SadBlob from "~icons/emotions/SadBlob";
import TenderBlob from "~icons/emotions/TenderBlob";
import TiredBlob from "~icons/emotions/TiredBlob";
import WarmBlob from "~icons/emotions/WarmBlob";
import type { EmotionId } from "~interfaces/mood";

export type EmotionIcon = ComponentType<SVGProps<SVGSVGElement>>;

export const EMOTION_ICONS: Record<EmotionId, EmotionIcon> = {
    warm: WarmBlob,
    calm: CalmBlob,
    joyful: JoyfulBlob,
    tender: TenderBlob,
    tired: TiredBlob,
    sad: SadBlob,
    anxious: AnxiousBlob,
    empty: EmptyBlob,
};

export {
    AnxiousBlob,
    BlobIcon,
    CalmBlob,
    EmptyBlob,
    JoyfulBlob,
    SadBlob,
    TenderBlob,
    TiredBlob,
    WarmBlob,
};
