import type { SVGProps } from "react";

const StarIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M12 2.5l2.9 6.5 6.6.6-5 4.6 1.5 6.5L12 17.5 5.9 20.7l1.5-6.5-5-4.6 6.6-.6L12 2.5z" />
    </svg>
);

export default StarIcon;
