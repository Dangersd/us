import type { EventCategory } from "~interfaces/calendar";
import type { EmotionId } from "~interfaces/mood";
import type { WishlistCategory } from "~interfaces/wishlist";

// Возвращаемая форма RPC `public.get_couple_stats()`. Каждое поле может быть
// null/empty — клиент рендерит «—» / пустые карточки graceful'но.
//
// `topPlaces[].name` — first-seen original casing (см. SQL миграцию).
export interface CoupleStats {
    topPlaces: Array<{ name: string; count: number }>;
    topCategories: Array<{ category: EventCategory; count: number }>;
    myTopEmotion: EmotionId | null;
    partnerTopEmotion: EmotionId | null;
    topWishlistCategory: WishlistCategory | null;
    memoriesCount: number;
}
