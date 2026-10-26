// Dot-matrix entity generator. Each entity is a stack of SDF layers painted onto an N×N LCD grid.
// Tones: 0 = unlit, 1 = faint, 2 = mid, 3 = ink, 4 = accent (eyes / core).

export function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const len = (x, y) => Math.hypot(x, y);
const circle = (cx, cy, r) => (x, y) => len(x - cx, y - cy) - r;
const ellipse = (cx, cy, rx, ry) => (x, y) => (len((x - cx) / rx, (y - cy) / ry) - 1) * Math.min(rx, ry);
const box = (cx, cy, hx, hy) => (x, y) => { const dx = Math.abs(x - cx) - hx, dy = Math.abs(y - cy) - hy; return len(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0); };
const seg = (ax, ay, bx, by, r) => (x, y) => { const px = x - ax, py = y - ay, vx = bx - ax, vy = by - ay; const h = Math.max(0, Math.min(1, (px * vx + py * vy) / (vx * vx + vy * vy))); return len(px - vx * h, py - vy * h) - r; };
const ring = (cx, cy, r, w) => (x, y) => Math.abs(len(x - cx, y - cy) - r) - w;
const U = (...fs) => (x, y) => Math.min(...fs.map(f => f(x, y)));
const S = (a, b) => (x, y) => Math.max(a(x, y), -b(x, y));
const I = (a, b) => (x, y) => Math.max(a(x, y), b(x, y));
const tri = (ax, ay, bx, by, cx, cy) => (x, y) => { // inside test only, returns -1/1
  const s = (px, py, qx, qy, rx, ry) => (px - rx) * (qy - ry) - (qx - rx) * (py - ry);
  const d1 = s(x, y, ax, ay, bx, by), d2 = s(x, y, bx, by, cx, cy), d3 = s(x, y, cx, cy, ax, ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
  return neg && pos ? 1 : -1;
};
const L = (f, t, o = {}) => Object.assign({ f, t }, o);

// --- the nine entities + the urge ---
function smooth(pts, per = 6) { const out = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]; for (let k = 0; k < per; k++) { const t = k / per, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } } out.push(pts[pts.length - 1]); return out; }
const WORM = (() => { const pts = smooth([[-0.92, 0.92], [-0.6, 0.62], [0.3, 0.5], [0.7, 0.28], [0.5, 0.06], [-0.42, -0.04], [-0.7, -0.28], [-0.46, -0.52], [0.1, -0.56], [0.4, -0.6]]); return pts.map((p, i) => [p[0], p[1], 0.045 + 0.075 * i / (pts.length - 1)]); })();
const SPIRAL = (() => { const out = []; for (let i = 0; i < 46; i++) { const th = i / 45 * 3.6 * Math.PI; const r = 0.06 + 0.185 * th / Math.PI; out.push([Math.cos(th + 1.2) * r, Math.sin(th + 1.2) * r + 0.04, 0.06 + 0.09 * i / 45]); } return out; })();

