import assert from 'node:assert/strict';
import test from 'node:test';
import { validateComponentAnimations } from '../../scripts/validate-component-animations.mjs';

test('all source archives, resources, theme/locale mappings and active posters are valid', () => {
  assert.deepEqual(validateComponentAnimations(), {
    supplied: 156,
    available: 34,
    missing: ['loading-text', 'sheet', 'spinner'],
  });
});

test('strict validation rejects missing animations', () => {
  assert.throws(() => validateComponentAnimations({ requireComplete: true }), /Missing animations/);
});
