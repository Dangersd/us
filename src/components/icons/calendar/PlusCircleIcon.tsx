import type { SVGProps } from "react";

const PlusCircleIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <circle cx="7" cy="7" r="5.5" />
        <path d="M7 4.5v5M4.5 7h5" />
    </svg>
);

export default PlusCircleIcon;
