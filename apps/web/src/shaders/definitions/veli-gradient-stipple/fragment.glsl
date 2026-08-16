// Shore Gradient — a single-pass ocean-floor light field with loose stipple.

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_aspect;
uniform vec2 u_pointer;
uniform vec2 u_pointerDrag;
uniform float u_pointerPresence;
uniform float u_quality;
uniform float u_theme;
uniform float u_motion;

uniform vec3 u_lightDeep;
uniform vec3 u_lightMid;
uniform vec3 u_lightShine;
uniform vec3 u_lightGrain;
uniform vec3 u_lightReading;
uniform vec3 u_darkDeep;
uniform vec3 u_darkMid;
uniform vec3 u_darkShine;
uniform vec3 u_darkGrain;
uniform vec3 u_darkReading;

uniform vec2 u_gradientDirection;
uniform float u_gradientOffset;
uniform vec2 u_lightPositionA;
uniform vec2 u_lightPositionB;
uniform float u_lightRadiusA;
uniform float u_lightRadiusB;
uniform float u_lightIntensity;
uniform float u_wanderAmount;
uniform float u_wanderSpeed;
uniform float u_swashAmount;
uniform float u_causticScale;
uniform float u_causticStrength;
uniform float u_causticSpeed;
uniform float u_grainSize;
uniform float u_grainDensity;
uniform float u_grainGlow;
uniform float u_driftSpeed;
uniform float u_pointerStrength;
uniform vec2 u_safeZoneCenter;
uniform vec2 u_safeZoneSize;
uniform float u_safeZoneStrength;

float gaussianLight(vec2 uv, vec2 position, float radius) {
  vec2 delta = (uv - position) * vec2(u_aspect, 1.0);
  return exp(-dot(delta, delta) / max(radius * radius, 0.0001));
}

