// src/components/ui/blob-path.ts
// Чистая функция: генерация SVG path для closed N-point smooth-blob.
// Используется <Blob /> в каждом frame анимации.
//
// Алгоритм:
//   1. Полярные точки: для каждого i ∈ [0, N) считаем угол θ_i = 2π i/N.
//   2. Радиус каждой точки: r_i = radius + jitter * sin(phase + i * 2π/N) * radius.
//   3. Вертикальное сжатие: y-координата масштабируется на aspectY (0.7..1.0).
//   4. Smooth cubic-Bezier через все точки — handle length = (4/3) tan(π/(2N)) r_i,
//      направление handle'а — перпендикуляр к радиусу (касательная окружности).
//
// Результат — строка вида "M x0 y0 C cx1 cy1, cx2 cy2, x1 y1, C ..., Z".
// Идемпотентно для одного и того же набора параметров.

export interface BlobPathOpts {
    cx: number; // центр X (px)
    cy: number; // центр Y (px)
    radius: number; // базовый радиус (px)
    points: number; // 6-12, обычно 8
    jitter: number; // 0..0.18 — доля radius, амплитуда деформации
    aspectY: number; // 0.7..1.0 — вертикальное сжатие (1 = круг, 0.7 = "опавший")
    phase: number; // радианы, animation phase
}

interface Point {
    x: number;
    y: number;
    tx: number; // tangent x
    ty: number; // tangent y
    r: number;
}

function computePoints(opts: BlobPathOpts): Point[] {
    const { cx, cy, radius, points, jitter, aspectY, phase } = opts;
    const arr: Point[] = [];
    for (let i = 0; i < points; i++) {
        const theta = (i / points) * Math.PI * 2;
        const r = radius * (1 + jitter * Math.sin(phase + theta));
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r * aspectY;
        // tangent — поворот radial-вектора на 90° (против часовой)
        const tx = -Math.sin(theta);
        const ty = Math.cos(theta) * aspectY;
        arr.push({ x, y, tx, ty, r });
    }
    return arr;
}

export function blobPath(opts: BlobPathOpts): string {
    const pts = computePoints(opts);
    const n = pts.length;
    // Handle-длина: классическая аппроксимация окружности через cubic-Bezier.
    // Для каждого сегмента берём среднее r между соседями (точки разной длины
    // на отклонённом контуре — берём compromise, визуально достаточно).
    const k = (4 / 3) * Math.tan(Math.PI / (2 * n));

    const fmt = (v: number) => v.toFixed(2);
    const segments: string[] = [];
    segments.push(`M ${fmt(pts[0].x)} ${fmt(pts[0].y)}`);
    for (let i = 0; i < n; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % n];
        const ra = a.r * k;
        const rb = b.r * k;
        const cp1x = a.x + a.tx * ra;
        const cp1y = a.y + a.ty * ra;
        const cp2x = b.x - b.tx * rb;
        const cp2y = b.y - b.ty * rb;
        segments.push(
            `C ${fmt(cp1x)} ${fmt(cp1y)}, ${fmt(cp2x)} ${fmt(cp2y)}, ${fmt(b.x)} ${fmt(b.y)}`,
        );
    }
    segments.push("Z");
    return segments.join(" ");
}
