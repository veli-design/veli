// Adapted from the designer’s veli-home-v2.html prototype in PD-1326.
// Keep the designer’s field parameters here so future motion revisions stay local.
export function initHomeStipple() {
  const canvasElement = document.getElementById('field');
  if (!canvasElement || !canvasElement.getContext('2d')) return;
  const html = document.documentElement;
  const S = {};
  function defineDefaults(values) {
    Object.assign(S, values);
  }
  const FRAME = [],
    ONBOOT = [];

  let LOW =
    html.dataset.reducedMotion === 'true' ||
    (html.dataset.reducedMotion === undefined &&
      matchMedia('(prefers-reduced-motion: reduce)').matches);

  function applyAll(kind) {
    heroApply(kind);
  }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const clamp01 = (v) => clamp(v, 0, 1);
  const smooth = (a, b, x) => {
    const t = clamp01((x - a) / (b - a || 1e-6));
    return t * t * (3 - 2 * t);
  };
  function mulberry32(a) {
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(20261015);
  function hexRgb(h) {
    h = String(h).trim();
    if (h[0] === '#') {
      if (h.length === 4) h = '#' + [...h.slice(1)].map((c) => c + c).join('');
      const n = parseInt(h.slice(1, 7), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    const m = h.match(/[\d.]+/g);
    return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
  }
  function mixHex(a, b, t) {
    const A = hexRgb(a),
      B = hexRgb(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
  }
  const PERM = new Uint8Array(512);
  (() => {
    const p = Array.from({ length: 256 }, (_, i) => i);
    const r = mulberry32(7);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
  })();
  const G3 = [
    1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1,
    1, 0, 1, -1, 0, -1, -1,
  ];
  function noise3(x, y, z) {
    const F = 1 / 3,
      G = 1 / 6;
    const s = (x + y + z) * F,
      i = Math.floor(x + s),
      j = Math.floor(y + s),
      k = Math.floor(z + s);
    const t = (i + j + k) * G,
      x0 = x - i + t,
      y0 = y - j + t,
      z0 = z - k + t;
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      }
    }
    const x1 = x0 - i1 + G,
      y1 = y0 - j1 + G,
      z1 = z0 - k1 + G;
    const x2 = x0 - i2 + 2 * G,
      y2 = y0 - j2 + 2 * G,
      z2 = z0 - k2 + 2 * G;
    const x3 = x0 - 1 + 3 * G,
      y3 = y0 - 1 + 3 * G,
      z3 = z0 - 1 + 3 * G;
    const ii = i & 255,
      jj = j & 255,
      kk = k & 255;
    let n = 0,
      tt,
      g;
    tt = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (tt > 0) {
      g = (PERM[ii + PERM[jj + PERM[kk]]] % 12) * 3;
      tt *= tt;
      n += tt * tt * (G3[g] * x0 + G3[g + 1] * y0 + G3[g + 2] * z0);
    }
    tt = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (tt > 0) {
      g = (PERM[ii + i1 + PERM[jj + j1 + PERM[kk + k1]]] % 12) * 3;
      tt *= tt;
      n += tt * tt * (G3[g] * x1 + G3[g + 1] * y1 + G3[g + 2] * z1);
    }
    tt = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (tt > 0) {
      g = (PERM[ii + i2 + PERM[jj + j2 + PERM[kk + k2]]] % 12) * 3;
      tt *= tt;
      n += tt * tt * (G3[g] * x2 + G3[g + 1] * y2 + G3[g + 2] * z2);
    }
    tt = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (tt > 0) {
      g = (PERM[ii + 1 + PERM[jj + 1 + PERM[kk + 1]]] % 12) * 3;
      tt *= tt;
      n += tt * tt * (G3[g] * x3 + G3[g + 1] * y3 + G3[g + 2] * z3);
    }
    return 32 * n;
  }
  function sdRoundRect(px, py, x0, y0, x1, y1, rad) {
    const hx = (x1 - x0) / 2,
      hy = (y1 - y0) / 2;
    const qx = Math.abs(px - (x0 + hx)) - (hx - rad),
      qy = Math.abs(py - (y0 + hy)) - (hy - rad);
    const ox = Math.max(qx, 0),
      oy = Math.max(qy, 0);
    return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - rad;
  }
  function rampFn(r) {
    if (r >= 1) return 1;
    if (r <= 0) return 0;
    return (15 / 8) * r - (10 / 8) * r * r * r + (3 / 8) * r * r * r * r * r;
  }
  const OUT = new Float32Array(3);
  defineDefaults({
    shape: 'dots',
    density: 80,
    dotSize: 4.4,
    sizeVar: 0,
    gap: 0.05,
    glyphDensity: 6,
    glyphs: 'ވ ލ ޑ ޒ ނ ސ ތ ރ',
    glyphSize: 18,
    glyphWidth: 108,
    weightMin: 300,
    weightMax: 700,
    weightMode: 'random',
    rotate: 'upright',
    flowSpeed: 3.04,
    flowScale: 287,
    detail: 0.14,
    turbulence: 0.81,
    circulation: 0.15,
    evolve: 0.0301,
    boundary: 38,
    jitter: 0,
    banding: 0.86,
    fade: 0.568,
    bandStyle: 'density',
    bandCount: 2.41,
    bandWidth: 0.53,
    bandSoft: 0.55,
    bandPhase: 0,
    coverage: 0.18,
    heroHeight: 1810,
    falloff: 990,
    tail: 0.31,
    stopFade: 200,
    bgSpeed: 0.77,
    scrollLag: 0.297,
    scrollBounce: 0,
    solidity: 0.04,
    inertia: 0.8,
    push: 0.3,
    spread: 0.2,
    pressure: 0.25,
    incompress: 0.5,
    restitution: 0.35,
    solidPad: 6,
    maxSpeed: 1600,
    gravity: 0,
    stiffness: 0.7,
    iterations: 2,
    solidBanner: true,
    solidLogo: true,
    solidText: true,
    solidCards: true,
    showSolids: false,
    colorA: '#87fd96',
    colorB: '#3babae',
    mix: 0,
    heatColor: '#055964',
    heat: 0.35,
    opacity: 1,
  });
  const GM = window.OPUS_GLYPHS ? window.OPUS_GLYPHS.meta : null;

  let glyphsReady = null;
  function loadGlyphs() {
    if (glyphsReady) return glyphsReady;
    glyphsReady = (async () => {
      if (!GM || typeof DecompressionStream === 'undefined') return null;
      const bytes = Uint8Array.from(atob(window.OPUS_GLYPHS.bin), (c) => c.charCodeAt(0));
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      const all = new Int16Array(await new Response(stream).arrayBuffer());
      const stops = GM.wght.length * GM.wdth.length;
      let off = 0;
      for (const g of GM.glyphs) {
        const len = g.n * stops,
          a = new Float32Array(len);
        for (let i = 0; i < len; i++) a[i] = i < g.n ? all[off + i] : all[off + i] + a[i - g.n];
        g.pts = a;
        off += len;
      }
      return GM;
    })();
    return glyphsReady;
  }
  function segOf(stops, v) {
    let k = 0;
    while (k < stops.length - 2 && stops[k + 1] < v) k++;
    return [k, clamp01((v - stops[k]) / (stops[k + 1] - stops[k]))];
  }
  function glyphPath(g, wght, wdth) {
    const W = GM.wght,
      nW = W.length,
      n = g.n,
      [k, t] = segOf(W, wght),
      [j, u] = segOf(GM.wdth, wdth);
    const o00 = (j * nW + k) * n,
      o01 = (j * nW + k + 1) * n,
      o10 = ((j + 1) * nW + k) * n,
      o11 = ((j + 1) * nW + k + 1) * n,
      P = g.pts;
    const at = (i) => {
      const a = P[o00 + i] + (P[o01 + i] - P[o00 + i]) * t,
        b = P[o10 + i] + (P[o11 + i] - P[o10 + i]) * t;
      return a + (b - a) * u;
    };
    const path = new Path2D();
    let q = 0;
    for (const c of g.c) {
      if (c === 'M') {
        path.moveTo(at(q), at(q + 1));
        q += 2;
      } else if (c === 'L') {
        path.lineTo(at(q), at(q + 1));
        q += 2;
      } else if (c === 'Q') {
        path.quadraticCurveTo(at(q), at(q + 1), at(q + 2), at(q + 3));
        q += 4;
      } else if (c === 'C') {
        path.bezierCurveTo(at(q), at(q + 1), at(q + 2), at(q + 3), at(q + 4), at(q + 5));
        q += 6;
      } else if (c === 'Z') path.closePath();
    }
    return path;
  }
  function glyphList() {
    if (!GM || !GM.glyphs[0].pts) return [];
    const by = new Map(GM.glyphs.map((g) => [g.t, g]));
    let list = [...String(S.glyphs).replace(/\s+/g, '')].map((t) => by.get(t)).filter(Boolean);
    if (!list.length) list = ['ވ', 'ލ', 'ޑ', 'ޒ', 'ނ'].map((t) => by.get(t));
    const [j] = segOf(GM.wdth, S.glyphWidth);
    return list.map((g) => ({ g, rEm: Math.max(g.r[j], g.r[j + 1]) }));
  }
  const solids = []; // { kind:'rect'|'mask', group, x0, y0, x1, y1 (doc), rad, mask? }
  let layoutDirty = true;
  function readSolids() {
    solids.length = 0;
    const sx = window.scrollX,
      sy = window.scrollY;
    for (const el of document.querySelectorAll('[data-solid]')) {
      const kind = el.dataset.solid,
        group = el.dataset.group;
      if (kind === 'text') {
        const range = document.createRange();
        range.selectNodeContents(el);
        const lines = [];
        for (const r of range.getClientRects()) {
          if (r.width < 1 || r.height < 1) continue;
          const L = lines.find((l) => Math.abs(l.cy - (r.top + r.bottom) / 2) < r.height * 0.4);
          if (L) {
            L.x0 = Math.min(L.x0, r.left);
            L.x1 = Math.max(L.x1, r.right);
            L.y0 = Math.min(L.y0, r.top);
            L.y1 = Math.max(L.y1, r.bottom);
          } else
            lines.push({
              x0: r.left,
              x1: r.right,
              y0: r.top,
              y1: r.bottom,
              cy: (r.top + r.bottom) / 2,
            });
        }
        lines.sort((p, q) => p.y0 - q.y0);
        for (let k = 0; k + 1 < lines.length; k++) {
          const mid = (lines[k].y1 + lines[k + 1].y0) / 2;
          lines[k].y1 = lines[k + 1].y0 = mid;
        }
        for (const l of lines)
          solids.push({
            kind: 'rect',
            group,
            x0: l.x0 + sx,
            y0: l.y0 + sy,
            x1: l.x1 + sx,
            y1: l.y1 + sy,
            rad: 6,
          });
        continue;
      }
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const s = {
        kind,
        group,
        x0: r.left + sx,
        y0: r.top + sy,
        x1: r.right + sx,
        y1: r.bottom + sy,
        rad: 0,
      };
      if (kind === 'rect')
        s.rad = Math.min(
          parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
          r.height / 2,
          r.width / 2,
        );
      if (kind === 'mask') {
        s.mask = buildMask(maskImageFor(el), r.width, r.height);
        if (!s.mask) s.kind = 'rect';
      }
      solids.push(s);
    }
    layoutDirty = false;
    const oldHF = HF;
    updateField();
    if (Math.abs(HF - oldHF) > 1 && N) setCount();
  }
  const maskImages = new Map();
  function maskImageFor(el) {
    if (el.tagName === 'IMG') return el;
    let im = maskImages.get(el);
    if (!im) {
      im = new Image();
      im.onload = () => {
        layoutDirty = true;
      };
      im.src = el.dataset.maskSrc;
      maskImages.set(el, im);
    }
    return im;
  }
  const MASK_CELL = 2,
    MASK_MARGIN = 56;
  function buildMask(img, w, h) {
    if (!img.complete || !img.naturalWidth) return null;
    const cs = MASK_CELL,
      m = MASK_MARGIN;
    const gw = Math.ceil((w + 2 * m) / cs),
      gh = Math.ceil((h + 2 * m) / cs);
    const c = document.createElement('canvas');
    c.width = gw;
    c.height = gh;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, m / cs, m / cs, w / cs, h / cs);
    let data;
    try {
      data = x.getImageData(0, 0, gw, gh).data;
    } catch {
      return null;
    } // file:// taints the canvas
    const N = gw * gh,
      INF = 1e9;
    const inside = new Uint8Array(N);
    for (let i = 0; i < N; i++) inside[i] = data[i * 4 + 3] > 110 ? 1 : 0;
    const chamfer = (seedInside) => {
      const d = new Float32Array(N);
      for (let i = 0; i < N; i++) d[i] = inside[i] === seedInside ? 0 : INF;
      const D1 = 1,
        D2 = Math.SQRT2;
      for (let y = 0; y < gh; y++)
        for (let xx = 0; xx < gw; xx++) {
          const i = y * gw + xx;
          let v = d[i];
          if (xx > 0) v = Math.min(v, d[i - 1] + D1);
          if (y > 0) {
            v = Math.min(v, d[i - gw] + D1);
            if (xx > 0) v = Math.min(v, d[i - gw - 1] + D2);
            if (xx < gw - 1) v = Math.min(v, d[i - gw + 1] + D2);
          }
          d[i] = v;
        }
      for (let y = gh - 1; y >= 0; y--)
        for (let xx = gw - 1; xx >= 0; xx--) {
          const i = y * gw + xx;
          let v = d[i];
          if (xx < gw - 1) v = Math.min(v, d[i + 1] + D1);
          if (y < gh - 1) {
            v = Math.min(v, d[i + gw] + D1);
            if (xx < gw - 1) v = Math.min(v, d[i + gw + 1] + D2);
            if (xx > 0) v = Math.min(v, d[i + gw - 1] + D2);
          }
          d[i] = v;
        }
      return d;
    };
    const dOut = chamfer(1),
      dIn = chamfer(0);
    const sdf = new Float32Array(N);
    for (let i = 0; i < N; i++) sdf[i] = (inside[i] ? -(dIn[i] - 0.5) : dOut[i] - 0.5) * cs;
    return { sdf, gw, gh, cs, m };
  }
  function maskSD(M, lx, ly) {
    const fx = (lx + M.m) / M.cs - 0.5,
      fy = (ly + M.m) / M.cs - 0.5;
    if (fx < 0 || fy < 0 || fx >= M.gw - 1 || fy >= M.gh - 1) return M.m;
    const ix = fx | 0,
      iy = fy | 0,
      tx = fx - ix,
      ty = fy - iy,
      i = iy * M.gw + ix,
      d = M.sdf;
    return (
      (d[i] * (1 - tx) + d[i + 1] * tx) * (1 - ty) +
      (d[i + M.gw] * (1 - tx) + d[i + M.gw + 1] * tx) * ty
    );
  }
  function solidOn(s) {
    return (
      (s.group === 'banner' && S.solidBanner) ||
      (s.group === 'logo' && S.solidLogo) ||
      (s.group === 'text' && S.solidText) ||
      (s.group === 'cards' && S.solidCards)
    );
  }
  function solidSD(s, x, y, oy) {
    if (s.kind === 'mask') return maskSD(s.mask, x - s.x0, y - (s.y0 - oy));
    return sdRoundRect(x, y, s.x0, s.y0 - oy, s.x1, s.y1 - oy, s.rad);
  }
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  let W = 0,
    H = 0,
    DPR = 1;
  let HF = 900; // field height (page space): the background's scroll range × coverage
  let bgOff = 0,
    bgV = 0; // background scroll offset (field y at the top of the viewport) and its velocity
  let N = 0,
    cap = 0;
  let X,
    Y,
    VX,
    VY,
    PX,
    PY,
    R,
    SR,
    RND,
    RND2,
    GI,
    HEAT,
    ANG,
    MASK,
    FVX,
    FVY,
    BUCKET,
    VIS,
    WS,
    SVX,
    SVY,
    HI;
  let gl = []; // glyph list for the current set
  let rMax = 2;
  function alloc(n) {
    const grow = (a, T) => {
      const b = new T(n);
      if (a) b.set(a.subarray(0, Math.min(a.length, n)));
      return b;
    };
    X = grow(X, Float32Array);
    Y = grow(Y, Float32Array);
    VX = grow(VX, Float32Array);
    VY = grow(VY, Float32Array);
    PX = grow(PX, Float32Array);
    PY = grow(PY, Float32Array);
    R = grow(R, Float32Array);
    SR = grow(SR, Float32Array);
    RND = grow(RND, Float32Array);
    RND2 = grow(RND2, Float32Array);
    GI = grow(GI, Uint16Array);
    HEAT = grow(HEAT, Float32Array);
    ANG = grow(ANG, Float32Array);
    MASK = grow(MASK, Float32Array);
    FVX = grow(FVX, Float32Array);
    FVY = grow(FVY, Float32Array);
    BUCKET = grow(BUCKET, Uint8Array);
    VIS = grow(VIS, Float32Array);
    WS = grow(WS, Float32Array);
    SVX = grow(SVX, Float32Array);
    SVY = grow(SVY, Float32Array);
    HI = grow(HI, Float32Array);
    cap = n;
  }
  function updateField() {
    const docH = Math.max(H, document.documentElement.scrollHeight);
    const cover = document.querySelector('[data-field-cover]');
    const minHF = cover ? cover.getBoundingClientRect().bottom + window.scrollY + 160 : 0;
    HF = Math.max(120, minHF, (S.bgSpeed * (docH - H) + H) * S.coverage);
  }
  function rho01(y) {
    return S.tail + (1 - S.tail) * (1 - smooth(S.heroHeight, S.heroHeight + S.falloff, y));
  }
  function curDensity() {
    return S.shape === 'glyphs' ? S.glyphDensity : S.density;
  }
  function fieldOy() {
    return window.scrollY - bgOff;
  } // content doc y − this = field y
  function freeSpot(i) {
    const sy = fieldOy();
    for (let t = 0; t < 40; t++) {
      const x = 4 + rand() * (W - 8),
        y = 4 + rand() * (HF - 8);
      if (rand() > rho01(y) && t < 39) continue;
      let ok = true;
      for (const s of solids) {
        if (solidOn(s) && solidSD(s, x, y, sy) < S.solidPad + 4) {
          ok = false;
          break;
        }
      }
      if (ok || t === 29) {
        X[i] = PX[i] = x;
        Y[i] = PY[i] = y;
        return;
      }
    }
  }
  function setCount() {
    updateField();
    let area = 0;
    for (let y = 0; y < HF; y += 8) area += rho01(y) * Math.min(8, HF - y);
    const want = Math.max(10, Math.round(((W * area) / 10000) * curDensity()));
    if (want > cap) alloc(Math.ceil(want * 1.25));
    for (let i = 0; i < Math.min(N, want); i++) if (Y[i] > HF - 2) freeSpot(i); // coverage shrank
    for (let i = N; i < want; i++) {
      freeSpot(i);
      VX[i] = VY[i] = 0;
      RND[i] = rand();
      RND2[i] = rand();
      SR[i] = rand();
      HEAT[i] = 0;
      ANG[i] = rand() * Math.PI * 2;
      GI[i] = Math.floor(rand() * 65535);
      VIS[i] = 0;
      WS[i] = -1;
      SVX[i] = SVY[i] = 0;
    }
    N = want;
    setRadii();
  }
  function setRadii() {
    gl = S.shape === 'glyphs' ? glyphList() : [];
    rMax = 0.5;
    for (let i = 0; i < N; i++) {
      const s = 1 - S.sizeVar * SR[i];
      R[i] = gl.length ? S.glyphSize * s * gl[GI[i] % gl.length].rEm : (S.dotSize / 2) * s;
      if (R[i] > rMax) rMax = R[i];
    }
  }
  const FCELL = 24;
  let fgy0 = 0,
    fgw = 0,
    fgh = 0,
    PSI = new Float32Array(0),
    time = Math.random() * 100;
  function buildFlow(active, sy) {
    fgy0 = Math.floor(winY0 / FCELL);
    fgw = Math.ceil(W / FCELL) + 2;
    fgh = Math.ceil((winY1 - fgy0 * FCELL) / FCELL) + 2;
    if (PSI.length < fgw * fgh) PSI = new Float32Array(fgw * fgh);
    const sc = S.flowScale,
      t = time,
      tb = Math.max(1, S.boundary);
    const turb = S.turbulence,
      circ = (S.circulation * Math.min(W, HF)) / (Math.PI * sc),
      det = S.detail;
    for (let gy = 0; gy < fgh; gy++) {
      const y = (fgy0 + gy) * FCELL,
        v = y / sc,
        gyre = Math.sin(Math.PI * clamp01(y / HF));
      for (let gx = 0; gx < fgw; gx++) {
        const x = gx * FCELL,
          u = x / sc;
        let d = Math.min(x, W - x, y, HF - y);
        for (const s of active) {
          if (x < s.x0 - tb - 60 || x > s.x1 + tb + 60) continue;
          const sd = solidSD(s, x, y, sy) - S.solidPad;
          if (sd < d) d = sd;
        }
        const n =
          (noise3(u, v, t) + det * noise3(u * 2 + 5.2, v * 2 + 1.3, t * 1.7)) / (1 + det * 0.6);
        const g = Math.sin(Math.PI * clamp01(x / W)) * gyre;
        PSI[gy * fgw + gx] = rampFn(d / tb) * (turb * n + circ * g);
      }
    }
  }
  function sampleFlow(x, y) {
    const fx = clamp(x / FCELL, 0, fgw - 1.001),
      fy = clamp(y / FCELL - fgy0, 0, fgh - 1.001);
    const ix = fx | 0,
      iy = fy | 0,
      tx = fx - ix,
      ty = fy - iy,
      i = iy * fgw + ix;
    const p00 = PSI[i],
      p10 = PSI[i + 1],
      p01 = PSI[i + fgw],
      p11 = PSI[i + fgw + 1];
    OUT[0] = (p00 * (1 - tx) + p10 * tx) * (1 - ty) + (p01 * (1 - tx) + p11 * tx) * ty;
    OUT[1] = ((p10 - p00) * (1 - ty) + (p11 - p01) * ty) / FCELL; // dψ/dx
    OUT[2] = ((p01 - p00) * (1 - tx) + (p11 - p10) * tx) / FCELL; // dψ/dy
  }
  let lastOy = 0;
  let ACT = new Int32Array(0),
    nA = 0,
    winY0 = 0,
    winY1 = 0;
  function buildActive() {
    winY0 = Math.max(0, bgOff - H * 0.35);
    winY1 = Math.min(HF, bgOff + H * 1.35);
    if (ACT.length < cap) ACT = new Int32Array(cap);
    nA = 0;
    for (let i = 0; i < N; i++) if (Y[i] >= winY0 && Y[i] <= winY1) ACT[nA++] = i;
  }
  function stepBackground(dt) {
    const target = S.bgSpeed * window.scrollY;
    if (S.scrollLag < 0.01) {
      bgV = (target - bgOff) / dt;
      bgOff = target;
      return;
    }
    const w = 1 / S.scrollLag,
      z = 1 - 0.85 * S.scrollBounce;
    const n = Math.max(1, Math.ceil((w * dt) / 0.25)),
      h = dt / n;
    for (let k = 0; k < n; k++) {
      bgV += (w * w * (target - bgOff) - 2 * z * w * bgV) * h;
      bgOff += bgV * h;
    }
  }
  let headA = new Int32Array(0),
    nextA = new Int32Array(0);
  function step(dt) {
    stepBackground(dt);
    const sy = fieldOy();
    const dOy = sy - lastOy;
    lastOy = sy;
    const svy = clamp(-dOy / dt, -S.maxSpeed * 1.5, S.maxSpeed * 1.5);
    buildActive();
    const active = solids.filter(
      (s) =>
        solidOn(s) && s.y1 - sy > winY0 - S.boundary - 80 && s.y0 - sy < winY1 + S.boundary + 80,
    );
    time += dt * S.evolve;
    buildFlow(active, sy);
    const k = 1 - Math.exp(-dt / Math.max(0.02, S.inertia));
    const speed = S.flowSpeed * S.flowScale,
      vmax = S.maxSpeed,
      jit = S.jitter;
    const bc = S.bandCount,
      bw = S.bandWidth,
      bs = S.bandSoft,
      bp = S.bandPhase;
    for (let a = 0; a < nA; a++) {
      const i = ACT[a];
      sampleFlow(X[i], Y[i]);
      const fvx = speed * OUT[2],
        fvy = -speed * OUT[1];
      FVX[i] = fvx;
      FVY[i] = fvy;
      let vx = VX[i] + (fvx - VX[i]) * k,
        vy = VY[i] + (fvy - VY[i]) * k + S.gravity * dt;
      if (jit) {
        vx += (rand() - 0.5) * jit;
        vy += (rand() - 0.5) * jit;
      }
      const sp = Math.hypot(vx, vy);
      if (sp > vmax) {
        vx *= vmax / sp;
        vy *= vmax / sp;
      }
      VX[i] = vx;
      VY[i] = vy;
      PX[i] = X[i];
      PY[i] = Y[i];
      X[i] += vx * dt;
      Y[i] += vy * dt;
      const f = OUT[0] * bc + bp,
        dist = Math.abs(f - Math.floor(f) - 0.5) * 2;
      MASK[i] = 1 - smooth(bw * (1 - bs), bw + 1e-4, dist);
    }
    ctxStep.active = active;
    ctxStep.sy = sy;
    ctxStep.svy = svy;
    ctxStep.dt = dt;
    const hard = S.solidity >= 0.999;
    for (let it = 0, pen = 1e9; it < S.iterations || (pen > 0.5 && it < MAX_ITER); it++) {
      pen = separate(it, dt);
      if (hard) collideSolids(it === 0);
      walls();
    }
    if (!hard) {
      collideSoft();
      walls();
    }
    const kFade = 1 - Math.exp(-dt / Math.max(0.02, S.fade));
    const kW = 1 - Math.exp(-dt / 0.6),
      kUp = 1 - Math.exp(-dt / 0.12),
      kDown = 1 - Math.exp(-dt / 0.7);
    const kV = 1 - Math.exp(-dt / 0.4),
      kA = 1 - Math.exp(-dt / 0.35);
    for (let a = 0; a < nA; a++) {
      const i = ACT[a];
      const dv = Math.hypot(VX[i] - FVX[i], VY[i] - FVY[i]);
      const ht = clamp01((dv - 40) / 500);
      HEAT[i] += (ht - HEAT[i]) * (ht > HEAT[i] ? kUp : kDown);
      VIS[i] += (visTarget(i) - VIS[i]) * kFade;
      const wt = weightTarget(i);
      WS[i] = WS[i] < 0 ? wt : WS[i] + (wt - WS[i]) * kW;
      SVX[i] += (VX[i] - SVX[i]) * kV;
      SVY[i] += (VY[i] - SVY[i]) * kV;
      if (S.rotate === 'flow' && SVX[i] * SVX[i] + SVY[i] * SVY[i] > 4) {
        const a = Math.atan2(SVY[i], SVX[i]);
        let d = a - ANG[i];
        d = Math.atan2(Math.sin(d), Math.cos(d));
        ANG[i] += d * kA;
      }
    }
  }
  function visTarget(i) {
    const m = 1 - S.banding * (1 - MASK[i]);
    const edge = 1 - smooth(HF - Math.min(160, HF * 0.2), HF, Y[i]); // soft bottom edge of the coverage
    return (S.bandStyle === 'density' ? smooth(RND[i] * 0.85, RND[i] * 0.85 + 0.15, m) : m) * edge;
  }
  function weightTarget(i) {
    return clamp01(
      S.weightMode === 'band' ? MASK[i] : S.weightMode === 'push' ? HEAT[i] : (RND[i] * 7.31) % 1,
    );
  }
  const ctxStep = { active: [], sy: 0, svy: 0, dt: 1 / 60 };
  const MAX_ITER = 6;
  const hash = { cell: 1, gw: 1, gh: 1, y0: 0 };
  function separate(it, dt) {
    const useInc = S.incompress > 0 && it === 0;
    let hS = 0;
    if (useInc) {
      const h0 = Math.sqrt(10000 / Math.max(0.5, curDensity())) * 1.05;
      for (let a = 0; a < nA; a++) {
        const i = ACT[a];
        HI[i] = Math.min(h0 * 3.5, h0 / Math.sqrt(Math.max(0.05, rho01(Y[i]))));
        if (HI[i] > hS) hS = HI[i];
      }
      const kw = S.incompress * 90 * dt;
      for (let a = 0; a < nA; a++) {
        const i = ACT[a],
          h = HI[i] * 0.5;
        const wall = (d) => {
          if (d >= h) return 0;
          const q = 1 - Math.max(0, d) / h;
          return kw * q * q * h;
        };
        VX[i] += wall(X[i]) - wall(W - X[i]);
        VY[i] += wall(Y[i]) - wall(HF - Y[i]);
      }
    }
    const kS = S.incompress * 90 * dt;
    const prK = S.pressure / dt;
    const cell = Math.max(2, 2 * rMax + S.gap, hS),
      gw = Math.ceil(W / cell) + 1,
      gh = Math.ceil((winY1 - winY0) / cell) + 1;
    const y0 = winY0;
    hash.cell = cell;
    hash.gw = gw;
    hash.gh = gh;
    hash.y0 = y0;
    if (headA.length < gw * gh) headA = new Int32Array(gw * gh);
    if (nextA.length < N) nextA = new Int32Array(cap);
    const gap = S.gap,
      stiff = S.stiffness;
    let pen = 0;
    headA.fill(-1, 0, gw * gh);
    for (let a = 0; a < nA; a++) {
      const i = ACT[a];
      const cx = clamp((X[i] / cell) | 0, 0, gw - 1),
        cy = clamp(((Y[i] - y0) / cell) | 0, 0, gh - 1),
        c = cy * gw + cx;
      nextA[i] = headA[c];
      headA[c] = i;
    }
    for (let a = 0; a < nA; a++) {
      const i = ACT[a];
      const cx = clamp((X[i] / cell) | 0, 0, gw - 1),
        cy = clamp(((Y[i] - y0) / cell) | 0, 0, gh - 1);
      for (let oy = -1; oy <= 1; oy++) {
        const yy = cy + oy;
        if (yy < 0 || yy >= gh) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const xx = cx + ox;
          if (xx < 0 || xx >= gw) continue;
          for (let j = headA[yy * gw + xx]; j !== -1; j = nextA[j]) {
            if (j <= i) continue;
            let dx = X[j] - X[i],
              dy = Y[j] - Y[i];
            const min = R[i] + R[j] + gap,
              d2 = dx * dx + dy * dy;
            const hp = useInc ? 0.5 * (HI[i] + HI[j]) : 0;
            if (d2 < hp * hp && d2 > 1e-6) {
              const d = Math.sqrt(d2),
                q = 1 - d / hp,
                f = (kS * q * q * hp) / d;
              VX[i] -= dx * f;
              VY[i] -= dy * f;
              VX[j] += dx * f;
              VY[j] += dy * f;
            }
            if (d2 >= min * min) continue;
            let d = Math.sqrt(d2);
            if (min - gap - d > pen) pen = min - gap - d;
            if (d < 1e-4) {
              const a = rand() * 6.283;
              dx = Math.cos(a);
              dy = Math.sin(a);
              d = 1;
            } else {
              dx /= d;
              dy /= d;
            }
            const c = (min - d) * 0.5 * stiff;
            X[i] -= dx * c;
            Y[i] -= dy * c;
            X[j] += dx * c;
            Y[j] += dy * c;
            if (it === 0 && prK) {
              const v = c * prK;
              VX[i] -= dx * v;
              VY[i] -= dy * v;
              VX[j] += dx * v;
              VY[j] += dy * v;
            }
          }
        }
      }
    }
    return pen;
  }
  function collideSolids(respond) {
    const { active, sy, svy, dt } = ctxStep;
    placed.length = 0;
    const pad = S.solidPad,
      push = S.push,
      rest = S.restitution,
      spread = S.spread;
    for (const s of active) {
      const isMask = s.kind === 'mask';
      const top = s.y0 - sy,
        bot = s.y1 - sy,
        prevTop = top - svy * dt,
        prevBot = bot - svy * dt; // rect before this frame's scroll
      const cxm = (s.x0 + s.x1) / 2;
      for (let a = 0; a < nA; a++) {
        const i = ACT[a];
        const e = R[i] + pad,
          x = X[i],
          y = Y[i];
        if (x < s.x0 - e || x > s.x1 + e || y < top - e || y > bot + e) continue;
        const sd = isMask
          ? maskSD(s.mask, x - s.x0, y - top) - e
          : sdRoundRect(x, y, s.x0 - e, top - e, s.x1 + e, bot + e, s.rad + e);
        if (sd >= 0) continue;
        let nx = 0,
          ny = 0,
          nxp = x,
          nyp = y;
        const wasOutside =
          PY[i] < prevTop - e || PY[i] > prevBot + e || PX[i] < s.x0 - e || PX[i] > s.x1 + e;
        if (!isMask) {
          const r = R[i];
          let best = null,
            bd = 1e9;
          const lead = wasOutside && svy !== 0 ? Math.sign(svy) : 0;
          const leadY = lead < 0 ? top - e : bot + e;
          const pinned =
            lead !== 0 && (leadY < r || leadY > HF - r || !freeAt(x, leadY, e - 0.5, s));
          const sy0 = Math.max(r, top - e),
            sy1 = Math.min(HF - r, bot + e);
          const sideY = pinned && sy1 > sy0 ? sy0 + RND2[i] * (sy1 - sy0) : y;
          for (let f = 0; f < 4; f++) {
            const fx = f === 2 ? s.x0 - e : f === 3 ? s.x1 + e : x;
            const fy = f === 0 ? top - e : f === 1 ? bot + e : sideY;
            if (fx < r || fx > W - r || fy < r || fy > HF - r) continue;
            if (!freeAt(fx, fy, e - 0.5, s)) continue; // don't hand it straight to a neighbouring solid
            const fnx = f === 2 ? -1 : f === 3 ? 1 : 0,
              fny = f === 0 ? -1 : f === 1 ? 1 : 0;
            const d =
              (f === 0 ? y - fy : f === 1 ? fy - y : f === 2 ? x - (s.x0 - e) : s.x1 + e - x) -
              (lead && fny === lead ? 1e6 : 0);
            if (d < bd) {
              bd = d;
              best = f;
              nxp = fx;
              nyp = fy;
              nx = fnx;
              ny = fny;
            }
          }
          if (best === null) {
            nxp = x;
            nyp = svy < 0 ? top - e : bot + e;
            nx = 0;
            ny = svy < 0 ? -1 : 1;
          } else if (pinned && nx !== 0) {
            for (let t = 0; t < 14; t++) {
              const cx = nxp + nx * rand() * 56,
                cy = sy0 + rand() * Math.max(0, sy1 - sy0);
              if (cx < r || cx > W - r) continue;
              if (particleFree(i, cx, cy) && freeAt(cx, cy, e - 0.5, s)) {
                nxp = cx;
                nyp = cy;
                break;
              }
            }
            placed.push(i);
          }
        } else {
          const lx = x - s.x0,
            ly = y - top,
            h = 2;
          let gx = maskSD(s.mask, lx + h, ly) - maskSD(s.mask, lx - h, ly),
            gy = maskSD(s.mask, lx, ly + h) - maskSD(s.mask, lx, ly - h);
          const gn = Math.hypot(gx, gy);
          if (gn < 1e-6) {
            gx = 0;
            gy = svy < 0 ? -1 : 1;
          } else {
            gx /= gn;
            gy /= gn;
          }
          nx = gx;
          ny = gy;
          nxp = x - gx * sd;
          nyp = y - gy * sd;
          if (nyp < R[i] || nyp > HF - R[i]) {
            nx = Math.sign(x - cxm) || 1;
            ny = 0;
            nyp = y;
            nxp = x;
            for (let t = 0; t < 80 && maskSD(s.mask, nxp - s.x0, ly) < e; t++) nxp += nx * 2;
          }
        }
        X[i] = nxp;
        Y[i] = nyp;
        if (!respond) continue;
        const vsy = svy * push;
        const rvx = VX[i],
          rvy = VY[i] - vsy,
          vn = rvx * nx + rvy * ny;
        if (vn < 0) {
          VX[i] -= (1 + rest) * vn * nx;
          VY[i] -= (1 + rest) * vn * ny;
        }
        if (svy !== 0)
          VX[i] +=
            (nx || Math.sign(x - cxm || 1)) * Math.abs(svy) * push * spread * (0.5 + RND2[i]);
        HEAT[i] = Math.max(HEAT[i], clamp01((Math.abs(svy) * push) / 600));
      }
    }
  }
  const placed = [];
  function particleFree(i, x, y) {
    const cell = hash.cell,
      gw = hash.gw,
      gh = hash.gh,
      r = R[i] + S.gap;
    const cx = clamp((x / cell) | 0, 0, gw - 1),
      cy = clamp(((y - hash.y0) / cell) | 0, 0, gh - 1);
    for (let oy = -1; oy <= 1; oy++) {
      const yy = cy + oy;
      if (yy < 0 || yy >= gh) continue;
      for (let ox = -1; ox <= 1; ox++) {
        const xx = cx + ox;
        if (xx < 0 || xx >= gw) continue;
        for (let j = headA[yy * gw + xx]; j !== -1; j = nextA[j]) {
          if (j === i) continue;
          const dx = X[j] - x,
            dy = Y[j] - y,
            m = r + R[j];
          if (dx * dx + dy * dy < m * m) return false;
        }
      }
    }
    for (const j of placed) {
      const dx = X[j] - x,
        dy = Y[j] - y,
        m = r + R[j];
      if (j !== i && dx * dx + dy * dy < m * m) return false;
    }
    return true;
  }
  function freeAt(x, y, e, self) {
    const { active, sy } = ctxStep;
    for (const o of active) {
      if (o === self || x < o.x0 - e || x > o.x1 + e || y < o.y0 - sy - e || y > o.y1 - sy + e)
        continue;
      if (solidSD(o, x, y, sy) < e) return false;
    }
    return true;
  }
  function collideSoft() {
    const { active, sy, svy } = ctxStep;
    const pad = S.solidPad,
      sol = S.solidity,
      push = S.push * sol,
      spread = S.spread,
      rest = S.restitution;
    for (const s of active) {
      const isMask = s.kind === 'mask';
      const top = s.y0 - sy,
        bot = s.y1 - sy,
        cxm = (s.x0 + s.x1) / 2;
      for (let a = 0; a < nA; a++) {
        const i = ACT[a];
        const e = R[i] + pad,
          x = X[i],
          y = Y[i];
        if (x < s.x0 - e || x > s.x1 + e || y < top - e || y > bot + e) continue;
        const sd = isMask
          ? maskSD(s.mask, x - s.x0, y - top) - e
          : sdRoundRect(x, y, s.x0 - e, top - e, s.x1 + e, bot + e, s.rad + e);
        if (sd >= 0) continue;
        let nx, ny;
        if (isMask) {
          const lx = x - s.x0,
            ly = y - top;
          nx = maskSD(s.mask, lx + 2, ly) - maskSD(s.mask, lx - 2, ly);
          ny = maskSD(s.mask, lx, ly + 2) - maskSD(s.mask, lx, ly - 2);
          const g = Math.hypot(nx, ny);
          if (g < 1e-6) {
            nx = 0;
            ny = svy < 0 ? -1 : 1;
          } else {
            nx /= g;
            ny /= g;
          }
        } else {
          const r = R[i];
          const dT = top - e >= r ? y - (top - e) : 1e9,
            dB = bot + e <= HF - r ? bot + e - y : 1e9;
          const dL = s.x0 - e >= r ? x - (s.x0 - e) : 1e9,
            dR = s.x1 + e <= W - r ? s.x1 + e - x : 1e9;
          const m = Math.min(dT, dB, dL, dR);
          if (m >= 1e9) {
            nx = 0;
            ny = 1;
          } else {
            nx = m === dL ? -1 : m === dR ? 1 : 0;
            ny = nx ? 0 : m === dT ? -1 : 1;
          }
        }
        const depth = -sd * sol;
        X[i] += nx * depth;
        Y[i] += ny * depth;
        const rvy = VY[i] - svy * push,
          vn = VX[i] * nx + rvy * ny;
        if (vn < 0) {
          const k = (1 + rest) * vn * sol;
          VX[i] -= k * nx;
          VY[i] -= k * ny;
        }
        if (svy !== 0)
          VX[i] +=
            (nx || Math.sign(x - cxm || 1)) * Math.abs(svy) * push * spread * (0.5 + RND2[i]) * 0.2;
        HEAT[i] = Math.max(HEAT[i], clamp01((Math.abs(svy) * push) / 900));
      }
    }
  }
  function walls() {
    const rest = S.restitution;
    for (let a = 0; a < nA; a++) {
      const i = ACT[a];
      const r = R[i];
      if (!Number.isFinite(X[i] + Y[i] + VX[i] + VY[i])) {
        freeSpot(i);
        VX[i] = VY[i] = 0;
      }
      if (X[i] < r) {
        X[i] = r;
        if (VX[i] < 0) VX[i] = -VX[i] * rest;
      } else if (X[i] > W - r) {
        X[i] = W - r;
        if (VX[i] > 0) VX[i] = -VX[i] * rest;
      }
      if (Y[i] < r) {
        Y[i] = r;
        if (VY[i] < 0) VY[i] = -VY[i] * rest;
      } else if (Y[i] > HF - r) {
        Y[i] = HF - r;
        if (VY[i] > 0) VY[i] = -VY[i] * rest;
      }
    }
  }
  const LEVELS = 17; // glyph weight levels baked into the atlas (fine enough that easing reads as continuous)
  let palette = []; // 6 bucket colours: base A/B × heat 0..2
  const ALEV = 4; // dot alpha levels (dots are batched into one path per colour × alpha)
  let atlas = null; // { canvas, cell, E, n }
  let atlasKey = '';
  function buildPalette() {
    palette = [];
    for (const base of [S.colorA, S.colorB])
      for (let h = 0; h < 3; h++) palette.push(mixHex(base, S.heatColor, (h / 2) * S.heat));
  }
  function buildAtlas() {
    if (!gl.length) {
      atlas = null;
      return;
    }
    const E = Math.max(8, Math.ceil(S.glyphSize * DPR));
    const uniq = [...new Set(gl.map((x) => x.g))];
    let rE = 0;
    for (const x of gl) rE = Math.max(rE, x.rEm);
    const cell = Math.ceil(2 * rE * E) + 4;
    const key = [E, cell, S.glyphs, S.glyphWidth, S.weightMin, S.weightMax, palette.join()].join(
      '|',
    );
    if (key === atlasKey && atlas) return;
    atlasKey = key;
    const sprites = uniq.length * LEVELS,
      cols = Math.max(1, Math.min(sprites, Math.floor(8192 / cell)));
    const rpc = Math.ceil(sprites / cols);
    const c = document.createElement('canvas');
    c.width = cell * cols;
    c.height = cell * rpc * palette.length;
    const x = c.getContext('2d');
    uniq.forEach((g, gi) => {
      for (let l = 0; l < LEVELS; l++) {
        const w = S.weightMin + (S.weightMax - S.weightMin) * (l / (LEVELS - 1));
        const p = glyphPath(g, w, S.glyphWidth);
        const idx = gi * LEVELS + l;
        palette.forEach((col, b) => {
          x.save();
          x.translate(
            (idx % cols) * cell + cell / 2,
            (b * rpc + Math.floor(idx / cols)) * cell + cell / 2,
          );
          x.scale(E / GM.upem, E / GM.upem);
          x.fillStyle = col;
          x.fill(p);
          x.restore();
        });
      }
    });
    atlas = { canvas: c, cell, E, cols, rpc, index: new Map(uniq.map((g, i) => [g, i])) };
  }
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(32, document.documentElement.clientWidth);
    H = Math.max(32, window.innerHeight);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    layoutDirty = true;
  }
  const bucketLists = Array.from({ length: 6 * ALEV }, () => []);
  const REVEAL = { active: true, r: 0, cx: 0, cy: 0, feather: 260 };
  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dens = S.bandStyle === 'density',
      op = S.opacity * (LOW ? 0.55 : 1);
    for (const L of bucketLists) L.length = 0;
    const sy = window.scrollY,
      clear = solids.filter(
        (q) =>
          q.kind === 'rect' &&
          (q.group === 'text' || q.group === 'banner') &&
          q.y1 - sy > -30 &&
          q.y0 - sy < H + 30,
      );
    const stopEl = document.querySelector('[data-field-stop]'),
      stopY = stopEl ? stopEl.getBoundingClientRect().top : Infinity;
    for (let i = 0; i < N; i++) {
      if (!running || LOW) {
        VIS[i] = visTarget(i);
        WS[i] = weightTarget(i);
      } // paused / still: show edits at once
      const ys = Y[i] - bgOff;
      if (ys < -40 || ys > H + 40) {
        BUCKET[i] = 0;
        continue;
      } // off screen
      let vis = VIS[i];
      if (ys > stopY - S.stopFade) vis *= 1 - smooth(stopY - S.stopFade, stopY, ys);
      if (REVEAL.active) {
        const d = Math.hypot(X[i] - REVEAL.cx, ys - REVEAL.cy) + RND2[i] * REVEAL.feather * 0.6;
        vis *= smooth(REVEAL.r, REVEAL.r - REVEAL.feather, d);
      }
      if (clear.length && vis > 0.03) {
        let d = 1e9;
        for (const q of clear) {
          const v = sdRoundRect(X[i], ys, q.x0, q.y0 - sy, q.x1, q.y1 - sy, q.rad);
          if (v < d) d = v;
        }
        if (d < 26) vis *= smooth(2, 26, d);
      }
      BUCKET[i] = (vis * 255) | 0;
      if (vis < 0.03) continue;
      const h = HEAT[i] < 0.15 ? 0 : HEAT[i] < 0.5 ? 1 : 2;
      const c = (RND2[i] < S.mix ? 3 : 0) + h;
      const a = dens ? Math.min(ALEV - 1, (vis * ALEV) | 0) : ALEV - 1;
      bucketLists[c * ALEV + a].push(i);
    }
    if (S.shape === 'glyphs' && atlas) {
      const A = atlas,
        cell = A.cell,
        half = cell / 2;
      for (let b = 0; b < 6 * ALEV; b++) {
        const row = (b / ALEV) | 0;
        for (const i of bucketLists[b]) {
          const g = gl[GI[i] % gl.length];
          const vis = VIS[i];
          const sc = dens ? 0.7 + 0.3 * vis : vis;
          ctx.globalAlpha = op * (dens ? vis : 1);
          const lvl = Math.round(clamp01(WS[i]) * (LEVELS - 1));
          const kk = ((R[i] / (g.rEm * S.glyphSize)) * sc * (S.glyphSize * DPR)) / A.E; // device scale
          const ang = S.rotate === 'upright' ? 0 : ANG[i];
          const c = Math.cos(ang) * kk,
            s = Math.sin(ang) * kk;
          ctx.setTransform(c, s, -s, c, X[i] * DPR, (Y[i] - bgOff) * DPR);
          const idx = A.index.get(g.g) * LEVELS + lvl;
          ctx.drawImage(
            A.canvas,
            (idx % A.cols) * cell,
            (row * A.rpc + Math.floor(idx / A.cols)) * cell,
            cell,
            cell,
            -half,
            -half,
            cell,
            cell,
          );
        }
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      for (let b = 0; b < 6 * ALEV; b++) {
        const L = bucketLists[b];
        if (!L.length) continue;
        const a = b % ALEV;
        ctx.fillStyle = palette[(b / ALEV) | 0];
        ctx.globalAlpha = op * (dens ? (a + 1) / ALEV : 1);
        ctx.beginPath();
        for (const i of L) {
          const r = R[i] * (dens ? 0.6 + 0.4 * VIS[i] : VIS[i]);
          if (r < 0.3) continue;
          const ys = Y[i] - bgOff;
          ctx.moveTo(X[i] + r, ys);
          ctx.arc(X[i], ys, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (S.showSolids) drawSolids();
  }
  function drawSolids() {
    const sy = window.scrollY;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    for (const s of solids) {
      ctx.strokeStyle = solidOn(s) ? 'rgba(209,15,51,0.7)' : 'rgba(0,0,0,0.2)';
      const p = S.solidPad;
      ctx.beginPath();
      ctx.roundRect(s.x0 - p, s.y0 - sy - p, s.x1 - s.x0 + 2 * p, s.y1 - s.y0 + 2 * p, s.rad + p);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
  let running = true;
  function heroFrame(dt) {
    if (layoutDirty) readSolids();

    if (LOW) {
      bgOff = window.scrollY;
      bgV = 0;
      lastOy = fieldOy();
    } else if (running) step(dt);
    else {
      stepBackground(dt);
      lastOy = fieldOy();
    }
    render();
  }
  function heroApply(kind) {
    if (kind === 'count') setCount();
    if (kind === 'radii' || kind === 'glyph') setRadii();
    buildPalette();
    if (S.shape === 'glyphs') buildAtlas();
  }
  ONBOOT.unshift(() => {
    resize();
    bgOff = S.bgSpeed * window.scrollY;
    lastOy = fieldOy();
    readSolids();
    setCount();
    heroApply();
    loadGlyphs().then(() => applyAll('glyph'));
    addEventListener('resize', () => {
      resize();
      setCount();
      if (S.shape === 'glyphs') buildAtlas();
    });
    new ResizeObserver(() => {
      layoutDirty = true;
    }).observe(document.body);
    document.fonts?.ready.then(() => {
      layoutDirty = true;
    });
    for (let i = 0; i < 40; i++) step(1 / 60);
  });
  FRAME.push(heroFrame);

  defineDefaults({
    ctaMode: 'light',
    introSpeed: 0.701,
    bgSpeed: 0.76,
    scrollLag: 0.031,
    coverage: 0.24,
    heroHeight: 1060,
    falloff: 170,
    tail: 0.06,
    stDot: 1.82,
    stPitch: 0.725,
    stLoose: 3.63,
    stSpeed: 0.0423,
    stEvolve: 0.534,
    stClear: 0,
    stScatter: 0.86,
    stScatterRadius: 65,
    stHoverSpeed: 1.93,
    stColorTime: 0.194,
    iconDot: 4.18,
    iconSpacing: 4.36,
    iconDepth: 65,
    iconLayers: 4,
    iconSpring: 0.541,
  });

  REVEAL.active = false;
  for (const boot of ONBOOT) boot();
  let raf = 0,
    previous = 0;
  const visible = () =>
    !document.hidden &&
    document.querySelector('[data-field-stop]').getBoundingClientRect().bottom > 0;
  function tick(time) {
    raf = 0;
    const dt = previous ? clamp((time - previous) / 1000, 1 / 240, 1 / 30) : 1 / 60;
    previous = time;
    heroFrame(dt);
    if (!LOW && visible()) raf = requestAnimationFrame(tick);
  }
  function wake() {
    if (!raf && visible()) {
      previous = 0;
      raf = requestAnimationFrame(tick);
    }
  }
  window.addEventListener('veli:motion-change', (event) => {
    LOW = event.detail.reduced;
    wake();
  });
  window.addEventListener('veli:color-scheme-change', () => {
    buildPalette();
    wake();
  });
  window.addEventListener('scroll', wake, { passive: true });
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('pageshow', wake);
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    raf = 0;
  });
  wake();
}
