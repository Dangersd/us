"use client";

import { tv } from "tailwind-variants";

import LogoutButton from "~components/auth/LogoutButton";
import ChangePasswordInline from "~components/widgets/profile/account/ChangePasswordInline";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-3 py-4"),
        title: cn("text-[11px] uppercase tracking-wider text-ink-muted px-1"),
        body: cn("flex flex-col gap-3"),
        logoutRow: cn("flex justify-start pt-1"),
    },
});

export interface AccountSectionProps {
    className?: string;
}

const AccountSection = ({ className }: AccountSectionProps) => {
    const { root, title, body, logoutRow } = styles();
    return (
        <section className={cn(root(), className)}>
            <h2 className={title()}>Аккаунт</h2>
            <div className={body()}>
                <ChangePasswordInline />
                <div className={logoutRow()}>
                    <LogoutButton variant="ghost" size="md" />
                </div>
            </div>
        </section>
    );
};

export default AccountSection;
