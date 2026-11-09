// Motion geometry and simulation from the supplied Designing Veli preview.
const TAU = Math.PI * 2;
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function bez(x1, y1, x2, y2) {
  const cx = 3 * x1,
    bx = 3 * (x2 - x1) - cx,
    ax = 1 - cx - bx,
    cy = 3 * y1,
    by = 3 * (y2 - y1) - cy,
    ay = 1 - cy - by;
  const X = (t) => ((ax * t + bx) * t + cx) * t,
    Y = (t) => ((ay * t + by) * t + cy) * t,
    dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = X(t) - x,
        d = dX(t);
      if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    return Y(Math.min(1, Math.max(0, t)));
  };
}
const C = {
  settle: bez(0.22, 1, 0.36, 1),
  exit: bez(0.32, 0, 0.67, 0),
  move: bez(0.65, 0, 0.35, 1),
  sine: bez(0.37, 0, 0.63, 1),
  press: bez(0.25, 0.46, 0.45, 0.94),
  ripple: bez(0.15, 0.6, 0.35, 1),
};
const SAND = {
  T: 6,
  breaths: 2,
  glowAmp: [0.16, 0.14, 0.12, 0.12],
  glowLag: 0.55,
  coreRise: 7,
  coreDim: 0.25,
  waves: 2,
  waveAmp: 7,
  waveLen: 300,
  waveLift: 0.35,
  lean: 16,
  bend: [0.5, 1.2],
  unbend: [4.5, 0.9],
};
const DOTS = {
  wander: [1.5, 3.5],
  relax: 1.4,
  damping: 0.8,
  reach: [4, 10],
  kick: 0.7,
  spacing: 6.5,
  fps: 60,
  substeps: 3,
  warmLoops: 3,
};

