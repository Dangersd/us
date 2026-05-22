import type { SVGProps } from "react";

// Базовый emotion-blob: SVG-кружок с радиальным градиентом + тёплый glow
// в цвете эмоции. Зеркалит .pen frame Jtmiv (color → colorAA → color44),
// но опасти подняты для большей сочности на тёмном bg (см. MoodBlob.tsx —
// единая система яркости блобов).
//
// gradientId должен быть стабильным per emotion — два <WarmBlob /> на
// одной странице делят defs с тем же id, gradient идентичный, безопасно.

interface BlobIconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
    color: string;
    gradientId: string;
}

const BlobIcon = ({ color, gradientId, style, ...rest }: BlobIconProps) => (
    <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
        // drop-shadow на root <svg> = CSS filter (без SVG-filter region
        // clipping). На inner circle он клипался по 110% bbox → виден был
        // тёмный квадрат вокруг блоба.
        style={{
            filter: `drop-shadow(0 0 8px ${color}88) drop-shadow(0 0 3px ${color}aa)`,
            overflow: "visible",
            ...style,
        }}
        {...rest}
    >
        <defs>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="55%" stopColor={color} stopOpacity="0.85" />
                <stop offset="100%" stopColor={color} stopOpacity="0.4" />
            </radialGradient>
        </defs>
        <circle cx="24" cy="24" r="24" fill={`url(#${gradientId})`} />
    </svg>
);

export default BlobIcon;
