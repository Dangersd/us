import type { SVGProps } from "react";

// "Видно полностью" — глаз. Outline 1.5px, currentColor для tint в dark-mode.

const VisibleIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
    >
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default VisibleIcon;
