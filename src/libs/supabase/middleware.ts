import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";

import { type NextRequest, NextResponse } from "next/server";

import { AUTH_PATHS, HOME_R, LOGIN_R } from "~config/routes";

interface CookieToSet {
    name: string;
    value: string;
    options?: CookieOptions;
}

function isPublicPath(pathname: string): boolean {
    return AUTH_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
    );
}

function redirectWithCookies(url: URL, src: NextResponse): NextResponse {
    const r = NextResponse.redirect(url);
    src.cookies.getAll().forEach((c) => {
        const { name, value, ...options } = c;
        r.cookies.set(name, value, options as CookieOptions);
    });
    return r;
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
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isPublic = isPublicPath(pathname);

    if (user && isPublic) {
        return redirectWithCookies(new URL(HOME_R(), request.url), response);
    }

    if (!user && !isPublic) {
        return redirectWithCookies(new URL(LOGIN_R(), request.url), response);
    }

    return response;
}
