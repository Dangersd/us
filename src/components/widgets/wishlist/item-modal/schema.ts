import * as yup from "yup";

import { WISHLIST_CATEGORIES } from "~config/wishlist";
import type {
    WishlistCategory,
    WishlistList,
    WishlistPriority,
} from "~interfaces/wishlist";

const CATEGORY_IDS = WISHLIST_CATEGORIES.map((c) => c.id) as WishlistCategory[];
const LIST_IDS: WishlistList[] = ["want", "love", "shared"];
const PRIORITY_IDS: WishlistPriority[] = ["someday", "want", "really_want"];

// Form values держим как строки (не null), чтобы RHF + yup нормально работали.
// Конвертация пустых строк → null происходит в WishlistItemForm перед мутацией.
export interface WishlistFormValues {
    title: string;
    list: WishlistList;
    imageUrl: string;
    category: WishlistCategory;
    priority: WishlistPriority;
    priceEstimate: string;
    linkUrl: string;
    note: string;
}

// Простая URL-валидация: либо пустая строка, либо http(s) URL. Без SSRF-
// строгой проверки — это всё равно couple-only приватный кабинет.
const URL_RE = /^https?:\/\/\S+$/i;

export const wishlistItemSchema: yup.ObjectSchema<WishlistFormValues> = yup
    .object({
        title: yup
            .string()
            .trim()
            .required("название обязательно")
            .max(200, "до 200 символов"),
        list: yup
            .mixed<WishlistList>()
            .oneOf(LIST_IDS, "недопустимый список")
            .required(),
        imageUrl: yup
            .string()
            .trim()
            .max(2000, "слишком длинный URL")
            .test("url-or-empty", "укажи валидный URL", (v) =>
                !v ? true : URL_RE.test(v),
            )
            .defined(),
        category: yup
            .mixed<WishlistCategory>()
            .oneOf(CATEGORY_IDS, "выбери категорию")
            .required(),
        priority: yup.mixed<WishlistPriority>().oneOf(PRIORITY_IDS).required(),
        priceEstimate: yup.string().trim().max(60, "до 60 символов").defined(),
        linkUrl: yup
            .string()
            .trim()
            .max(2000, "слишком длинный URL")
            .test("url-or-empty", "укажи валидный URL", (v) =>
                !v ? true : URL_RE.test(v),
            )
            .defined(),
        note: yup.string().trim().max(4000, "до 4000 символов").defined(),
    })
    .required();
