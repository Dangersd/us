import type {
    WishlistCategory,
    WishlistList,
    WishlistPriority,
} from "~interfaces/wishlist";

// 8 категорий, hex'ы locked в плане /autoplan. Палитра — около #FFB4D1 (rose-peach
// hue комнаты) + соседние тёплые тона. Используется как dot 8px на карточке +
// в фильтр-чипах и в radial-gradient под no-image fallback.
export const WISHLIST_CATEGORIES: ReadonlyArray<{
    id: WishlistCategory;
    label: string;
    dot: `#${string}`;
}> = [
    { id: "clothing", label: "Одежда", dot: "#FFB4D1" },
    { id: "fragrance", label: "Парфюм", dot: "#E8B4FF" },
    { id: "books", label: "Книги", dot: "#F4D08A" },
    { id: "home", label: "Дом", dot: "#FFC9A8" },
    { id: "food", label: "Еда", dot: "#F4A5B9" },
    { id: "experience", label: "Опыт", dot: "#A8C9FF" },
    { id: "travel", label: "Путешествие", dot: "#E8A87C" },
    { id: "other", label: "Другое", dot: "#BFB3A8" },
] as const;

export const WISHLIST_CATEGORY_BY_ID: Record<
    WishlistCategory,
    (typeof WISHLIST_CATEGORIES)[number]
> = Object.fromEntries(WISHLIST_CATEGORIES.map((c) => [c.id, c])) as Record<
    WishlistCategory,
    (typeof WISHLIST_CATEGORIES)[number]
>;

// Priority — три тихие градации, без чисел. Визуально: 3 круглые pip'а
// (4×4px) в правом-верхнем углу image-области карточки: заполнены столько
// штук, сколько соответствует priority.
export const WISHLIST_PRIORITY_LABELS: Record<WishlistPriority, string> = {
    someday: "Когда-нибудь",
    want: "Хочется",
    really_want: "Очень хочется",
};

export const WISHLIST_PRIORITY_PIPS: Record<WishlistPriority, number> = {
    someday: 1,
    want: 2,
    really_want: 3,
};

// 5-tab UI: «Хочет / Хочу / Наше / Я люблю / Любит».
// Каждый таб = фильтр (list, owner_id), где owner_id resolves относительно
// текущего пользователя и партнёра в couple.
//
// readOnly = true → нет FAB и нет edit-modal по тапу карточки. Используется
// для partner-views: partner.want («Хочет») и partner.love («Любит»).
//
// owner: "me" | "partner" | null (null означает list='shared' где owner_id null).
export type WishlistTabId =
    | "partner-want"
    | "my-want"
    | "shared"
    | "my-love"
    | "partner-love";

export interface WishlistTab {
    id: WishlistTabId;
    label: string;
    list: WishlistList;
    owner: "me" | "partner" | null;
    readOnly: boolean;
}

// readOnly === true означает: нет FAB (нельзя добавлять в чужой список) и тап
// по карточке не открывает edit-modal. Edit/delete на per-card уровне всё равно
// скрываются для не-owner item'ов (см. WishlistItemCard).
export const WISHLIST_TABS: ReadonlyArray<WishlistTab> = [
    {
        id: "partner-want",
        label: "Хочет",
        list: "want",
        owner: "partner",
        readOnly: true,
    },
    {
        id: "my-want",
        label: "Хочу",
        list: "want",
        owner: "me",
        readOnly: false,
    },
    {
        id: "shared",
        label: "Наше",
        list: "shared",
        owner: null,
        readOnly: false,
    },
    {
        id: "my-love",
        label: "Я люблю",
        list: "love",
        owner: "me",
        readOnly: false,
    },
    {
        id: "partner-love",
        label: "Любит",
        list: "love",
        owner: "partner",
        readOnly: true,
    },
] as const;

export const WISHLIST_TAB_BY_ID: Record<WishlistTabId, WishlistTab> =
    Object.fromEntries(WISHLIST_TABS.map((t) => [t.id, t])) as Record<
        WishlistTabId,
        WishlistTab
    >;

// Per-tab копии empty-state. Тон комнаты — тёплый, romantic.
export const WISHLIST_EMPTY_COPY: Record<WishlistTabId, string> = {
    "partner-want": "Пока пусто — её/его список наполнится",
    "my-want": "Что бы ты хотел? Добавь первую вещь",
    shared: "Что хотите вместе?",
    "my-love": "Что ты уже любишь? Партнёру пригодится для подарка",
    "partner-love": "Пока без подсказок — может, она ещё ничего не добавила",
};
