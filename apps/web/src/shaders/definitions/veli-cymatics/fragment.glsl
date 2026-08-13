// ===========================================================================
// Veli Cymatics — procedural sand settling on the nodal lines of a vibrating
// Chladni plate. Inspired by the designer's particle study, but expressed as
// one GPU pass so the homepage keeps a small, resilient runtime.
//
// Visual layers:
//   1. Mineral plate — a quiet Sage surface with a faint Teal atmospheric wash.
//   2. Standing wave — two slowly changing frequencies create nodal contours.
//   3. Sand grains — a jittered particle lattice accumulates on those contours.
//   4. Vibration — pointer movement locally parts and gathers the grains.
//   5. Reading zone — contrast recedes through the central hero-copy area.
// ===========================================================================

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_aspect;
uniform vec2 u_pointer;
uniform vec2 u_pointerDrag;
uniform float u_pointerPresence;
uniform float u_quality;
uniform float u_theme; // 0.0 light, 1.0 dark (provided by the renderer)
uniform float u_motion; // 0.0 reduced motion, 1.0 animated

uniform vec3 u_lightBase;
uniform vec3 u_lightWash;
uniform vec3 u_lightGrain;
uniform vec3 u_lightAccent;
uniform vec3 u_darkBase;
uniform vec3 u_darkWash;
uniform vec3 u_darkGrain;
uniform vec3 u_darkAccent;

uniform float u_frequencyA;
uniform float u_frequencyB;
uniform float u_nodeWidth;
uniform float u_patternScale;
uniform float u_morphSpeed;

uniform float u_grainSize;
uniform float u_grainDensity;
uniform float u_dustAmount;
uniform float u_pointerStrength;

