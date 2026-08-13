import type { ParamSpec, ShaderDefinition } from '../types';

/**
 * Minimal WebGL renderer for fullscreen fragment-shader backgrounds.
 *
 * Deliberately tiny and dependency-free: one fullscreen triangle, one program,
 * one draw call per frame. It knows nothing about any specific effect — it
 * binds a definition's params to `u_<name>` uniforms and provides a fixed set
 * of built-in uniforms:
 *
 *   uniform vec2  u_resolution;       // drawing-buffer size in px
 *   uniform float u_time;             // seconds since start
 *   uniform float u_aspect;           // resolution.x / resolution.y
 *   uniform vec2  u_pointer;          // smoothed pointer, uv (0..1), -1 idle
 *   uniform vec2  u_pointerDrag;      // trailing-lag vector, uv (motion dir, bounded)
 *   uniform float u_pointerPresence;  // eased hover presence (0..1)
 *   uniform float u_quality;          // 1.0 full, <1.0 reduced
 *   uniform float u_theme;            // 0.0 light, 1.0 dark
 *   uniform float u_motion;           // 0.0 reduced motion, 1.0 animated
 *
 * Performance & resilience:
 *   - caps device pixel ratio (lower on coarse-pointer / low-core devices),
 *   - pauses when scrolled offscreen or the tab is hidden,
 *   - honours prefers-reduced-motion (renders a single static frame),
 *   - falls back gracefully: `create()` returns null if WebGL is unavailable,
 *     letting the caller keep its static fallback image.
 */

const VERTEX_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/** sRGB hex string -> linear-light RGB triple. */
function hexToLinearRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const toLinear = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return [
    toLinear(parseInt(full.slice(0, 2), 16)),
    toLinear(parseInt(full.slice(2, 4), 16)),
    toLinear(parseInt(full.slice(4, 6), 16)),
  ];
}

