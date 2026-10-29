// Animation and palette adapted from Basim's ENG-3733 prototype (2026-10-08).
// Glyphs, icon masks and distance fields are baked; this runtime only draws dots.
import { cubicBezier } from 'motion';

import type { ErrorPageKind } from './types';

type Color = [number, number, number, number];
type Point = { x: number; y: number };
export type BakedArtwork = { tide: number[]; depths: number[]; cells: number[][] };
type DotState = { distance: number; role: number; token: number; highlight: number; scale: number };
type Dot = {
  x: number;
  y: number;
  size: number;
  sparkle: number;
  scatter: number;
  jitterX: number;
  jitterY: number;
  states: DotState[];
  fromDistance: number;
  fromColor: Color;
  fromScale: number;
  delay: number;
  offsetX: number;
  offsetY: number;
};

// Resolve on this canvas, so nested providers and app palette overrides stay local.
const paletteTokens = [
  ['--veli-error-ink', '--veli-color-primary-900', '#055964'],
  ['--veli-error-lagoon', '--veli-color-primary-alpha-300', 'rgba(0,180,161,.16)'],
  ['--veli-error-patch', '--veli-color-primary-alpha-400', 'rgba(0,194,187,.31)'],
  ['--veli-error-accent', '--veli-color-button-accent-default', '#9af366'],
] as const;

export const compactArtworkSize: Record<ErrorPageKind, readonly [number, number]> = {
  '404': [740, 331],
  '500': [302, 315],
  '503': [314, 321],
  '403': [302, 316],
  '401': [315, 323],
  offline: [336, 289],
};

// Roles: ink, reef, lagoon, patch, island, bloom.
const ROLES = [
  { token: 0, sparkle: 3, chance: 0.1, highlight: 3, scale: 1 },
  { token: 0, sparkle: 3, chance: 0.18, highlight: 3, scale: 1 },
  { token: 1, sparkle: 3, chance: 0.06, highlight: 3, scale: 0.4 },
  { token: 2, sparkle: 0, chance: 0.2, highlight: 3, scale: 1 },
  { token: 3, sparkle: 3, chance: 0, highlight: 0, scale: 1 },
  { token: 3, sparkle: 0, chance: 0.45, highlight: 0, scale: 1 },
];

const WIDTH = 936;
const HEIGHT = 380;
const PITCH = 8.4;
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = cubicBezier(0.65, 0, 0.35, 1);

