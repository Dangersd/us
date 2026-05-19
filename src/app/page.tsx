import LoginShell from "~components/auth/LoginShell";
import LogoutButton from "~components/auth/LogoutButton";
import { cn } from "~libs/utils";
import { fetchCurrentUserServer } from "~queries/user/fetch-current-user.server";

const HomePage = async () => {
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

    return (
        <LoginShell hue={user.gender}>
            <div className={cn("flex flex-col items-center gap-6 text-center")}>
                <h1
                    className={cn(
                        "font-display text-ink-primary text-3xl font-medium",
                        "tracking-[-0.01em]",
                    )}
                >
                    Привет, {user.displayName}
                </h1>
                <p className={cn("text-ink-secondary text-base max-w-sm")}>
                    Дом ещё пустой — комнаты появятся в Phase 0.4. Что дальше:
                    смотри docs/06-roadmap.md.
                </p>
                <LogoutButton variant="soft" size="md" />
            </div>
        </LoginShell>
    );
};

export default HomePage;
