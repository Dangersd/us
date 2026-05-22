// Inline script в <head>, выполняется до первого paint и до hydrate.
// Читает localStorage["grain"] / ["weather"] и ставит классы
// html.grain-off / html.weather-off если выключено. Так атмосферные слои
// не «мигают» при refresh когда пользователь их отключил (FOUC prevention).
//
// Try-catch — на случай заблокированного localStorage (приватные окна,
// iframe sandbox). Ключи хардкодены строками — синхронизировать с
// GRAIN_STORAGE_KEY (use-grain-setting.ts) и WEATHER_STORAGE_KEY
// (use-weather-setting.ts).
//
// Unified из бывших GrainBootScript + WeatherBootScript — добавление новых
// атмосферных toggle'ов в будущем (motion, contrast и т.д.) — здесь же.
const AtmosphereBootScript = () => (
    <script
        dangerouslySetInnerHTML={{
            __html: `try{var c=document.documentElement.classList;if(localStorage.getItem("grain")==="0")c.add("grain-off");if(localStorage.getItem("weather")==="0")c.add("weather-off");}catch(e){}`,
        }}
    />
);

export default AtmosphereBootScript;
