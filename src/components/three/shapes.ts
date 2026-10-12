// Target positions for every particle in each assembly stage.
// Stage order: idea swarm → phone → browser → neural lattice → cloud → globe.

type Vec3 = [number, number, number];
type Emitter = { weight: number; emit: () => Vec3 };

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261007);
const range = (a: number, b: number) => a + rand() * (b - a);

function onSphere(): Vec3 {
  const z = rand() * 2 - 1;
  const t = rand() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  return [r * Math.cos(t), r * Math.sin(t), z];
}

function inSphere(r: number): Vec3 {
  const [x, y, z] = onSphere();
  const k = r * Math.cbrt(rand());
  return [x * k, y * k, z * k];
}

/** A point on the outline of a rounded rectangle centred at the origin */
function roundedOutline(w: number, h: number, r: number): [number, number] {
  const sx = w - 2 * r;
  const sy = h - 2 * r;
  const arc = (Math.PI * r) / 2;
  const total = 2 * sx + 2 * sy + 4 * arc;
  let s = rand() * total;
  if (s < sx) return [-sx / 2 + s, h / 2];
  s -= sx;
  if (s < sx) return [-sx / 2 + s, -h / 2];
  s -= sx;
  if (s < sy) return [w / 2, -sy / 2 + s];
  s -= sy;
  if (s < sy) return [-w / 2, -sy / 2 + s];
  s -= sy;
  const corner = Math.min(3, Math.floor(s / arc));
  const a = ((s % arc) / arc) * (Math.PI / 2) + corner * (Math.PI / 2);
  const cx = corner === 0 || corner === 3 ? sx / 2 : -sx / 2;
  const cy = corner === 0 || corner === 1 ? sy / 2 : -sy / 2;
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
}

const fill = (cx: number, cy: number, w: number, h: number, z = 0) => (): Vec3 => [
  cx + range(-w / 2, w / 2),
  cy + range(-h / 2, h / 2),
  z,
];

const outline = (cx: number, cy: number, w: number, h: number, r = 0.02, z = 0) => (): Vec3 => {
  const [x, y] = roundedOutline(w, h, r);
  return [cx + x, cy + y, z];
};

const disc = (cx: number, cy: number, r: number, z = 0) => (): Vec3 => {
  const a = rand() * Math.PI * 2;
  const k = r * Math.sqrt(rand());
  return [cx + Math.cos(a) * k, cy + Math.sin(a) * k, z];
};

function sampleEmitters(emitters: Emitter[], n: number, out: Float32Array, jitter = 0.006) {
  const total = emitters.reduce((s, e) => s + e.weight, 0);
  const cdf: number[] = [];
  let acc = 0;
  for (const e of emitters) cdf.push((acc += e.weight / total));
  for (let i = 0; i < n; i++) {
    const r = rand();
    let k = 0;
    while (k < cdf.length - 1 && r > cdf[k]) k++;
    const [x, y, z] = emitters[k].emit();
    out[i * 3] = x + range(-jitter, jitter);
    out[i * 3 + 1] = y + range(-jitter, jitter);
    out[i * 3 + 2] = z + range(-jitter, jitter);
  }
}

function idea(n: number, out: Float32Array) {
  for (let i = 0; i < n; i++) {
    let p: Vec3;
    if (i % 9 === 0) {
      p = inSphere(0.16);
    } else {
      const d = onSphere();
      const r = 0.35 + 2.3 * Math.pow(rand(), 1.7);
      p = [d[0] * r, d[1] * r * 0.82, d[2] * r * 0.7];
    }
    out.set(p, i * 3);
  }
}

function phone(n: number, out: Float32Array) {
  const W = 1.5, H = 3.0, R = 0.24, D = 0.09, S = D * 0.6;
  sampleEmitters(
    [
      { weight: 18, emit: outline(0, 0, W, H, R, D) },
      { weight: 7, emit: outline(0, 0, W, H, R, -D) },
      { weight: 6, emit: () => { const [x, y] = roundedOutline(W, H, R); return [x, y, range(-D, D)]; } },
      { weight: 3, emit: outline(0, 0, W - 0.14, H - 0.14, R - 0.06, S) },
      { weight: 1.2, emit: fill(0, H / 2 - 0.18, 0.38, 0.08, S) },
      { weight: 2, emit: fill(-0.22, 1.08, 0.78, 0.07, S) },
      { weight: 13, emit: fill(0, 0.6, 1.16, 0.6, S) },
      { weight: 2, emit: fill(-0.03, 0.12, 1.1, 0.045, S) },
      { weight: 1.7, emit: fill(-0.13, -0.02, 0.9, 0.045, S) },
      { weight: 1.8, emit: fill(-0.08, -0.16, 1.0, 0.045, S) },
      ...[-0.4, 0, 0.4].flatMap((x) =>
        [-0.5, -0.9].map((y) => ({ weight: 2.4, emit: outline(x, y, 0.32, 0.32, 0.07, S) })),
      ),
      { weight: 1, emit: fill(0, -1.3, 0.5, 0.035, S) },
    ],
    n,
    out,
  );
}

