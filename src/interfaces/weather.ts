// Weather domain types. Используются в src/queries/weather/* и
// src/components/shell/WeatherLayer.tsx + WeatherCanvas + weather-particles.

export type WeatherStateKind = "clear" | "cloudy" | "rain" | "snow";

export interface WeatherSnapshot {
    state: WeatherStateKind;
    isDay: boolean;
    temperature: number;
    windSpeed: number;
    fetchedAt: number;
}
