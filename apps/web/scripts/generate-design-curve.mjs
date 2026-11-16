import { URL } from 'node:url';
import console from 'node:console';
import fs from 'node:fs/promises';
import { prepareCurve, simulate, SAND } from '../src/scripts/design-preview-curve.js';
const info = JSON.parse(
  await fs.readFile(new URL('../src/lib/design-preview.json', import.meta.url), 'utf8'),
);
const I = info.sand;
const { P0, P3, yLin, yCurve, poly, bendAt } = prepareCurve(I);
const sim = simulate(I.curveDots, P0, P3, yLin, yCurve, poly, bendAt, SAND.T);
if ([...sim.d].some((value) => !Number.isFinite(value)))
  throw new Error('Invalid particle simulation');
await fs.writeFile(
  new URL('../public/animations/design/curve-particles.bin', import.meta.url),
  new Uint8Array(sim.d.buffer),
);
console.log(`Baked ${sim.n} frames of ${sim.m} particles from the designer simulation.`);
