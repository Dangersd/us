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
