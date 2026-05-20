// Маски для form-полей: ввод только цифрами, авто-подстановка разделителей.
// Отображаемый формат: ДД-ММ-ГГГГ / ЧЧ:ММ.
// БД-формат: YYYY-MM-DD / HH:MM(:SS). Конвертация — отдельные хелперы.

export function maskDate(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) {
        return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

// Время в 24-часовом формате с clamping по позициям:
// - hour digit 1: 0-2 пропускается, 3-9 → auto-prepend "0" (так "5" → "05")
// - hour digit 2: если первая цифра "2", вторая ограничена 0-3 (макс. час 23)
// - minute digit 1: 0-5 (макс. 59 → первая цифра ≤ 5)
// - minute digit 2: 0-9
// Невалидные пишутся как clamped, не отбрасываются — иначе backspace ломается.
export function maskTime(raw: string): string {
    const all = raw.replace(/\D/g, "");
    let digits = "";

    for (let i = 0; i < all.length && digits.length < 4; i++) {
        const d = all[i];
        const pos = digits.length;
        if (pos === 0) {
            // 3-9 не могут начать валидный 2-digit час (≥ 30) — auto-prepend 0.
            digits += d >= "3" ? `0${d}` : d;
        } else if (pos === 1) {
            const firstHour = digits[0];
            // При "2X" — clamp X в 0-3 (макс. час 23).
            digits += firstHour === "2" && d > "3" ? "3" : d;
        } else if (pos === 2) {
            // Первая цифра минут — макс. 5 (макс. минута 59).
            digits += d > "5" ? "5" : d;
        } else {
            digits += d;
        }
    }

    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

// "20-05-2024" → "2024-05-20" (ISO). Если не валидный display — возвращаем
// исходник, пусть yup отловит.
export function displayDateToIso(masked: string): string {
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(masked);
    if (!m) return masked;
    return `${m[3]}-${m[2]}-${m[1]}`;
}

// "2024-05-20" → "20-05-2024" (display).
export function isoToDisplayDate(iso: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) return iso;
    return `${m[3]}-${m[2]}-${m[1]}`;
}
