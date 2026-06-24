// ===========================================================================
// Veli Dunes — flowing Maldivian white-sand dunes.
//
// A from-scratch alternative to veli-aurora. Instead of recreating a fixed
// editor stack, this builds a small, physically-motivated scene:
//
//   1. Dune field   — domain-warped, slowly travelling ridges form soft
//                      crescent dunes (a smooth height field `h`).
//   2. Sand shading  — the height field is lit (crests catch warm light, the
//                      lee faces fall into cool periwinkle shadow) and the two
//                      sand tones are mixed in OKLab.
//   3. Flowing grain — fine sand texture whose sample coordinates are advected
//                      by the wind, so the speckle *drifts* rather than sitting
//                      static like a noise stamp.
//   4. Drift sand    — loose grains streaming along the dune crests: sparse,
//                      wind-stretched, scrolling sparkles masked to the ridge
//                      lines, like fine sand blowing along an edge.
//
// Built-in uniforms (provided by runtime/renderer.ts):
//   u_resolution, u_time, u_aspect, u_pointer, u_pointerDrag, u_quality
//
// Param uniforms (see index.ts) — every look knob lives there as `u_<name>`,
// so the background can be retuned without touching this shader.
// ===========================================================================

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_aspect;
uniform vec2 u_pointer;          // smoothed pointer, uv (0..1), -1 if idle
uniform vec2 u_pointerDrag;      // bounded momentum vector, uv
uniform float u_quality;         // 1.0 full, <1.0 reduced

// Sand palette (all linear-light RGB; pre-linearised in JS).
uniform vec3 u_sandLight;        // lit crest — warm white
uniform vec3 u_sandWarm;         // sunlit highlight — warm cream
uniform vec3 u_sandBlue;         // mid tone — periwinkle
uniform vec3 u_sandShadow;       // lee shadow — deeper blue

// Dune field
uniform float u_duneScale;       // overall size of the dunes (lower = larger)
uniform float u_duneWarp;        // organic distortion of the ridges
uniform float u_flowSpeed;       // how fast the dunes travel
uniform vec2  u_windDir;         // wind direction (drives flow + drift)

// Flowing grain
uniform float u_grainScale;      // fine-sand frequency
uniform float u_grainFlow;       // how fast the grain drifts with the wind
uniform float u_grainStrength;   // grain contrast

// Drift sand (loose particles along crests)
uniform float u_driftAmount;     // density / brightness of streaming grains
uniform float u_driftSpeed;      // how fast they blow along the crest
uniform float u_pointerStrength; // how much the pointer disturbs the sand

// ---------------------------------------------------------------------------
// Dune height field. Domain-warped fbm gives organic, crescent-like ridges;
// the whole field is slowly advected along the wind so the dunes travel.
// Returns roughly [0,1].
// ---------------------------------------------------------------------------
float duneHeight(vec2 p, float t) {
  vec2 wind = normalize(u_windDir + 1e-4);
  p += wind * t * u_flowSpeed;

  // Low-frequency warp — bends the ridges into soft crescents.
  vec2 w = vec2(
    fbm(p * 0.6 + vec2(0.0, t * 0.15), 4.0),
    fbm(p * 0.6 + vec2(4.7, 1.3) - vec2(t * 0.12, 0.0), 4.0)
  );
  p += (w - 0.5) * u_duneWarp;

  // Travelling ridges at a couple of orientations build the layered dunes.
  float ridges =
      0.60 * sin(p.x * 1.10 + p.y * 0.55 + t * 0.35) +
      0.30 * sin(p.x * 2.05 - p.y * 0.35 - t * 0.27 + 1.7) +
      0.18 * sin(p.x * 0.70 + p.y * 1.30 + t * 0.20 + 3.1);

  // Mix the smooth ridges with a touch of fbm grit for natural variation.
  float h = 0.5 + 0.5 * ridges;
  h = mix(h, fbm(p * 1.6, 5.0), 0.14);
  return clamp(h, 0.0, 1.0);
}

// ---------------------------------------------------------------------------
// Flowing fine-sand grain. Two value-noise layers sampled at high frequency,
// scrolled along the wind at different rates so the texture shimmers and
// drifts instead of tiling. Returns a signed value centred on 0.
// ---------------------------------------------------------------------------
float flowingGrain(vec2 uv, float t) {
  vec2 wind = normalize(u_windDir + 1e-4);
  vec2 p = uv * vec2(u_aspect, 1.0);
  vec2 drift = wind * t * u_grainFlow;

  float g1 = vnoise(p * u_grainScale + drift);
  float g2 = vnoise(p * u_grainScale * 2.17 - drift * 1.6 + 23.0);
  float g = mix(g1, g2, 0.5);
  return (g - 0.5);
}

