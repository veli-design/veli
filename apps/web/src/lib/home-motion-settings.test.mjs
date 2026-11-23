import assert from 'node:assert/strict';
import test from 'node:test';
import { homeMotionSettings } from '../scripts/home-motion-settings.js';

test('hero uses the PD-1417 final export rather than raw prototype defaults', () => {
  const expected = {
    dotSize: 2.3,
    flowScale: 493,
    colorA: '#50cf00',
    colorB: '#50cf00',
    coverage: 0.19,
    heroHeight: 1060,
    falloff: 170,
    tail: 0.06,
    introSpeed: 0.701,
    bgSpeed: 0.76,
    scrollLag: 0.031,
  };
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(homeMotionSettings[key], value, key);
  }
});

test('hero tuning preserves the existing card stipple settings', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(homeMotionSettings).filter(([key]) => key.startsWith('st'))),
    {
      stDot: 1.82,
      stPitch: 0.725,
      stLoose: 3.63,
      stSpeed: 0.0423,
      stEvolve: 0.534,
      stClear: 0,
      stScatter: 0.86,
      stScatterRadius: 65,
      stHoverSpeed: 1.93,
      stColorTime: 0.194,
    },
  );
});
