import type { ReactNode } from "react";

import LoginShell from "~components/auth/LoginShell";
import LogoutButton from "~components/auth/LogoutButton";
import AppShell from "~components/shell/AppShell";
import { cn } from "~libs/utils";
import { fetchCurrentUserServer } from "~queries/user/fetch-current-user.server";

const RoomsLayout = async ({ children }: { children: ReactNode }) => {
    const user = await fetchCurrentUserServer();

    // Orphan-state: auth.user есть, но row в public.users отсутствует.
    // Не редиректим (иначе loop с proxy) — даём выйти.
    if (!user) {
        return (
            <LoginShell>
                <div
                    className={cn(
                        "flex flex-col items-center gap-6 text-center",
                    )}
                >
                    <h1
                        className={cn(
                            "font-display text-ink-primary text-2xl font-medium",
                        )}
                    >
                        Профиль не настроен
                    </h1>
                    <p className={cn("text-ink-secondary text-base")}>
                        Свяжись с админом, чтобы привязать аккаунт к паре.
                    </p>
                    <LogoutButton variant="soft" size="md" />
                </div>
            </LoginShell>
        );
    }

    return <AppShell user={user}>{children}</AppShell>;
};

export default RoomsLayout;
