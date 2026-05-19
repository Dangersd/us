export type Gender = "male" | "female";

export interface AppUser {
    id: string;
    coupleId: string;
    gender: Gender;
    displayName: string;
    birthday: string | null;
    personalHueVariant: string | null;
    settings: Record<string, unknown>;
}