function browser(n: number, out: Float32Array) {
  const W = 3.0, H = 2.0;
  sampleEmitters(
    [
      { weight: 16, emit: outline(0, 0, W, H, 0.08) },
      { weight: 5, emit: fill(0, H / 2 - 0.22, W, 0.012) },
      { weight: 0.8, emit: disc(-1.36, 0.89, 0.035) },
      { weight: 0.8, emit: disc(-1.25, 0.89, 0.035) },
      { weight: 0.8, emit: disc(-1.14, 0.89, 0.035) },
      { weight: 3, emit: outline(0.15, 0.89, 1.5, 0.1, 0.05) },
      { weight: 6, emit: fill(-0.68, 0.5, 1.4, 0.15) },
      { weight: 2, emit: fill(-0.78, 0.28, 1.2, 0.04) },
      { weight: 1.7, emit: fill(-0.88, 0.18, 1.0, 0.04) },
      { weight: 2, emit: fill(-1.12, 0.0, 0.46, 0.12) },
      { weight: 13, emit: fill(0.78, 0.28, 1.15, 0.68) },
      ...[-0.95, 0, 0.95].flatMap((x) => [
        { weight: 3.5, emit: outline(x, -0.6, 0.8, 0.5, 0.04) },
        { weight: 0.9, emit: fill(x - 0.08, -0.5, 0.5, 0.035) },
      ]),
    ],
    n,
    out,
  );
  for (let i = 0; i < n; i++) out[i * 3 + 2] += range(-0.03, 0.03);
}

function neural(n: number, out: Float32Array) {
  const layers = [
    { x: -1.8, count: 3, r: 0.55 },
    { x: -0.9, count: 6, r: 1.05 },
    { x: 0, count: 8, r: 1.3 },
    { x: 0.9, count: 6, r: 1.05 },
    { x: 1.8, count: 3, r: 0.55 },
  ];
  const nodes: Vec3[][] = layers.map((l, li) =>
    Array.from({ length: l.count }, (_, k) => {
      const a = (k / l.count) * Math.PI * 2 + li * 0.4;
      return [l.x, Math.cos(a) * l.r, Math.sin(a) * l.r] as Vec3;
    }),
  );
  const flat = nodes.flat();
  const edges: [Vec3, Vec3][] = [];
  for (let li = 0; li < nodes.length - 1; li++)
    for (const a of nodes[li]) for (const b of nodes[li + 1]) edges.push([a, b]);

  for (let i = 0; i < n; i++) {
    let p: Vec3;
    if (rand() < 0.34) {
      const c = flat[Math.floor(rand() * flat.length)];
      const o = inSphere(0.085);
      p = [c[0] + o[0], c[1] + o[1], c[2] + o[2]];
    } else {
      const [a, b] = edges[Math.floor(rand() * edges.length)];
      const t = rand();
      p = [
        a[0] + (b[0] - a[0]) * t + range(-0.008, 0.008),
        a[1] + (b[1] - a[1]) * t + range(-0.008, 0.008),
        a[2] + (b[2] - a[2]) * t + range(-0.008, 0.008),
      ];
    }
    out.set(p, i * 3);
  }
}

