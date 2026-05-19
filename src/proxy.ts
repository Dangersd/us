import type { NextRequest } from "next/server";

import { updateSession } from "~libs/supabase/middleware";

export async function proxy(request: NextRequest) {
    return updateSession(request);
}

export const config = {
    // Исключаем статику и asset-файлы — middleware гоняется только по навигационным запросам.
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.png|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
