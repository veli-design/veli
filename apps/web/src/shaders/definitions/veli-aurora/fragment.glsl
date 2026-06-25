// ===========================================================================
// Veli Aurora — recreation of the shaders.com homepage background.
//
// Layer stack (top -> bottom in the original editor), all folded into one
// fullscreen pass for performance:
//
//   1. Swirl                — domain-warped two-colour field (OKLab blend)
//   2. Liquify              — pointer-driven UV displacement on the swirl
//   3. Halftone             — subtle high-frequency dot texture
//   4. Chromatic Aberration — soft per-channel UV offset (rainbow fringing)
//   5. Film Grain           — animated luminance noise
//   6. Fractal Noise        — 8-octave fbm, Overlay-blended for contrast/grit
//
// Built-in uniforms (provided by runtime/renderer.ts):
//   u_resolution, u_time, u_aspect, u_pointer, u_pointerDrag, u_quality
//
// Param uniforms mirror the shaders.com controls 1:1 (see index.ts), so the
// look can be retuned by editing numbers there — no shader edits required.
// ===========================================================================

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_aspect;          // resolution.x / resolution.y
uniform vec2 u_pointer;          // smoothed pointer, uv space (0..1), -1 if idle
uniform vec2 u_pointerDrag;      // trailing-lag vector, uv (points along motion, bounded)
uniform float u_quality;         // 1.0 = full, <1.0 = reduced (mobile / low-end)

// Swirl
uniform vec3 u_swirlColorA;
uniform vec3 u_swirlColorB;
uniform float u_swirlDetail;
uniform float u_swirlBlend;
uniform float u_swirlSpeed;

// Liquify
uniform float u_liquifyIntensity;
uniform float u_liquifyRadius;

// Halftone
uniform float u_halftoneFrequency;
uniform float u_halftoneAngle;    // radians
uniform float u_halftoneOpacity;

// Chromatic aberration
uniform float u_caStrength;
uniform float u_caAngle;          // radians
uniform vec3 u_caOffsets;         // red, green, blue channel offsets
uniform float u_caOpacity;

// Film grain
uniform float u_grainStrength;
uniform float u_grainBias;

// Fractal noise overlay
uniform vec3 u_fnColorA;
uniform vec3 u_fnColorB;
uniform float u_fnOctaves;
uniform float u_fnDetail;
uniform float u_fnContrast;
uniform float u_fnAngle;          // radians
uniform float u_fnSeed;
uniform float u_fnSpeed;
uniform float u_fnOpacity;

// --- Liquify ----------------------------------------------------------------
// The inertial physics live on the JS side (see renderer.ts); `u_pointerDrag`
// is a bounded momentum vector that lags and outlives the cursor's motion. Here
// we just smear the swirl along it within a tight gaussian around the pointer,
// so the effect reads as the swirl being dragged with weight and drifting back.
vec2 liquify(vec2 uv) {
  if (u_pointer.x < 0.0) return uv; // pointer idle / never moved
  vec2 toP = (uv - u_pointer) * vec2(u_aspect, 1.0);
  float d2 = dot(toP, toP);
  float sigma = max(u_liquifyRadius * 0.1, 0.02);
  float falloff = exp(-d2 / (sigma * sigma));
  return uv - u_pointerDrag * (u_liquifyIntensity * 0.12) * falloff;
}

