import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createErrorArtwork } from '../src/error-page/error-artwork-engine.ts';
import notFound from '../src/error-page/artwork-data/404.ts';
import offline from '../src/error-page/artwork-data/offline.ts';

function environment(t, reduced = false) {
  const frames = new Map();
  let frameId = 0;
  const queries = new Map();
  const events = new Map();
  const arcs = [];
  const ctx = {
    setTransform() {},
    clearRect() {},
    beginPath() {},
    arc(...args) {
      arcs.push(args);
    },
    fill() {},
    fillStyle: '',
  };
  const probe = {
    clearRect() {},
    fillStyle: '',
    fillRect() {},
    getImageData() {
      return { data: [20, 100, 120, 255] };
    },
  };
  let resize;
  let intersect;
  let resizeDisconnected = false;
  let intersectionDisconnected = false;
  const document = {
    hidden: false,
    createElement: () => ({ getContext: () => probe }),
    addEventListener: (name, callback) => events.set(name, callback),
    removeEventListener: (name) => events.delete(name),
  };
  const globals = {
    document,
    window: {
      devicePixelRatio: 1,
      matchMedia: (name) => {
        const query = {
          matches: name.includes('reduced-motion') ? reduced : true,
          addEventListener: (_name, cb) => {
            query.listener = cb;
          },
          removeEventListener: () => {
            delete query.listener;
          },
        };
        queries.set(name, query);
        return query;
      },
    },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    requestAnimationFrame: (cb) => {
      frames.set(++frameId, cb);
      return frameId;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    ResizeObserver: class {
      constructor(callback) {
        resize = callback;
      }
      observe() {}
      disconnect() {
        resizeDisconnected = true;
      }
    },
    IntersectionObserver: class {
      constructor(callback) {
        intersect = callback;
      }
      observe() {}
      disconnect() {
        intersectionDisconnected = true;
      }
    },
  };
  const saved = new Map(
    Object.keys(globals).map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]),
  );
  for (const [name, value] of Object.entries(globals))
    Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
  t.after(() => {
    for (const [name, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  let width = 936;
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width, height: 380 }),
  };
  return {
    canvas,
    frames,
    queries,
    events,
    arcs,
    document,
    resize: (value) => {
      width = value;
      resize();
    },
    intersect: (visible) => intersect([{ isIntersecting: visible }]),
    disconnected: () => resizeDisconnected && intersectionDisconnected,
  };
}

test('reduced motion draws usable artwork, changes styles immediately, and releases observers', (t) => {
  const e = environment(t, true);
  const art = createErrorArtwork(e.canvas, '404', notFound);
  assert.ok(art);
  assert.ok(e.arcs.length > 0);
  const before = e.arcs.length;
  art.next();
  assert.ok(e.arcs.length > before);
  assert.equal(e.frames.size, 0);
  art.dispose();
  assert.ok(e.disconnected());
  assert.equal(e.events.size, 0);
  assert.ok([...e.queries.values()].every((query) => !query.listener));
});

test('pause stays in effect through theme, visibility and resize changes; resume and dispose manage frames', (t) => {
  const e = environment(t);
  const art = createErrorArtwork(e.canvas, 'offline', offline);
  assert.equal(e.frames.size, 1);
  art.pause(true);
  assert.equal(e.frames.size, 0);
  art.refreshPalette();
  e.resize(320);
  e.intersect(false);
  e.intersect(true);
  assert.equal(e.frames.size, 0);
  art.pause(false);
  assert.equal(e.frames.size, 1);
  e.document.hidden = true;
  e.events.get('visibilitychange')();
  assert.equal(e.frames.size, 0);
  e.document.hidden = false;
  e.events.get('visibilitychange')();
  assert.equal(e.frames.size, 1);
  e.intersect(false);
  assert.equal(e.frames.size, 0);
  e.intersect(true);
  assert.equal(e.frames.size, 1);
  art.dispose();
  assert.equal(e.frames.size, 0);
  assert.ok(e.disconnected());
});

test('static mode and live reduced-motion changes never leave continuous animation running', (t) => {
  const e = environment(t);
  const still = createErrorArtwork(e.canvas, '404', notFound, true);
  assert.ok(e.arcs.length > 0);
  assert.equal(e.frames.size, 0);
  still.dispose();
  const art = createErrorArtwork(e.canvas, 'offline', offline);
  assert.equal(e.frames.size, 1);
  const query = e.queries.get('(prefers-reduced-motion: reduce)');
  query.matches = true;
  query.listener();
  assert.equal(e.frames.size, 0);
  query.matches = false;
  query.listener();
  assert.equal(e.frames.size, 1);
  art.dispose();
});

test('compact geometry follows the canvas container and maps pointer coordinates to the artwork', (t) => {
  const e = environment(t, true);
  const art = createErrorArtwork(e.canvas, '404', notFound);
  assert.deepEqual(art.position(468, 190), { x: 468, y: 190 });
  e.resize(400);
  assert.equal(e.canvas.width, 740);
  assert.equal(e.canvas.height, 331);
  assert.deepEqual(art.position(200, 190), { x: 468, y: 190 });
  e.resize(0);
  assert.equal(art.position(0, 0), undefined);
  art.dispose();
});

test('unavailable canvas has no animation or observer side effects', (t) => {
  const e = environment(t);
  e.canvas.getContext = () => null;
  assert.equal(createErrorArtwork(e.canvas, '404', notFound), null);
  assert.equal(e.frames.size, 0);
  assert.equal(e.events.size, 0);
});

for (const kind of ['401', '403', '404', '500', '503', 'offline']) {
  test(`${kind}: all five baked styles have valid roles and draw statically`, async (t) => {
    const { default: data } = await import(`../src/error-page/artwork-data/${kind}.ts`);
    assert.equal(data.depths.length, 5);
    assert.ok(data.cells.length > 2000);
    assert.ok(
      data.cells.every(
        (cell) =>
          cell.length === 17 &&
          cell.every(Number.isFinite) &&
          [8, 10, 12, 14, 16].every((index) => cell[index] >= 0 && cell[index] <= 5),
      ),
    );
    const e = environment(t, true);
    const art = createErrorArtwork(e.canvas, kind, data);
    for (let style = 0; style < 5; style++) {
      const count = e.arcs.length;
      art.next();
      assert.ok(e.arcs.length > count);
    }
    assert.equal(e.frames.size, 0);
    art.dispose();
  });
}
