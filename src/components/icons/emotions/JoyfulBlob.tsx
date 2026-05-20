import type { SVGProps } from "react";

import { EMOTION_BY_ID } from "~config/mood";
import BlobIcon from "~icons/emotions/BlobIcon";

const JoyfulBlob = (props: SVGProps<SVGSVGElement>) => (
    <BlobIcon
        color={EMOTION_BY_ID.joyful.color}
        gradientId="emo-blob-joyful"
        {...props}
    />
);

export default JoyfulBlob;
