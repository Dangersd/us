import type { SVGProps } from "react";

import { EMOTION_BY_ID } from "~config/mood";
import BlobIcon from "~icons/emotions/BlobIcon";

const AnxiousBlob = (props: SVGProps<SVGSVGElement>) => (
    <BlobIcon
        color={EMOTION_BY_ID.anxious.color}
        gradientId="emo-blob-anxious"
        {...props}
    />
);

export default AnxiousBlob;
