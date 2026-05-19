import { cn } from "~libs/utils";

interface LogoUsProps {
    className?: string;
}

const LogoUs = ({ className }: LogoUsProps) => (
    <h1
        className={cn(
            "font-display text-ink-primary text-3xl font-medium",
            "tracking-[-0.02em] text-center select-none",
            className,
        )}
    >
        us
    </h1>
);

export default LogoUs;
