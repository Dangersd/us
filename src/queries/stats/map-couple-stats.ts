import type { EventCategory } from "~interfaces/calendar";
import type { EmotionId } from "~interfaces/mood";
import type { CoupleStats } from "~interfaces/stats";
import type { WishlistCategory } from "~interfaces/wishlist";

// Известные литералы — узкие енумы из DB constraint'ов.
// Mapper фильтрует неизвестные значения в null/skip, чтобы враждебный/
// испорченный jsonb не положил типизацию вниз по стеку.
const EVENT_CATEGORIES: ReadonlySet<EventCategory> = new Set([
    "date",
    "dinner",
    "cinema",
    "trip",
    "anniversary",
    "birthday",
    "generic",
]);

const EMOTIONS: ReadonlySet<EmotionId> = new Set([
    "warm",
    "calm",
    "sad",
    "anxious",
    "joyful",
    "tired",
    "tender",
    "empty",
]);

const WISHLIST_CATEGORIES: ReadonlySet<WishlistCategory> = new Set([
    "clothing",
    "fragrance",
    "books",
    "home",
    "food",
    "experience",
    "travel",
    "other",
]);

interface RawPlace {
    name?: unknown;
    count?: unknown;
}
interface RawCategory {
    category?: unknown;
    count?: unknown;
}

// Принимает RAW jsonb (unknown), возвращает типизированный shape.
// null/невалидный вход → дефолтный shape с пустыми массивами и null'ами,
// чтобы UI рендерил empty-states без crash.
export function mapCoupleStats(raw: unknown): CoupleStats {
    if (!raw || typeof raw !== "object") return emptyStats();
    const obj = raw as Record<string, unknown>;

    return {
        topPlaces: mapTopPlaces(obj.topPlaces),
        topCategories: mapTopCategories(obj.topCategories),
        myTopEmotion: mapEmotion(obj.myTopEmotion),
        partnerTopEmotion: mapEmotion(obj.partnerTopEmotion),
        topWishlistCategory: mapWishlistCategory(obj.topWishlistCategory),
        memoriesCount: mapCount(obj.memoriesCount),
    };
}

function emptyStats(): CoupleStats {
    return {
        topPlaces: [],
        topCategories: [],
        myTopEmotion: null,
        partnerTopEmotion: null,
        topWishlistCategory: null,
        memoriesCount: 0,
    };
}

function mapTopPlaces(raw: unknown): CoupleStats["topPlaces"] {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((r: RawPlace) => {
            if (!r || typeof r !== "object") return null;
            const name = typeof r.name === "string" ? r.name : null;
            const count =
                typeof r.count === "number" ? r.count : Number(r.count);
            if (!name || !Number.isFinite(count)) return null;
            return { name, count };
        })
        .filter((x): x is { name: string; count: number } => x !== null);
}

function mapTopCategories(raw: unknown): CoupleStats["topCategories"] {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((r: RawCategory) => {
            if (!r || typeof r !== "object") return null;
            const cat = typeof r.category === "string" ? r.category : null;
            const count =
                typeof r.count === "number" ? r.count : Number(r.count);
            if (!cat || !EVENT_CATEGORIES.has(cat as EventCategory))
                return null;
            if (!Number.isFinite(count)) return null;
            return { category: cat as EventCategory, count };
        })
        .filter(
            (x): x is { category: EventCategory; count: number } => x !== null,
        );
}

function mapEmotion(raw: unknown): EmotionId | null {
    if (typeof raw !== "string") return null;
    return EMOTIONS.has(raw as EmotionId) ? (raw as EmotionId) : null;
}

function mapWishlistCategory(raw: unknown): WishlistCategory | null {
    if (typeof raw !== "string") return null;
    return WISHLIST_CATEGORIES.has(raw as WishlistCategory)
        ? (raw as WishlistCategory)
        : null;
}

function mapCount(raw: unknown): number {
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string") {
        const n = Number(raw);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
}
