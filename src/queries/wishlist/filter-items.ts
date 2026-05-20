import type { WishlistCategory, WishlistItem } from "~interfaces/wishlist";

// Чистая функция клиентской фильтрации. Извлечено в отдельный файл, чтобы
// можно было unit-тестировать без React Query / DOM.
//
// Семантика:
// - categories.length === 0 → проходят все категории (filter disabled);
// - categories.length > 0   → проходит item, чья category ∈ categories (OR).
// - search === ""           → проходит всё; иначе case-insensitive substring
//   match по title или note.
export interface FilterItemsArgs {
    categories: WishlistCategory[];
    search: string;
}

export function filterItems(
    items: WishlistItem[],
    { categories, search }: FilterItemsArgs,
): WishlistItem[] {
    const categorySet = new Set(categories);
    const needle = search.trim().toLowerCase();

    return items.filter((item) => {
        if (categorySet.size > 0 && !categorySet.has(item.category)) {
            return false;
        }
        if (needle.length === 0) return true;

        const hayTitle = item.title.toLowerCase();
        if (hayTitle.includes(needle)) return true;
        const hayNote = (item.note ?? "").toLowerCase();
        return hayNote.includes(needle);
    });
}
