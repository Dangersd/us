import type { ComponentType, SVGProps } from "react";

import { EMOTIONS, EMOTION_BY_ID } from "~config/mood";
import BlobIcon from "~icons/emotions/BlobIcon";
import type { EmotionId } from "~interfaces/mood";

export type EmotionIcon = ComponentType<SVGProps<SVGSVGElement>>;

// Один компонент на эмоцию — фабрика вместо 8 ручных wrapper-файлов.
// Цвет берётся из EMOTION_BY_ID, gradientId стабильный per-эмоция,
// SVG-разметка вся в BlobIcon.
const makeEmotionBlob = (id: EmotionId): EmotionIcon => {
    const Component: EmotionIcon = (props) => (
        <BlobIcon
            color={EMOTION_BY_ID[id].color}
            gradientId={`emo-blob-${id}`}
            {...props}
        />
    );
    Component.displayName = `${id}Blob`;
    return Component;
};

export const EMOTION_ICONS: Record<EmotionId, EmotionIcon> = Object.fromEntries(
    EMOTIONS.map((e) => [e.id, makeEmotionBlob(e.id)]),
) as Record<EmotionId, EmotionIcon>;

export { default as BlobIcon } from "~icons/emotions/BlobIcon";
