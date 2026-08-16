// Shore Cymatics — illuminated water causally shaping a cymatic sand field.

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
uniform vec3 u_lightAccent;
uniform vec3 u_lightReading;
uniform vec3 u_darkDeep;
uniform vec3 u_darkMid;
uniform vec3 u_darkShine;
uniform vec3 u_darkGrain;
uniform vec3 u_darkAccent;
uniform vec3 u_darkReading;

uniform vec2 u_gradientDirection;
uniform float u_gradientOffset;
uniform vec2 u_lightPositionA;
uniform vec2 u_lightPositionB;
uniform float u_lightSpread;
uniform float u_lightIntensity;
uniform float u_wanderAmount;
uniform float u_wanderSpeed;
uniform float u_swashAmount;
uniform float u_causticScale;
uniform float u_causticStrength;
uniform float u_frequencyA;
uniform float u_frequencyB;
uniform float u_nodeWidth;
uniform float u_patternScale;
uniform float u_morphSpeed;
uniform float u_fusionStrength;
uniform float u_grainSize;
uniform float u_grainDensity;
uniform float u_looseGrain;
uniform float u_driftSpeed;
uniform float u_pointerStrength;
uniform vec2 u_safeZoneCenter;
uniform vec2 u_safeZoneSize;
uniform float u_safeZoneStrength;

float gaussianLight(vec2 uv, vec2 position, float radius) {
  vec2 delta = (uv - position) * vec2(u_aspect, 1.0);
  return exp(-dot(delta, delta) / max(radius * radius, 0.0001));
}

float shorePhase(float time) {
  float cycleTime = time / 12.0;
  float cycle = fract(cycleTime);
  float calm = 0.32 * cycle / 0.55;
  float surgeT = clamp((cycle - 0.55) / 0.45, 0.0, 1.0);
  float surgeEase = surgeT * surgeT * (3.0 - 2.0 * surgeT);
  return floor(cycleTime) + mix(calm, 0.32 + 0.68 * surgeEase, step(0.55, cycle));
}

