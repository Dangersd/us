import type { NextRequest } from "next/server";

import { updateSession } from "~libs/supabase/middleware";

export async function proxy(request: NextRequest) {
    return updateSession(request);
}

export const config = {
    // Исключаем статику, asset-файлы и RSC-prefetch'и от <Link>.
    //
    // missing: RSC header — <Link> на hover/viewport стреляет RSC-prefetch на
    // тот же URL с заголовком "RSC: 1". Эти запросы НЕ нуждаются в проверке
    // auth в middleware: (rooms)/layout.tsx сам зовёт fetchCurrentUserServer,
    // который валидирует токен через supabase.auth.getUser(). Если юзер
    // неавторизован — layout рендерит LoginShell, ничего секретного не
    // утекает. А полная навигация (без RSC header'а) по-прежнему идёт через
    // middleware и редиректится на /login.
    //
    // Без этого исключения каждый hover на nav-item стрелял supabase.auth.getUser()
    // (HTTP в Supabase Auth, ~50-200ms) на каждом item'е sidebar/BottomNav.
    matcher: [
        {
            source: "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.png|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
            missing: [{ type: "header", key: "RSC", value: "1" }],
        },
    ],
};
