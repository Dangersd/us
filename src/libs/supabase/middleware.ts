import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";

import { type NextRequest, NextResponse } from "next/server";

interface CookieToSet {
    name: string;
    value: string;
    options?: CookieOptions;
}

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: CookieToSet[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // Триггерит рефреш токена + пишет обновлённые cookies в ответ.
    await supabase.auth.getUser();

    return response;
}
