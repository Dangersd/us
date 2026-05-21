/**
 * Простой форматтер «X минут/часов/дней назад» для repair-эпизодов.
 * Намеренно низкая точность: ≤59 минут → «N минут», иначе часы, иначе дни.
 *
 * Возвращает «только что» для интервалов меньше минуты, чтобы избежать
 * мерцания «0 минут назад» при свежем submit + 30s polling.
 */
export function formatRelativeTime(
    fromIso: string,
    nowMs: number = Date.now(),
): string {
    const fromMs = new Date(fromIso).getTime();
    if (Number.isNaN(fromMs)) return "только что";

    const diffSec = Math.max(0, Math.floor((nowMs - fromMs) / 1000));
    if (diffSec < 60) return "только что";

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} ${pluralizeMinutes(diffMin)} назад`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} ${pluralizeHours(diffHr)} назад`;

    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} ${pluralizeDays(diffDay)} назад`;
}

function pluralizeMinutes(n: number): string {
    return ruPlural(n, ["минуту", "минуты", "минут"]);
}

function pluralizeHours(n: number): string {
    return ruPlural(n, ["час", "часа", "часов"]);
}

function pluralizeDays(n: number): string {
    return ruPlural(n, ["день", "дня", "дней"]);
}

function ruPlural(n: number, forms: [string, string, string]): string {
    const mod100 = n % 100;
    const mod10 = n % 10;
    if (mod100 >= 11 && mod100 <= 14) return forms[2];
    if (mod10 === 1) return forms[0];
    if (mod10 >= 2 && mod10 <= 4) return forms[1];
    return forms[2];
}
