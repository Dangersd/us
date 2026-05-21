// RU плюрализация для счётчиков «N дней» / «N часов» — стандартная
// mod10/mod100 формула.
function pluralizeRu(
    n: number,
    [one, few, many]: readonly [string, string, string],
): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
}

export function pluralizeDays(n: number): string {
    return pluralizeRu(n, ["день", "дня", "дней"]);
}

export function pluralizeHours(n: number): string {
    return pluralizeRu(n, ["час", "часа", "часов"]);
}
