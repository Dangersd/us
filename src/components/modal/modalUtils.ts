// Тулза для tracking-classes на <body>. ModalProvider добавляет .open_modal
// при открытии любой модалки в стеке, убирает когда стек пуст.
// CSS правило в src/styles/globals.css:
//   .open_modal #global_content { position: fixed !important; width: 100%; }
// фиксирует контентный wrapper, блокируя скролл и сохраняя scrollY.

let openCount = 0;
let savedScrollY = 0;

export function lockBodyScroll() {
    if (typeof document === "undefined") return;
    if (openCount === 0) {
        savedScrollY = window.scrollY;
        document.body.classList.add("open_modal");
        // global_content получает position: fixed через CSS, выставляем top
        // отрицательным scrollY чтобы content остался "на месте" визуально.
        const gc = document.getElementById("global_content");
        if (gc) gc.style.top = `-${savedScrollY}px`;
    }
    openCount += 1;
}

export function unlockBodyScroll() {
    if (typeof document === "undefined") return;
    openCount = Math.max(0, openCount - 1);
    if (openCount === 0) {
        document.body.classList.remove("open_modal");
        const gc = document.getElementById("global_content");
        if (gc) gc.style.top = "";
        window.scrollTo(0, savedScrollY);
    }
}

// Для уверенности при HMR / fast-refresh.
export function resetBodyScrollLock() {
    openCount = 0;
    if (typeof document !== "undefined") {
        document.body.classList.remove("open_modal");
        const gc = document.getElementById("global_content");
        if (gc) gc.style.top = "";
    }
}
