// Opacity-decay для P9 partner-life-pulse: чем больше часов с момента
// последнего mood-checkin партнёра, тем приглушённее блоб. Floor 0.55 —
// иначе блоб читается как render-bug, не «партнёр тихо» (см. design review
// в plan/p0-p1-dazzling-bird.md → P9 freshness floor).
//
// hoursSince === null → нет mood сегодня, статичный приглушённый блоб (0.5).
// hoursSince ∈ [0, 6]  → 1.0 (свежо, полная видимость)
// hoursSince ∈ [6, 46] → линейный спад от 1.0 до 0.55
// hoursSince > 46      → 0.55 (floor)
export const freshnessFromHours = (hoursSince: number | null): number => {
    if (hoursSince == null) return 0.5;
    return Math.max(0.55, 1 - Math.max(0, hoursSince - 6) / 40);
};