export const DEFS = {
  // E-01 THE WHISPERER — a hood with nothing inside but two points and a mouth near your ear
  whisperer: [
    L(U(ellipse(0, -0.12, 0.6, 0.78), box(0, 0.62, 0.74, 0.36)), 3),
    L(ellipse(0, 0.02, 0.33, 0.5), 0),
    L(ring(0, 0.02, 0.36, 0.035), 2),
    L(box(-0.14, -0.08, 0.06, 0.035), 4), L(box(0.14, -0.08, 0.06, 0.035), 4),
    L(box(0.02, 0.24, 0.12, 0.025), 2),
    L(I(ring(0.2, 0.22, 0.62, 0.035), (x, y) => 0.74 - x), 1),
    L(I(ring(0.2, 0.22, 0.8, 0.035), (x, y) => 0.88 - x), 1),
    L(box(0, 0.9, 0.74, 0.04), 2),
  ],
  // E-02 SIREN — a pale face that sings, hair falling into the dark
  siren: [
    ...[-0.62, -0.46, -0.3, 0.3, 0.46, 0.62].map((x0, i) => L((x, y) => (y < -0.35 || y > 0.98) ? 1 : Math.abs(x - (x0 + 0.07 * Math.sin(y * 7 + i))) - 0.055, i % 2 ? 2 : 3)),
    L(ellipse(0, -0.3, 0.42, 0.5), 3),
    L(ellipse(0, -0.2, 0.27, 0.36), 1, { dither: true }),
    L(ellipse(-0.12, -0.26, 0.08, 0.06), 3), L(ellipse(0.12, -0.26, 0.08, 0.06), 3),
    L(circle(-0.12, -0.26, 0.03), 4), L(circle(0.12, -0.26, 0.03), 4),
    L(ellipse(0, 0.0, 0.06, 0.08), 3),
    L(U(seg(-0.2, 0.3, 0, 0.55, 0.05), seg(0.2, 0.3, 0, 0.55, 0.05)), 2),
  ],
  // E-03 HOLLOW — a skull that is mostly absence
  hollow: [
    L(circle(0, -0.12, 0.66), 3),
    L(box(0, 0.5, 0.36, 0.22), 3),
    L(I(circle(0, -0.12, 0.66), (x, y) => 0.1 - y), 2, { dither: true }),
    L(circle(-0.26, -0.12, 0.2), 0), L(circle(0.26, -0.12, 0.2), 0),
    L(circle(-0.26, -0.1, 0.045), 4), L(circle(0.26, -0.1, 0.045), 4),
    L(tri(0, 0.08, -0.07, 0.22, 0.07, 0.22), 0),
    L(box(0, 0.5, 0.24, 0.07), 0),
    ...[-0.18, -0.06, 0.06, 0.18].map(x0 => L(box(x0, 0.5, 0.025, 0.08), 3)),
    L(U(seg(0.05, -0.78, 0.14, -0.5, 0.03), seg(0.14, -0.5, 0.08, -0.36, 0.03)), 0),
  ],
  // E-04 DOPA-WYRM — a ringed worm coiled around the phone you take to bed
  wyrm: [
    L(S(box(0, 0.1, 0.3, 0.6), box(0, 0.12, 0.23, 0.5)), 3),
    L(box(0, 0.12, 0.23, 0.5), 1, { dither: true }),
    L(box(0, -0.42, 0.08, 0.025), 2),
    L(circle(0.12, -0.3, 0.045), 4),
    L(U(...WORM.slice(0, -1).map((p, i) => seg(p[0], p[1], WORM[i + 1][0], WORM[i + 1][1], p[2] + 0.06))), 0),
    ...WORM.slice(0, -1).map((p, i) => L(seg(p[0], p[1], WORM[i + 1][0], WORM[i + 1][1], p[2]), Math.floor(i / 3) % 2 ? 2 : 3)),
    L(circle(0.6, -0.64, 0.3), 0),
    L(circle(0.6, -0.64, 0.25), 3),
    L(circle(0.62, -0.6, 0.14), 0),
    ...Array.from({ length: 9 }, (_, k) => { const a = k / 9 * Math.PI * 2; return L(box(0.62 + Math.cos(a) * 0.13, -0.6 + Math.sin(a) * 0.13, 0.028, 0.028), 3); }),
    L(circle(0.62, -0.6, 0.04), 4),
  ],
  // E-05 THE GLASS — a mirror that shows the old you
  glass: [
    L(S(box(0, 0.06, 0.56, 0.8), box(0, 0.06, 0.45, 0.69)), 3),
    L(circle(0, -0.8, 0.12), 3),
    L(box(0, 0.06, 0.45, 0.69), 1, { dither: true }),
    L(U(circle(0, -0.2, 0.19), ellipse(0, 0.55, 0.38, 0.3)), 2),
    L(box(-0.07, -0.21, 0.035, 0.02), 4), L(box(0.07, -0.21, 0.035, 0.02), 4),
    ...[[0.3, -0.5], [0.42, 0.1], [-0.1, 0.5], [0.4, 0.55], [-0.3, -0.35]].map(([x, y]) => L(seg(0.14, -0.06, x, y, 0.022), 0)),
  ],
  // E-06 ECHO-LEGION — the same memory, replayed, each copy weaker
  legion: [
    ...[-0.6, -0.3, 0, 0.3, 0.6].map(x => L(circle(x, -0.55, 0.11), 1)),
    ...[-0.45, -0.15, 0.15, 0.45].map(x => L(U(circle(x, -0.12, 0.14), ellipse(x, 0.06, 0.15, 0.06)), 2)),
    ...[-0.42, -0.14, 0.14, 0.42].map(x => L(box(x, -0.13, 0.08, 0.02), 0)),
    ...[-0.5, 0, 0.5].map(x => L(U(circle(x, 0.42, 0.21), ellipse(x, 0.74, 0.25, 0.14)), 3)),
    ...[-0.5, 0, 0.5].flatMap(x => [L(circle(x - 0.08, 0.4, 0.04), 4), L(circle(x + 0.08, 0.4, 0.04), 4)]),
  ],
  // E-07 REBOOT — the machine that wants to reinstall the old system
  reboot: [
    L(seg(0, -0.6, 0, -0.86, 0.035), 3), L(circle(0, -0.9, 0.07), 4),
    L(S(box(0, 0.02, 0.6, 0.6), U(tri(-0.6, -0.58, -0.4, -0.58, -0.6, -0.38), tri(0.6, -0.58, 0.4, -0.58, 0.6, -0.38))), 3),
    L(circle(0, -0.1, 0.32), 0),
    L(ring(0, -0.1, 0.24, 0.035), 2),
    L(circle(0, -0.1, 0.12), 4),
    L(box(-0.36, 0.38, 0.14, 0.025), 0), L(box(0.36, 0.38, 0.14, 0.025), 0),
    L(circle(-0.5, 0.38, 0.05), 2), L(circle(0.5, 0.38, 0.05), 2),
    ...[-0.24, -0.12, 0, 0.12, 0.24].map(x => L(box(x, 0.46, 0.03, 0.1), 0)),
    L(box(0, 0.8, 0.34, 0.12), 2, { dither: true }),
  ],
  // E-08 SOVEREIGN — an old king on an empty throne
  sovereign: [
    L(S(box(0, 0.16, 0.78, 0.76), box(0, 0.22, 0.66, 0.66)), 1, { dither: true }),
    L(box(0, -0.44, 0.44, 0.08), 3),
    ...[[-0.4, 0.22], [-0.2, 0.3], [0, 0.42], [0.2, 0.3], [0.4, 0.22]].map(([x, h]) => L(tri(x - 0.1, -0.5, x + 0.1, -0.5, x, -0.5 - h), 3)),
    L(circle(0, -0.44, 0.05), 4),
    L(ellipse(0, -0.04, 0.34, 0.36), 2),
    L(box(-0.14, -0.06, 0.08, 0.025), 0), L(box(0.14, -0.06, 0.08, 0.025), 0),
    L((x, y) => (y < 0.18 || y > 0.95) ? 1 : Math.abs(x) - (0.2 + (y - 0.18) * 0.62), 3),
    L(box(0, 0.5, 0.025, 0.36), 2),
  ],
  // E-09 THE ORIGIN — the eye at the bottom of the feed
  origin: [
    ...Array.from({ length: 14 }, (_, k) => { const a = k / 14 * Math.PI * 2; return L(seg(Math.cos(a) * 0.78, Math.sin(a) * 0.78, Math.cos(a) * 0.96, Math.sin(a) * 0.96, 0.035), 2); }),
    L(ring(0, 0, 0.68, 0.025), 1),
    L(I(circle(0, 0.55, 0.85), circle(0, -0.55, 0.85)), 3),
    L(I(circle(0, 0.6, 0.78), circle(0, -0.6, 0.78)), 1, { dither: true }),
    L(circle(0, 0, 0.27), 2),
    L(circle(0, 0, 0.13), 4),
    L(circle(0.07, -0.07, 0.035), 1),
  ],
  // URGE — what shows up at 23:14. Many eyes, one mouth.
  urge: [
    L(U(circle(0, -0.1, 0.55), circle(-0.42, 0.12, 0.33), circle(0.42, 0.12, 0.33), circle(0, 0.32, 0.42)), 3),
    ...[[-0.5, 0.45, 0.95], [-0.25, 0.6, 0.98], [0.05, 0.62, 0.9], [0.32, 0.55, 0.97], [0.55, 0.42, 0.85]].map(([x, y0, y1]) => L(seg(x, y0, x + 0.05, y1, 0.045), 2)),
    L(I(U(circle(0, -0.1, 0.55), circle(-0.42, 0.12, 0.33), circle(0.42, 0.12, 0.33)), (x, y) => y + 0.25), 2, { dither: true }),
    ...[[-0.2, -0.3, 0.09], [0.2, -0.3, 0.09], [0, -0.52, 0.06], [-0.45, 0.02, 0.06], [0.45, 0.02, 0.06], [-0.36, -0.36, 0.045], [0.36, -0.36, 0.045]].flatMap(([x, y, r]) => [L(circle(x, y, r + 0.05), 0), L(circle(x, y, r), 4)]),
    L(ellipse(0, 0.2, 0.36, 0.1), 0),
    ...[-0.28, -0.14, 0, 0.14, 0.28].map(x => L(tri(x - 0.05, 0.12, x + 0.05, 0.12, x, 0.24), 3)),
    ...[-0.21, -0.07, 0.07, 0.21].map(x => L(tri(x - 0.05, 0.3, x + 0.05, 0.3, x, 0.18), 3)),
  ],
};

