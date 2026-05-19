// Все маршруты приложения. Никаких хардкодов в компонентах.
// Phase 0.4 добавит MOOD_R / CALENDAR_R / WISHLIST_R / PROFILE_R.
export const HOME_R = () => "/";
export const LOGIN_R = () => "/login";

// Публичные пути, на которые proxy пускает анонимного гостя.
export const AUTH_PATHS: readonly string[] = [LOGIN_R()];
