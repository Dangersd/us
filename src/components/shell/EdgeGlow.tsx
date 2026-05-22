import { cn } from "~libs/utils";

// Personal-hue edge glow всего экрана. Очень тонкое (opacity 0.10 после
// mix-blend-mode: screen — за пределами осознанного восприятия, но «дом
// узнаёт тебя» по тёплой границе в углах).
//
// Цвет берётся из CSS-переменной --user-hue, которую AppShell проставляет
// в inline-style на #global_content по user.gender. См. AppShell.tsx.
//
// Layout: fixed inset-0, pointer-events-none, mix-blend-mode: screen.
// Два radial-gradient'а в противоположных углах (bottom-left, top-right)
// — диагональное свечение через экран. z-0 ставит слой ниже всех floating
// элементов (карточки, модалки, навигация), но выше plain background.
//
// Не реагирует на prefers-reduced-motion — статичный градиент, не анимация.
const EdgeGlow = () => (
    <div
        aria-hidden
        className={cn(
            "pointer-events-none fixed inset-0 z-0",
            "mix-blend-screen opacity-[0.10]",
            "bg-[radial-gradient(120%_60%_at_0%_100%,var(--user-hue)_0%,transparent_50%),radial-gradient(120%_60%_at_100%_0%,var(--user-hue)_0%,transparent_50%)]",
        )}
    />
);

export default EdgeGlow;
