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

export function maskTime(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
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
