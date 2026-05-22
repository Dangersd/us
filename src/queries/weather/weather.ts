import { useQuery } from "@tanstack/react-query";

import {
    WEATHER_REFRESH_MS,
    WEATHER_STALE_MS,
    buildWeatherUrl,
    parseWeatherResponse,
} from "~config/weather";
import type { WeatherSnapshot } from "~interfaces/weather";

// Weather query — read-only, без auth, public API (Open-Meteo).
// Не следует pattern src/queries/<domain>/{keys,fetch,hook,index}, потому что
// домен слишком маленький: один query, нет мутаций, нет invalidation,
// нет map-row (сырая JSON). Single-file достаточно. См. autoplan-решение C5.

export const WEATHER_QUERY_KEY = ["weather", "bishkek"] as const;

export const fetchCurrentWeather =
    async (): Promise<WeatherSnapshot | null> => {
        const res = await fetch(buildWeatherUrl(), { cache: "no-store" });
        if (!res.ok) return null;
        const raw = (await res.json()) as unknown;
        return parseWeatherResponse(raw);
    };

export const useCurrentWeather = ({ enabled }: { enabled: boolean }) =>
    useQuery({
        queryKey: WEATHER_QUERY_KEY,
        queryFn: fetchCurrentWeather,
        enabled,
        staleTime: WEATHER_STALE_MS,
        refetchInterval: WEATHER_REFRESH_MS,
        refetchOnWindowFocus: true,
    });