function cloud(n: number, out: Float32Array) {
  const lift = 0.45;
  const spheres = [
    [-1.05, -0.15, 0, 0.62],
    [-0.2, 0.2, 0, 0.95],
    [0.85, -0.05, 0, 0.75],
    [0.3, -0.3, 0.35, 0.55],
    [-0.6, -0.3, -0.3, 0.55],
  ];
  const base = -0.55;
  const weights = spheres.map((s) => s[3] * s[3]);
  const wsum = weights.reduce((a, b) => a + b, 0);
  const streams = [-1.1, -0.65, -0.2, 0.25, 0.7, 1.15];

  for (let i = 0; i < n; i++) {
    let p: Vec3;
    if (rand() < 0.14) {
      const x = streams[Math.floor(rand() * streams.length)];
      let t = rand();
      while ((t * 7) % 1 > 0.55) t = rand();
      p = [x + range(-0.01, 0.01), base - 0.18 - t * 1.25, range(-0.01, 0.01)];
    } else {
      p = [0, 0, 0];
      for (let tries = 0; tries < 24; tries++) {
        let r = rand() * wsum;
        let k = 0;
        while (k < weights.length - 1 && r > weights[k]) r -= weights[k++];
        const [cx, cy, cz, rad] = spheres[k];
        const d = onSphere();
        const q: Vec3 = [cx + d[0] * rad, cy + d[1] * rad, cz + d[2] * rad];
        const buried = spheres.some(
          (s, j) => j !== k && Math.hypot(q[0] - s[0], q[1] - s[1], q[2] - s[2]) < s[3] * 0.98,
        );
        if (buried) continue;
        if (q[1] < base) q[1] = base;
        p = q;
        break;
      }
    }
    p[1] += lift;
    out.set(p, i * 3);
  }
}

export const OFFICES = [
  { city: "Toronto", lat: 43.65, lon: -79.38 },
  { city: "Florida", lat: 27.99, lon: -81.76 },
  { city: "Dubai", lat: 25.2, lon: 55.27 },
  { city: "Riyadh", lat: 24.71, lon: 46.67 },
  { city: "Karachi", lat: 24.86, lon: 67.0 },
];

const ROUTES: [number, number][] = [
  [0, 1],
  [1, 3],
  [3, 2],
  [2, 4],
  [0, 2],
  [1, 4],
];

function globe(n: number, out: Float32Array, kind: Float32Array) {
  const R = 1.45;
  const lon0 = -8;
  const tilt = 0.42;
  const toVec = (lat: number, lon: number): Vec3 => {
    const p = (lat * Math.PI) / 180;
    const l = ((lon - lon0) * Math.PI) / 180;
    const x = Math.cos(p) * Math.sin(l);
    const y = Math.sin(p);
    const z = Math.cos(p) * Math.cos(l);
    return [x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)];
  };
  const offices = OFFICES.map((o) => toVec(o.lat, o.lon));

  const nShell = Math.floor(n * 0.6);
  const nOffice = Math.floor(n * 0.1);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < n; i++) {
    let p: Vec3;
    if (i < nShell) {
      const y = 1 - (2 * (i + 0.5)) / nShell;
      const r = Math.sqrt(1 - y * y);
      const t = i * golden;
      p = [Math.cos(t) * r * R, y * R, Math.sin(t) * r * R];
      kind[i] = 0;
    } else if (i < nShell + nOffice) {
      const o = offices[i % offices.length];
      const j = inSphere(0.05);
      p = [o[0] * R * 1.01 + j[0], o[1] * R * 1.01 + j[1], o[2] * R * 1.01 + j[2]];
      kind[i] = 1;
    } else {
      const [ai, bi] = ROUTES[i % ROUTES.length];
      const a = offices[ai];
      const b = offices[bi];
      const t = rand();
      const omega = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      const s = Math.sin(omega);
      const ka = Math.sin((1 - t) * omega) / s;
      const kb = Math.sin(t * omega) / s;
      const h = R * (1 + 0.12 * omega * Math.sin(Math.PI * t));
      p = [
        (a[0] * ka + b[0] * kb) * h,
        (a[1] * ka + b[1] * kb) * h,
        (a[2] * ka + b[2] * kb) * h,
      ];
      kind[i] = 2;
    }
    out.set(p, i * 3);
  }
}

function scale(a: Float32Array, k: number) {
  for (let i = 0; i < a.length; i++) a[i] *= k;
}

export function buildShapes(n: number) {
  const targets = Array.from({ length: 6 }, () => new Float32Array(n * 3));
  const kind = new Float32Array(n);
  const seed = new Float32Array(n);
  for (let i = 0; i < n; i++) seed[i] = rand();

  idea(n, targets[0]);
  phone(n, targets[1]);
  browser(n, targets[2]);
  neural(n, targets[3]);
  cloud(n, targets[4]);
  scale(targets[3], 0.82);
  scale(targets[4], 0.88);
  globe(n, targets[5], kind);

  return { targets, kind, seed };
}
