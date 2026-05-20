// Все маршруты приложения. Никаких хардкодов в компонентах.
export const HOME_R = () => "/";
export const MOOD_R = () => "/mood";
export const MOOD_HISTORY_R = () => "/mood/history";
export const CALENDAR_R = () => "/calendar";
export const WISHLIST_R = () => "/wishlist";
export const PROFILE_R = () => "/profile";
export const LOGIN_R = () => "/login";

// Публичные пути, на которые proxy пускает анонимного гостя.
export const AUTH_PATHS: readonly string[] = [LOGIN_R()];

// Calendar searchparam'ы — single source of truth, чтобы не было
// stringly-typed `searchParams.get('view')` рассыпанных по компонентам.
export const CALENDAR_VIEW_PARAM = "view";
export const CALENDAR_EVENT_PARAM = "event";
export const CALENDAR_IDEA_PARAM = "idea";
export const CALENDAR_MONTH_PARAM = "m";
export const CALENDAR_DATE_PARAM = "d";
