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
// event/idea ушли из URL — модалки управляются ModalProvider.
export const CALENDAR_VIEW_PARAM = "view";
export const CALENDAR_MONTH_PARAM = "m";
export const CALENDAR_DATE_PARAM = "d";

// Wishlist searchparam: ?tab=<WishlistTabId>. См. ~config/wishlist.WISHLIST_TABS.
export const WISHLIST_TAB_PARAM = "tab";
