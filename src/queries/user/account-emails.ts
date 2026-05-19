import type { Gender } from "~interfaces/user";

// Email-алиасы существуют только под капотом. В UI не показываем.
export const ACCOUNT_EMAILS: Record<Gender, string> = {
    male: "him@us.local",
    female: "her@us.local",
};
