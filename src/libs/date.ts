// Дата-helper'ы. Все даты-как-строки в проекте — локальная дата клиента
// в ISO-формате (YYYY-MM-DD). en-CA locale даёт ISO без таймзонных сдвигов,
// в отличие от .toISOString().slice(0,10), который шлёт UTC и ломается на
// границе суток в любой таймзоне ≠ UTC.

export function todayDateString(): string {
    return new Date().toLocaleDateString("en-CA");
}
