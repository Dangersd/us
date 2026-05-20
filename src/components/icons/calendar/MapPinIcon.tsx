import type { SVGProps } from "react";

const MapPinIcon = (props: SVGProps<SVGSVGElement>) => (
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
        <path d="M11.667 6.125c0 3.208-4.667 6.708-4.667 6.708S2.333 9.333 2.333 6.125a4.667 4.667 0 0 1 9.334 0Z" />
        <circle cx="7" cy="6.125" r="1.75" />
    </svg>
);

export default MapPinIcon;
