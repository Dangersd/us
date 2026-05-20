import type { AppUser } from "~interfaces/user";
import { getBrowserSupabase } from "~libs/supabase/client";
import {
    USER_COLUMNS,
    type UserRow,
    mapUserRow,
} from "~queries/user/map-user-row";

// RLS-инвариант: policy users_select_couple
// (supabase/migrations/20260519000000_init_couple_users.sql:48) ограничивает
// видимость в таблице users рамками couple_id текущего пользователя. Поэтому
// .neq("id", auth.user.id) гарантированно возвращает строго одну строку
// партнёра (или null, если пара ещё неполная). Если будущая миграция ослабит
// эту policy — этот запрос начнёт возвращать «multiple rows» через
// .maybeSingle(). Грэп на «users_select_couple» в кодовой базе должен указать
// на это место.
export async function fetchPartnerProfile(): Promise<AppUser | null> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;

    const { data, error } = await supabase
        .from("users")
        .select(USER_COLUMNS)
        .neq("id", auth.user.id)
        .maybeSingle<UserRow>();
    if (error) throw error;
    return data ? mapUserRow(data) : null;
}
