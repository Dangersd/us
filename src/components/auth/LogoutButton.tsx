"use client";

import type { ReactNode } from "react";

import Button, { type ButtonProps } from "~components/ui/Button";
import { useSignOut } from "~queries/user";

interface LogoutButtonProps extends Omit<
    ButtonProps,
    "onClick" | "disabled" | "children"
> {
    children?: ReactNode;
}

const LogoutButton = ({
    variant = "soft",
    size = "md",
    children,
    ...rest
}: LogoutButtonProps) => {
    const signOut = useSignOut();

    return (
        <Button
            {...rest}
            variant={variant}
            size={size}
            disabled={signOut.isPending}
            onClick={() => signOut.mutate()}
        >
            {signOut.isPending ? "Выходим..." : (children ?? "Выйти")}
        </Button>
    );
};

export default LogoutButton;
