// Дата-helper'ы. Все даты-как-строки в проекте — локальная дата клиента
// в ISO-формате (YYYY-MM-DD). en-CA locale даёт ISO без таймзонных сдвигов,
// в отличие от .toISOString().slice(0,10), который шлёт UTC и ломается на
// границе суток в любой таймзоне ≠ UTC.
//
// Сервер (Next.js на Vercel) бежит в UTC, поэтому без явного `tz` SSR-prefetch
// промахивается мимо клиентского дня в окне ~00:00–06:00 local (UTC+6, Бишкек).
// Передавай COUPLE_TZ при вызове из server components / route handlers.

export const COUPLE_TZ = "Asia/Bishkek";

export function todayDateString(tz?: string): string {
    if (tz) {
        return new Date().toLocaleDateString("en-CA", { timeZone: tz });
    }
    return new Date().toLocaleDateString("en-CA");
}

// ===== Range helpers (Phase 0.5.6) =====
//
// Все ниже работают в строках YYYY-MM-DD. UTC-арифметика, чтобы не цеплять
// TZ runtime-окружения — week/month boundaries вычисляются от уже
// TZ-aware-строки (которую обычно даёт todayDateString(COUPLE_TZ)).
//
// Намеренно НЕ тянем date-fns / dayjs: чистые функции на Date.UTC дешевле
// зависимости. Edge-cases (DST, високосный год, ISO-неделя) Date.UTC решает.

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_YM_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;
const ISO_DAY_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const RU_WEEKDAY_SHORT = [
    "Пн",
    "Вт",
    "Ср",
    "Чт",
    "Пт",
    "Сб",
    "Вс",
] as const;

// Именительный падеж: Intl возвращает родительный «мая» + суффикс «г.»,
// что ломает заголовок «май 2026».
export const RU_MONTHS_NOM = [
    "январь",
    "февраль",
    "март",
    "апрель",
    "май",
    "июнь",
    "июль",
    "август",
    "сентябрь",
    "октябрь",
    "ноябрь",
    "декабрь",
] as const;

interface YMD {
    y: number;
    m: number;
    d: number;
}

function parseIsoDate(date: string): YMD {
    if (!ISO_DATE_RE.test(date)) {
        throw new Error(`invalid date string: ${date}`);
    }
    const [y, m, d] = date.split("-").map(Number);
    return { y, m, d };
}

function formatIsoDate({ y, m, d }: YMD): string {
    const mm = String(m).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
}

export function addDays(date: string, days: number): string {
    const { y, m, d } = parseIsoDate(date);
    const t = Date.UTC(y, m - 1, d) + days * 86400000;
    const dt = new Date(t);
    return formatIsoDate({
        y: dt.getUTCFullYear(),
        m: dt.getUTCMonth() + 1,
        d: dt.getUTCDate(),
    });
}

// Понедельник недели, содержащей `date` (ISO-week, Пн=1).
export function startOfIsoWeek(date: string): string {
    const { y, m, d } = parseIsoDate(date);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const isoIdx = dow === 0 ? 7 : dow;
    return addDays(date, -(isoIdx - 1));
}

export function endOfIsoWeek(date: string): string {
    return addDays(startOfIsoWeek(date), 6);
}

export function currentYearMonth(tz?: string): string {
    return todayDateString(tz).slice(0, 7);
}

export function startOfMonth(ym: string): string {
    if (!ISO_YM_RE.test(ym)) throw new Error(`invalid year-month: ${ym}`);
    return `${ym}-01`;
}

export function endOfMonth(ym: string): string {
    const match = ISO_YM_RE.exec(ym);
    if (!match) throw new Error(`invalid year-month: ${ym}`);
    const y = Number(match[1]);
    const m = Number(match[2]);
    const dt = new Date(Date.UTC(y, m, 0));
    return formatIsoDate({
        y: dt.getUTCFullYear(),
        m: dt.getUTCMonth() + 1,
        d: dt.getUTCDate(),
    });
}

// Возвращает текущий месяц при невалидном вводе. Год 1900–2999 (за
// пределами — мусор или дата нашего внука).
export function parseYearMonth(raw: unknown, tz?: string): string {
    if (typeof raw !== "string") return currentYearMonth(tz);
    const match = ISO_YM_RE.exec(raw);
    if (!match) return currentYearMonth(tz);
    const y = Number(match[1]);
    if (y < 1900 || y > 2999) return currentYearMonth(tz);
    return raw;
}

// Должен лежать внутри переданного `ym`. null = невалидный или out-of-month.
export function parseDay(raw: unknown, ym: string): string | null {
    if (typeof raw !== "string") return null;
    if (!ISO_DAY_RE.test(raw)) return null;
    if (raw.slice(0, 7) !== ym) return null;
    return raw;
}

export function formatRuMonth(ym: string): string {
    const match = ISO_YM_RE.exec(ym);
    if (!match) return ym;
    const monthIdx = Number(match[2]) - 1;
    return `${RU_MONTHS_NOM[monthIdx]} ${match[1]}`;
}

// Centralized range helpers — server + client считают одинаковые start/end
// строки, иначе query keys разъезжаются и кэш промахивается.
export interface DateRange {
    start: string;
    end: string;
}

export function getWeekRange(date: string): DateRange {
    const start = startOfIsoWeek(date);
    return { start, end: addDays(start, 6) };
}

export function getMonthRange(ym: string): DateRange {
    return { start: startOfMonth(ym), end: endOfMonth(ym) };
}
