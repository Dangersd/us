import type { SVGProps } from "react";

import { EMOTION_BY_ID } from "~config/mood";
import BlobIcon from "~icons/emotions/BlobIcon";

const EmptyBlob = (props: SVGProps<SVGSVGElement>) => (
    <BlobIcon
        color={EMOTION_BY_ID.empty.color}
        gradientId="emo-blob-empty"
        {...props}
    />
);

export default EmptyBlob;
