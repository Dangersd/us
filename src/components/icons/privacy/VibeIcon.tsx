import type { SVGProps } from "react";

// "Только vibe" — облако-туман: видно общую тональность, не точное число.

const VibeIcon = (props: SVGProps<SVGSVGElement>) => (
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
        <path d="M3 15h11" />
        <path d="M6 19h13" />
        <path d="M5 11h17" />
        <path d="M7 7h13" />
    </svg>
);

export default VibeIcon;