// The reference Shore scene spends most of each cycle in a calm crawl, then
// eases through one quick swash. Keeping the clock monotonic prevents pops.
float shorePhase(float time) {
  float cycleTime = time / 12.0;
  float cycle = fract(cycleTime);
  float calm = 0.32 * cycle / 0.55;
  float surgeT = clamp((cycle - 0.55) / 0.45, 0.0, 1.0);
  float surgeEase = surgeT * surgeT * (3.0 - 2.0 * surgeT);
  return floor(cycleTime) + mix(calm, 0.32 + 0.68 * surgeEase, step(0.55, cycle));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float theme = clamp(u_theme, 0.0, 1.0);
  float motionTime = mix(15.0, u_time, u_motion);
  float phase = shorePhase(motionTime * u_wanderSpeed);
  float swash = (
    0.085 * sin(phase * 2.0 * PI) +
    0.028 * sin(phase * 4.0 * PI + 1.1)
  ) * u_swashAmount;

  vec3 deep = mixOklab(u_lightDeep, u_darkDeep, theme);
  vec3 mid = mixOklab(u_lightMid, u_darkMid, theme);
  vec3 shine = mixOklab(u_lightShine, u_darkShine, theme);
  vec3 grainColor = mixOklab(u_lightGrain, u_darkGrain, theme);
  vec3 readingColor = mixOklab(u_lightReading, u_darkReading, theme);

  float wanderTime = motionTime * 0.07 * u_wanderSpeed;
  vec2 wanderA = vec2(sin(wanderTime), sin(wanderTime * 0.79 + 1.0));
  vec2 wanderB = vec2(sin(wanderTime + 2.4), sin(wanderTime * 0.79 + 5.08));
  wanderA *= vec2(0.03, 0.022) * u_wanderAmount;
  wanderB *= vec2(0.03, 0.022) * u_wanderAmount;

  vec2 pointerParallax = vec2(0.0);
  if (u_pointer.x >= 0.0) {
    pointerParallax = (u_pointer - 0.5) * vec2(0.06, -0.05);
    pointerParallax *= u_pointerPresence * u_pointerStrength;
  }

  vec2 lightA = u_lightPositionA + wanderA + pointerParallax;
  vec2 lightB = u_lightPositionB + wanderB + pointerParallax * 0.7;
  lightA += vec2(0.02 * sin(phase * PI), swash * 0.9);
  lightB += vec2(0.02 * sin(phase * PI + 1.7), swash * 0.72);

  float gradient = u_gradientOffset + dot(uv - 0.5, u_gradientDirection);
  float lightField = gaussianLight(uv, lightA, u_lightRadiusA) * 1.1;
  lightField += gaussianLight(uv, lightB, u_lightRadiusB) * 0.55;
  lightField = clamp(gradient + lightField * u_lightIntensity, 0.0, 1.0);

  vec3 color = mixOklab(deep, mid, smoothstep(0.0, 0.62, lightField));
  color = mixOklab(color, shine, smoothstep(0.52, 0.98, lightField));

  // Flowing refraction lives inside the same illumination field. It resembles
  // moving caustic ribbons, never the standing-wave nodes of cymatics.
  vec2 water = (uv - 0.5) * vec2(u_aspect, 1.0) * u_causticScale;
  float waterTime = motionTime * u_causticSpeed;
  water += vec2(fbm(water * 0.26 + waterTime * 0.08, 3.0), fbm(water * 0.31 - waterTime * 0.06, 3.0));
  float ribbonA = abs(sin(water.x + sin(water.y * 0.72 + waterTime)));
  float ribbonB = abs(cos(water.y * 0.91 - cos(water.x * 0.64 - waterTime * 0.8)));
  float caustic = pow(1.0 - min(ribbonA, ribbonB), 4.2);
  caustic *= smoothstep(0.12, 0.92, lightField);
  color = mixOklab(color, shine, caustic * u_causticStrength);

  float shoreY = 0.52 + 0.14 * (uv.x - 0.35);
  shoreY += 0.045 * sin(uv.x * 5.2 + phase * PI + 0.7) + swash;
  float shoreBand = exp(-abs(uv.y - shoreY) * 5.2);

  float safeDistance = length((uv - u_safeZoneCenter) / max(u_safeZoneSize, vec2(0.001)));
  float safeZone = 1.0 - smoothstep(0.58, 1.0, safeDistance);
  float detailPresence = mix(1.0 - u_safeZoneStrength, 1.0, 1.0 - safeZone);

  // One jittered grain per screen-space cell replaces the reference's CPU
  // point buffer. The shoreline only biases density; it does not form nodes.
  vec2 particleUv = uv;
  particleUv += vec2(motionTime * 0.0008, -motionTime * 0.00035) * u_driftSpeed;
  particleUv += u_pointerDrag * u_pointerStrength * u_pointerPresence * 0.32;
  float cellSize = u_grainSize / mix(1.0, 0.86, 1.0 - u_quality);
  vec2 particlePx = particleUv * u_resolution;
  vec2 cell = floor(particlePx / cellSize);
  vec2 local = fract(particlePx / cellSize);
  vec2 jitter = vec2(hash21(cell + 11.3), hash21(cell + 73.1));
  float seed = hash21(cell + 137.2);
  float radius = mix(0.07, 0.2, hash21(cell + 43.7));
  float grain = 1.0 - smoothstep(radius, radius + 0.09, length(local - jitter));
  float density = u_grainDensity * mix(0.38, 1.0, shoreBand);
  density *= mix(0.7, 1.18, lightField) * detailPresence;
  grain *= 1.0 - step(density, seed);
  color = mixOklab(color, grainColor, grain * u_grainGlow);

  // A restrained theme-aware veil guarantees a stable editorial reading zone
  // without cutting an obvious hole in the material field.
  color = mixOklab(color, readingColor, safeZone * u_safeZoneStrength * 0.5);
  float mineral = hash21(gl_FragCoord.xy * 0.53) - 0.5;
  color *= 1.0 + mineral * mix(0.012, 0.024, theme);

  gl_FragColor = vec4(linearToSrgb(color), 1.0);
}
