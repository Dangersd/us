import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";

import { cookies } from "next/headers";

interface CookieToSet {
    name: string;
    value: string;
    options?: CookieOptions;
}

export async function getServerSupabase() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: CookieToSet[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // Вызвано из Server Component;
                        // cookies устанавливаются через middleware (появится в Phase 0.2)
                    }
                },
            },
        },
    );
}
