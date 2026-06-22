// ---------------------------------------------------------------------------
// Shared GLSL helpers for shader-background definitions.
//
// This file is imported (via `?raw`) and prepended to each definition's
// fragment source, so every background gets the same noise / colour-space
// toolbox. Keep it dependency-free and side-effect-free: just functions.
// ---------------------------------------------------------------------------

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

#ifndef PI
#define PI 3.14159265359
#endif

// --- Hashing & value noise --------------------------------------------------

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

// Smooth value noise in [0, 1].
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Fractal Brownian motion. `octaves` is clamped to [1, 8]; loop bound is a
// compile-time constant (required by GLSL ES 1.00), broken early at runtime.
float fbm(vec2 p, float octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float norm = 0.0;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= octaves) break;
    value += amplitude * vnoise(p);
    norm += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value / max(norm, 1e-4);
}

// --- Colour space: linear sRGB <-> OKLab ------------------------------------
// Mixing in OKLab gives the smooth perceptual gradients the reference relies
// on. Inputs/outputs here are linear-light RGB (colours arrive pre-linearised
// from JS, output is gamma-encoded once at the end of the pipeline).

vec3 linearSrgbToOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0);
  m = pow(max(m, 0.0), 1.0 / 3.0);
  s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  );
}

vec3 oklabToLinearSrgb(vec3 c) {
  float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  float l = l_ * l_ * l_;
  float m = m_ * m_ * m_;
  float s = s_ * s_ * s_;
  return vec3(
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

// Mix two linear-RGB colours through OKLab.
vec3 mixOklab(vec3 a, vec3 b, float t) {
  return oklabToLinearSrgb(mix(linearSrgbToOklab(a), linearSrgbToOklab(b), t));
}

// --- Compositing & output ---------------------------------------------------

// Photoshop-style "Overlay" blend, per channel.
vec3 blendOverlay(vec3 base, vec3 blend) {
  return mix(
    2.0 * base * blend,
    1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
    step(0.5, base)
  );
}

mat2 rot2(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

// Linear-light -> sRGB gamma encode for final output.
vec3 linearToSrgb(vec3 c) {
  c = max(c, 0.0);
  return mix(
    c * 12.92,
    1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, c)
  );
}
