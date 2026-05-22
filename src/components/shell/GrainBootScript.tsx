// Inline script в <head>, выполняется до первого paint и до hydrate.
// Читает localStorage["grain"] и ставит html.grain-off если выключено.
// Так грейн не «мигает» при refresh когда пользователь его отключил
// (FOUC prevention). Try-catch — на случай заблокированного localStorage
// (приватные окна, iframe sandbox). Ключ хардкоден строкой — синхронизировать
// с GRAIN_STORAGE_KEY в use-grain-setting.ts.
const GrainBootScript = () => (
    <script
        dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("grain")==="0"){document.documentElement.classList.add("grain-off")}}catch(e){}`,
        }}
    />
);

export default GrainBootScript;
