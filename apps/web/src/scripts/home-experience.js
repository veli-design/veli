import { homeMotionSettings } from './home-motion-settings.js';
// Motion adapted from Basim's veli-home-v2.html (PD-1326 / PD-1391).
// SVG layers, Lottie markers, easing, and timings stay aligned with that reference.
// Settings are source constants; the prototype's tuning UI and storage are omitted.
import { initHomeStipple } from './home-stipple.js';
import { FD_TYPE_DV, FD_TYPE_EN } from './home-type-paths.js';

export function initHomeExperience() {
  const home = document.querySelector('.marketing-home');
  if (!home || home.dataset.motionInitialized) return;
  home.dataset.motionInitialized = 'true';
  const html = document.documentElement;
  const S = {};
  function defineDefaults(values) {
    Object.assign(S, values);
  }
  const FRAME = [],
    ONBOOT = [],
    ONINTRO = [],
    ONTHEME = [],
    ONLOW = [];
  let LOW =
    html.dataset.reducedMotion === 'true' ||
    (html.dataset.reducedMotion === undefined &&
      matchMedia('(prefers-reduced-motion: reduce)').matches);
  const isDark = () => html.dataset.theme === 'dark';
  const THEME = { stippleRest: '#e0e2dd' };
  const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
  const REVEAL = { active: !LOW, r: 0, cx: 0, cy: 0, feather: 260 };
  const hero = initHomeStipple(REVEAL);
  function finishAllMotion() {
    for (const animation of liveAnims.splice(0)) {
      try {
        animation.finish();
      } catch {
        /* Animation may already be cancelled. */
      }
    }
    REVEAL.active = false;
    intro.fieldStart = -1;
    intro.done = true;
    html.classList.remove('home-intro');
    document.querySelectorAll('[data-reveal]').forEach((group) => group.classList.add('revealed'));
    document.querySelectorAll('[data-cta]').forEach((cta) => cta.classList.add('played'));
    ONLOW.forEach((finish) => finish());
    hero?.wake();
  }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const clamp01 = (v) => clamp(v, 0, 1);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => {
    const t = clamp01((x - a) / (b - a || 1e-6));
    return t * t * (3 - 2 * t);
  };
  const easeOutCubic = (t) => 1 - Math.pow(1 - clamp01(t), 3);
  function mulberry32(a) {
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
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
  function textLineRects(el, ox = 0, oy = 0, pad = 0) {
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
    return lines.map((l) => ({
      x0: l.x0 - ox - pad,
      y0: l.y0 - oy - pad,
      x1: l.x1 - ox + pad,
      y1: l.y1 - oy + pad,
    }));
  }

  const liveAnims = [];
  function anim(el, frames, opts) {
    const a = el.animate(frames, Object.assign({ fill: 'both' }, opts));
    liveAnims.push(a);
    a.finished
      .then(() => {
        const k = liveAnims.indexOf(a);
        if (k >= 0) liveAnims.splice(k, 1);
      })
      .catch(() => {});
    return a;
  }
  const visIO = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        const o = visMap.get(e.target);
        if (o) o.visible = e.isIntersecting;
        wake();
      }),
    { rootMargin: '120px 0px' },
  );
  const visMap = new WeakMap();
  function trackVisible(el, obj) {
    obj.visible = false;
    visMap.set(el, obj);
    visIO.observe(el);
    return obj;
  }
  function whenSeen(el, fn, threshold = 0.35) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            io.disconnect();
            fn();
            wake();
          }
        }),
      { threshold },
    );
    io.observe(el);
  }
  const intro = { fieldStart: -1, fieldDur: 2, done: false };
  function introTimes() {
    const k = (1 / Math.max(0.25, S.introSpeed)) * (innerWidth <= 900 ? 0.6 : 1);
    if (document.querySelector('.hero-logo'))
      return {
        draw: 0.3 * k,
        drawDur: 1.3 * k,
        drawStagger: 0.045 * k,
        fill: 1.45 * k,
        fillDur: 0.8 * k,
        field: 1.5 * k,
        fieldDur: 2.2 * k,
        content: 2.0 * k,
        stagger: 0.08 * k,
        itemDur: 0.8 * k,
      };
    return {
      field: 0.1 * k,
      fieldDur: 1.8 * k,
      content: 0.15 * k,
      stagger: 0.09 * k,
      itemDur: 0.85 * k,
    };
  }
  function playIntro() {
    for (const a of liveAnims.splice(0)) {
      try {
        a.cancel();
      } catch {
        /* An animation can be cancelled by page navigation. */
      }
    }
    const T = introTimes();
    ONINTRO.forEach((f) => f(T));
    if (LOW) {
      finishAllMotion();
      return;
    }
    if (window.scrollY > 40) {
      // Restoring a scrolled page skips the opening sequence, while later
      // sections still reveal and play when they enter the viewport.
      REVEAL.active = false;
      intro.done = true;
      html.classList.remove('home-intro');
      document.querySelectorAll('[data-reveal]').forEach((group) => {
        if (inView(group)) revealGroup(group);
      });
      return;
    }
    html.classList.add('home-intro');
    intro.done = false;
    document.querySelectorAll('.hero-logo path').forEach((p, i) => {
      anim(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: T.drawDur * 1000,
        delay: (T.draw + i * T.drawStagger) * 1000,
        easing: EASE_IN_OUT,
      });
      anim(
        p,
        [
          { fillOpacity: 0, strokeOpacity: 1 },
          { fillOpacity: 1, strokeOpacity: 0 },
        ],
        {
          duration: T.fillDur * 1000,
          delay: (T.fill + i * T.drawStagger * 0.6) * 1000,
          easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
        },
      );
    });
    if (typeof REVEAL !== 'undefined') {
      REVEAL.active = true;
      REVEAL.r = 0;
    }
    intro.fieldStart = performance.now() + T.field * 1000;
    intro.fieldDur = T.fieldDur;
    const items = [...document.querySelectorAll('[data-intro]')];
    items.forEach((el, i) =>
      anim(
        el,
        [
          { opacity: 0, transform: 'translateY(14px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: T.itemDur * 1000, delay: (T.content + i * T.stagger) * 1000, easing: EASE_OUT },
      ),
    );
    setTimeout(
      () => {
        intro.done = true;
        html.classList.remove('home-intro');
        document.querySelectorAll('[data-reveal]').forEach((g) => {
          if (inView(g)) revealGroup(g);
        });
      },
      (T.content + items.length * T.stagger) * 1000,
    );
  }
  function updateReveal(now) {
    if (typeof REVEAL === 'undefined' || !REVEAL.active) return;
    const logo = document.querySelector('.hero-logo, [data-reveal-origin]');
    if (logo) {
      const r = logo.getBoundingClientRect();
      REVEAL.cx = r.left + r.width * (logo.classList.contains('hero-logo') ? 0.22 : 0.5);
      REVEAL.cy = r.top + r.height / 2;
    }
    if (intro.fieldStart < 0 || now < intro.fieldStart) {
      REVEAL.r = 0;
      return;
    }
    const t = clamp01((now - intro.fieldStart) / (intro.fieldDur * 1000));
    REVEAL.r = easeOutCubic(t) * (Math.hypot(innerWidth, innerHeight) + REVEAL.feather * 2);
    if (t >= 1) {
      REVEAL.active = false;
      intro.fieldStart = -1;
    }
  }
  function inView(el) {
    const r = el.getBoundingClientRect();
    return r.top < innerHeight * 0.92 && r.bottom > 0;
  }
  function revealGroup(g) {
    if (g.classList.contains('revealed')) return;
    g.classList.add('revealed');
    g.dispatchEvent(new CustomEvent('reveal'));
    if (LOW) return;
    const items = [
      ...(g.hasAttribute('data-reveal-item') ? [g] : []),
      ...g.querySelectorAll('[data-reveal-item]'),
    ];
    const step = +(g.dataset.revealStagger || 90);
    items.forEach((el, i) =>
      anim(
        el,
        [
          { opacity: 0, transform: 'translateY(24px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 800, delay: i * step, easing: EASE_OUT },
      ),
    );
  }
  function initReveals() {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting && intro.done) revealGroup(e.target);
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('[data-reveal]').forEach((g) => io.observe(g));
  }
  const CTA_PLAY = {
    line(c, items) {
      c.querySelectorAll('.cta-lines path').forEach((p) =>
        anim(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
          duration: 2600,
          easing: 'cubic-bezier(0.45, 0, 0.2, 1)',
        }),
      );
      items.forEach((el, i) =>
        anim(
          el,
          [
            { opacity: 0, transform: 'translateY(18px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 900, delay: 1100 + i * 120, easing: EASE_OUT },
        ),
      );
    },
    light(c, items) {
      anim(
        c.querySelector('.cta-light-src'),
        [
          { opacity: 0, transform: 'translateY(26%) scale(0.86)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 2600, easing: EASE_OUT },
      );
      items.forEach((el) => {
        if (el.classList.contains('btn-accent'))
          anim(
            el,
            [
              { opacity: 0, transform: 'translateY(12px)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: 800, delay: 1500, easing: EASE_OUT },
          );
      });
    },
  };
  function playCta(c) {
    c.classList.add('played');
    if (LOW) return;
    const items = [...c.querySelectorAll('[data-cta-item]')];
    (
      CTA_PLAY[c.dataset.cta] ||
      ((_cta, it) =>
        it.forEach((el, i) =>
          anim(
            el,
            [
              { opacity: 0, transform: 'translateY(18px)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: 900, delay: i * 120, easing: EASE_OUT },
          ),
        ))
    )(c, items);
  }
  function initCtas() {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting && !e.target.classList.contains('played')) playCta(e.target);
        }),
      { threshold: 0.55 },
    );
    document.querySelectorAll('[data-cta]').forEach((c) => io.observe(c));
  }

  const ST_CELL = 8;
  const TAU = Math.PI * 2;
  const sstep = (a, b, x) => smooth(a, b, x);
  const wrapD = (d) => d - Math.round(d);
  const STIPPLE_PATTERNS = {
    drift: {
      label: 'Drift',
      note: 'Topographic bands that wander and slowly re-form (the original card field).',
      s: 34,
      w: 0.36,
      snap: 0.8,
      pitch: 5.5,
      loose: 0.05,
      speed: 10,
      evolve: 0.04,
      field(x, y, t, c) {
        const sc = c.s * 6;
        const n =
          noise3(x / sc + c.ox, y / sc + c.oy, t) +
          0.25 * noise3((x / sc) * 2.1 + 5.3 + c.ox, (y / sc) * 2.1 - 2.7 + c.oy, t * 1.4);
        return n * (sc / c.s) * 0.7;
      },
    },
    ribbons: {
      label: 'Ribbons',
      note: 'Two or three thick meandering streams with loose dots at their edges.',
      s: 118,
      w: 0.3,
      snap: 0.55,
      pitch: 6.5,
      loose: 0.07,
      speed: 16,
      evolve: 0.15,
      angle: -0.42,
      field(x, y, t, c) {
        const m = 34 * Math.sin(x / 95 + t * 0.5) + 26 * noise3(x / 210 + c.ox, c.oy, t * 0.3);
        return (y + m) / c.s;
      },
    },
    chevrons: {
      label: 'Chevrons',
      note: 'Nested V-shaped contour lines, like a wake or a valley map.',
      s: 36,
      w: 0.08,
      snap: 1,
      pitch: 8.5,
      loose: 0.04,
      speed: 14,
      evolve: 0.12,
      field(x, y, t, c) {
        return (
          (y +
            0.85 * Math.sqrt(x * x + 900) +
            8 * noise3(x / 160 + c.ox, y / 160 + c.oy, t * 0.3)) /
            c.s -
          t * 0.5
        );
      },
    },
    ripples: {
      label: 'Ripples',
      note: 'Rings spreading from a point, like a drop in a lagoon.',
      grid: false,
      s: 24,
      w: 0.1,
      snap: 1,
      pitch: 8,
      loose: 0.04,
      speed: 12,
      evolve: 0.25,
      field(x, y, t, c) {
        return Math.hypot(x + c.W * 0.22, y - c.H * 0.2) / c.s - t;
      },
    },
    waves: {
      label: 'Waves',
      note: 'Parallel swells travelling across the panel.',
      grid: false,
      s: 26,
      w: 0.1,
      snap: 1,
      pitch: 7,
      loose: 0.03,
      speed: 10,
      evolve: 0.35,
      field(x, y, t, c) {
        return (y + 13 * Math.sin(x / 64 - t) + 5 * Math.sin(x / 29 + t * 0.6)) / c.s;
      },
    },
    dunes: {
      label: 'Dunes',
      note: 'Fine, close sand ripples with irregular crests (veli = sand).',
      s: 17,
      w: 0.16,
      snap: 0.9,
      pitch: 6,
      loose: 0.05,
      speed: 6,
      evolve: 0.05,
      angle: -0.18,
      field(x, y, t, c) {
        const d =
          9 * Math.sin(x / 34 + 2.4 * noise3(x / 180 + c.ox, y / 180 + c.oy, t * 0.25)) +
          26 * noise3(x / 260 + 3.3 + c.ox, y / 260 + c.oy, t * 0.2);
        return (y + d) / c.s;
      },
    },
    atoll: {
      label: 'Atoll',
      note: 'Contour lines around a few islands; open water stays empty.',
      s: 1,
      w: 0.12,
      snap: 1,
      pitch: 7.5,
      loose: 0.02,
      speed: 9,
      evolve: 0.05,
      islands: [
        [-0.27, -0.05, 0.36, 1],
        [0.3, 0.14, 0.44, 1.1],
        [0.04, -0.45, 0.22, 0.6],
      ],
      height(x, y, t, c) {
        let h = 0;
        for (const [ix, iy, ir, a] of this.islands) {
          const r = ir * c.H,
            wx = 0.12 * r * noise3(x / 90 + c.ox + ix * 7, y / 90 + c.oy, t),
            wy = 0.12 * r * noise3(x / 90 - 4.1, y / 90 + c.oy + iy * 5, t);
          const dx = x + wx - ix * c.W,
            dy = y + wy - iy * c.H;
          h += a * Math.exp(-(dx * dx + dy * dy) / (r * r));
        }
        return h;
      },
      field(x, y, t, c) {
        return (this.height(x, y, t, c) * 7) / c.s + 0.5;
      },
      mask(x, y, t, c) {
        return sstep(0.035, 0.1, this.height(x, y, t, c));
      },
    },
    spiral: {
      label: 'Spiral',
      note: 'Two arms winding slowly into a centre.',
      grid: false,
      s: 34,
      w: 0.1,
      snap: 1,
      pitch: 8,
      loose: 0.04,
      speed: 14,
      evolve: 0.15,
      field(x, y, t, c) {
        const dx = x - c.W * 0.18;
        return Math.hypot(dx, y) / c.s + (2 * Math.atan2(y, dx)) / TAU - t;
      },
      mask(x, y, _time, c) {
        return sstep(10, 30, Math.hypot(x - c.W * 0.18, y));
      },
    },
    current: {
      label: 'Current',
      note: 'Streamlines parting around the middle, where the UI sits.',
      grid: false,
      s: 20,
      w: 0.1,
      snap: 1,
      pitch: 8,
      loose: 0.03,
      speed: 18,
      evolve: 0.05,
      field(x, y, t, c) {
        const R = 0.36 * c.H,
          u = x / 1.9,
          r2 = Math.max(u * u + y * y, R * R * 0.5);
        return (y * (1 - (R * R) / r2) + 3 * Math.sin(x / 80 + t)) / c.s;
      },
      mask(x, y, _time, c) {
        const R = 0.36 * c.H,
          u = x / 1.9;
        return sstep(R * 0.95, R * 1.15, Math.hypot(u, y));
      },
    },
    hatch: {
      label: 'Hatch',
      note: 'Straight diagonal lines, like rain or an engraving.',
      s: 16,
      w: 0.1,
      snap: 1,
      pitch: 8,
      loose: 0.03,
      speed: 12,
      evolve: 0.05,
      angle: 1.0,
      field(x, y, t, c) {
        return (x + 2.5 * noise3(x / 120 + c.ox, y / 120 + c.oy, t)) / c.s;
      },
    },
    eddies: {
      label: 'Eddies',
      note: 'Closed loops around a pair of counter-turning whirlpools.',
      s: 1,
      w: 0.13,
      snap: 1,
      pitch: 7.5,
      loose: 0.03,
      speed: 12,
      evolve: 0.05,
      sum(x, y, t, c) {
        const sg = 0.42 * c.H,
          k = 1 / (2 * sg * sg),
          wob = 0.06 * c.H;
        const a = [-0.24 * c.W + wob * noise3(c.ox, t, 1), 0.02 * c.H],
          b = [0.24 * c.W + wob * noise3(c.oy, t, 2), -0.04 * c.H];
        const da = (x - a[0]) ** 2 + (y - a[1]) ** 2,
          db = (x - b[0]) ** 2 + (y - b[1]) ** 2;
        return Math.exp(-da * k) - Math.exp(-db * k);
      },
      field(x, y, t, c) {
        return (this.sum(x, y, t, c) * 6) / c.s + 0.5;
      },
      mask(x, y, t, c) {
        return sstep(0.03, 0.09, Math.abs(this.sum(x, y, t, c)));
      },
    },
    terraces: {
      label: 'Terraces',
      note: 'Layered strata stepping across two soft faults.',
      s: 18,
      w: 0.12,
      snap: 1,
      pitch: 7,
      loose: 0.03,
      speed: 8,
      evolve: 0.05,
      angle: -0.08,
      field(x, y, t, c) {
        const step =
          44 * sstep(-12, 12, x + 0.45 * y + 0.14 * c.W) -
          40 * sstep(-12, 12, x - 0.4 * y - 0.28 * c.W);
        return (y + step + 6 * noise3(x / 150 + c.ox, y / 150 + c.oy, t)) / c.s;
      },
    },
  };
  const STIPPLE_NAMES = Object.keys(STIPPLE_PATTERNS);
  defineDefaults({
    stPattern1: 'chevrons',
    stPattern2: 'ribbons',
    stPattern3: 'drift',
    stPatternTiles: 'none',
    stColorMode: 'hover',
    stDot: 2.3,
    stDensity: 1,
    stPitch: 1,
    stSpacing: 1,
    stWidth: 1,
    stSnap: 1,
    stLoose: 1,
    stSpeed: 1,
    stEvolve: 1,
    stAngle: 0,
    stSeed: 1,
    stClear: 10,
    stScatter: 0.77,
    stScatterRadius: 106,
    stHoverSpeed: 4.21,
    stColorTime: 0.0628,
    cardHover1: '#3babae',
    cardHover2: '#2f96f0',
    cardHover3: '#e066e3',
  });
  function stippleRestColour() {
    return (
      getComputedStyle(document.documentElement).getPropertyValue('--stipple-dot').trim() ||
      THEME.stippleRest ||
      '#e0e2dd'
    );
  }
  class StippleField {
    constructor(host) {
      this.host = host;
      this.root =
        host.closest('[data-stipple-root]') ||
        host.closest('.pcard, .tile, article, a, figure') ||
        host;
      this.canvas =
        host.querySelector(':scope > canvas.st') ||
        host.insertBefore(
          Object.assign(document.createElement('canvas'), { className: 'st' }),
          host.firstChild,
        );
      this.canvas.setAttribute('aria-hidden', 'true');
      this.ctx = this.canvas.getContext('2d');
      this.solidEls = [...host.querySelectorAll('[data-stipple-solid], [data-cf-solid]')].filter(
        (e) => e !== host,
      );
      this.avoidEls = [...host.querySelectorAll('[data-stipple-avoid], [data-cf-avoid]')];
      this.n = 0;
      this.cap = 0;
      this.solids = [];
      this.avoid = [];
      this.hover = 0;
      this.hoverTarget = 0;
      this.px = this.py = -1e4;
      this.pin = false;
      this.visible = false;
      this.dirty = true;
      this.name = '';
      const R = this.root;
      R.addEventListener('pointerenter', (e) => {
        this.hoverTarget = 1;
        wake();
        this.pin = e.pointerType !== 'touch';
      });
      R.addEventListener('pointerleave', () => {
        this.hoverTarget = 0;
        wake();
        this.pin = false;
        this.px = this.py = -1e4;
      });
      R.addEventListener(
        'pointermove',
        (e) => {
          if (e.pointerType === 'touch') return;
          const r = host.getBoundingClientRect();
          this.px = e.clientX - r.left;
          this.py = e.clientY - r.top;
          this.pin = true;
        },
        { passive: true },
      );
      R.addEventListener('focusin', () => {
        this.hoverTarget = 1;
        wake();
      });
      R.addEventListener('focusout', () => {
        this.hoverTarget = 0;
        wake();
      });
    }
    get patternName() {
      const d = this.host.dataset,
        v = d.stippleKey ? S[d.stippleKey] : d.stipple;
      return v === 'none' ? 'none' : STIPPLE_PATTERNS[v] ? v : 'drift';
    }
    num(name, fallback) {
      const v = parseFloat(this.host.dataset['stipple' + name]);
      return Number.isFinite(v) ? v : fallback;
    }
    accent() {
      const d = this.host.dataset;
      return (d.stippleColorKey && S[d.stippleColorKey]) || d.stippleColor || '#3babae';
    }
    mode() {
      return this.host.dataset.stippleMode || S.stColorMode;
    }
    params() {
      const P = STIPPLE_PATTERNS[this.name];
      const ang = (P.angle || 0) + ((S.stAngle + this.num('Angle', 0)) * Math.PI) / 180;
      const seed = mulberry32(S.stSeed * 7919 + STIPPLE_NAMES.indexOf(this.name) * 104729);
      return {
        P,
        s: P.s * S.stSpacing * this.num('Spacing', 1),
        w: clamp(P.w * S.stWidth * this.num('Width', 1), 0.03, 0.95),
        snap: P.snap * S.stSnap,
        pitch: Math.max(2.5, P.pitch * S.stPitch * this.num('Pitch', 1)),
        loose: clamp(P.loose * S.stLoose, 0, 0.6),
        speed: P.speed * S.stSpeed,
        evolve: P.evolve * S.stEvolve,
        cos: Math.cos(ang),
        sin: Math.sin(ang),
        ox: seed() * 40,
        oy: seed() * 40,
      };
    }
    layout() {
      const name = this.patternName;
      const r = this.host.getBoundingClientRect();
      this.W = Math.max(1, r.width);
      this.H = Math.max(1, r.height);
      this.rad = parseFloat(getComputedStyle(this.host).borderTopLeftRadius) || 0;
      const d = Math.min(2, devicePixelRatio || 1);
      this.dpr = d;
      this.canvas.width = Math.round(this.W * d);
      this.canvas.height = Math.round(this.H * d);
      this.dirty = false;
      if (name === 'none') {
        this.name = name;
        this.n = 0;
        this.clear();
        return;
      }
      const respawn = name !== this.name || this.forceRespawn;
      this.name = name;
      this.forceRespawn = false;
      this.Q = this.params();
      this.c = { W: this.W, H: this.H, s: this.Q.s, ox: this.Q.ox, oy: this.Q.oy };
      this.time = respawn ? 0 : this.time;
      this.gw = Math.ceil(this.W / ST_CELL) + 2;
      this.gh = Math.ceil(this.H / ST_CELL) + 2;
      this.psi = new Float32Array(this.gw * this.gh);
      this.msk = new Float32Array(this.gw * this.gh);
      this.buildGrid();
      const Q = this.Q,
        [len, area] = this.measure();
      const spacing = clamp(area / Math.max(1, len), 6, 400);
      const rows = Math.max(1, ((Q.w * spacing) / Q.pitch) * 0.9);
      let want = (len / Q.pitch) * rows * S.stDensity * (rows < 1.3 ? 0.88 : 1);
      want = Math.round(clamp(want / (1 - Q.loose), 40, 4200));
      if (want > this.cap) this.alloc(Math.ceil(want * 1.2));
      const from = respawn ? 0 : this.n;
      for (let i = from; i < want; i++) this.spawn(i);
      this.n = want;
      for (let i = 0; i < this.n; i++) if (this.X[i] > this.W || this.Y[i] > this.H) this.spawn(i);
      this.readSolids();
      this.readAvoid();
      if (respawn) this.settle(24);
    }
    measure() {
      const c = 10,
        e = 1;
      let len = 0,
        area = 0;
      for (let y = c / 2; y < this.H; y += c)
        for (let x = c / 2; x < this.W; x += c) {
          const [p, m] = this.evalAt(x, y);
          if (m < 0.02) continue;
          const g =
            Math.hypot(wrapD(this.psiAt(x + e, y) - p), wrapD(this.psiAt(x, y + e) - p)) / e;
          len += Math.min(g, 0.5) * m * c * c;
          area += m * c * c;
        }
      return [len, area];
    }
    alloc(n) {
      const g = (a, T = Float32Array) => {
        const b = new T(n);
        if (a) b.set(a.subarray(0, Math.min(a.length, n)));
        return b;
      };
      this.X = g(this.X);
      this.Y = g(this.Y);
      this.VX = g(this.VX);
      this.VY = g(this.VY);
      this.RND = g(this.RND);
      this.VIS = g(this.VIS);
      this.TV = g(this.TV);
      this.AV = g(this.AV);
      this.next = new Int32Array(n);
      this.head = null;
      this.cap = n;
    }
    local(x, y) {
      const dx = x - this.W / 2,
        dy = y - this.H / 2,
        Q = this.Q;
      return [dx * Q.cos + dy * Q.sin, -dx * Q.sin + dy * Q.cos];
    }
    evalAt(x, y) {
      const P = this.Q.P,
        [u, v] = this.local(x, y);
      return [P.field(u, v, this.time, this.c), P.mask ? P.mask(u, v, this.time, this.c) : 1];
    }
    psiAt(x, y) {
      const Q = this.Q,
        dx = x - this.W / 2,
        dy = y - this.H / 2;
      return Q.P.field(dx * Q.cos + dy * Q.sin, -dx * Q.sin + dy * Q.cos, this.time, this.c);
    }
    buildGrid() {
      const P = this.Q.P;
      if (P.grid === false && !P.mask) return;
      for (let gy = 0; gy < this.gh; gy++)
        for (let gx = 0; gx < this.gw; gx++) {
          const [p, m] = this.evalAt(gx * ST_CELL, gy * ST_CELL),
            i = gy * this.gw + gx;
          this.psi[i] = p;
          this.msk[i] = m;
        }
    }
    sample(x, y) {
      const P = this.Q.P,
        o = this.o || (this.o = new Float32Array(4));
      if (P.grid === false) {
        const e = 0.75;
        o[0] = this.psiAt(x, y);
        o[1] = wrapD(this.psiAt(x + e, y) - this.psiAt(x - e, y)) / (2 * e);
        o[2] = wrapD(this.psiAt(x, y + e) - this.psiAt(x, y - e)) / (2 * e);
        o[3] = P.mask ? this.gridMask(x, y) : 1;
        return o;
      }
      const gw = this.gw,
        fx = clamp(x / ST_CELL, 0, gw - 1.001),
        fy = clamp(y / ST_CELL, 0, this.gh - 1.001);
      const ix = fx | 0,
        iy = fy | 0,
        tx = fx - ix,
        ty = fy - iy,
        i = iy * gw + ix,
        A = this.psi,
        M = this.msk;
      const p00 = A[i],
        p10 = A[i + 1],
        p01 = A[i + gw],
        p11 = A[i + gw + 1];
      o[0] = (p00 * (1 - tx) + p10 * tx) * (1 - ty) + (p01 * (1 - tx) + p11 * tx) * ty;
      o[1] = ((p10 - p00) * (1 - ty) + (p11 - p01) * ty) / ST_CELL;
      o[2] = ((p01 - p00) * (1 - tx) + (p11 - p10) * tx) / ST_CELL;
      o[3] =
        (M[i] * (1 - tx) + M[i + 1] * tx) * (1 - ty) +
        (M[i + gw] * (1 - tx) + M[i + gw + 1] * tx) * ty;
      return o;
    }
    gridMask(x, y) {
      const gw = this.gw,
        fx = clamp(x / ST_CELL, 0, gw - 1.001),
        fy = clamp(y / ST_CELL, 0, this.gh - 1.001);
      const ix = fx | 0,
        iy = fy | 0,
        tx = fx - ix,
        ty = fy - iy,
        i = iy * gw + ix,
        M = this.msk;
      return (
        (M[i] * (1 - tx) + M[i + 1] * tx) * (1 - ty) +
        (M[i + gw] * (1 - tx) + M[i + gw + 1] * tx) * ty
      );
    }
    spawn(i) {
      const Q = this.Q;
      let x = 0,
        y = 0;
      for (let k = 0; k < 8; k++) {
        x = 4 + Math.random() * (this.W - 8);
        y = 4 + Math.random() * (this.H - 8);
        if (this.sample(x, y)[3] > 0.4) break;
      }
      this.RND[i] = Math.random();
      if (this.RND[i] >= Q.loose) {
        for (let k = 0; k < 3; k++) {
          const o = this.sample(x, y),
            g2 = o[1] * o[1] + o[2] * o[2];
          if (g2 < 1e-10) break;
          const e = o[0] - Math.round(o[0]),
            hw = Q.w * 0.5 * 0.8,
            ex = e - clamp(e, -hw, hw) + (Math.random() - 0.5) * hw * 2 * 0.9;
          x = clamp(x - (o[1] * ex) / g2, 2, this.W - 2);
          y = clamp(y - (o[2] * ex) / g2, 2, this.H - 2);
        }
      }
      this.X[i] = x;
      this.Y[i] = y;
      this.VX[i] = this.VY[i] = 0;
      this.VIS[i] = 0;
    }
    hop(i, clear) {
      let x = this.X[i],
        y = this.Y[i];
      for (let k = 0; k < 90; k++) {
        const o = this.sample(x, y),
          g = Math.hypot(o[1], o[2]) || 1;
        x += (o[2] / g) * 4;
        y += (-o[1] / g) * 4;
        if (this.edgeSD(x, y) < 2) break;
        if (this.solidSD(x, y) > clear) {
          this.X[i] = x;
          this.Y[i] = y;
          this.VIS[i] = 0;
          return;
        }
      }
      this.spawnUpstream(i);
    }
    spawnUpstream(i) {
      this.spawn(i);
      for (let k = 0; k < 6; k++) {
        const o = this.sample(this.X[i], this.Y[i]),
          g = Math.hypot(o[1], o[2]) || 1,
          tx = o[2] / g,
          ty = -o[1] / g;
        let x = this.X[i],
          y = this.Y[i];
        for (let j = 0; j < 40 && this.edgeSD(x - tx * 8, y - ty * 8) > this.Q.pitch; j++) {
          x -= tx * 8;
          y -= ty * 8;
        }
        if (Math.random() < 0.5) {
          this.X[i] = x;
          this.Y[i] = y;
        }
        break;
      }
    }
    readSolids() {
      const c = this.host.getBoundingClientRect(),
        out = [];
      for (const el of this.solidEls) {
        if (!el.offsetParent || el.closest('[data-cf-off]')) continue;
        const r = el.getBoundingClientRect();
        out.push({
          x0: r.left - c.left,
          y0: r.top - c.top,
          x1: r.right - c.left,
          y1: r.bottom - c.top,
          rad: Math.min(20, parseFloat(getComputedStyle(el).borderTopLeftRadius) || 8),
        });
      }
      if (this.host._stippleSolids) for (const s of this.host._stippleSolids(c)) out.push(s);
      this.solids = out;
    }
    readAvoid() {
      const c = this.host.getBoundingClientRect();
      this.avoid = [];
      for (const el of this.avoidEls)
        if (el.offsetParent) this.avoid.push(...textLineRects(el, c.left, c.top, 4));
    }
    solidSD(x, y) {
      let d = 1e9;
      for (const s of this.solids) {
        const v = sdRoundRect(x, y, s.x0, s.y0, s.x1, s.y1, s.rad);
        if (v < d) d = v;
      }
      return d;
    }
    avoidSD(x, y) {
      let d = 1e9;
      for (const a of this.avoid) {
        const v = sdRoundRect(x, y, a.x0, a.y0, a.x1, a.y1, 6);
        if (v < d) d = v;
      }
      return d;
    }
    edgeSD(x, y) {
      return -sdRoundRect(x, y, 0, 0, this.W, this.H, Math.min(this.rad, this.H / 2));
    }
    step(dt) {
      if (this.dirty) this.layout();
      if (this.name === 'none') return;
      this.readSolids();
      const Q = this.Q,
        h = this.hover;
      this.hover +=
        (this.hoverTarget - this.hover) * (1 - Math.exp(-dt / Math.max(0.02, S.stColorTime)));
      const hs = 1 + h * (S.stHoverSpeed - 1);
      this.time += dt * Q.evolve * hs;
      this.buildGrid();
      const k = 1 - Math.exp(-dt / 0.35),
        speed = Q.speed * hs,
        snapRate = 6 * Q.snap,
        hw = Q.w * 0.5;
      const scR = S.stScatterRadius,
        sc = S.stScatter * 900 * h,
        pitch = Q.pitch,
        r = S.stDot / 2;
      const { X, Y, VX, VY } = this;
      for (let i = 0; i < this.n; i++) {
        const o = this.sample(X[i], Y[i]);
        let g = Math.hypot(o[1], o[2]);
        const flat = g < 1e-6;
        if (flat) g = 1e-6;
        const nx = o[1] / g,
          ny = o[2] / g,
          m = o[3];
        const sp = speed * Math.min(1, g * (this.Q.P.s > 1 ? this.Q.s : 30));
        let tvx = ny * sp,
          tvy = -nx * sp;
        const e = o[0] - Math.round(o[0]);
        const loose = this.RND[i] < Q.loose;
        if (!loose && !flat) {
          const ex = e - clamp(e, -hw * 0.75, hw * 0.75),
            pull = clamp(ex / g, -30, 30) * snapRate * m;
          tvx -= nx * pull;
          tvy -= ny * pull;
        }
        if (sc > 0 && this.pin) {
          const dx = X[i] - this.px,
            dy = Y[i] - this.py,
            d2 = dx * dx + dy * dy;
          if (d2 < scR * scR && d2 > 1e-4) {
            const d = Math.sqrt(d2),
              q = 1 - d / scR,
              f = sc * q * q * dt;
            VX[i] += (dx / d) * f;
            VY[i] += (dy / d) * f;
          }
        }
        VX[i] += (tvx - VX[i]) * k;
        VY[i] += (tvy - VY[i]) * k;
        const s2 = Math.hypot(VX[i], VY[i]);
        if (s2 > 500) {
          VX[i] *= 500 / s2;
          VY[i] *= 500 / s2;
        }
        X[i] += VX[i] * dt;
        Y[i] += VY[i] * dt;
        const band = 1 - sstep(hw, hw + 0.1, Math.abs(e));
        this.TV[i] = (loose ? 0.55 : band) * m;
      }
      this.separate(pitch);
      const pad = S.stClear,
        kf = 1 - Math.exp(-dt / 0.35);
      for (let i = 0; i < this.n; i++) {
        let av = 1;
        if (this.solids.length) {
          for (const s of this.solids) {
            const e2 = r + 2,
              sd = sdRoundRect(X[i], Y[i], s.x0 - e2, s.y0 - e2, s.x1 + e2, s.y1 + e2, s.rad + e2);
            if (sd < 0) {
              const dT = Y[i] - (s.y0 - e2),
                dB = s.y1 + e2 - Y[i],
                dL = X[i] - (s.x0 - e2),
                dR = s.x1 + e2 - X[i],
                mn = Math.min(dT, dB, dL, dR);
              const nx = mn === dL ? -1 : mn === dR ? 1 : 0,
                ny = nx ? 0 : mn === dT ? -1 : 1;
              X[i] += nx * -sd * 0.35;
              Y[i] += ny * -sd * 0.35;
            }
          }
          const sd = this.solidSD(X[i], Y[i]) - r;
          av = sstep(pad * 0.25, pad + 2, sd);
          if (sd < pad * 0.6) {
            const gx = this.solidSD(X[i] + 1, Y[i]) - this.solidSD(X[i] - 1, Y[i]),
              gy = this.solidSD(X[i], Y[i] + 1) - this.solidSD(X[i], Y[i] - 1);
            if (VX[i] * gx + VY[i] * gy < 0 && Math.random() < dt * 12) this.hop(i, r + pad);
          }
        }
        if (this.avoid.length)
          av = Math.min(av, sstep(pad * 0.25, pad + 4, this.avoidSD(X[i], Y[i])));
        this.AV[i] = av;
        const ed = this.edgeSD(X[i], Y[i]) - r - 1;
        if (ed < 0) {
          const e1 = 1,
            gx = this.edgeSD(X[i] + e1, Y[i]) - this.edgeSD(X[i] - e1, Y[i]),
            gy = this.edgeSD(X[i], Y[i] + e1) - this.edgeSD(X[i], Y[i] - e1);
          const gg = Math.hypot(gx, gy) || 1;
          X[i] -= (gx / gg) * ed;
          Y[i] -= (gy / gg) * ed;
          if (ed < -pitch * 2 || !Number.isFinite(X[i] + Y[i])) this.spawn(i);
        }
        this.VIS[i] += (this.TV[i] - this.VIS[i]) * kf;
      }
      const out = r + 2 + pitch * 0.6;
      for (let i = 0; i < this.n; i++) {
        const ed = this.edgeSD(X[i], Y[i]);
        if (ed > out) continue;
        const gx = this.edgeSD(X[i] + 1, Y[i]) - this.edgeSD(X[i] - 1, Y[i]),
          gy = this.edgeSD(X[i], Y[i] + 1) - this.edgeSD(X[i], Y[i] - 1);
        if (VX[i] * -gx + VY[i] * -gy > 0.15 * speed * Math.hypot(gx, gy) && Math.random() < dt * 8)
          this.spawnUpstream(i);
      }
    }
    separate(min) {
      const cell = Math.max(2, min),
        gw = Math.ceil(this.W / cell) + 1,
        gh = Math.ceil(this.H / cell) + 1;
      if (!this.head || this.head.length < gw * gh) this.head = new Int32Array(gw * gh);
      const head = this.head,
        next = this.next,
        X = this.X,
        Y = this.Y;
      head.fill(-1, 0, gw * gh);
      for (let i = 0; i < this.n; i++) {
        const c = clamp((Y[i] / cell) | 0, 0, gh - 1) * gw + clamp((X[i] / cell) | 0, 0, gw - 1);
        next[i] = head[c];
        head[c] = i;
      }
      for (let i = 0; i < this.n; i++) {
        const cx = clamp((X[i] / cell) | 0, 0, gw - 1),
          cy = clamp((Y[i] / cell) | 0, 0, gh - 1);
        for (let oy = -1; oy <= 1; oy++) {
          const yy = cy + oy;
          if (yy < 0 || yy >= gh) continue;
          for (let ox = -1; ox <= 1; ox++) {
            const xx = cx + ox;
            if (xx < 0 || xx >= gw) continue;
            for (let j = head[yy * gw + xx]; j !== -1; j = next[j]) {
              if (j <= i) continue;
              let dx = X[j] - X[i],
                dy = Y[j] - Y[i];
              const d2 = dx * dx + dy * dy;
              if (d2 >= min * min) continue;
              let d = Math.sqrt(d2);
              if (d < 1e-4) {
                dx = 1;
                dy = 0;
                d = 1;
              } else {
                dx /= d;
                dy /= d;
              }
              const c = (min - d) * 0.5 * 0.7;
              X[i] -= dx * c;
              Y[i] -= dy * c;
              X[j] += dx * c;
              Y[j] += dy * c;
            }
          }
        }
      }
    }
    clear() {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    render() {
      if (this.dirty) this.layout();
      this.clear();
      if (this.name === 'none') return;
      const ctx = this.ctx,
        d = this.dpr,
        mode = this.mode();
      ctx.setTransform(d, 0, 0, d, 0, 0);
      const mix = mode === 'always' ? 1 : mode === 'rest' ? 0 : this.hover;
      ctx.fillStyle = mixHex(ST_REST.c, this.accent(), mix);
      const r = S.stDot / 2,
        LV = 4;
      for (let a = 0; a < LV; a++) {
        ctx.globalAlpha = (a + 1) / LV;
        ctx.beginPath();
        for (let i = 0; i < this.n; i++) {
          const v = (LOW ? this.TV[i] : this.VIS[i]) * this.AV[i];
          if (v < 0.05 || Math.min(LV - 1, (v * LV) | 0) !== a) continue;
          const rr = r * (0.65 + 0.35 * v);
          ctx.moveTo(this.X[i] + rr, this.Y[i]);
          ctx.arc(this.X[i], this.Y[i], rr, 0, TAU);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    settle(frames) {
      const h = this.hover;
      for (let f = 0; f < frames; f++) this.step(1 / 30);
      this.hover = h;
      for (let i = 0; i < this.n; i++) this.VIS[i] = this.TV[i];
    }
  }
  const ST_REST = { c: '#e0e2dd' };
  const stippleFields = [];
  function initStipple() {
    ST_REST.c = stippleRestColour();
    const hosts = [...document.querySelectorAll('[data-stipple]')];
    for (const h of hosts) stippleFields.push(new StippleField(h));
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          const f = stippleFields.find((x) => x.host === e.target);
          if (f) f.visible = e.isIntersecting;
          wake();
        }),
      { rootMargin: '120px 0px' },
    );
    const ro = new ResizeObserver((es) =>
      es.forEach((e) => {
        const f = stippleFields.find((x) => x.host === e.target);
        if (f) f.dirty = true;
      }),
    );
    for (const f of stippleFields) {
      io.observe(f.host);
      ro.observe(f.host);
      f.layout();
      f.render();
    }
  }
  function tickStipple(dt) {
    for (const f of stippleFields) {
      if (!f.visible || (f.name === 'none' && !f.dirty)) continue;
      if (LOW) {
        if (f.dirty) f.layout();
        f.hover += (f.hoverTarget - f.hover) * (1 - Math.exp(-dt / Math.max(0.02, S.stColorTime)));
        f.render();
        continue;
      }
      f.acc = (f.acc || 0) + dt;
      if (f.acc < (f.hoverTarget > 0 || f.hover > 0.01 ? 0 : 1 / 30)) continue;
      f.step(Math.min(f.acc, 1 / 20));
      f.acc = 0;
      f.render();
    }
  }
  ONBOOT.push(initStipple);
  FRAME.push(tickStipple);
  ONTHEME.push(() => {
    ST_REST.c = stippleRestColour();
    stippleFields.forEach((f) => f.render());
  });

  const FD_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200];
  const FD_PAL = {
    slate: [
      '#fcfcfc',
      '#f5f5f7',
      '#ecedf0',
      '#e0e1e5',
      '#b9bac1',
      '#9a9ba4',
      '#8a8c95',
      '#686a73',
      '#4e5159',
      '#34353c',
      '#202227',
      '#101015',
    ],
    ash: [
      '#fafafa',
      '#f5f5f5',
      '#ededed',
      '#e2e2e2',
      '#bbbbbb',
      '#9c9c9c',
      '#8c8c8c',
      '#6a6a6a',
      '#515151',
      '#353535',
      '#222222',
      '#101010',
    ],
    stone: [
      '#fcfcfb',
      '#f5f5f4',
      '#ededeb',
      '#e2e1df',
      '#bcbbb9',
      '#9d9c99',
      '#8e8c8a',
      '#6c6b68',
      '#52514e',
      '#373633',
      '#23211f',
      '#11110d',
    ],
    lime: [
      '#f8ffe8',
      '#ebfac7',
      '#e3f4ba',
      '#d4eaa3',
      '#a2c851',
      '#7eaa0d',
      '#739808',
      '#597402',
      '#455801',
      '#2e3b01',
      '#1d2501',
      '#0d1200',
    ],
    magenta: [
      '#fffaff',
      '#fff0ff',
      '#ffe6ff',
      '#ffd3ff',
      '#fc96fd',
      '#f657f8',
      '#e83ceb',
      '#b71ebb',
      '#8f0a95',
      '#620466',
      '#410244',
      '#240126',
    ],
    sage: [
      '#fbfcfb',
      '#f4f6f3',
      '#eceee9',
      '#e0e2dd',
      '#b9bcb6',
      '#9a9d96',
      '#8b8d87',
      '#696b66',
      '#50514d',
      '#353633',
      '#212320',
      '#10100f',
    ],
    blue: [
      '#f8fdff',
      '#e6f7ff',
      '#d4f2ff',
      '#b7e9fe',
      '#5ac6fd',
      '#13a4f4',
      '#0091ed',
      '#0065de',
      '#003fd1',
      '#002a8f',
      '#001d58',
      '#010f2d',
    ],
    emerald: [
      '#eefff5',
      '#d0ffe5',
      '#bcfad8',
      '#a1f2c5',
      '#23d57e',
      '#0eb269',
      '#09a15f',
      '#037a49',
      '#025d38',
      '#023e25',
      '#012816',
      '#001509',
    ],
    green: [
      '#f0ffef',
      '#d5ffd3',
      '#bdfdb4',
      '#9af366',
      '#5ed423',
      '#2fb31e',
      '#0fa320',
      '#227b0d',
      '#225d04',
      '#1a3d02',
      '#0e2801',
      '#051500',
    ],
    yellow: [
      '#fffced',
      '#fff6c7',
      '#fcecae',
      '#fae091',
      '#eeb014',
      '#c5940d',
      '#b0860b',
      '#836707',
      '#674e04',
      '#473302',
      '#2e1f01',
      '#180f00',
    ],
    orange: [
      '#fffbf8',
      '#fff2e9',
      '#ffead9',
      '#fedac4',
      '#f5aa7b',
      '#ea8036',
      '#eb610b',
      '#b04d00',
      '#853c00',
      '#572a00',
      '#371a01',
      '#1e0c00',
    ],
    red: [
      '#fffbfb',
      '#fff1f0',
      '#ffe8e8',
      '#ffd9d8',
      '#fba4a2',
      '#f27676',
      '#eb5d5b',
      '#d5110e',
      '#a50a07',
      '#710303',
      '#4d0101',
      '#2c0000',
    ],
    teal: [
      '#f9fdfc',
      '#eaf7f5',
      '#d6f3f0',
      '#b0ecea',
      '#5bccca',
      '#3babae',
      '#309a9f',
      '#19767e',
      '#055964',
      '#0c3a47',
      '#0f2528',
      '#051214',
    ],
    indigo: [
      '#fcfbff',
      '#f6f4ff',
      '#eeeaff',
      '#e4ddff',
      '#c1b0ff',
      '#a28afe',
      '#9177fd',
      '#6d4bf0',
      '#5237be',
      '#342287',
      '#21125f',
      '#10053b',
    ],
  };
  const FD_EASE = [
    ['ease-in-out', 0.65, 0, 0.35, 1],
    ['ease-out', 0.16, 1, 0.3, 1],
    ['ease-in', 0.7, 0, 0.84, 0],
    ['ease-standard', 0.32, 0.72, 0, 1],
  ];
  const FD_W = 648,
    FD_H = 264;
  const SVGNS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1,
      bx = 3 * (x2 - x1) - cx,
      ax = 1 - cx - bx;
    const cy = 3 * y1,
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
        if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      return Y(clamp01(t));
    };
  }
  const E_OUT = bezier(0.16, 1, 0.3, 1),
    E_INOUT = bezier(0.65, 0, 0.35, 1);
  const span = (t, a, d) => clamp01((t - a) / d);
  class FoundationCard {
    build() {
      throw new Error('A foundation scene must supply its artwork.');
    }
    paint() {
      throw new Error('A foundation scene must supply its drawing steps.');
    }
    constructor(el, kind) {
      this.el = el;
      this.kind = kind;
      this.svg = sv('svg', {
        viewBox: `0 0 ${FD_W} ${FD_H}`,
        'aria-hidden': 'true',
        class: 'fd-svg',
      });
      el.appendChild(this.svg);
      this.tip = document.createElement('div');
      this.tip.className = 'fd-tip';
      this.tip.hidden = true;
      el.appendChild(this.tip);
      this.drawn = 0; // outline draw progress 0→1
      this.drawing = false; // outline is drawing
      this.t = -1; // seconds since play (-1: not played)
      this.state = 'blank'; // blank → outline → play → done
      this.ratio = 0;
      this.build();
      this.paint();
      el.addEventListener('click', () => {
        if (this.state === 'done') {
          this.replay();
          wake();
        }
      });
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.replay();
          wake();
        }
      });
      el.addEventListener('pointermove', (e) => this.hover(e));
      el.addEventListener('pointerleave', () => {
        this.tip.hidden = true;
      });
    }
    rebuild() {
      this.svg.textContent = '';
      this.build();
      this.paint();
    }
    get dur() {
      return 3;
    }
    get drawTime() {
      return 1.1;
    } // the outline draw-in (s)
    get catchUp() {
      return 0.5;
    } // …and how fast it finishes if the card is already fully in view
    get loops() {
      return false;
    } // keeps animating gently once done (only while on screen)
    outline() {
      if (this.state !== 'blank') return;
      this.state = 'outline';
      if (LOW) {
        this.drawn = 1;
        this.paint();
      } else this.drawing = true;
    }
    play() {
      if (this.state === 'play' || this.state === 'done') return;
      this.outline();
      this.state = 'play';
      this.t = 0;
      if (LOW) this.finish();
    }
    replay() {
      this.t = 0;
      this.state = 'play';
      this.el.classList.remove('fd-done');
      if (LOW) this.finish();
    }
    reset() {
      this.state = 'blank';
      this.drawn = 0;
      this.drawing = false;
      this.t = -1;
      this.el.classList.remove('fd-done');
      this.paint();
      this.check();
    }
    finish() {
      this.drawn = 1;
      this.drawing = false;
      this.t = this.dur;
      this.state = 'done';
      this.el.classList.add('fd-done');
      this.paint();
    }
    check() {
      if (this.ratio > 0.01) this.outline();
      if (this.ratio > 0.965) this.play();
    }
    tick(dt) {
      let dirty = false;
      if (this.drawing) {
        this.drawn = Math.min(1, this.drawn + dt / this.drawTime);
        if (this.drawn >= 1) this.drawing = false;
        dirty = true;
      }
      if (this.state === 'play') {
        if (this.drawn < 1) {
          this.drawn = Math.min(1, this.drawn + dt / this.catchUp);
        } // catch up before colour lands
        else this.t += dt;
        if (this.t >= this.dur) {
          this.finish();
          return;
        }
        dirty = true;
      } else if (this.state === 'done' && this.loops && this.ratio > 0 && !LOW) {
        this.t += dt;
        dirty = true;
      }
      if (dirty) this.paint();
    }
    drawEl(e, k) {
      e.style.strokeDashoffset = 1 - k;
    }
    hover(e) {
      const tok = e.target.closest && e.target.closest('[data-tok]');
      if (!tok || this.state !== 'done') {
        this.tip.hidden = true;
        return;
      }
      const r = this.el.getBoundingClientRect();
      this.tip.textContent = tok.getAttribute('data-tok');
      this.tip.hidden = false;
      this.tip.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 16}px)`;
    }
  }
  const FL = {
    every: 5.5,
    pals: [
      'green',
      'teal',
      'blue',
      'indigo',
      'magenta',
      'red',
      'orange',
      'yellow',
      'lime',
      'emerald',
      'sage',
      'stone',
    ],
  }; // 3 sets of 4
  class ColourCard extends FoundationCard {
    get dur() {
      return 1.4;
    }
    get loops() {
      return true;
    }
    build() {
      this.n = 0;
      this.k = -1;
      this.pi = -1;
      const box = (this.box = document.createElement('div'));
      box.className = 'fd-swatches';
      this.sq = [];
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 12; c++) {
          const q = document.createElement('div');
          q.className = 'fd-sq';
          q.innerHTML = '<i class="f"></i><i class="b"></i>';
          q.style.setProperty('--d', `${(c * 0.04 + r * 0.06).toFixed(3)}s`); // a soft diagonal wave
          box.appendChild(q);
          this.sq.push({ q, f: q.firstChild, b: q.lastChild, r, c });
        }
      this.el.appendChild(box);
    }
    rebuild() {
      this.box.remove();
      this.build();
      this.paint();
    }
    replay() {
      super.replay();
      this.k = -1;
      this.pi = -1;
    }
    flipTo(p) {
      this.n++;
      this.box.classList.toggle('fd-instant', LOW);
      for (const s of this.sq) {
        const pal = FL.pals[(p * 4 + s.r) % FL.pals.length];
        const show = this.n % 2 ? s.b : s.f,
          hide = this.n % 2 ? s.f : s.b;
        show.style.background = FD_PAL[pal][s.c];
        show.classList.add('on');
        show.style.opacity = 1;
        hide.style.opacity = 0;
        s.q.setAttribute('data-tok', `${pal}/${FD_STEPS[s.c]}  ${FD_PAL[pal][s.c]}`);
      }
    }
    paint() {
      const live = this.state === 'play' || this.state === 'done',
        D = this.drawn;
      if (!live)
        this.sq.forEach((s) => {
          s.f.style.opacity = clamp01(D * 1.8 - ((s.c + s.r * 1.5) / 16.5) * 0.8);
          s.b.style.opacity = 0;
        });
      const k = live ? Math.floor(this.t / FL.every) : -1;
      while (this.k < k) {
        this.k++;
        this.flipTo(++this.pi);
      }
    }
  }
  const TY = { s: 0.44453, x: 73.98, y: -17.9 };
  const TY_GUIDES = [
    [73.7, -1, 0, ''],
    [106.1, -1, 0.1, 'baseline'],
    [149.2, 1, 0.45, 'cap height'],
    [163.5, 1, 0.55, 'x-height'],
    [206.1, 1, 0.65, 'baseline'],
  ];
  class TypeCard extends FoundationCard {
    get dur() {
      return 1.9;
    }
    get drawTime() {
      return 2.1;
    }
    get catchUp() {
      return 2.1;
    } // always let the letters trace at full length
    build() {
      const s = this.svg;
      this.lines = TY_GUIDES.map(([y, dir, a, name]) => {
        const e = sv(
          'path',
          { d: dir < 0 ? `M624 ${y}H24` : `M24 ${y}H624`, pathLength: 1, class: 'fd-baseline' },
          s,
        );
        let l = null;
        if (name) {
          l = sv('text', { x: 624, y: y - 4, class: 'fd-gname', 'text-anchor': 'end' }, s);
          l.textContent = name;
        }
        return { e, a, l };
      });
      const g = sv(
        'g',
        { transform: `translate(${TY.x} ${TY.y}) scale(${TY.s})`, class: 'fd-words' },
        s,
      );
      const glyph = (d, hex) => {
        const e = sv('path', { d, pathLength: 1, class: 'fd-o fd-ink' }, g);
        e.style.fill = hex;
        return e;
      };
      this.dv = FD_TYPE_DV.map((d) => glyph(d, FD_PAL.green[3])); // [0] is the rightmost letter
      this.en = FD_TYPE_EN.map((d) => glyph(d, FD_PAL.teal[4]));
      this.notes = [
        ['MV AAAMU FK  ·  DHIVEHI  ·  ←', 624, 44, 'end', -1],
        ['INTER SEMIBOLD  ·  ENGLISH  ·  →', 24, 240, 'start', 1],
      ].map(([txt, x, y, anchor, dir]) => {
        const e = sv('text', { x, y, class: 'fd-tag', 'text-anchor': anchor }, s);
        e.textContent = txt;
        return { e, dir };
      });
    }
    paint() {
      const t = this.t,
        live = this.state === 'play' || this.state === 'done',
        D = this.drawn * this.drawTime;
      const E = bezier(0.65, 0, 0.35, 1),
        F = bezier(0.33, 0, 0.2, 1);
      const glyph = (e, a, fa) => {
        this.drawEl(e, E(span(D, a, 1)));
        const f = live ? F(span(t, fa, 0.47)) : 0,
          o = live ? F(span(t, fa + 0.3, 0.5)) : 0;
        e.style.fillOpacity = f;
        e.style.strokeOpacity = 1 - o;
      };
      this.dv.forEach((e, j) => glyph(e, j * 0.18, j * 0.08));
      this.en.forEach((e, j) => glyph(e, 0.15 + j * 0.13, 0.35 + j * 0.05));
      this.lines.forEach(({ e, a, l }) => {
        e.style.strokeDashoffset = 1 - (live ? E(span(t, a, 0.9)) : 0);
        if (l) l.style.opacity = live ? F(span(t, a + 0.6, 0.4)) : 0;
      });
      this.notes.forEach(({ e, dir }, i) => {
        const k = live ? F(span(t, 1.1 + i * 0.2, 0.5)) : 0;
        e.style.opacity = k;
        e.style.transform = `translateX(${((1 - k) * -16 * dir).toFixed(1)}px)`;
      });
    }
  }
  const MO = { gx: 116, gy: 67, gw: 160, gh: 130, tx0: 372, tx1: 560, ty: 132, P: 4.6, intro: 0.8 };
  class MotionCard extends FoundationCard {
    get dur() {
      return MO.intro + MO.P;
    }
    get loops() {
      return true;
    }
    build() {
      const s = this.svg;
      this.track = sv(
        'path',
        { d: `M${MO.tx0 - 16} ${MO.ty}H${MO.tx1 + 16}`, pathLength: 1, class: 'fd-o fd-track' },
        s,
      );
      this.marks = [];
      for (let j = 0; j <= 10; j++)
        this.marks.push(sv('circle', { cy: MO.ty, r: 4, class: 'fd-mmark' }, s));
      this.curveO = sv('path', { pathLength: 1, class: 'fd-o' }, s);
      this.curve = sv('path', { pathLength: 1, class: 'fd-curve2' }, s);
      this.h = [0, 1].map(() => sv('path', { pathLength: 1, class: 'fd-o fd-handle' }, s)); // handles over the curve
      this.dots = [0, 1].map(() => sv('circle', { r: 8, pathLength: 1, class: 'fd-o fd-hdot' }, s));
      this.ball = sv('circle', { cy: MO.ty, r: 13, pathLength: 1, class: 'fd-o fd-ball' }, s);
    }
    pts(e) {
      // easing [x1, y1, x2, y2] → graph points P0..P3
      const X = (u) => MO.gx + u * MO.gw,
        Y = (v) => MO.gy + MO.gh - v * MO.gh;
      return [
        [X(0), Y(0)],
        [X(e[0]), Y(e[1])],
        [X(e[2]), Y(e[3])],
        [X(1), Y(1)],
      ];
    }
    paint() {
      const t = this.t,
        live = this.state === 'play' || this.state === 'done',
        D = this.drawn,
        n = FD_EASE.length;
      const lt = live ? Math.max(0, t - MO.intro) : 0,
        i = Math.floor(lt / MO.P),
        tau = lt - i * MO.P;
      const A = FD_EASE[(i - 1 + n) % n].slice(1),
        B = FD_EASE[i % n].slice(1);
      const m = i === 0 ? 1 : E_INOUT(span(tau, 0, 0.6));
      const e = A.map((v, k) => lerp(v, B[k], m));
      const [p0, p1, p2, p3] = this.pts(e),
        f = (v) => v.map((q) => q.toFixed(1)).join(' ');
      const d = `M${f(p0)}C${f(p1)} ${f(p2)} ${f(p3)}`;
      this.curveO.setAttribute('d', d);
      this.curve.setAttribute('d', d);
      this.curve.setAttribute('data-tok', `${FD_EASE[i % n][0]}  (${B.join(', ')})`);
      this.h[0].setAttribute('d', `M${f(p0)}L${f(p1)}`);
      this.h[1].setAttribute('d', `M${f(p3)}L${f(p2)}`);
      [p1, p2].forEach((p, k) => {
        this.dots[k].setAttribute('cx', p[0].toFixed(1));
        this.dots[k].setAttribute('cy', p[1].toFixed(1));
      });
      [this.curveO, ...this.h, this.track].forEach((el, k) =>
        this.drawEl(el, clamp01(D * 1.5 - k * 0.12)),
      );
      this.dots.forEach((el) => this.drawEl(el, clamp01(D * 1.5 - 0.4)));
      this.drawEl(this.ball, clamp01(D * 1.5 - 0.5));
      const k = live ? E_OUT(span(t, 0, 0.7)) : 0;
      this.curve.style.strokeDashoffset = 1 - k;
      this.curveO.style.opacity = 1 - k;
      this.dots.forEach((el) => {
        el.style.fillOpacity = k;
        el.style.strokeOpacity = 1 - k;
      });
      this.h.forEach((el) => el.classList.toggle('on', k > 0.5));
      this.ball.style.fillOpacity = k;
      this.ball.style.strokeOpacity = 1 - k;
      const fn = bezier(...B),
        u = live && t > MO.intro ? span(tau, 0.7, 1.3) : 0,
        dir = 1;
      const xs = (v) => (dir > 0 ? lerp(MO.tx0, MO.tx1, v) : lerp(MO.tx1, MO.tx0, v));
      this.ball.setAttribute('cx', xs(fn(u)).toFixed(1));
      this.ball.style.opacity =
        LOW || !live || t <= MO.intro
          ? 1
          : (i > 0 ? span(tau, 0, 0.3) : 1) * (1 - span(tau, MO.P - 0.5, 0.4));
      const fade = 1 - span(tau, MO.P - 0.45, 0.4); // this run's marks fade before the next curve
      this.marks.forEach((mk, j) => {
        const uj = j / 10;
        mk.setAttribute('cx', xs(fn(uj)).toFixed(1));
        mk.style.opacity = u > 0 && u >= uj ? 0.9 * fade : 0;
      });
    }
  }
  const GR = { x0: 24, cw: 54, g: 24, y0: 28.5, h: 207, every: 2.4, intro: 1.8 };
  const GR_LAYOUTS = [
    // [first column, span, top, height] per block
    [
      [0, 8, 0, 40],
      [0, 5, 64, 63],
      [5, 3, 64, 63],
      [0, 2, 151, 56],
      [2, 2, 151, 56],
      [4, 4, 151, 56],
    ],
    [
      [0, 3, 0, 207],
      [3, 5, 0, 40],
      [3, 5, 64, 63],
      [3, 2, 151, 56],
      [5, 3, 151, 56],
      [5, 3, 151, 56],
    ],
    [
      [0, 4, 0, 91.5],
      [4, 4, 0, 91.5],
      [0, 3, 115.5, 91.5],
      [3, 3, 115.5, 91.5],
      [6, 2, 115.5, 91.5],
      [6, 2, 115.5, 91.5],
    ],
  ];
  class GridCard extends FoundationCard {
    get dur() {
      return GR.intro + GR.every + 1.2;
    } // one change of layout, then it rests; click to replay
    build() {
      const s = this.svg,
        id = 'fdg' + Math.random().toString(36).slice(2, 7),
        defs = sv('defs', {}, s);
      [
        ['p', 'fd-hatch-pink'],
        ['b', 'fd-hatch-blue'],
      ].forEach(([k, cls]) => {
        const p = sv(
          'pattern',
          {
            id: id + k,
            width: 6,
            height: 6,
            patternUnits: 'userSpaceOnUse',
            patternTransform: 'rotate(45)',
          },
          defs,
        );
        sv('rect', { width: 6, height: 6, class: cls + '-bg' }, p);
        sv('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: cls }, p);
      });
      const X = (c) => GR.x0 + c * (GR.cw + GR.g);
      this.margins = [
        [0, 0, FD_W, GR.y0],
        [0, GR.y0 + GR.h, FD_W, FD_H - GR.y0 - GR.h],
        [0, GR.y0, GR.x0, GR.h],
        [FD_W - GR.x0, GR.y0, GR.x0, GR.h],
      ].map(([x, y, w, h]) =>
        sv('rect', { x, y, width: w, height: h, fill: `url(#${id}p)`, class: 'fd-gfx' }, s),
      );
      this.gutters = [];
      for (let c = 0; c < 7; c++)
        this.gutters.push(
          sv(
            'rect',
            {
              x: X(c) + GR.cw,
              y: GR.y0,
              width: GR.g,
              height: GR.h,
              fill: `url(#${id}b)`,
              class: 'fd-gfx',
            },
            s,
          ),
        );
      this.cols = [];
      for (let c = 0; c < 8; c++)
        this.cols.push(
          sv(
            'rect',
            {
              x: X(c),
              y: GR.y0,
              width: GR.cw,
              height: GR.h,
              pathLength: 1,
              class: 'fd-o fd-gcol',
              'data-tok': `column ${c + 1} of 8  ·  54 wide`,
            },
            s,
          ),
        );
      this.labels = [
        [X(0) + GR.cw + GR.g / 2, GR.y0 - 8, 'gutter 24'],
        [GR.x0 / 2, GR.y0 + GR.h / 2 + 3, '24'],
      ].map(([x, y, txt]) => {
        const e = sv('text', { x, y, class: 'fd-gnum', 'text-anchor': 'middle' }, s);
        e.textContent = txt;
        return e;
      });
      this.blocks = GR_LAYOUTS[0].map(() => {
        const g = sv('g', { class: 'fd-gblock' }, s);
        return {
          g,
          r: sv('rect', { rx: 10, class: 'fd-gbox' }, g),
          l: sv('rect', { rx: 3, height: 6, class: 'fd-gline' }, g),
        };
      });
      this.X = X;
    }
    rectOf(L, b) {
      const [c, n, y, h] = GR_LAYOUTS[L][b];
      return [this.X(c), GR.y0 + y, n * GR.cw + (n - 1) * GR.g, h];
    }
    paint() {
      const t = this.t,
        live = this.state === 'play' || this.state === 'done',
        D = this.drawn;
      this.cols.forEach((c, i) => {
        this.drawEl(c, clamp01(D * 1.6 - i * 0.08));
        const f = live ? E_OUT(span(t, i * 0.06, 0.5)) : 0;
        c.style.fillOpacity = f;
        c.style.strokeOpacity = 1 - f;
        c.style.transform = f > 0 && f < 1 ? `scaleY(${(0.3 + 0.7 * f).toFixed(3)})` : '';
      });
      this.gutters.forEach((g, i) => {
        g.style.opacity = live ? E_OUT(span(t, 0.5 + i * 0.04, 0.4)) : 0;
      });
      this.margins.forEach((m) => {
        m.style.opacity = live ? E_OUT(span(t, 0.7, 0.5)) * 0.8 : 0;
      });
      this.labels.forEach((l) => {
        l.style.opacity = live ? E_OUT(span(t, 0.9, 0.4)) : 0;
      });
      const lt = live ? Math.max(0, t - GR.intro) : 0,
        step = Math.floor(lt / GR.every),
        tau = lt - step * GR.every,
        nL = GR_LAYOUTS.length;
      this.blocks.forEach((b, i) => {
        const from = this.rectOf((step - 1 + nL) % nL, i),
          to = this.rectOf(step % nL, i);
        const m = step === 0 ? 1 : E_INOUT(span(tau, i * 0.06, 0.8));
        const [x, y, w, h] = from.map((v, k) => lerp(v, to[k], m));
        b.r.setAttribute('x', x.toFixed(1));
        b.r.setAttribute('y', y.toFixed(1));
        b.r.setAttribute('width', w.toFixed(1));
        b.r.setAttribute('height', h.toFixed(1));
        b.l.setAttribute('x', (x + 10).toFixed(1));
        b.l.setAttribute('y', (y + 10).toFixed(1));
        b.l.setAttribute('width', Math.max(0, Math.min(w - 20, w * 0.55)).toFixed(1));
        const hide = (L) => i === 5 && L !== 0; // the sixth block only exists in the first layout
        const vis = (1 - m) * (hide((step - 1 + nL) % nL) ? 0 : 1) + m * (hide(step % nL) ? 0 : 1);
        const k = live ? E_OUT(span(t, 1.0 + i * 0.08, 0.5)) : 0;
        b.g.style.opacity = k * vis;
        b.g.style.transform = `translateY(${((1 - k) * -10).toFixed(1)}px)`;
      });
    }
  }
  const FD_CARDS = [];
  function initFoundation() {
    const KIND = { colour: ColourCard, type: TypeCard, motion: MotionCard, grid: GridCard };
    document
      .querySelectorAll('.foundation [data-fd]')
      .forEach((el) => FD_CARDS.push(new KIND[el.dataset.fd](el, el.dataset.fd)));
    if (!FD_CARDS.length) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          const c = FD_CARDS.find((k) => k.el === e.target);
          if (!c) return;
          c.ratio = e.isIntersecting ? e.intersectionRatio : 0;
          c.check();
          wake();
        }),
      { threshold: [0, 0.02, 0.25, 0.5, 0.75, 0.9, 0.95, 0.965, 0.98, 1] },
    );
    FD_CARDS.forEach((c) => {
      io.observe(c.el);
      c.svg.style.setProperty('--fd-sw', (FD_W / Math.max(1, c.el.offsetWidth)).toFixed(3));
    });
    addEventListener('resize', () =>
      FD_CARDS.forEach((c) =>
        c.svg.style.setProperty('--fd-sw', (FD_W / Math.max(1, c.el.offsetWidth)).toFixed(3)),
      ),
    );
  }
  ONBOOT.push(initFoundation);
  FRAME.push((dt) => FD_CARDS.forEach((c) => c.ratio > 0 && c.tick(Math.min(dt, 0.05))));
  ONLOW.push(() =>
    FD_CARDS.forEach((c) => {
      if (c.state !== 'blank') c.finish();
    }),
  );

  defineDefaults(homeMotionSettings);

  const animationCache = new Map();
  function animationData(name, theme) {
    const key = `${name}-${theme}`;
    if (!animationCache.has(key))
      animationCache.set(
        key,
        fetch(`/animations/marketing/${key}.json`)
          .then((response) => {
            if (!response.ok) throw new Error(`Unable to load ${key}`);
            return response.json();
          })
          .catch((error) => {
            animationCache.delete(key);
            throw error;
          }),
      );
    return animationCache.get(key);
  }
  let lottie;
  class CardLottie {
    constructor(box) {
      this.box = box;
      this.name = box.dataset.lottie;
      this.holder = box.querySelector('.lottie-box');
      this.card = box.closest('.pcard');
      this.btn = this.card.querySelector('.lt-replay');
      this.layers = (box.dataset.lottieSolids || '').split(/\s+/).filter(Boolean);
      this.anim = null;
      this.theme = '';
      this.state = 'wait';
      this.seen = false;
      this.f = 0;
      this.wrap = false;
      this.vis = trackVisible(box, {});
      box._stippleSolids = (c) => this.solids(c);
      whenSeen(
        box,
        () => {
          this.seen = true;
        },
        0.5,
      );
      this.card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) this.play();
      });
      this.load().catch(() => (this.card.dataset.animationState = 'fallback'));
    }
    async load() {
      const theme = isDark() ? 'dark' : 'light';
      if (this.theme === theme) return;
      this.theme = theme;
      const data = structuredClone(await animationData(this.name, theme));
      if (this.theme !== theme) return; // the theme changed again while decoding

      data.layers = data.layers.filter((l) => l.nm !== 'panel');
      if (this.anim) this.anim.destroy();
      this.anim = lottie.loadAnimation({
        container: this.holder,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: data,
        rendererSettings: {
          preserveAspectRatio: (this.box.dataset.lottieAlign || 'xMidYMid') + ' slice',
          progressiveLoad: false,
        },
      });
      this.fps = data.fr;
      this.frames = data.op - data.ip;
      const mk = (n, d) => {
        const m = (data.markers || []).find((x) => x.cm === n);
        return m ? m.tm : d;
      };
      this.final = mk('final', this.frames - 1);
      this.reset = mk('reset', this.final);
      this.draw();
      const ready = () => {
        if (this.theme !== theme) return;
        this.card.dataset.animationTheme = theme;
        this.box.classList.add('animation-loaded');
        this.draw();
        wake();
      };
      if (this.anim.isLoaded) ready();
      else this.anim.addEventListener('DOMLoaded', ready);
    }

    draw() {
      if (this.anim)
        this.anim.goToAndStop(
          LOW || this.state === 'done' ? this.final : this.state === 'wait' ? 0 : this.f,
          true,
        );
    }
    done(on) {
      this.card.classList.toggle('lt-done', on);
      this.card.dataset.animationState = on ? 'done' : this.state;
      this.btn.hidden = !on;
    }
    play() {
      if (LOW || this.state === 'play' || !this.anim) return;
      this.wrap = this.state === 'done';
      this.f = this.wrap ? this.reset : 0; // from the end: tidy away first
      this.state = 'play';
      this.done(false);
      this.card.dataset.animationState = 'playing';
      wake();
    }
    tick(dt) {
      if (!this.anim || LOW) return;
      if (this.state === 'wait') {
        if (this.seen) this.play();
        else return;
      }
      if (this.state !== 'play' || !this.vis.visible) return;
      this.f += dt * this.fps;
      if (this.wrap) {
        if (this.f >= this.frames) {
          this.f -= this.frames;
          this.wrap = false;
        }
      } else if (this.f >= this.final) {
        this.f = this.final;
        this.state = 'done';
        this.done(true);
      }
      this.draw();
    }
    solids(c) {
      const out = [];
      for (const k of this.layers) {
        const g = this.holder.querySelector('g.' + k);
        if (!g) continue;
        const r = g.getBoundingClientRect();
        if (r.width < 2 || r.right < c.left || r.left > c.right || r.top > c.bottom) continue;
        out.push({
          x0: r.left - c.left,
          y0: r.top - c.top,
          x1: r.right - c.left,
          y1: r.bottom - c.top,
          rad: Math.min(16, r.height / 2),
        });
      }
      return out;
    }
  }

  const CARD_LOTTIES = [];
  function initCardLotties() {
    import('lottie-web/build/player/lottie_light')
      .then((module) => {
        lottie = module.default;
        document
          .querySelectorAll('[data-lottie]')
          .forEach((box) => CARD_LOTTIES.push(new CardLottie(box)));
        wake();
      })
      .catch(() => {
        /* The supplied stills remain usable if the player cannot load. */
      });
  }
  ONBOOT.push(initCardLotties);
  ONTHEME.push(() =>
    CARD_LOTTIES.forEach((card) =>
      card.load().catch(() => {
        /* Keep the current frame if fetching fails. */
      }),
    ),
  );
  ONLOW.push(() =>
    CARD_LOTTIES.forEach((card) => {
      if (card.state === 'play') {
        card.state = 'done';
        card.done(true);
      }
      card.draw();
    }),
  );
  FRAME.push((dt) => CARD_LOTTIES.forEach((card) => card.tick(dt)));
  ONBOOT.push(() => {
    const row = document.querySelector('.explore');
    new IntersectionObserver(([entry]) => {
      row.toggleAttribute('data-x-visible', entry.isIntersecting);
      row.toggleAttribute('data-x-run', entry.isIntersecting && !LOW);
    }).observe(row);
    const track = document.querySelector('.lg-track');
    [...track.children].forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    const logos = document.querySelector('.lg-window');
    new IntersectionObserver(([entry]) =>
      logos.toggleAttribute('data-running', entry.isIntersecting && !document.hidden),
    ).observe(logos);
  });
  let raf = 0,
    last = 0;
  function active() {
    return (
      !LOW &&
      (!intro.done ||
        REVEAL.active ||
        stippleFields.some((field) => field.visible) ||
        FD_CARDS.some(
          (card) => card.ratio > 0 && (card.loops || card.drawing || card.state === 'play'),
        ) ||
        CARD_LOTTIES.some((card) => card.vis.visible && card.state === 'play'))
    );
  }
  function tick(time) {
    raf = 0;
    if (document.hidden) return;
    const dt = last ? clamp((time - last) / 1000, 1 / 240, 1 / 30) : 1 / 60;
    last = time;
    updateReveal(time);
    FRAME.forEach((frame) => frame(dt, time));
    if (active()) raf = requestAnimationFrame(tick);
  }
  function wake() {
    if (!raf && !document.hidden) {
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  }
  function theme() {
    THEME.stippleRest = getComputedStyle(home).getPropertyValue('--stipple-dot').trim();
    ONTHEME.forEach((apply) => apply());
    wake();
  }
  html.classList.add('home-motion');
  for (const boot of ONBOOT) boot();
  initReveals();
  initCtas();
  theme();
  playIntro();
  html.dataset.homeReady = 'true';
  window.addEventListener('veli:color-scheme-change', theme);
  window.addEventListener('veli:motion-change', (event) => {
    LOW = event.detail.reduced;
    if (LOW) finishAllMotion();
    else
      document.querySelectorAll('[data-reveal]').forEach((group) => {
        if (inView(group)) revealGroup(group);
      });
    document
      .querySelectorAll('.explore')
      .forEach((row) =>
        row.toggleAttribute('data-x-run', row.hasAttribute('data-x-visible') && !LOW),
      );
    wake();
  });
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake);
  document.fonts?.ready.then(wake);
  document.addEventListener('visibilitychange', () => {
    document.querySelector('.lg-window')?.toggleAttribute('data-page-visible', !document.hidden);
    const explore = document.querySelector('.explore');
    explore?.toggleAttribute(
      'data-x-run',
      !document.hidden && explore.hasAttribute('data-x-visible') && !LOW,
    );
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else wake();
  });
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    raf = 0;
  });
  window.addEventListener('pageshow', wake);
  wake();
}