export function createErrorArtwork(
  canvas: HTMLCanvasElement,
  kind: ErrorPageKind,
  data: BakedArtwork,
  staticMode = false,
) {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const ctx = context;
  const [centerX, centerY, radiusX, radiusY] = data.tide;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let palette: Color[] = paletteTokens.map(() => [0, 0, 0, 1]);
  let current = 0;
  let start = performance.now();
  let end = start + 1700;
  let entrance = true;
  let pointer: Point | null = null;
  let paused = false;
  let visible = true;
  let frame = 0;
  let lastDraw = 0;
  let disposed = false;
  let moving = false;

  const dots: Dot[] = data.cells.map(
    ([x, y, size, sparkle, scatter, jitterX, jitterY, ...states]) => ({
      x,
      y,
      size,
      sparkle,
      scatter,
      jitterX,
      jitterY,
      states: Array.from({ length: data.depths.length }, (_, index) => {
        const role = states[index * 2 + 1];
        const style = ROLES[role];
        const token = sparkle < style.chance ? style.sparkle : style.token;
        return {
          distance: states[index * 2],
          role,
          token,
          highlight: token === style.highlight ? style.token : style.highlight,
          scale: style.scale,
        };
      }),
      fromDistance: data.depths[0] + PITCH,
      fromColor: [0, 0, 0, 0],
      fromScale: 1,
      delay: 0,
      offsetX: 0,
      offsetY: 0,
    }),
  );

  const sample = { distance: 0, u: 0, color: [0, 0, 0, 0] as Color, scale: 1 };

  function evaluate(dot: Dot, now: number) {
    const target = dot.states[current];
    const duration = entrance ? 1500 : 1200;
    const u =
      staticMode || reduced.matches || paused
        ? 1
        : clamp((now - start - (entrance ? 200 : 0) - dot.delay) / (duration * 0.5));
    const progress = ease(u) + 0.3 * Math.sin(Math.PI * clamp((u - 0.5) * 2)) ** 2;
    const colorProgress = clamp(progress);
    let distance = dot.fromDistance + (target.distance - dot.fromDistance) * progress;
    if (!entrance)
      distance -=
        1.7 *
        PITCH *
        Math.sin(Math.PI * colorProgress) *
        Math.min(1, Math.abs(target.distance - dot.fromDistance) / (2 * PITCH));
    for (let index = 0; index < 4; index++)
      sample.color[index] =
        dot.fromColor[index] +
        (palette[target.token][index] - dot.fromColor[index]) * colorProgress;
    sample.distance = distance;
    sample.u = u;
    sample.scale = dot.fromScale + (target.scale - dot.fromScale) * colorProgress;
    return sample;
  }

  function change(to: number, origin?: Point, first = false) {
    const now = performance.now();
    for (const dot of dots) {
      const value = evaluate(dot, now);
      dot.fromDistance = first ? data.depths[to] + PITCH : value.distance;
      dot.fromColor = first ? [...palette[dot.states[to].token]] : [...value.color];
      dot.fromScale = first ? dot.states[to].scale : value.scale;
    }
    current = to;
    entrance = first;
    start = now;
    const duration = first ? 1500 : 1200;
    end = now + duration + (first ? 200 : 0);
    let maxDistance = 1;
    for (const dot of dots) {
      dot.delay = Math.hypot(
        dot.x - (origin?.x ?? centerX),
        (dot.y - (origin?.y ?? centerY)) * (origin ? 1 : radiusX / radiusY),
      );
      maxDistance = Math.max(maxDistance, dot.delay);
    }
    for (const dot of dots) dot.delay = (0.5 * duration * dot.delay) / maxDistance;
    if (staticMode || reduced.matches || paused) settle();
    else {
      draw(now);
      schedule();
    }
  }

  function draw(now: number) {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const [width, height] = geometry();
    const scale = 1;
    if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
      canvas.width = width * ratio;
      canvas.height = height * ratio;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.setTransform(
      ratio * scale,
      0,
      0,
      ratio * scale,
      (ratio * (width - WIDTH * scale)) / 2,
      (ratio * (height - HEIGHT * scale)) / 2,
    );
    const still = staticMode || reduced.matches || paused;
    const morphing = !still && !entrance && now < end;
    moving = false;

    for (const dot of dots) {
      const target = dot.states[current];
      const value = evaluate(dot, now);
      const coverage = clamp(0.5 - value.distance / PITCH);
      const base = PITCH * 0.24 * dot.size * value.scale;
      let radius = base * Math.sqrt(coverage) * (coverage < 0.2 ? coverage / 0.2 : 1);
      let offset = 0;
      let scatter = false;
      if (coverage < 1) {
        const fall = Math.exp(-Math.max(0, value.distance) / 13);
        const scatterRadius = base * clamp((fall - dot.scatter) / 0.08) * (0.55 + 0.45 * fall);
        if (scatterRadius > radius) {
          radius = scatterRadius;
          scatter = true;
        }
        offset = (1 - coverage) ** 3;
      }
      if (radius < 0.25) continue;
      let color = value.color;
      if (
        morphing &&
        value.u > 0 &&
        value.u < 1 &&
        !scatter &&
        coverage > 0.05 &&
        coverage < 0.9 &&
        dot.sparkle < 0.4 &&
        Math.abs(target.distance - dot.fromDistance) > PITCH * 0.5
      )
        color = palette[target.highlight];
      const x = dot.x + dot.jitterX * offset;
      const y = dot.y + dot.jitterY * offset;
      let pushX = 0;
      let pushY = 0;
      if (!still && pointer && finePointer.matches && now - start > 400) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 160 && distance > 0.01) {
          const force = 16 * (1 - distance / 160) ** 2 * (target.role === 0 ? 0.5 : 1);
          pushX = (dx / distance) * force;
          pushY = (dy / distance) * force;
        }
      }
      dot.offsetX = still ? 0 : dot.offsetX + (pushX - dot.offsetX) * 0.16;
      dot.offsetY = still ? 0 : dot.offsetY + (pushY - dot.offsetY) * 0.16;
      if (Math.abs(pushX - dot.offsetX) > 0.01 || Math.abs(pushY - dot.offsetY) > 0.01)
        moving = true;
      else {
        dot.offsetX = pushX;
        dot.offsetY = pushY;
      }
      ctx.fillStyle = `rgba(${color[0] | 0},${color[1] | 0},${color[2] | 0},${color[3]})`;
      ctx.beginPath();
      ctx.arc(x + dot.offsetX, y + dot.offsetY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function schedule() {
    if (
      !frame &&
      !disposed &&
      visible &&
      !document.hidden &&
      !paused &&
      !staticMode &&
      !reduced.matches
    )
      frame = requestAnimationFrame(tick);
  }

  function tick(now: number) {
    frame = 0;
    // Cap at 30fps; suspend entirely for hidden tabs, offscreen art and reduced motion.
    if (now - lastDraw >= 32 || (lastDraw < end && now >= end)) {
      draw(now);
      lastDraw = now;
    }
    // The intro and deliberate transitions finish on their final frame. Idle art stays still.
    if (now < end || moving) schedule();
  }

  function refreshPalette() {
    const styles = getComputedStyle(canvas);
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    if (!probe) return;
    palette = paletteTokens.map(([override, token, fallback]): Color => {
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle =
        styles.getPropertyValue(override).trim() ||
        styles.getPropertyValue(token).trim() ||
        fallback;
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b, alpha] = probe.getImageData(0, 0, 1, 1).data;
      return [r, g, b, alpha / 255];
    });
    for (const dot of dots) dot.fromColor = [...palette[dot.states[current].token]];
    draw(performance.now());
  }

  function geometry(): readonly [number, number] {
    return canvas.getBoundingClientRect().width < 768 ? compactArtworkSize[kind] : [WIDTH, HEIGHT];
  }

  function resume() {
    if (document.hidden || !visible || staticMode || reduced.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      if (reduced.matches) settle();
    } else {
      schedule();
    }
  }

  function settle() {
    start = performance.now() - 3000;
    end = performance.now();
    entrance = false;
    for (const dot of dots) {
      const state = dot.states[current];
      dot.fromDistance = state.distance;
      dot.fromColor = [...palette[state.token]];
      dot.fromScale = state.scale;
    }
    draw(end);
  }

  function resize() {
    refreshPalette();
    schedule();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  });
  intersection.observe(canvas);
  document.addEventListener('visibilitychange', resume);
  reduced.addEventListener('change', resume);
  refreshPalette();
  change(0, undefined, true);

  return {
    position: (clientX: number, clientY: number): Point | undefined => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return undefined;
      const [width, height] = geometry();
      const scale = 1;
      return {
        x: (((clientX - bounds.left) * width) / bounds.width - (width - WIDTH * scale) / 2) / scale,
        y:
          (((clientY - bounds.top) * height) / bounds.height - (height - HEIGHT * scale) / 2) /
          scale,
      };
    },
    refreshPalette,
    next: (origin?: Point) => change((current + 1) % data.depths.length, origin),
    point: (value: Point | null) => {
      pointer = value;
      moving = true;
      schedule();
    },
    pause: (value: boolean) => {
      paused = value;
      cancelAnimationFrame(frame);
      frame = 0;
      settle();
      schedule();
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', resume);
      reduced.removeEventListener('change', resume);
    },
  };
}
