import type { SVGProps } from "react";

const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M9 3.75v10.5M3.75 9h10.5" />
    </svg>
);

export default PlusIcon;