float chladni(vec2 p, float a, float b) {
  return 0.5 * (
    cos(a * PI * p.x) * cos(b * PI * p.y) -
    cos(b * PI * p.x) * cos(a * PI * p.y)
  );
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
  vec3 accent = mixOklab(u_lightAccent, u_darkAccent, theme);
  vec3 readingColor = mixOklab(u_lightReading, u_darkReading, theme);

  float wanderTime = motionTime * 0.07 * u_wanderSpeed;
  vec2 wanderA = vec2(sin(wanderTime), sin(wanderTime * 0.79 + 1.0));
  vec2 wanderB = vec2(sin(wanderTime + 2.4), sin(wanderTime * 0.79 + 5.08));
  wanderA *= vec2(0.03, 0.022) * u_wanderAmount;
  wanderB *= vec2(0.03, 0.022) * u_wanderAmount;

  vec2 pointerParallax = vec2(0.0);
  if (u_pointer.x >= 0.0) {
    pointerParallax = (u_pointer - 0.5) * vec2(0.055, -0.045);
    pointerParallax *= u_pointerPresence * u_pointerStrength;
  }

  vec2 lightA = u_lightPositionA + wanderA + pointerParallax;
  vec2 lightB = u_lightPositionB + wanderB + pointerParallax * 0.7;
  lightA += vec2(0.02 * sin(phase * PI), swash * 0.9);
  lightB += vec2(0.02 * sin(phase * PI + 1.7), swash * 0.72);

  float gradient = u_gradientOffset + dot(uv - 0.5, u_gradientDirection);
  float lightField = gaussianLight(uv, lightA, u_lightSpread) * 1.1;
  lightField += gaussianLight(uv, lightB, u_lightSpread * 0.94) * 0.55;
  lightField = clamp(gradient + lightField * u_lightIntensity, 0.0, 1.0);

  vec3 color = mixOklab(deep, mid, smoothstep(0.0, 0.62, lightField));
  color = mixOklab(color, shine, smoothstep(0.52, 0.98, lightField));

  vec2 water = (uv - 0.5) * vec2(u_aspect, 1.0) * u_causticScale;
  float waterTime = motionTime * 0.12;
  water += vec2(fbm(water * 0.26 + waterTime * 0.08, 3.0), fbm(water * 0.31 - waterTime * 0.06, 3.0));
  float ribbonA = abs(sin(water.x + sin(water.y * 0.72 + waterTime)));
  float ribbonB = abs(cos(water.y * 0.91 - cos(water.x * 0.64 - waterTime * 0.8)));
  float caustic = pow(1.0 - min(ribbonA, ribbonB), 4.2);
  caustic *= smoothstep(0.12, 0.92, lightField);
  color = mixOklab(color, shine, caustic * u_causticStrength);

  // The illuminated water displaces the plate, widens its quiet nodes, and
  // increases their sand capacity. This is the causal bridge between scenes.
  vec2 plate = (uv - 0.5) * vec2(u_aspect, 1.0) * 2.0 * u_patternScale;
  plate = rot2(-0.13 + swash * 0.22) * plate;
  float breathing = motionTime * u_morphSpeed;
  vec2 waterPull = vec2(
    sin(plate.y * 1.7 + breathing),
    sin(plate.x * 1.45 - breathing * 0.8)
  );
  waterPull *= 0.022 + lightField * 0.018 * u_fusionStrength;
  waterPull += u_pointerDrag * u_pointerPresence * u_pointerStrength * 1.8;

  float freqA = u_frequencyA + 0.2 * sin(breathing * 0.83 + lightField * 0.6);
  float freqB = u_frequencyB + 0.25 * sin(breathing * 0.61 + 2.1 - lightField * 0.45);
  float field = abs(chladni(plate + waterPull, freqA, freqB));
  float localNodeWidth = u_nodeWidth * mix(0.72, 1.34, lightField * u_fusionStrength);
  float node = 1.0 - smoothstep(0.018, localNodeWidth, field);
  float nodeHalo = exp(-field * mix(10.0, 6.8, lightField));

  float safeDistance = length((uv - u_safeZoneCenter) / max(u_safeZoneSize, vec2(0.001)));
  float safeZone = 1.0 - smoothstep(0.58, 1.0, safeDistance);
  float detailPresence = mix(1.0 - u_safeZoneStrength, 1.0, 1.0 - safeZone);
  color = mixOklab(color, accent, nodeHalo * detailPresence * mix(0.025, 0.075, theme));

  // Grains flow with the Shore swash before being accepted by the light-shaped
  // nodes. A small loose fraction remains free on the ocean floor.
  vec2 particleUv = uv;
  particleUv.x += phase * 0.0016 * u_driftSpeed;
  particleUv.y += swash * 0.022 * u_driftSpeed;
  particleUv += u_pointerDrag * u_pointerPresence * u_pointerStrength * 0.28;
  float cellSize = u_grainSize / mix(1.0, 0.86, 1.0 - u_quality);
  vec2 particlePx = particleUv * u_resolution;
  vec2 cell = floor(particlePx / cellSize);
  vec2 local = fract(particlePx / cellSize);
  vec2 jitter = vec2(hash21(cell + 11.3), hash21(cell + 73.1));
  float seed = hash21(cell + 137.2);
  float radius = mix(0.07, 0.215, hash21(cell + 43.7));
  float grain = 1.0 - smoothstep(radius, radius + 0.09, length(local - jitter));
  float nodeCapacity = pow(node, 0.7) * u_grainDensity;
  nodeCapacity *= mix(0.52, 1.0 + 0.45 * u_fusionStrength, lightField);
  float density = (u_looseGrain + nodeCapacity) * detailPresence;
  grain *= 1.0 - step(density, seed);
  float glint = smoothstep(0.82, 0.99, hash21(cell + 207.4)) * lightField;
  vec3 particleColor = mixOklab(grainColor, accent, glint);
  color = mixOklab(color, particleColor, grain * mix(0.58, 0.78, theme));

  color = mixOklab(color, readingColor, safeZone * u_safeZoneStrength * 0.48);
  float mineral = hash21(gl_FragCoord.xy * 0.53) - 0.5;
  color *= 1.0 + mineral * mix(0.014, 0.026, theme);

  gl_FragColor = vec4(linearToSrgb(color), 1.0);
}
