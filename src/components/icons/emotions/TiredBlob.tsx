import type { SVGProps } from "react";

import { EMOTION_BY_ID } from "~config/mood";
import BlobIcon from "~icons/emotions/BlobIcon";

const TiredBlob = (props: SVGProps<SVGSVGElement>) => (
    <BlobIcon
        color={EMOTION_BY_ID.tired.color}
        gradientId="emo-blob-tired"
        {...props}
    />
);

export default TiredBlob;