const seg = (t, t0, d, c) => c((t - t0) / d);
function prepareCurve(I) {
  const op = I.curveD.match(/-?[\d.]+/g).map(Number);
  const pair = (i) => [op[2 * i], op[2 * i + 1]];
  const centreLine = [];
  let width = 0;
  for (let k = 0; k <= 18; k++) {
    const f = pair(6 + k),
      b = pair(48 - k);
    centreLine.push({ x: (f[0] + b[0]) / 2, y: (f[1] + b[1]) / 2 });
    if (k % 3 === 0) width += Math.hypot(f[0] - b[0], f[1] - b[1]) / 7;
  }
  const P0 = [I.lineB[0], Math.max(I.lineB[1], I.lineB[3])]; // foot of handle B (bottom-left anchor)
  const P3 = [I.lineA[0], Math.min(I.lineA[1], I.lineA[3])]; // head of handle A (top-right anchor)
  const yLin = (x) => P0[1] + ((x - P0[0]) / (P3[0] - P0[0])) * (P3[1] - P0[1]);
  const poly = [];
  for (let i = 0; i < 18; i += 3) {
    const [a, b, c, d] = [centreLine[i], centreLine[i + 1], centreLine[i + 2], centreLine[i + 3]];
    for (let s = 0; s <= 40; s++) {
      const u = s / 40,
        v = 1 - u;
      poly.push([
        v * v * v * a.x + 3 * v * v * u * b.x + 3 * v * u * u * c.x + u * u * u * d.x,
        v * v * v * a.y + 3 * v * v * u * b.y + 3 * v * u * u * c.y + u * u * u * d.y,
      ]);
    }
  }
  const polyX = poly.slice().sort((p, q) => p[0] - q[0]);
  const yCurve = (x) => {
    if (x <= polyX[0][0]) return polyX[0][1];
    for (let i = 1; i < polyX.length; i++)
      if (polyX[i][0] >= x) {
        const [x0, y0] = polyX[i - 1],
          [x1, y1] = polyX[i];
        return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
      }
    return polyX[polyX.length - 1][1];
  };
  centreLine.forEach((c) => {
    c.off = yLin(c.x) - c.y;
  });
  const bendAt = (t) =>
    t < SAND.bend[0]
      ? 0
      : t < SAND.unbend[0]
        ? seg(t, SAND.bend[0], SAND.bend[1], C.settle)
        : 1 - seg(t, SAND.unbend[0], SAND.unbend[1], C.move);

  return { centreLine, width, P0, P3, yLin, yCurve, poly, bendAt };
}
function simulate(centres, P0, P3, yLin, yCurve, polyParam, bendAt, T) {
  const m = centres.length,
    n = Math.round(T * DOTS.fps),
    dt = 1 / (DOTS.fps * DOTS.substeps);
  const pick = [];
  for (let i = 0; i < polyParam.length; i += 4) pick.push(polyParam[i]);
  pick.push(polyParam[polyParam.length - 1]);
  pick.sort((a, b) => (a[1] === b[1] ? a[0] - b[0] : b[1] - a[1]));
  const base = pick.map(([x, y]) => ({ x, yc: y, yl: yLin(x) }));
  const lineAt = (k) => base.map((p) => [p.x, p.yl + (p.yc - p.yl) * k, p.yc - p.yl]);
  const nearest = (L, px, py) => {
    let best = { d2: Infinity };
    for (let i = 0; i < L.length - 1; i++) {
      const [ax, ay, av] = L[i],
        [bx, by, bv] = L[i + 1],
        ex = bx - ax,
        ey = by - ay,
        l2 = ex * ex + ey * ey || 1e-9;
      const u = Math.max(0, Math.min(1, ((px - ax) * ex + (py - ay) * ey) / l2)),
        qx = ax + ex * u,
        qy = ay + ey * u,
        d2 = (px - qx) ** 2 + (py - qy) ** 2;
      if (d2 < best.d2) {
        const l = Math.sqrt(l2);
        best = {
          d2,
          qx,
          qy,
          nx: -ey / l,
          ny: ex / l,
          dyk: av + (bv - av) * u,
        };
      }
    }
    return best;
  };
  seed = 4242;
  const P = centres.map(([x, y]) => {
    const xc = Math.min(Math.max(x, P0[0]), P3[0]),
      hy = y + (yLin(xc) - yCurve(xc));
    return {
      ox: x,
      oy: y,
      hx: x,
      hy,
      x,
      y: hy,
      vx: 0,
      vy: 0,
      r: DOTS.wander[0] + rnd() * (DOTS.wander[1] - DOTS.wander[0]),
      reach: DOTS.reach[0] + rnd() * (DOTS.reach[1] - DOTS.reach[0]),
      f1: 1 + Math.floor(rnd() * 2),
      f2: 1 + Math.floor(rnd() * 2),
      p1: rnd() * TAU,
      p2: rnd() * TAU,
      side: 1,
    };
  });
  const L0 = lineAt(0);
  for (const p of P) {
    const q = nearest(L0, p.hx, p.hy);
    p.side = Math.sign((p.hx - q.qx) * q.nx + (p.hy - q.qy) * q.ny) || 1;
  }
  const w = TAU / DOTS.relax,
    ks = w * w,
    cd = 2 * DOTS.damping * w,
    out = new Float32Array(n * m * 2),
    total = (DOTS.warmLoops + 1) * n * DOTS.substeps;
  let kPrev = bendAt(0);
  for (let s = 0; s < total; s++) {
    const t = ((s + 1) * dt) % T,
      k = bendAt(t),
      dk = (k - kPrev) / dt;
    kPrev = k;
    const L = lineAt(k);
    for (const p of P) {
      const tx = p.hx + p.r * Math.sin((TAU * p.f1 * t) / T + p.p1),
        ty = p.hy + p.r * Math.sin((TAU * p.f2 * t) / T + p.p2);
      p.vx += (ks * (tx - p.x) - cd * p.vx) * dt;
      p.vy += (ks * (ty - p.y) - cd * p.vy) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    for (let i = 0; i < m; i++)
      for (let j = i + 1; j < m; j++) {
        const a = P[i],
          b = P[j],
          dx = b.x - a.x,
          dy = b.y - a.y,
          d2 = dx * dx + dy * dy;
        if (d2 < DOTS.spacing * DOTS.spacing && d2 > 1e-6) {
          const d = Math.sqrt(d2),
            o = (DOTS.spacing - d) / 2,
            ux = dx / d,
            uy = dy / d;
          a.x -= ux * o;
          a.y -= uy * o;
          b.x += ux * o;
          b.y += uy * o;
          const rv = (b.vx - a.vx) * ux + (b.vy - a.vy) * uy;
          if (rv < 0) {
            a.vx += (ux * rv) / 2;
            a.vy += (uy * rv) / 2;
            b.vx -= (ux * rv) / 2;
            b.vy -= (uy * rv) / 2;
          }
        }
      }
    for (const p of P) {
      const q = nearest(L, p.x, p.y),
        nx = q.nx * p.side,
        ny = q.ny * p.side,
        d = (p.x - q.qx) * nx + (p.y - q.qy) * ny;
      if (d < p.reach) {
        p.x += nx * (p.reach - d);
        p.y += ny * (p.reach - d);
        const lv = q.dyk * dk * ny,
          vn = p.vx * nx + p.vy * ny;
        if (vn < lv) {
          const add = (lv - vn) * (1 + DOTS.kick);
          p.vx += nx * add;
          p.vy += ny * add;
        }
      }
    }
    if (Math.floor(s / (n * DOTS.substeps)) === DOTS.warmLoops && (s + 1) % DOTS.substeps === 0) {
      const fi = ((Math.floor(s / DOTS.substeps) % n) + 1) % n;
      for (let i = 0; i < m; i++) {
        out[(fi * m + i) * 2] = P[i].x - P[i].ox;
        out[(fi * m + i) * 2 + 1] = P[i].y - P[i].oy;
      }
    }
  }
  for (let i = 0; i < m; i++)
    for (let c = 0; c < 2; c++) {
      const first = out[i * 2 + c],
        last = out[((n - 1) * m + i) * 2 + c],
        err = last + (last - out[((n - 2) * m + i) * 2 + c]) - first;
      for (let f = 0; f < n; f++) out[(f * m + i) * 2 + c] -= err * (f / n);
    }
  return { d: out, n, m };
}

export { C, SAND, DOTS, prepareCurve, simulate };