float chladni(vec2 p, float a, float b) {
  return 0.5 * (
    cos(a * PI * p.x) * cos(b * PI * p.y) -
    cos(b * PI * p.x) * cos(a * PI * p.y)
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float theme = clamp(u_theme, 0.0, 1.0);
  // Reduced-motion renders the fully settled composition rather than freezing
  // the energetic first frame of the entrance choreography.
  float motionTime = mix(12.0, u_time, u_motion);
  float formation = smoothstep(0.2, 4.2, motionTime);
  float introEnergy = 1.0 - formation;

  vec3 base = mixOklab(u_lightBase, u_darkBase, theme);
  vec3 washColor = mixOklab(u_lightWash, u_darkWash, theme);
  vec3 grainColor = mixOklab(u_lightGrain, u_darkGrain, theme);
  vec3 accent = mixOklab(u_lightAccent, u_darkAccent, theme);

  // A soft mineral surface. The restrained wash gives the empty areas enough
  // depth to feel material without becoming a generic gradient background.
  float wash = 0.5 + 0.5 * sin((uv.x * 0.72 + uv.y * 0.42) * PI - 0.35);
  float edgeShade = smoothstep(0.22, 0.92, length((uv - 0.5) * vec2(0.82, 1.0)));
  vec3 color = mixOklab(base, washColor, 0.34 * wash);
  color = mixOklab(color, base, edgeShade * 0.18);

  // Plate coordinates. A small fixed rotation avoids a perfectly axial,
  // diagram-like result; slow sine warps make the plate feel handmade.
  vec2 plateOrigin = (uv - 0.5) * vec2(u_aspect, 1.0) * 2.0 * u_patternScale;
  float plateRadius = length(plateOrigin);
  float introTurn = introEnergy * (1.08 - 0.24 * min(plateRadius, 2.0));
  vec2 p = rot2(-0.13 + introTurn) * plateOrigin;
  float phase = motionTime * u_morphSpeed;
  vec2 introSweep = normalize(p + vec2(0.0001)) * introEnergy;
  introSweep *= 0.13 * sin(plateRadius * 11.0 - motionTime * 4.4);
  vec2 imperfect = vec2(
    sin(p.y * 1.7 + phase * 0.7),
    sin(p.x * 1.45 - phase * 0.55)
  ) * 0.028;
  imperfect += introSweep;

  float pointerDisturb = 0.0;
  float pointerRing = 0.0;
  if (u_pointer.x >= 0.0 && u_pointerPresence > 0.001) {
    vec2 toPointer = (uv - u_pointer) * vec2(u_aspect, 1.0);
    float d = length(toPointer);
    pointerDisturb = exp(-d * d / 0.022) * u_pointerStrength * u_pointerPresence;
    pointerRing = exp(-abs(d - 0.12) * 32.0) * u_pointerStrength * u_pointerPresence;
    imperfect -= u_pointerDrag * pointerDisturb * 2.8;
  }

  float freqA = u_frequencyA + 0.22 * sin(phase * 0.83 + 0.4);
  float freqB = u_frequencyB + 0.28 * sin(phase * 0.61 + 2.1);
  float field = abs(chladni(p + imperfect, freqA, freqB));
  float node = 1.0 - smoothstep(0.018, u_nodeWidth, field);
  float nodeHalo = exp(-field * 8.5);

  // Before the Chladni field settles, grains travel through rotating radial
  // lanes. Blending the lane density into the final nodes makes the entrance
  // read as a troupe coherently finding formation rather than random noise.
  float introAngle = atan(p.y, p.x);
  float introField = abs(
    sin(plateRadius * 12.0 - motionTime * 4.8 + sin(introAngle * 3.0 + motionTime) * 0.9)
  );
  float introNode = 1.0 - smoothstep(0.045, 0.34, introField);
  float particleNode = mix(introNode, node, formation);

  // Leave the foreground copy in a deliberately calm pocket. The field still
  // ghosts through at low contrast, keeping the canvas continuous rather than
  // looking like a panel was placed behind the text.
  float safeDistance = length((uv - vec2(0.5, 0.51)) * vec2(1.22, 1.0));
  float safeZone = 1.0 - smoothstep(0.26, 0.49, safeDistance);
  float patternPresence = mix(0.14, 1.0, 1.0 - safeZone);

  // A faint continuous deposit beneath the discrete grains helps the pattern
  // read at a distance and on lower-density mobile rendering.
  float contour = nodeHalo * patternPresence;
  color = mixOklab(color, accent, contour * mix(0.026, 0.07, theme));
  color = mixOklab(color, grainColor, node * patternPresence * mix(0.035, 0.08, theme));

  // Coherent particle-space advection. The intro drives broad inward, rotating
  // streams; once settled this falls back to a very small continuous drift so
  // the sand remains visibly alive without changing the approved composition.
  vec2 particleUv = uv;
  vec2 fromCenter = (uv - 0.5) * vec2(u_aspect, 1.0);
  float centerDistance = length(fromCenter);
  vec2 centerRadial = fromCenter / max(centerDistance, 0.0001);
  vec2 centerTangent = vec2(-centerRadial.y, centerRadial.x);
  vec2 introAdvection = centerTangent * introEnergy * (0.075 + 0.018 * sin(motionTime * 3.2));
  introAdvection += centerRadial * introEnergy * 0.035 * sin(centerDistance * 18.0 - motionTime * 5.0);
  vec2 ambientAdvection = vec2(
    sin(p.y * 1.8 + phase * 2.7),
    cos(p.x * 1.55 - phase * 2.2)
  ) * 0.0018;
  particleUv += (introAdvection + ambientAdvection) / vec2(u_aspect, 1.0);

  // Hover creates one smooth local current: grains orbit the cursor, open at
  // its center, and gather at the surrounding pressure ring. The whole field
  // moves together, avoiding independent bee-like jitter.
  if (u_pointer.x >= 0.0 && u_pointerPresence > 0.001) {
    vec2 toPointer = (particleUv - u_pointer) * vec2(u_aspect, 1.0);
    float d = length(toPointer);
    vec2 radial = toPointer / max(d, 0.0001);
    vec2 tangent = vec2(-radial.y, radial.x);
    float current = exp(-d * d / 0.032) * u_pointerPresence * u_pointerStrength;
    float carriedMomentum = min(length(u_pointerDrag) * 3.5, 0.012);
    float pulse = sin(motionTime * 1.45 - d * 13.0) * 0.0026;
    vec2 kineticAdvection = tangent * current * (0.0085 + carriedMomentum);
    kineticAdvection += radial * current * pulse;
    particleUv += kineticAdvection / vec2(u_aspect, 1.0);
  }

  // One jittered point per lattice cell. Acceptance probability follows the
  // active formation field, recreating grains migrating to its quiet lines.
  float cellSize = u_grainSize / mix(1.0, 0.88, 1.0 - u_quality);
  vec2 particlePx = particleUv * u_resolution;
  vec2 cell = floor(particlePx / cellSize);
  vec2 local = fract(particlePx / cellSize);
  float seed = hash21(cell + 19.17);
  vec2 jitter = vec2(hash21(cell + 2.3), hash21(cell + 71.7));
  float depth = pow(clamp(particleNode, 0.0, 1.0), 0.68);
  float sizeVariation = mix(0.82, 1.18, hash21(cell + 41.2));
  float radius = mix(0.052, 0.225, depth) * sizeVariation;
  float grain = 1.0 - smoothstep(radius, radius + 0.09, length(local - jitter));

  float density = u_dustAmount + depth * u_grainDensity * patternPresence;
  density += pointerRing * 0.3;
  density *= 1.0 - pointerDisturb * 0.58;
  grain *= 1.0 - step(density, seed);

  float glint = smoothstep(0.84, 0.99, hash21(cell + 103.4));
  vec3 particleColor = mixOklab(grainColor, accent, glint * mix(0.28, 0.56, theme));
  float particleOpacity = grain * mix(0.52, 0.78, theme);
  color = mixOklab(color, particleColor, particleOpacity);

  // Sparse loose grains move along the plate like airborne dust. They are
  // intentionally absent from the reading zone and reduced on lower quality.
  vec2 driftCell = floor((gl_FragCoord.xy + vec2(motionTime * 7.0, -motionTime * 2.2)) / (cellSize * 1.7));
  vec2 driftLocal = fract((gl_FragCoord.xy + vec2(motionTime * 7.0, -motionTime * 2.2)) / (cellSize * 1.7));
  float driftSeed = hash21(driftCell + 211.0);
  float drift = (1.0 - step(u_dustAmount * 0.44 * u_quality, driftSeed));
  drift *= 1.0 - smoothstep(0.08, 0.22, length(driftLocal - 0.5));
  drift *= 1.0 - safeZone;
  color = mixOklab(color, accent, drift * mix(0.16, 0.28, theme));

  // Fine matte variation, fixed in screen space to keep it calm in motion.
  float mineral = hash21(gl_FragCoord.xy * 0.53) - 0.5;
  color *= 1.0 + mineral * mix(0.018, 0.03, theme);

  gl_FragColor = vec4(linearToSrgb(color), 1.0);
}