// ---------------------------------------------------------------------------
// Loose drift sand along the dune crests. Coordinates are rotated into the
// wind frame and stretched, so grains read as thin wind-blown streaks; they
// scroll along the wind and twinkle. Masked by `edge` so they only appear
// where the dune surface is steep (the crest lines), like sand catching on a
// ridge. `disturb` adds a local burst around the pointer.
// ---------------------------------------------------------------------------
float driftSand(vec2 uv, float edge, float disturb, float t) {
  vec2 wind = normalize(u_windDir + 1e-4);
  vec2 perp = vec2(-wind.y, wind.x);
  vec2 p = uv * vec2(u_aspect, 1.0);

  // Into the wind frame, stretched: long along the wind, tight across it.
  vec2 q = vec2(dot(p, wind), dot(p, perp));
  q.x += t * u_driftSpeed;
  q *= vec2(22.0, 90.0);

  vec2 cell = floor(q);
  float n = hash21(cell);
  // Sparse threshold -> discrete grains; lower threshold near the pointer.
  float thresh = mix(0.978, 0.90, clamp(disturb, 0.0, 1.0));
  float spark = step(thresh, n);
  // Soften each grain within its cell and twinkle it over time.
  vec2 f = fract(q) - 0.5;
  spark *= smoothstep(0.5, 0.0, length(f * vec2(1.0, 0.6)));
  spark *= 0.45 + 0.55 * sin(t * 7.0 + n * 60.0);

  return spark * (edge + disturb) * u_driftAmount;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv * vec2(u_aspect, 1.0) * u_duneScale;
  float t = u_time;

  // Pointer disturbance: a soft gaussian that follows the cursor and rides its
  // momentum, used to nudge the dunes and stir up extra drift sand.
  float disturb = 0.0;
  vec2 pointerPush = vec2(0.0);
  if (u_pointer.x >= 0.0) {
    vec2 toP = (uv - u_pointer) * vec2(u_aspect, 1.0);
    float d2 = dot(toP, toP);
    disturb = exp(-d2 / 0.020) * u_pointerStrength;
    pointerPush = u_pointerDrag * disturb * 6.0;
  }

  // 1. Dune height + a finite-difference gradient for lighting & crest edges.
  float e = 0.012 * u_duneScale;
  float h  = duneHeight(p + pointerPush, t);
  float hx = duneHeight(p + pointerPush + vec2(e, 0.0), t);
  float hy = duneHeight(p + pointerPush + vec2(0.0, e), t);
  vec2 grad = vec2(hx - h, hy - h) / e;
  float slope = clamp(length(grad), 0.0, 1.0);

  // Simple directional light: crests facing the wind catch warm light.
  vec2 lightDir = normalize(vec2(0.6, 0.8));
  float lit = clamp(0.5 + 0.6 * dot(normalize(grad + 1e-4), lightDir), 0.0, 1.0);

  // 2. Sand shading. The dune faces read as soft periwinkle bands separating
  //    lighter crests — a crisp-ish height ramp gives the wave layering, then
  //    troughs deepen to shadow and lit crests pick up the warm highlight.
  float band = smoothstep(0.33, 0.67, h);
  vec3 col = mixOklab(u_sandBlue, u_sandLight, band);
  col = mixOklab(col, u_sandShadow, smoothstep(0.34, 0.0, h) * 0.65);
  col = mixOklab(col, u_sandWarm, lit * smoothstep(0.55, 1.0, h));

  // Slope shading: the steep faces between bands darken slightly, deepening
  // the sense of overlapping dune layers.
  col = mixOklab(col, u_sandShadow, slope * 0.18);

  // Gentle large-scale wash so the corners differ like the reference (cool
  // lower-left, warm upper-right).
  float wash = smoothstep(0.0, 1.0, uv.x * 0.6 + uv.y * 0.4);
  col = mixOklab(col, u_sandWarm, wash * 0.10);

  // 3. Flowing grain — modulates lightness only, so it reads as sand texture
  //    rather than colour noise. Slightly stronger in shadow (matte sand).
  float grain = flowingGrain(uv, t);
  float grainAmt = u_grainStrength * (0.6 + 0.4 * (1.0 - h));
  col *= 1.0 + grain * grainAmt;

  // 4. Drift sand along the crests (steep slope = crest line).
  float edge = smoothstep(0.15, 0.6, slope);
  float drift = driftSand(uv, edge, disturb, t);
  col = mixOklab(col, u_sandLight, clamp(drift, 0.0, 1.0));

  gl_FragColor = vec4(linearToSrgb(col), 1.0);
}
