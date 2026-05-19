import type { SVGProps } from "react";

import { EMOTION_BY_ID } from "~config/mood";
import BlobIcon from "~icons/emotions/BlobIcon";

const TenderBlob = (props: SVGProps<SVGSVGElement>) => (
    <BlobIcon
        color={EMOTION_BY_ID.tender.color}
        gradientId="emo-blob-tender"
        {...props}
    />
);

export default TenderBlob;