// Rasterise to an N×N grid of tones (3×3 supersampling, majority coverage).
export function raster(def, n) {
  const g = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    for (const l of DEFS[def]) {
      let hit = 0;
      for (let sy = 0; sy < 3; sy++) for (let sx = 0; sx < 3; sx++) {
        const u = ((x + (sx + 0.5) / 3) / n) * 2 - 1, v = ((y + (sy + 0.5) / 3) / n) * 2 - 1;
        if (l.f(u, v) <= 0) hit++;
      }
      if (hit >= 5) {
        if (l.dither && l.t > 0 && (x + y) % 2) continue;
        g[y][x] = l.t;
      }
    }
  }
  return g;
}

export const PAL = {
  bone:   { off: '#1b1916', offA: 0.13, t: [null, '#aca491', '#6d675b', '#1b1916', '#d23a1e'] },
  boneDim:{ off: '#1b1916', offA: 0.10, t: [null, '#bdb6a5', '#a69e8c', '#8e8778', '#b07a6a'] },
  blood:  { off: '#ffb4a8', offA: 0.10, t: [null, '#5e2420', '#a8352a', '#ff4a32', '#f6e6dc'] },
  ice:    { off: '#a9dcff', offA: 0.09, t: [null, '#26404f', '#4f7f9c', '#a9dcff', '#ff4b3a'] },
  iceDim: { off: '#a9dcff', offA: 0.07, t: [null, '#16252e', '#203643', '#2d4a5b', '#5a3a38'] },
};

