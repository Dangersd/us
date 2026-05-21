import type { ReactNode } from "react";

import Container from "~components/layout/Container";
import type { Gender } from "~interfaces/user";
import { cn } from "~libs/utils";

interface LoginShellProps {
    hue?: Gender;
    children: ReactNode;
}

const LoginShell = ({ hue, children }: LoginShellProps) => (
    <main
        className={cn(
            "min-h-dvh w-full",
            "flex flex-col items-center justify-center",
            "py-20",
            "transition-[background] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
            {
                "bg-login-glow-base": !hue,
                "bg-login-vignette-him": hue === "male",
                "bg-login-vignette-her": hue === "female",
            },
        )}
    >
        <Container size="sm">
            <div
                className={cn(
                    "flex w-full max-w-100 mx-auto flex-col items-center",
                )}
            >
                {children}
            </div>
        </Container>
    </main>
);

export default LoginShell;
