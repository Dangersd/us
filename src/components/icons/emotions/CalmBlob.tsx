import type { SVGProps } from "react";

import { EMOTION_BY_ID } from "~config/mood";
import BlobIcon from "~icons/emotions/BlobIcon";

const CalmBlob = (props: SVGProps<SVGSVGElement>) => (
    <BlobIcon
        color={EMOTION_BY_ID.calm.color}
        gradientId="emo-blob-calm"
        {...props}
    />
);

export default CalmBlob;
