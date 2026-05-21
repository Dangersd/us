import { RU_MONTHS_GEN, RU_WEEKDAY_SHORT } from "~libs/date";

// "Пт · 22 мая" по ISO YYYY-MM-DD. ISO weekday (Пн=1..Вс=7), UTC чтобы
// не цеплять runtime tz.
export function formatDateLine(occurrenceDate: string): string {
    const [y, m, d] = occurrenceDate.split("-").map(Number);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const dowIdx = dow === 0 ? 6 : dow - 1;
    return `${RU_WEEKDAY_SHORT[dowIdx]} · ${d} ${RU_MONTHS_GEN[m - 1] ?? ""}`;
}
