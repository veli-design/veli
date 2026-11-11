import INFO from '../lib/design-preview.json';
import { bez, C, SAND, DOTS, prepareCurve } from './design-preview-curve.js';

// Original preview layers/timings, mounted inside the existing Figma layout.
export async function initDesignPreviews(initialSeed = 7) {
  const svg = document.querySelector('.design-page');
  if (!svg) return;
  const reduced = () => document.documentElement.dataset.reducedMotion === 'true';
  const mounts = [...svg.querySelectorAll('[data-design-animation]')];
  let simulation;
  try {
    await Promise.all([
      ...mounts.map(async (mount) => {
        const response = await fetch(`/animations/design/${mount.dataset.designAnimation}.svg`);
        if (!response.ok) throw new Error('Preview artwork unavailable');
        const parsed = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
        if (parsed.documentElement.localName !== 'svg') throw new Error('Invalid preview artwork');
        mount.append(document.importNode(parsed.documentElement, true));
      }),
      fetch('/animations/design/curve-particles.bin').then(async (response) => {
        if (!response.ok) throw new Error('Preview simulation unavailable');
        simulation = await response.arrayBuffer();
      }),
    ]);
  } catch {
    return;
  } // The supplied Figma stills remain available.
  const curveSimulation = {
    n: Math.round(SAND.T * DOTS.fps),
    m: INFO.sand.curveDots.length,
    d: new Float32Array(simulation),
  };
  if (curveSimulation.d.length !== curveSimulation.n * curveSimulation.m * 2) return;
  function svgPoint(element, event) {
    const matrix = element?.getScreenCTM();
    return matrix
      ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
      : null;
  }
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (k) => svg.querySelector(`[data-a="${k}"]`);
  const TAU = Math.PI * 2;
  const lerp = (a, b, p) => a + (b - a) * p;
  const centre = (b) => [b[0] + b[2] / 2, b[1] + b[3] / 2];
  const scaleAbout = (cx, cy, s) => `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`;
  let seed = initialSeed;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ---- curves (motion grammar) ----
  const seg = (t, t0, d, c) => c((t - t0) / d);

  const scenes = [];
  const add = (card, render) => scenes.push({ card, render });

  // =============================================================================================
  // Shaped by patient forces · only the background dots move. Each card answers the pointer with
  // its own force: Reef = light (grains lean toward it and glow), Ocean = water (the pointer drops
  // ripples that roll through the grains), Wind = wind (a stroke blows a gust of streaking grains
  // downstream). Underneath, every card keeps its slow ambient sand drift.
  // =============================================================================================
  const FORCES = {
    T: 16, // s, the ambient field's loop
    amp: 2.2, // pt, how far a grain is carried by the ambient field
    jitter: 0.6, // pt, each grain's own tremble
    shimmer: 0.25, // opacity dip as a grain turns away from the light
    flow: { reef: [0.6, 90], ocean: [0, 70], wind: [-0.35, 110] }, // ambient direction (rad), ripple width (pt)
    light: {
      // Reef — a lamp over the reef
      reach: 130, // pt, the pool of light
      lean: 11, // pt, how far grains at the edge of the pool lean toward the light
      grow: 0.85, // grains at the centre of the light grow by this much (×1.85)
      follow: 7, // 1/s, how quickly the light follows the pointer and fades
    },
    water: {
      // Ocean — ripples
      every: 46, // pt of pointer travel between drops
      speed: 240, // pt/s, ring speed
      width: 20, // pt, ring thickness
      amp: 7, // pt, how far a ring rolls a grain
      life: 1.7, // s
      splash: 2.2, // a click drops a ripple this many times bigger
      max: 14, // rings alive at once
    },
    wind: {
      // Wind — a stroke releases puffs of moving air that travel on downstream
      every: 20, // pt of pointer travel between puffs
      carry: 0.95, // puff speed = pointer speed × this (capped by `topSpeed`)
      topSpeed: 1000, // pt/s
      grainSpeed: 480, // pt/s, the fastest a grain of sand travels
      radius: 34, // pt, a puff's size as it leaves the pointer…
      grow: 55, // pt/s …and how fast it spreads as it travels
      slow: 1.3, // 1/s, how quickly the air loses speed
      life: 1.05, // s, how long a puff lasts
      drag: 4.5, // 1/s, how hard the air pulls grains to its own speed
      flutter: 0.3, // sideways flutter, as a share of the air speed
      settle: 2.6, // s, the slow drift back once the gust has passed
      damping: 0.85, // of critical — a little sway on the way back
      streak: 1.8, // a grain at full speed stretches to (1 + this)× along its flight
      maxShift: 80, // pt
      max: 28, // puffs alive at once
    },
  };
  // shared pointer, in page (SVG) coordinates, with its velocity
  const PTR = { x: 0, y: 0, vx: 0, vy: 0, on: false, t: 0, clicks: [] };
  {
    const toSvg = (e) => {
      const card = e.target instanceof Element ? e.target.closest('.design-force-card') : null;
      return card ? svgPoint(card.querySelector('[data-design-svg]'), e) : null;
    };
    svg.addEventListener('pointermove', (e) => {
      const p = toSvg(e);
      if (!p) {
        PTR.on = false;
        PTR.vx = PTR.vy = 0;
        return;
      }
      const now = performance.now() / 1000,
        dt = Math.max(0.008, now - PTR.t);
      if (PTR.on) {
        PTR.vx = lerp(PTR.vx, (p.x - PTR.x) / dt, 0.5);
        PTR.vy = lerp(PTR.vy, (p.y - PTR.y) / dt, 0.5);
      }
      PTR.x = p.x;
      PTR.y = p.y;
      PTR.t = now;
      PTR.on = true;
    });
    svg.addEventListener('pointerdown', (e) => {
      const p = toSvg(e);
      if (!p) return;
      PTR.clicks.push({ x: p.x, y: p.y, t: performance.now() / 1000 });
      if (PTR.clicks.length > 8) PTR.clicks.shift();
    });
    svg.addEventListener('pointerleave', () => {
      PTR.on = false;
      PTR.vx = PTR.vy = 0;
    });
  }
  const releaseForcePointer = () => {
    PTR.on = false;
    PTR.vx = PTR.vy = 0;
  };
  svg.addEventListener('pointercancel', releaseForcePointer);
  svg.addEventListener('pointerup', (event) => {
    if (event.pointerType !== 'mouse') releaseForcePointer();
  });
  (function () {
    const I = INFO.forces;
    I.cards.forEach((c, ci) => {
      const [dir, len] = FORCES.flow[c.name];
      const ux = Math.cos(dir),
        uy = Math.sin(dir);
      seed = 101 + ci * 31;
      const els = [...svg.querySelectorAll(`[data-f^="${ci}:"]`)];
      const g = els.map((el) => {
        const [x, y] = c.dots[+el.getAttribute('data-f').split(':')[1]];
        return {
          el,
          x,
          y,
          ph: rnd() * TAU,
          f: 1 + Math.floor(rnd() * 3),
          q: rnd() * TAU,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
          s: 0,
          w: 0.7 + rnd() * 0.6,
        };
      });
      const cardEl = els[0].closest('.design-force-card'),
        box = c.clip;
      const isOver = () =>
        PTR.on &&
        PTR.x > box[0] &&
        PTR.x < box[0] + box[2] &&
        PTR.y > box[1] &&
        PTR.y < box[1] + box[3];
      let last = performance.now() / 1000;

      // ---- per-card force: returns true while anything is still moving ----
      let force;
      if (c.name === 'reef') {
        const L = FORCES.light;
        let lx = 0,
          ly = 0,
          li = 0; // the light: position and intensity
        force = (dt, over) => {
          const k = 1 - Math.exp(-L.follow * dt);
          if (over) {
            if (li < 0.01) {
              lx = PTR.x;
              ly = PTR.y;
            }
            lx += (PTR.x - lx) * k;
            ly += (PTR.y - ly) * k;
          }
          li += ((over ? 1 : 0) - li) * k;
          if (li < 0.002) {
            li = 0;
            for (const d of g) {
              d.ox = d.oy = d.s = 0;
            }
            return false;
          }
          for (const d of g) {
            const rx = lx - d.x,
              ry = ly - d.y,
              r = Math.hypot(rx, ry) || 1,
              f = Math.max(0, 1 - r / L.reach),
              fall = f * f * (3 - 2 * f);
            // lean toward the light, most at mid-distance (the centre is already lit)
            const lean =
              L.lean *
              li *
              d.w *
              Math.sin(Math.PI * Math.min(1, r / L.reach)) *
              (r < L.reach ? 1 : 0);
            const tx = (rx / r) * lean,
              ty = (ry / r) * lean,
              ts = L.grow * fall * li;
            d.ox += (tx - d.ox) * k;
            d.oy += (ty - d.oy) * k;
            d.s += (ts - d.s) * k;
          }
          return true;
        };
      } else if (c.name === 'ocean') {
        const W = FORCES.water,
          rings = [];
        let lastDrop = null;
        force = (_dt, over, now) => {
          if (over) {
            if (!lastDrop || Math.hypot(PTR.x - lastDrop[0], PTR.y - lastDrop[1]) > W.every) {
              rings.push({ x: PTR.x, y: PTR.y, t: now, a: 1 });
              lastDrop = [PTR.x, PTR.y];
            }
          } else lastDrop = null;
          while (PTR.clicks.length) {
            const cl = PTR.clicks.shift();
            if (cl.x > box[0] && cl.x < box[0] + box[2] && cl.y > box[1] && cl.y < box[1] + box[3])
              rings.push({ x: cl.x, y: cl.y, t: now, a: W.splash });
          }
          while (rings.length > W.max) rings.shift();
          for (let i = rings.length - 1; i >= 0; i--)
            if (now - rings[i].t > W.life * Math.sqrt(rings[i].a)) rings.splice(i, 1);
          if (!rings.length) {
            for (const d of g) {
              d.ox = d.oy = d.s = 0;
            }
            return false;
          }
          for (const d of g) {
            let ox = 0,
              oy = 0,
              s = 0;
            for (const R of rings) {
              const age = now - R.t,
                front = W.speed * age,
                rx = d.x - R.x,
                ry = d.y - R.y,
                r = Math.hypot(rx, ry) || 1;
              const u = (r - front) / (W.width * Math.sqrt(R.a));
              if (u < -2.5 || u > 2.5) continue;
              // a travelling crest: grains roll out on the leading edge and back on the trailing one
              const fade = Math.max(0, 1 - age / (W.life * Math.sqrt(R.a))),
                wave = -u * Math.exp(-u * u) * 1.65 * W.amp * R.a * fade * fade;
              ox += (rx / r) * wave;
              oy += (ry / r) * wave;
              s += 0.5 * Math.exp(-u * u) * fade * Math.min(1, R.a);
            }
            d.ox = ox;
            d.oy = oy;
            d.s = s;
          }
          return true;
        };
      } else {
        const W = FORCES.wind,
          om = TAU / W.settle,
          ks = om * om,
          cd = 2 * W.damping * om;
        const puffs = [];
        let lastPuff = null,
          svx = 0,
          svy = 0,
          active = false;
        force = (dt, over, now) => {
          // the pointer's velocity, smoothed so a jittery hand still makes a steady gust
          const ks2 = 1 - Math.exp(-14 * dt);
          svx += (PTR.vx - svx) * ks2;
          svy += (PTR.vy - svy) * ks2;
          if (over && now - PTR.t < 0.1) {
            if (!lastPuff) lastPuff = [PTR.x, PTR.y];
            // release puffs along the stroke (interpolated, so a fast stroke leaves no gaps)
            let gap = Math.hypot(PTR.x - lastPuff[0], PTR.y - lastPuff[1]);
            const sp = Math.min(W.topSpeed, Math.hypot(svx, svy) * W.carry);
            if (sp > 40)
              while (gap >= W.every) {
                const u = W.every / gap;
                lastPuff = [lerp(lastPuff[0], PTR.x, u), lerp(lastPuff[1], PTR.y, u)];
                const s = sp / (Math.hypot(svx, svy) || 1);
                puffs.push({
                  x: lastPuff[0],
                  y: lastPuff[1],
                  vx: svx * s,
                  vy: svy * s,
                  r: W.radius,
                  t: now,
                });
                gap -= W.every;
              }
          } else lastPuff = null;
          while (puffs.length > W.max) puffs.shift();
          // the air moves on downstream, slows, spreads and fades
          const slow = Math.exp(-W.slow * dt);
          for (let i = puffs.length - 1; i >= 0; i--) {
            const P = puffs[i];
            P.x += P.vx * dt;
            P.y += P.vy * dt;
            P.vx *= slow;
            P.vy *= slow;
            P.r += W.grow * dt;
            P.a = Math.max(0, 1 - (now - P.t) / W.life);
            P.a *= P.a;
            if (P.a <= 0) puffs.splice(i, 1);
          }
          if (puffs.length) active = true;
          if (!active) return false;
          let moving = false;
          for (const d of g) {
            // the air at this grain
            let wx = 0,
              wy = 0;
            const gx = d.x + d.ox,
              gy = d.y + d.oy;
            for (const P of puffs) {
              const rx = gx - P.x,
                ry = gy - P.y,
                q = (rx * rx + ry * ry) / (P.r * P.r);
              if (q > 4) continue;
              const f = Math.exp(-q) * P.a;
              wx += P.vx * f;
              wy += P.vy * f;
            }
            let ax = -ks * d.ox - cd * d.vx,
              ay = -ks * d.oy - cd * d.vy;
            // past ~55 % of maxShift the air loses its grip on a grain, reaching none at maxShift (soft limit)
            const m0 = Math.hypot(d.ox, d.oy),
              soft = W.maxShift * 0.55;
            const grip = m0 <= soft ? 1 : Math.max(0, 1 - (m0 - soft) / (W.maxShift - soft));
            const ws = Math.hypot(wx, wy);
            if (ws > 1) {
              // carried by the air (its pull fades with grip), with a slow flutter across it;
              // the drag toward the air's speed always applies, so nothing flies on unchecked
              const fl = Math.sin(now * 3.2 + d.q * 2) * W.flutter,
                dg = W.drag * d.w,
                gp = grip * grip;
              ax += dg * (gp * (wx - fl * wy) - d.vx);
              ay += dg * (gp * (wy + fl * wx) - d.vy);
            }
            if (m0 > W.maxShift) {
              ax -= (d.ox / m0) * ks * 3 * (m0 - W.maxShift);
              ay -= (d.oy / m0) * ks * 3 * (m0 - W.maxShift);
            }
            d.vx += ax * dt;
            d.vy += ay * dt;
            d.ox += d.vx * dt;
            d.oy += d.vy * dt;
            const vv = Math.hypot(d.vx, d.vy);
            if (vv > W.grainSpeed) {
              const s = W.grainSpeed / vv;
              d.vx *= s;
              d.vy *= s;
            }
            const m = Math.hypot(d.ox, d.oy);
            if (m > 0.05 || Math.abs(d.vx) + Math.abs(d.vy) > 0.5) moving = true;
            else {
              d.ox = d.oy = d.vx = d.vy = 0;
            }
          }
          if (!puffs.length && !moving) active = false;
          return true;
        };
      }

      add(cardEl, (t) => {
        const p = (t % FORCES.T) / FORCES.T;
        const now = performance.now() / 1000,
          dt = Math.min(0.033, now - last);
        last = now;
        if (PTR.on && now - PTR.t > 0.08) {
          PTR.vx *= 0.8;
          PTR.vy *= 0.8;
        } // pointer resting: no speed
        const live = force(dt, isOver(), now);
        const wind = c.name === 'wind';
        for (const d of g) {
          // ambient: two crossing ripples travel along the card's flow
          const along = d.x * ux + d.y * uy,
            across = -d.x * uy + d.y * ux;
          const w1 = Math.sin(TAU * (along / len - p * 2) + d.ph * 0.15),
            w2 = Math.sin(TAU * (across / (len * 1.7) + p) + 1.3);
          const ax =
            ux * FORCES.amp * w1 -
            uy * FORCES.amp * 0.5 * w2 +
            FORCES.jitter * Math.cos(TAU * p * d.f * 2 + d.q);
          const ay =
            uy * FORCES.amp * w1 +
            ux * FORCES.amp * 0.5 * w2 +
            FORCES.jitter * Math.sin(TAU * p * d.f * 3 + d.q);
          let tr = `translate(${(ax + d.ox).toFixed(2)} ${(ay + d.oy).toFixed(2)})`;
          let op = 1 - FORCES.shimmer * (0.5 + 0.5 * Math.sin(TAU * (along / len - p * 2) + d.q));
          if (live) {
            if (wind) {
              // a grain in flight stretches into a streak along its velocity — growing smoothly with speed
              const v = Math.hypot(d.vx, d.vy);
              if (v > 3) {
                const a = (Math.atan2(d.vy, d.vx) * 180) / Math.PI,
                  st = 1 + FORCES.wind.streak * (1 - Math.exp(-v / 320));
                tr += ` translate(${d.x} ${d.y}) rotate(${a.toFixed(1)}) scale(${st.toFixed(3)} ${(1 / Math.sqrt(st)).toFixed(3)}) rotate(${(-a).toFixed(1)}) translate(${-d.x} ${-d.y})`;
                op = Math.min(1, op + (0.3 * (st - 1)) / FORCES.wind.streak);
              }
            } else if (d.s > 0.01) {
              tr += ' ' + scaleAbout(d.x, d.y, 1 + d.s);
              op = Math.min(1, op + d.s);
            }
          }
          d.el.setAttribute('transform', tr);
          d.el.setAttribute('opacity', op.toFixed(2));
        }
      });
    });
  })();

  // =============================================================================================
  // From sand to atoll · scroll-driven.
  //  · the white circles and labels never change
  //  · the dotted orbits turn with the scroll (gently, neighbours in opposite directions)
  //  · Veli's icon is always moving: its sand particles turn and breathe
  //  · Coral, Reef, Islands and Atolls are static, exactly as designed
  // =============================================================================================
  const ATOLL = {
    turn: 20, // °, orbit rotation per screen of scroll (low)
    follow: 6, // 1/s, how closely the rotation follows the scroll (lower = more glide)
    rings: {
      ring1: [1, 1],
      ring2: [-1, 1.2],
      ring3: [-1, 0.9],
      ring4: [1, 0.8],
      ring5: [-1, 0.65],
      ring6: [1, 0.7],
      ring7: [-1, 0.6],
      ring8: [1, 0.6],
      ring9: [-1, 0.85],
    },
    // Veli's particles: outer ring turns, inner ring counter-turns, both breathe
    veli: { outerSpeed: 14, innerSpeed: -24, breath: 2.8, outerBreath: 0.07, innerBreath: 0.12 },
  };
  (function () {
    const I = INFO.atoll,
      A = ATOLL;
    const card = svg.querySelector('.design-atoll');
    const rings = Object.entries(A.rings).map(([k, [dir, share]]) => {
      const r = I[k];
      if (r.grad) {
        const g = document.getElementById(r.grad);
        if (g) g.removeAttribute('gradientTransform');
      }
      return { el: $('atoll:' + k), cx: r.cx, cy: r.cy, deg: dir * share * A.turn };
    });
    const vc = centre(I.node0.bbox);
    const vo = $('atoll:veliOuter'),
      vi = $('atoll:veliInner');
    let su = null,
      last = performance.now() / 1000;
    add(card, (t) => {
      const now = performance.now() / 1000,
        dt = Math.min(0.05, now - last);
      last = now;
      const b = card.getBoundingClientRect(),
        vh = innerHeight,
        k = 1 - Math.exp(-A.follow * dt);
      // orbits: signed distance of the card's centre from the screen's centre, in screens
      const sTarget = Math.max(-1.5, Math.min(1.5, (b.top + b.height / 2 - vh / 2) / vh));
      su = su === null ? sTarget : su + (sTarget - su) * k;
      for (const r of rings)
        r.el.setAttribute('transform', `rotate(${(r.deg * su).toFixed(3)} ${r.cx} ${r.cy})`);
      // Veli: always there, its particles always moving
      const V = A.veli,
        br = Math.sin((TAU * t) / V.breath);
      vo.setAttribute(
        'transform',
        scaleAbout(vc[0], vc[1], 1 + V.outerBreath * br) +
          ` rotate(${(V.outerSpeed * t) % 360} ${vc[0]} ${vc[1]})`,
      );
      vi.setAttribute(
        'transform',
        scaleAbout(vc[0], vc[1], 1 - V.innerBreath * br) +
          ` rotate(${(V.innerSpeed * t) % 360} ${vc[0]} ${vc[1]})`,
      );
    });
  })();

  // =============================================================================================
  // Crystalline Sand · light breathes; a wave runs through the texture; the motion curve eases
  // itself from a straight line while it shoves the loose particles it touches
  // =============================================================================================
  (function () {
    const I = INFO.sand,
      T = SAND.T;
    const glows = [0, 1, 2, 3].map((i) => ({
      el: $('sand:glow' + i),
      c: centre(I['glow' + i].bbox),
    }));
    const gEls = [...svg.querySelectorAll('[data-g]')];
    const gx0 = Math.min(...I.grains.map((g) => g[0]));
    seed = 977;
    const grains = gEls.map((el) => ({
      el,
      x: I.grains[+el.getAttribute('data-g')][0] - gx0,
      amp: 0.6 + rnd() * 0.8,
      lag: (rnd() - 0.5) * 1.2,
      wr: 1 + rnd() * 2,
      f1: 1 + Math.floor(rnd() * 3),
      f2: 1 + Math.floor(rnd() * 3),
      p1: rnd() * TAU,
      p2: rnd() * TAU,
    }));

    // curve: the design's outline (6 cubic segments a side) → its exact centre line, redrawn live
    const { centreLine, width, P0, P3, bendAt } = prepareCurve(I);
    const fillEl = $('sand:curveFill'),
      strokeEl = $('sand:curveStroke');
    const live = document.createElementNS(NS, 'path');
    live.setAttribute('stroke', fillEl.getAttribute('fill') || '#F2F2F2');
    live.setAttribute('stroke-width', (width + 2 * 1).toFixed(2)); // outline + its 1 pt outside stroke each side
    live.setAttribute('stroke-linecap', 'round');
    live.setAttribute('fill', 'none');
    fillEl.parentNode.insertBefore(live, fillEl);
    fillEl.setAttribute('display', 'none');
    strokeEl.setAttribute('display', 'none');
    const cEls = [...svg.querySelectorAll('[data-c]')];
    const sim = curveSimulation;
    const hA = { els: [$('sand:lineA'), $('sand:hdlA')], c: P3 },
      hB = { els: [$('sand:lineB'), $('sand:hdlB')], c: P0 };

    add(svg.querySelector('.design-crystalline'), (time) => {
      const t = time % T,
        p = t / T;
      const ph = TAU * p * SAND.breaths;
      glows.forEach((g, i) => {
        let tr = scaleAbout(g.c[0], g.c[1], 1 + SAND.glowAmp[i] * Math.sin(ph - i * SAND.glowLag));
        if (i === 3) {
          const w = Math.sin(ph - 3 * SAND.glowLag);
          tr = `translate(0 ${(-SAND.coreRise * w).toFixed(2)}) ` + tr;
          g.el.setAttribute('opacity', (1 - (SAND.coreDim * (1 - w)) / 2).toFixed(3));
        }
        g.el.setAttribute('transform', tr);
      });
      const wp = TAU * p * SAND.waves;
      for (const g of grains) {
        const w = Math.sin(wp - (TAU * g.x) / SAND.waveLen + g.lag);
        const jx = g.wr * Math.sin(TAU * p * g.f1 + g.p1),
          jy = g.wr * Math.sin(TAU * p * g.f2 + g.p2);
        g.el.setAttribute(
          'transform',
          `translate(${jx.toFixed(2)} ${(jy - SAND.waveAmp * g.amp * w).toFixed(2)})`,
        );
        g.el.setAttribute('opacity', (1 - (SAND.waveLift * (1 - w)) / 2).toFixed(3));
      }
      const k = bendAt(t),
        lin = 1 - k;
      const pts = centreLine.map((c) => `${c.x.toFixed(2)} ${(c.y + c.off * lin).toFixed(2)}`);
      let d = 'M' + pts[0];
      for (let i = 1; i < pts.length; i += 3)
        d += 'C' + pts[i] + ' ' + pts[i + 1] + ' ' + pts[i + 2];
      live.setAttribute('d', d);
      const a = SAND.lean * lin;
      for (const h of [hA, hB])
        for (const el of h.els)
          el.setAttribute('transform', a ? `rotate(${a.toFixed(3)} ${h.c[0]} ${h.c[1]})` : '');
      const f = (t / T) * sim.n,
        f0 = Math.floor(f) % sim.n,
        f1 = (f0 + 1) % sim.n,
        fr = f - Math.floor(f);
      cEls.forEach((el, i) => {
        const A = (f0 * sim.m + i) * 2,
          B = (f1 * sim.m + i) * 2;
        el.setAttribute(
          'transform',
          `translate(${(sim.d[A] + (sim.d[B] - sim.d[A]) * fr).toFixed(2)} ${(sim.d[A + 1] + (sim.d[B + 1] - sim.d[A + 1]) * fr).toFixed(2)})`,
        );
      });
    });
  })();

  // loose particles shoved by the moving line; simulated once, stored per frame (seamless loop)

  // =============================================================================================
  // Movement with purpose · Guide → Connect → Respond, then it all returns
  // =============================================================================================
  const MOVE = {
    T: 7,
    // Guide: the pill drifts out with a soft start and a long settle; the trail lags further behind
    guide: { start: 0.3, travel: 1.5, lag: 0.14, back: 5.5, backTravel: 1.2, backLag: 0.06 },
    drift: bez(0.3, 0, 0.1, 1), // soft start, long glide into place
    drift_back: bez(0.45, 0, 0.2, 1), // gentle return
    // Connect: the outline draws, then fills, then the next steps settle in one by one
    connect: {
      draw: [1.3, 0.7],
      fill: [2.0, 0.45],
      step: 2.5,
      stepGap: 0.26,
      stepIn: 0.55,
      clear: 5.7,
      color: '#A3FFE6',
    },
  };
  const RIPPLE = {
    press: 3.0,
    travel: 0.9,
    stagger: 0.16,
    echoes: [4.25, 4.95],
    echoLife: 1.5,
    echoTo: 1.2,
    echoPeak: 0.6,
    fade: [5.8, 0.6],
    spread: 0.14,
  };
  (function () {
    const I = INFO.move,
      T = MOVE.T;
    const pills = [0, 1, 2, 3].map((i) => ({ el: $('move:p' + i), off: -48 * i }));
    // Connect: the outlined step draws itself, then the next two steps settle in
    const c0 = $('move:c0'),
      c0r = +c0.getAttribute('r'),
      circ = TAU * c0r;
    c0.setAttribute('stroke-dasharray', `${circ} ${circ}`);
    c0.setAttribute('transform', `rotate(-90 ${c0.getAttribute('cx')} ${c0.getAttribute('cy')})`);
    const steps = [1, 2].map((i) => ({ el: $('move:c' + i), c: centre(I['c' + i].bbox) }));
    const blue = { el: $('move:blue'), c: centre(I.blue.bbox) };
    const rings = ['r1', 'r2', 'r3'].map((k, i) => {
      const r = I[k],
        stepPx = (r.r * r.step * Math.PI) / 180,
        n = Math.max(1, Math.round((10 * T) / stepPx));
      return {
        el: $('move:' + k),
        grad: r.grad && document.getElementById(r.grad),
        cx: r.cx,
        cy: r.cy,
        r: r.r,
        deg: (i % 2 ? -1 : 1) * n * r.step,
      };
    });
    const outer = rings[2];
    const echoes = RIPPLE.echoes.map(() => {
      const el = outer.el.cloneNode(true);
      el.removeAttribute('data-a');
      rings[0].el.parentNode.insertBefore(el, rings[0].el);
      return el;
    });
    const dotR = I.blue.bbox[2] / 2;
    add(svg.querySelector('.design-motion-demo'), (time) => {
      const t = time % T,
        p = t / T;
      const G = MOVE.guide;
      pills.forEach((pl, i) => {
        const lag = (3 - i) * G.lag,
          backLag = (3 - i) * G.backLag;
        let k; // 1 = collapsed at the first slot, 0 = rest
        if (t < G.start + lag) k = 1;
        else if (t < G.back) k = 1 - seg(t, G.start + lag, G.travel, MOVE.drift);
        else k = t < G.back + backLag ? 0 : seg(t, G.back + backLag, G.backTravel, MOVE.drift_back);
        pl.el.setAttribute('transform', `translate(${(pl.off * k).toFixed(2)} 0)`);
      });
      const CN = MOVE.connect;
      const draw =
        t < CN.draw[0]
          ? 0
          : t < CN.clear
            ? seg(t, CN.draw[0], CN.draw[1], C.move)
            : 1 - seg(t, CN.clear + 0.15, 0.5, C.exit);
      c0.setAttribute('stroke-dashoffset', (circ * (1 - draw)).toFixed(2));
      // the drawn outline fills in before the next step arrives
      const fill =
        t < CN.fill[0]
          ? 0
          : t < CN.clear
            ? seg(t, CN.fill[0], CN.fill[1], C.settle)
            : 1 - seg(t, CN.clear, 0.3, C.exit);
      c0.setAttribute('fill', CN.color);
      c0.setAttribute('fill-opacity', fill.toFixed(3));
      steps.forEach((d, i) => {
        const at = CN.step + i * CN.stepGap;
        const k =
          t < CN.clear
            ? t < at
              ? 0
              : seg(t, at, CN.stepIn, C.settle)
            : 1 - seg(t, CN.clear + (1 - i) * 0.1, 0.28, C.exit);
        d.el.setAttribute('transform', scaleAbout(d.c[0], d.c[1], lerp(0.55, 1, k)));
        d.el.setAttribute('opacity', Math.min(1, k * 1.6).toFixed(3));
      });
      let s = 1;
      const td = RIPPLE.press,
        tu = td + 0.3;
      if (t >= td && t < tu) s = lerp(1, 0.88, seg(t, td, 0.14, C.press));
      else if (t >= tu && t < tu + 0.4) s = lerp(0.88, 1, seg(t, tu, 0.22, C.press));
      blue.el.setAttribute('transform', s === 1 ? '' : scaleAbout(blue.c[0], blue.c[1], s));
      rings.forEach((r, i) => {
        const a = r.deg * p,
          t0 = tu + i * RIPPLE.stagger,
          born = dotR / r.r;
        let sc, o;
        if (t < RIPPLE.fade[0]) {
          const k = t < t0 ? 0 : seg(t, t0, RIPPLE.travel, C.ripple);
          sc = lerp(born, 1, k);
          o = t < t0 ? 0 : Math.min(1, (t - t0) / 0.12);
        } else {
          const k = seg(t, RIPPLE.fade[0] + i * 0.08, RIPPLE.fade[1], C.sine);
          sc = 1 + RIPPLE.spread * k;
          o = 1 - k;
        }
        r.el.setAttribute(
          'transform',
          `rotate(${a} ${r.cx} ${r.cy}) ` + scaleAbout(r.cx, r.cy, sc),
        );
        r.el.setAttribute('opacity', o.toFixed(3));
        if (r.grad) r.grad.setAttribute('gradientTransform', `rotate(${-a} ${r.cx} ${r.cy})`);
      });
      const oa = outer.deg * p;
      echoes.forEach((el, i) => {
        const k = (t - RIPPLE.echoes[i]) / RIPPLE.echoLife;
        if (k <= 0 || k >= 1) {
          el.setAttribute('opacity', 0);
          return;
        }
        const e = C.ripple(k);
        el.setAttribute(
          'transform',
          `rotate(${oa} ${outer.cx} ${outer.cy}) ` +
            scaleAbout(outer.cx, outer.cy, lerp(dotR / outer.r, RIPPLE.echoTo, e)),
        );
        el.setAttribute('opacity', (RIPPLE.echoPeak * Math.min(1, k / 0.1) * (1 - e)).toFixed(3));
      });
    });
  })();

  // =============================================================================================
  // Rooted in Thaana · interactive. The pointer is a lens over the letters: nearby letters swell,
  // the letter under it blooms into a large green letter like the painted ones, and the painted
  // letters ease away from the pointer. Click a letter to pin its bloom; click again to release.
  // =============================================================================================
  const THAANA = {
    lens: 150, // pt, radius of the lens
    swell: 0.55, // letters at the lens centre grow by this much
    bloom: 4.2, // a bloomed letter's scale
    catch: 48, // pt, the pointer catches the nearest letter within this distance
    green: '#9AF366', // the painted letters' colour
    push: 14, // pt, how far painted letters ease away from the pointer
    pushReach: 260, // pt
    ease: 10, // response rate (1/s): higher = snappier
  };
  (function () {
    const I = INFO.thaana;
    const card = svg.querySelector('.design-thaana');
    const labels = svg.querySelector('[data-t="labels"]');
    const glyphs = I.glyphs.map((g, i) => {
      const el = svg.querySelector(`[data-t="g${i}"]`);
      return {
        el,
        c: centre(g.bbox),
        s: 1,
        b: 0,
        pinned: false,
        fill: el.getAttribute('fill') || '#10100F',
        top: false,
      };
    });
    const blobs = I.blobs.map((b, i) => ({
      el: svg.querySelector(`[data-t="b${i}"]`),
      c: centre(b.bbox),
      x: 0,
      y: 0,
      s: 1,
    }));
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const mix = (a, b, p) =>
      '#' +
      hex(a)
        .map((v, i) =>
          Math.round(v + (hex(b)[i] - v) * p)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('');
    let ptr = null,
      hot = null;
    const toSvg = (e) => {
      const p = svgPoint(card.querySelector('[data-design-svg]'), e);
      return [p.x, p.y];
    };
    const inCard = ([x, y]) =>
      x >= I.card[0] && x <= I.card[0] + I.card[2] && y >= I.card[1] && y <= I.card[1] + I.card[3];
    const pick = (pt) => {
      let best = null,
        bd = THAANA.catch;
      for (const g of glyphs) {
        const d = Math.hypot(g.c[0] - pt[0], g.c[1] - pt[1]);
        if (d < bd) {
          bd = d;
          best = g;
        }
      }
      return best;
    };
    card.addEventListener('pointermove', (e) => {
      const p = toSvg(e);
      wake();
      ptr = inCard(p) ? p : null;
      hot = ptr && pick(ptr);
    });
    card.addEventListener('pointerleave', () => {
      wake();
      ptr = null;
      hot = null;
    });
    card.addEventListener('click', (e) => {
      const p = toSvg(e);
      if (!inCard(p)) return;
      const g = pick(p);
      if (g) {
        g.pinned = !g.pinned;
        g.el.setAttribute('aria-pressed', String(g.pinned));
        wake();
      }
    });
    const releaseThaanaPointer = () => {
      ptr = hot = null;
      wake();
    };
    card.addEventListener('pointercancel', releaseThaanaPointer);
    card.addEventListener('pointerup', (event) => {
      if (event.pointerType !== 'mouse') releaseThaanaPointer();
    });
    setupThaanaKeyboard(card, glyphs, (g) => {
      ptr = g?.c ?? null;
      hot = g;
      wake();
    });
    let last = performance.now() / 1000;
    add(card, () => {
      const now = performance.now() / 1000,
        dt = Math.min(0.05, now - last);
      last = now;
      const still = reduced();
      const k = still ? 1 : 1 - Math.exp(-THAANA.ease * dt);
      for (const g of glyphs) {
        let ts = 1;
        if (ptr && !still) {
          const d = Math.hypot(g.c[0] - ptr[0], g.c[1] - ptr[1]);
          const f = Math.max(0, 1 - d / THAANA.lens);
          ts = 1 + THAANA.swell * f * f * (3 - 2 * f);
        }
        const tb = (!still && g === hot) || g.pinned ? 1 : 0;
        g.b += (tb - g.b) * k;
        g.s += (ts - g.s) * k;
        const s = still ? 1 : g.s * (1 + (THAANA.bloom - 1) * C.settle(g.b));
        if (Math.abs(s - 1) < 0.002 && g.b < 0.002) {
          if (g.el.hasAttribute('transform')) {
            g.el.removeAttribute('transform');
            g.el.setAttribute('fill', g.fill);
          }
          continue;
        }
        g.el.setAttribute('transform', scaleAbout(g.c[0], g.c[1], s));
        g.el.setAttribute('fill', mix(g.fill, THAANA.green, Math.min(1, g.b * 1.4)));
        // a blooming letter is lifted above the others (and above the painted ones)
        if (g.b > 0.05 && !g.top) {
          labels.parentNode.insertBefore(g.el, labels);
          g.top = true;
        }
      }
      for (const b of blobs) {
        let tx = 0,
          ty = 0,
          ts = 1;
        if (ptr && !still) {
          const dx = b.c[0] - ptr[0],
            dy = b.c[1] - ptr[1],
            d = Math.hypot(dx, dy) || 1,
            f = Math.max(0, 1 - d / THAANA.pushReach);
          tx = (dx / d) * THAANA.push * f;
          ty = (dy / d) * THAANA.push * f;
          ts = 1 + 0.05 * f;
        }
        b.x += (tx - b.x) * k;
        b.y += (ty - b.y) * k;
        b.s += (ts - b.s) * k;
        b.el.setAttribute(
          'transform',
          `translate(${b.x.toFixed(2)} ${b.y.toFixed(2)}) ` + scaleAbout(b.c[0], b.c[1], b.s),
        );
      }
    });
  })();

  const visible = new Set();
  let raf = 0;
  const t0 = performance.now();
  function wake() {
    if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function frame(now) {
    raf = 0;
    if (document.hidden) return;
    const still = reduced();
    for (const scene of scenes) {
      if (visible.has(scene.card) && (!still || scene.card.classList.contains('design-thaana')))
        scene.render((now - t0) / 1000);
    }
    if (!still && visible.size) raf = requestAnimationFrame(frame);
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      wake();
    },
    { rootMargin: '50px' },
  );
  scenes.forEach((scene) => observer.observe(scene.card));
  for (const mount of mounts) {
    const host = mount.closest('[data-design-preview-host]');
    host.dataset.designPreviewReady = 'true';
  }
  svg.querySelector('.design-thaana-art').removeAttribute('aria-hidden');
  svg
    .querySelector('.design-thaana-native [data-node-id="2382:110952"]')
    .setAttribute('aria-hidden', 'true');
  window.dispatchEvent(new Event('veli:design-previews-ready'));
  window.addEventListener('veli:motion-change', wake);
  document.addEventListener('visibilitychange', () => {
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

function setupThaanaKeyboard(card, glyphs, activate) {
  const letters = [
    ...card.querySelectorAll('.design-thaana-native [data-node-id="2382:110952"] > p'),
  ]
    .slice(0, glyphs.length)
    .map((p) => p.textContent.trim());
  const art = card.querySelector('[data-design-svg="thaana"]');
  art.setAttribute('role', 'group');
  art.setAttribute('aria-label', 'Interactive Thaana letters');
  art.setAttribute('aria-describedby', 'thaana-preview-instructions');
  glyphs.forEach((g, i) => {
    const el = g.el;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', i === 0 ? '0' : '-1');
    el.setAttribute('aria-label', `Pin letter ${letters[i]}`);
    el.setAttribute('aria-pressed', 'false');
    el.addEventListener('focus', () => activate(g));
    el.addEventListener('blur', () => activate(null));
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        g.pinned = !g.pinned;
        el.setAttribute('aria-pressed', String(g.pinned));
        activate(g);
      }
      const direction = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      }[event.key];
      if (!direction) return;
      event.preventDefault();
      let best = null,
        score = Infinity;
      for (const other of glyphs) {
        const dx = other.c[0] - g.c[0],
          dy = other.c[1] - g.c[1];
        const along = dx * direction[0] + dy * direction[1];
        const across = Math.abs(dx * direction[1] - dy * direction[0]);
        const distance = Math.hypot(dx, dy) + across * 2;
        if (along > 1 && distance < score) {
          best = other;
          score = distance;
        }
      }
      if (best) {
        el.setAttribute('tabindex', '-1');
        best.el.setAttribute('tabindex', '0');
        best.el.focus();
      }
    });
  });
}