// Square-pixel path for every lit cell of a tone; unlit cells get a tiny dot.
// opts: hp (0..1, decayed cells fade to tone 1), scatter (0..1, cells fly off as particles), seed, locked (noise)
export function svg(def, { n = 24, cell = 9, pal = 'bone', hp = 1, scatter = 0, seed = 7, locked = false, gap = 0.16, offDots = true, pad = 0 } = {}) {
  const P = PAL[pal], g = locked ? null : raster(def, n), r = rng(seed), k = rng(seed * 13 + 5);
  const paths = { 1: '', 2: '', 3: '', 4: '' }; let off = '', code = ''; const parts = [];
  const W = n * cell + pad * 2, s = cell * (1 - gap), o = (cell - s) / 2;
  const sq = (px, py, sz) => `M${(px).toFixed(2)} ${(py).toFixed(2)}h${sz.toFixed(2)}v${sz.toFixed(2)}h${(-sz).toFixed(2)}z`;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let t = locked ? (k() < 0.22 ? (k() < 0.5 ? 1 : 2) : 0) : g[y][x];
    const decay = k();
    if (t && t !== 4 && decay > 0.3 + 0.7 * hp) t = 1;
    const px = pad + x * cell, py = pad + y * cell;
    if (!t) { code += '0'; if (offDots) off += `M${(px + cell / 2 - 0.8).toFixed(2)} ${(py + cell / 2 - 0.8).toFixed(2)}h1.6v1.6h-1.6z`; continue; }
    if (scatter && r() < scatter * (1.15 - y / n)) {
      const dx = (r() * 4 - 1) * cell, dy = -(1 + r() * 7) * cell, sz = s * (0.25 + r() * 0.5);
      if (py + dy > 0) { const tt = t === 4 ? 4 : Math.max(1, t - 1); paths[tt] += sq(px + o + dx, py + o + dy, sz); parts.push([tt, +(px + o + dx).toFixed(1), +(py + o + dy).toFixed(1), +sz.toFixed(2)]); }
      code += '0';
      if (offDots) off += `M${(px + cell / 2 - 0.8).toFixed(2)} ${(py + cell / 2 - 0.8).toFixed(2)}h1.6v1.6h-1.6z`;
      continue;
    }
    paths[t] += sq(px + o, py + o, s); code += t;
  }
  const sp = { def, n, c: cell, s: +s.toFixed(3), o: +o.toFixed(3), pad, g: code, p: parts, off: offDots ? 1 : 0, P: [P.off, P.offA, ...P.t.slice(1)] };
  let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}" data-sp='${JSON.stringify(sp)}'>`;
  if (off) out += `<path d="${off}" fill="${P.off}" fill-opacity="${P.offA}"/>`;
  for (const t of [1, 2, 3, 4]) if (paths[t]) out += `<path d="${paths[t]}" fill="${P.t[t]}"/>`;
  return out + '</svg>';
}

// Ruled background grid (one path) for panels.
export function gridSvg(w, h, step, color, alpha) {
  let d = '';
  for (let x = step; x < w; x += step) d += `M${x} 0V${h}`;
  for (let y = step; y < h; y += step) d += `M0 ${y}H${w}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" data-pat='${JSON.stringify({ k: 'grid', w, h, step, color, alpha })}'><path d="${d}" stroke="${color}" stroke-opacity="${alpha}" stroke-width="1" fill="none"/></svg>`;
}

// Dot field background.
export function dotsSvg(w, h, step, color, alpha, size = 1.2) {
  let d = '';
  for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) d += `M${(x - size / 2).toFixed(1)} ${(y - size / 2).toFixed(1)}h${size}v${size}h${-size}z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" data-pat='${JSON.stringify({ k: 'dots', w, h, step, color, alpha, size })}'><path d="${d}" fill="${color}" fill-opacity="${alpha}"/></svg>`;
}
