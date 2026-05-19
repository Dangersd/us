import type { AppUser, Gender } from "~interfaces/user";

export interface UserRow {
    id: string;
    couple_id: string;
    gender: Gender;
    display_name: string;
    birthday: string | null;
    personal_hue_variant: string | null;
    settings: Record<string, unknown> | null;
}

export const USER_COLUMNS =
    "id, couple_id, gender, display_name, birthday, personal_hue_variant, settings";

export function mapUserRow(row: UserRow): AppUser {
    return {
        id: row.id,
        coupleId: row.couple_id,
        gender: row.gender,
        displayName: row.display_name,
        birthday: row.birthday,
        personalHueVariant: row.personal_hue_variant,
        settings: row.settings ?? {},
    };
}
