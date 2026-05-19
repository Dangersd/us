import type { SVGProps } from "react";

// Базовый emotion-blob: SVG-кружок с радиальным градиентом (зеркалит .pen
// frame Jtmiv — каждая иконка emotion-picker'а — ellipse с 3-stop radial
// gradient color → colorAA → color44). Пер-emotion обёртки в этом же
// модуле подставляют свой color + уникальный gradientId.
//
// gradientId должен быть стабильным per emotion — два <WarmBlob /> на
// одной странице делят defs с тем же id, gradient идентичный, безопасно.

interface BlobIconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
    color: string;
    gradientId: string;
}

const BlobIcon = ({ color, gradientId, ...rest }: BlobIconProps) => (
    <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        {...rest}
    >
        <defs>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="60%" stopColor={color} stopOpacity="0.67" />
                <stop offset="100%" stopColor={color} stopOpacity="0.27" />
            </radialGradient>
        </defs>
        <circle cx="24" cy="24" r="24" fill={`url(#${gradientId})`} />
    </svg>
);

export default BlobIcon;