type ApplyUniform = (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => void;

function bindParam(spec: ParamSpec): ApplyUniform {
  switch (spec.type) {
    case 'float': {
      const v = spec.value as number;
      return (gl, loc) => gl.uniform1f(loc, v);
    }
    case 'vec2': {
      const v = spec.value as [number, number];
      return (gl, loc) => gl.uniform2f(loc, v[0], v[1]);
    }
    case 'vec3': {
      const v = spec.value as [number, number, number];
      return (gl, loc) => gl.uniform3f(loc, v[0], v[1], v[2]);
    }
    case 'color': {
      const v = hexToLinearRgb(spec.value as string);
      return (gl, loc) => gl.uniform3f(loc, v[0], v[1], v[2]);
    }
  }
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (import.meta.env.DEV) {
      console.error('[shader] compile error:', gl.getShaderInfoLog(shader));
    }
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export interface ShaderRenderer {
  destroy: () => void;
}

export interface ShaderRendererOptions {
  /** Element the pointer is tracked relative to (defaults to the canvas). */
  pointerTarget?: HTMLElement;
  /** Hard cap on device pixel ratio (default 1.5). */
  maxPixelRatio?: number;
}

export function createRenderer(
  canvas: HTMLCanvasElement,
  definition: ShaderDefinition,
  options: ShaderRendererOptions = {},
): ShaderRenderer | null {
  const context =
    (canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
    }) as WebGLRenderingContext | null) ||
    (canvas.getContext('experimental-webgl', {
      antialias: false,
      alpha: false,
    }) as WebGLRenderingContext | null);
  if (!context) return null;
  const gl: WebGLRenderingContext = context;

  const vert = compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const frag = compile(gl, gl.FRAGMENT_SHADER, definition.fragment);
  if (!vert || !frag) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (import.meta.env.DEV) {
      console.error('[shader] link error:', gl.getProgramInfoLog(program));
    }
    return null;
  }
  gl.useProgram(program);

  // Fullscreen triangle.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  // Built-in uniform locations.
  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uAspect = gl.getUniformLocation(program, 'u_aspect');
  const uPointer = gl.getUniformLocation(program, 'u_pointer');
  const uPointerDrag = gl.getUniformLocation(program, 'u_pointerDrag');
  const uPointerPresence = gl.getUniformLocation(program, 'u_pointerPresence');
  const uQuality = gl.getUniformLocation(program, 'u_quality');
  const uTheme = gl.getUniformLocation(program, 'u_theme');
  const uMotion = gl.getUniformLocation(program, 'u_motion');

  // Param uniforms — uploaded once (they're static defaults). Re-run this loop
  // if/when live tweaking is added.
  for (const [name, spec] of Object.entries(definition.params)) {
    const loc = gl.getUniformLocation(program, `u_${name}`);
    if (loc) bindParam(spec)(gl, loc);
  }

  // --- Quality / DPR heuristics --------------------------------------------
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const lowCore = (navigator.hardwareConcurrency ?? 8) <= 4;
  const reducedMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const quality = coarse || lowCore ? 0.6 : 1.0;
  const maxDpr = options.maxPixelRatio ?? (coarse || lowCore ? 1.0 : 1.5);
  if (uQuality) gl.uniform1f(uQuality, quality);
  if (uMotion) gl.uniform1f(uMotion, reducedMotion ? 0 : 1);

  // --- Theme ---------------------------------------------------------------
  // Layout resolves light/dark/system onto `data-theme`. Keep that state in a
  // built-in uniform so shader definitions can use design-token palettes for
  // both modes and transition without rebuilding the WebGL program.
  const readTheme = () => (document.documentElement.dataset.theme === 'dark' ? 1 : 0);
  let themeTarget = readTheme();
  let themeCurrent = themeTarget;
  if (uTheme) gl.uniform1f(uTheme, themeCurrent);

  // --- Resize ---------------------------------------------------------------
  let width = 0;
  let height = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (w === width && h === height) return;
    width = w;
    height = h;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    if (uResolution) gl.uniform2f(uResolution, w, h);
    if (uAspect) gl.uniform1f(uAspect, w / h);
  }

  // --- Pointer (inertial momentum model) -----------------------------------
  // The warp displacement behaves like a heavy mass nudged by the cursor:
  // cursor motion imparts an *impulse* to a momentum vector, that momentum
  // carries the displacement along after the cursor stops (inertia), and a weak
  // return eases it back to rest. Crucially the per-frame cursor motion is
  // scaled down and saturated before it becomes impulse, so fast flicks add a
  // bounded, tasteful push rather than tracking mouse speed 1:1 (no wobble).
  const target = options.pointerTarget ?? canvas;
  const CENTER_STIFFNESS = 14; // how quickly the warp centre follows the cursor (lower = smooths fast flicks)
  const FLICK_GAIN = 0.35; // cursor motion -> momentum impulse (higher = stronger)
  const MOVE_SATURATION = 0.018; // cap on per-frame motion mapped to impulse (uv)
  const MAX_MOMENTUM = 0.05; // clamp on momentum — makes hard flicks bounded & ~speed-independent
  const MOMENTUM_DAMP = 2.0; // momentum decay rate /s (lower = longer drift)
  const FLOW_RETURN = 1.5; // displacement ease-back rate /s (lower = lingers)
  const MAX_FLOW = 0.12; // clamp on the displacement vector (uv) — safety only

  // All in uv space. `active` stays true after the first move so momentum can
  // play out and settle in place when the pointer leaves.
  const pointer = { x: 0, y: 0 }; // raw, latest event
  const center = { x: 0, y: 0 }; // smoothed warp centre
  const prevCenter = { x: 0, y: 0 };
  const velocity = { x: 0, y: 0 }; // momentum (carries inertia)
  const flow = { x: 0, y: 0 }; // applied displacement vector (uploaded as u_pointerDrag)
  let active = false;
  let pointerPresenceTarget = 0;
  let pointerPresence = 0;

  function onPointerMove(e: PointerEvent) {
    const rect = target.getBoundingClientRect();
    pointer.x = (e.clientX - rect.left) / rect.width;
    pointer.y = 1 - (e.clientY - rect.top) / rect.height; // flip to GL space
    pointerPresenceTarget = 1;
    if (!active) {
      center.x = prevCenter.x = pointer.x;
      center.y = prevCenter.y = pointer.y;
      active = true;
    }
  }
  function onPointerLeave() {
    pointerPresenceTarget = 0;
  }
  if (!reducedMotion) {
    target.addEventListener('pointermove', onPointerMove, { passive: true });
    target.addEventListener('pointerleave', onPointerLeave, { passive: true });
  }

  // --- Render loop ----------------------------------------------------------
  const start = performance.now();
  let last = start;
  let raf = 0;
  let running = false;

  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    resize();

    if (active) {
      // Centre chases the cursor (also de-jitters raw events).
      const ck = 1 - Math.exp(-CENTER_STIFFNESS * dt);
      center.x += (pointer.x - center.x) * ck;
      center.y += (pointer.y - center.y) * ck;

      // This frame's centre motion -> impulse, with reduced/saturated mapping
      // (dt cancels here, so the impulse is framerate-independent).
      let mx = center.x - prevCenter.x;
      let my = center.y - prevCenter.y;
      prevCenter.x = center.x;
      prevCenter.y = center.y;
      const mm = Math.hypot(mx, my);
      if (mm > MOVE_SATURATION) {
        const s = MOVE_SATURATION / mm;
        mx *= s;
        my *= s;
      }
      velocity.x += mx * FLICK_GAIN;
      velocity.y += my * FLICK_GAIN;

      // Momentum decays slowly (inertia carries the motion past the cursor).
      const vd = Math.exp(-MOMENTUM_DAMP * dt);
      velocity.x *= vd;
      velocity.y *= vd;

      // Clamp momentum so a hard, long flick can't accumulate into a big
      // push-and-rebound — fast and moderate flicks settle to the same bounded,
      // tasteful drift while slow targeted moves stay below the cap untouched.
      const vm = Math.hypot(velocity.x, velocity.y);
      if (vm > MAX_MOMENTUM) {
        const s = MAX_MOMENTUM / vm;
        velocity.x *= s;
        velocity.y *= s;
      }

      // Integrate momentum into the displacement, then ease it back to rest.
      flow.x += velocity.x * dt;
      flow.y += velocity.y * dt;
      const fr = Math.exp(-FLOW_RETURN * dt);
      flow.x *= fr;
      flow.y *= fr;

      const fm = Math.hypot(flow.x, flow.y);
      if (fm > MAX_FLOW) {
        const s = MAX_FLOW / fm;
        flow.x *= s;
        flow.y *= s;
      }
    }

    if (uTime) gl.uniform1f(uTime, (now - start) / 1000);
    if (uTheme) {
      const tk = 1 - Math.exp(-7 * dt);
      themeCurrent += (themeTarget - themeCurrent) * tk;
      gl.uniform1f(uTheme, themeCurrent);
    }
    if (uPointer) gl.uniform2f(uPointer, active ? center.x : -1, active ? center.y : -1);
    if (uPointerDrag) gl.uniform2f(uPointerDrag, flow.x, flow.y);
    if (uPointerPresence) {
      const pk = 1 - Math.exp(-8 * dt);
      pointerPresence += (pointerPresenceTarget - pointerPresence) * pk;
      gl.uniform1f(uPointerPresence, pointerPresence);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  }

  function play() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function pause() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
  }

  function renderOnce() {
    resize();
    if (uTime) gl.uniform1f(uTime, 0);
    if (uPointer) gl.uniform2f(uPointer, -1, -1);
    if (uPointerDrag) gl.uniform2f(uPointerDrag, 0, 0);
    if (uPointerPresence) gl.uniform1f(uPointerPresence, 0);
    if (uTheme) gl.uniform1f(uTheme, themeCurrent);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  const themeObserver = uTheme
    ? new MutationObserver(() => {
        themeTarget = readTheme();
        if (reducedMotion) {
          themeCurrent = themeTarget;
          renderOnce();
        }
      })
    : null;
  themeObserver?.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });

  // Reduced motion: one static frame, no loop, no listeners.
  if (reducedMotion) {
    renderOnce();
    return {
      destroy() {
        themeObserver?.disconnect();
        gl.deleteProgram(program);
        gl.deleteShader(vert);
        gl.deleteShader(frag);
        gl.deleteBuffer(buffer);
      },
    };
  }

  // Pause when offscreen / tab hidden.
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && document.visibilityState === 'visible') play();
      else pause();
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  function onVisibility() {
    if (document.visibilityState === 'hidden') pause();
    else if (canvas.getBoundingClientRect().bottom > 0) play();
  }
  document.addEventListener('visibilitychange', onVisibility);

  function onContextLost(e: Event) {
    e.preventDefault();
    pause();
  }
  canvas.addEventListener('webglcontextlost', onContextLost);

  play();

  return {
    destroy() {
      pause();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerleave', onPointerLeave);
      themeObserver?.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buffer);
    },
  };
}
