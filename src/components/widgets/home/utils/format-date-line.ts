import { RU_MONTHS_GEN, RU_WEEKDAY_SHORT } from "~libs/date";

const ISO_DATE_STRICT_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// "Пт · 22 мая" по ISO YYYY-MM-DD. ISO weekday (Пн=1..Вс=7), UTC чтобы
// не цеплять runtime tz. На невалидный ввод возвращаем пустую строку,
// чтобы UI не показывал "undefined · NaN".
export function formatDateLine(occurrenceDate: string): string {
    if (!ISO_DATE_STRICT_RE.test(occurrenceDate)) return "";
    const [y, m, d] = occurrenceDate.split("-").map(Number);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const dowIdx = dow === 0 ? 6 : dow - 1;
    return `${RU_WEEKDAY_SHORT[dowIdx]} · ${d} ${RU_MONTHS_GEN[m - 1] ?? ""}`;
}
