import type { SVGProps } from "react";

const CalendarPlusIcon = (props: SVGProps<SVGSVGElement>) => (
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
        <rect x="2.5" y="3.5" width="13" height="12" rx="2" />
        <path d="M2.5 7h13M6 2v3M12 2v3M9 9v4M7 11h4" />
    </svg>
);

export default CalendarPlusIcon;
