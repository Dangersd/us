// Все маршруты приложения. Никаких хардкодов в компонентах.
export const HOME_R = () => "/";
export const MOOD_R = () => "/mood";
export const CALENDAR_R = () => "/calendar";
export const WISHLIST_R = () => "/wishlist";
export const PROFILE_R = () => "/profile";
export const LOGIN_R = () => "/login";

// Публичные пути, на которые proxy пускает анонимного гостя.
export const AUTH_PATHS: readonly string[] = [LOGIN_R()];