// --- Swirl ------------------------------------------------------------------
// Domain-warped fbm producing soft swirling regions, blended between the two
// pastel colours in OKLab.
vec3 swirlColor(vec2 uv) {
  vec2 p = uv * vec2(u_aspect, 1.0);
  float t = u_time * u_swirlSpeed * 0.12;
  float scale = mix(1.1, 3.4, clamp(u_swirlDetail / 3.0, 0.0, 1.0));
  p *= scale;

  vec2 q = vec2(
    fbm(p + vec2(0.0, t), 4.0),
    fbm(p + vec2(5.2, 1.3) - vec2(t, 0.0), 4.0)
  );
  vec2 r = vec2(
    fbm(p + 2.2 * q + vec2(1.7, 9.2) + 0.15 * t, 4.0),
    fbm(p + 2.2 * q + vec2(8.3, 2.8) - 0.12 * t, 4.0)
  );
  float v = fbm(p + 2.6 * r, 5.0);

  // `blend` widens/narrows the transition band between the two colours.
  float soft = mix(0.04, 0.42, clamp(u_swirlBlend, 0.0, 1.0));
  v = smoothstep(0.5 - soft, 0.5 + soft, v);

  return mixOklab(u_swirlColorA, u_swirlColorB, clamp(v, 0.0, 1.0));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // 2. Liquify displaces the coordinates the swirl is sampled at.
  vec2 luv = liquify(uv);

  // 1 + 4. Swirl with chromatic aberration. The CA layer re-samples the swirl
  // at per-channel offsets along its angle, then composites at low opacity.
  vec3 base = swirlColor(luv);
  vec3 color = base;
  if (u_caStrength > 0.0 && u_caOpacity > 0.0) {
    vec2 dir = vec2(cos(u_caAngle), sin(u_caAngle));
    float amt = u_caStrength * 0.012;
    vec3 ca = base;
    ca.r = swirlColor(luv + dir * amt * u_caOffsets.r).r;
    ca.b = swirlColor(luv + dir * amt * u_caOffsets.b).b;
    if (u_quality >= 1.0) {
      ca.g = swirlColor(luv + dir * amt * u_caOffsets.g).g;
    }
    color = mix(base, ca, u_caOpacity);
  }

  // 6. Fractal noise, Overlay-blended. Color B is black, so Overlay mostly
  // modulates contrast/texture rather than tinting.
  if (u_fnOpacity > 0.0) {
    vec2 fp = rot2(u_fnAngle) * (uv * vec2(u_aspect, 1.0)) * u_fnDetail;
    fp += u_fnSeed;
    float octaves = max(u_fnOctaves * u_quality, 2.0);
    float n = fbm(fp + vec2(0.0, u_time * u_fnSpeed * 0.1), octaves);
    n = clamp((n - 0.5) * u_fnContrast + 0.5, 0.0, 1.0);
    vec3 fnCol = mixOklab(u_fnColorA, u_fnColorB, n);
    color = mix(color, blendOverlay(color, fnCol), u_fnOpacity);
  }

  // 3. Halftone — rotated dot grid keyed off luminance, very subtle.
  if (u_halftoneOpacity > 0.0) {
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    vec2 hp = rot2(u_halftoneAngle) * gl_FragCoord.xy;
    hp *= u_halftoneFrequency / max(u_resolution.y, 1.0);
    vec2 cell = fract(hp) - 0.5;
    float dotRadius = sqrt(clamp(1.0 - luma, 0.0, 1.0)) * 0.5;
    // Fixed AA width (cell space) — avoids the OES_standard_derivatives
    // dependency so the shader runs on WebGL1 everywhere.
    float aa = 0.08;
    float dist = length(cell);
    float dot = smoothstep(dotRadius + aa, dotRadius - aa, dist);
    // Dots darken very slightly; the reference uses halftone as a faint
    // print-screen texture, not a visible dot pattern.
    color = mix(color, color * (1.0 - 0.12 * dot), u_halftoneOpacity);
  }

  // 5. Film grain — animated, with a bias controlling its distribution.
  if (u_grainStrength > 0.0) {
    float g = hash21(gl_FragCoord.xy + fract(u_time) * 137.0);
    g = pow(g, max(u_grainBias, 1.0) * 0.2 + 0.5);
    color += (g - 0.5) * u_grainStrength * 0.06;
  }

  gl_FragColor = vec4(linearToSrgb(color), 1.0);
}
