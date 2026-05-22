import type { WeatherSnapshot, WeatherStateKind } from "~interfaces/weather";

// Хардкод Бишкека — оба пользователя там (см. memory project_couple_tz).
// Если кто-то поедет — пока принимаем dissonance "в Бишкеке снег, у меня
// солнце"; добавление поля "город" в Профиль deferred (см. TODOS.md).
export const BISHKEK_COORDS = { lat: 42.87, lon: 74.59 } as const;

// Open-Meteo обновляется ~раз в 15 мин. Refresh с запасом, focus-фокус сам
// обновит данные при возврате через час.
export const WEATHER_STALE_MS = 15 * 60 * 1000;
export const WEATHER_REFRESH_MS = 30 * 60 * 1000;

// Open-Meteo current API.
export const buildWeatherUrl = (): string => {
    const params = new URLSearchParams({
        latitude: BISHKEK_COORDS.lat.toString(),
        longitude: BISHKEK_COORDS.lon.toString(),
        current: "weather_code,is_day,temperature_2m,wind_speed_10m",
        timezone: "Asia/Bishkek",
    });
    return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
};

// WMO weather_code → 4 базовых state. Туман схлапывается в облачно,
// гроза — в дождь. Неизвестные коды → cloudy fallback.
// https://open-meteo.com/en/docs#weathervariables
export const wmoToState = (code: number): WeatherStateKind => {
    if (code <= 1) return "clear";
    if (code <= 3 || code === 45 || code === 48) return "cloudy";
    if (
        (code >= 51 && code <= 67) ||
        (code >= 80 && code <= 82) ||
        (code >= 95 && code <= 99)
    ) {
        return "rain";
    }
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
    return "cloudy";
};

// Debug override — НЕ работает в production (dead code по NODE_ENV).
// dev/staging: NEXT_PUBLIC_WEATHER_DEBUG_STATE=rain → форсим состояние.
const DEBUG_STATE: WeatherStateKind | undefined =
    process.env.NODE_ENV !== "production"
        ? (process.env.NEXT_PUBLIC_WEATHER_DEBUG_STATE as
              | WeatherStateKind
              | undefined)
        : undefined;

const isValidDebugState = (v: unknown): v is WeatherStateKind =>
    v === "clear" || v === "cloudy" || v === "rain" || v === "snow";

// Defensive parse сырого ответа Open-Meteo. Возвращает null если структура
// не та (rate-limit page, partial JSON, API change). React Query трактует
// null так же как "нет погоды" → WeatherLayer рендерит null.
export const parseWeatherResponse = (raw: unknown): WeatherSnapshot | null => {
    if (!raw || typeof raw !== "object") return null;
    const root = raw as Record<string, unknown>;
    const data = root.current as Record<string, unknown> | undefined;
    if (!data) return null;
    const code = data.weather_code;
    if (typeof code !== "number") return null;

    const isDayRaw = data.is_day;
    const temp = data.temperature_2m;
    const wind = data.wind_speed_10m;

    const state =
        DEBUG_STATE && isValidDebugState(DEBUG_STATE)
            ? DEBUG_STATE
            : wmoToState(code);

    return {
        state,
        isDay: isDayRaw === 1 || isDayRaw === true,
        temperature: typeof temp === "number" ? temp : 0,
        windSpeed: typeof wind === "number" ? wind : 0,
        fetchedAt: Date.now(),
    };
};
