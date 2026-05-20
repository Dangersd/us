import type { SVGProps } from "react";

const ChevronLeftIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M15 6l-6 6 6 6" />
    </svg>
);

export default ChevronLeftIcon;
