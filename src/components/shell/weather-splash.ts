// Splash particle pool. Pure module, без React, без DOM (только Canvas2D).
// Стиль — тёплая cream (rgba(244,237,228,...)). Каждое попадание капли о
// surface создаёт "корону" из 4 мини-частиц с upward kick + gravity decay.
// Cooldown 200ms per surface защищает от спама splash при густом дожде.
//
// Stuck-drops (стекающие капли) удалены — оставлен только splash на ударе.

export interface SplashEvent {
    x: number;
    y: number;
    surfaceId: string;
    surfaceLeft: number;
    surfaceTop: number;
    surfaceWidth: number;
}

export interface SplashParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
}

const GRAVITY = 0.18;
const SPLASH_COOLDOWN_MS = 200;
const SPLASH_LIFE_DECAY = 0.05;

// Per-surface last spawn timestamp — throttle cooldown.
const lastSpawnAt = new Map<string, number>();

export const __resetSplashState = (): void => {
    lastSpawnAt.clear();
};

export const canSpawnOnSurface = (surfaceId: string, now: number): boolean => {
    const last = lastSpawnAt.get(surfaceId);
    return last === undefined || now - last >= SPLASH_COOLDOWN_MS;
};

export const markSpawn = (surfaceId: string, now: number): void => {
    lastSpawnAt.set(surfaceId, now);
};

export const spawnSplash = (pool: SplashParticle[], e: SplashEvent): void => {
    for (let i = 0; i < 4; i += 1) {
        pool.push({
            x: e.x + (Math.random() - 0.5) * 3,
            y: e.y,
            vx: (Math.random() - 0.5) * 2.4,
            vy: -Math.random() * 1.8 - 0.3,
            life: 1.0,
        });
    }
};

export const updateSplashPool = (pool: SplashParticle[]): void => {
    for (let i = pool.length - 1; i >= 0; i -= 1) {
        const p = pool[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += GRAVITY;
        p.life -= SPLASH_LIFE_DECAY;
        if (p.life <= 0) pool.splice(i, 1);
    }
};

const SPLASH_COLOR = "244, 237, 228";

export const drawSplashPool = (
    ctx: CanvasRenderingContext2D,
    pool: SplashParticle[],
): void => {
    for (let i = 0; i < pool.length; i += 1) {
        const p = pool[i];
        if (p.life <= 0) continue;
        ctx.fillStyle = `rgba(${SPLASH_COLOR}, ${p.life * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
    }
};
