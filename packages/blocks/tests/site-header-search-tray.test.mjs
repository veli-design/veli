import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getSearchTrayMaxHeight,
  TRAY_BOTTOM_GAP,
  TRAY_GAP,
} from '../src/site-header/search-tray.ts';

// Tray top = containerTop + targetTop + targetHeight + TRAY_GAP. The bottom of the tray must stay
// TRAY_BOTTOM_GAP above the viewport bottom.
const tray = (overrides) =>
  getSearchTrayMaxHeight({
    viewportHeight: 800,
    containerTop: 0,
    targetTop: 10,
    targetHeight: 44,
    ...overrides,
  });

test('tray height leaves the space below the trigger inside the viewport', () => {
  const height = tray({ viewportHeight: 320 });
  assert.equal(height, 320 - (10 + 44 + TRAY_GAP) - TRAY_BOTTOM_GAP);
  assert.equal(height, 246);
});

test('tray height accounts for the container offset above the viewport', () => {
  const offset = tray({ containerTop: 40, viewportHeight: 320 });
  assert.equal(offset, tray({ viewportHeight: 320 }) - 40);
});

test('tray height has no minimum on a short viewport', () => {
  // The previous floor of 140px let the tray extend past a 280px viewport. Only the space that
  // really exists below the trigger is available: 280 - (0 + 200 + 4) - 16 = 60.
  const height = tray({ viewportHeight: 280, targetTop: 0, targetHeight: 200 });
  assert.equal(height, 60);
  assert.ok(height < 140);
});

test('tray height never goes negative when the trigger is below the viewport', () => {
  assert.equal(tray({ viewportHeight: 100, targetTop: 300 }), 0);
});

test('tray bottom stays inside the viewport for every short viewport size', () => {
  for (let viewportHeight = 200; viewportHeight <= 400; viewportHeight += 20) {
    const maxHeight = tray({ viewportHeight });
    const trayBottom = 10 + 44 + TRAY_GAP + maxHeight;
    assert.ok(
      trayBottom + TRAY_BOTTOM_GAP <= viewportHeight,
      `tray bottom ${trayBottom} overflows ${viewportHeight}px viewport`,
    );
  }
});
