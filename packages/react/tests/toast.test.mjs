import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createToastQueue, Toast, ToastContent } from '@veli-design/react/toast';
import { UNSTABLE_ToastStateContext as ToastStateContext } from 'react-aria-components';
import { VeliProvider } from '@veli-design/react/provider';

const renderToast = (toast, props = {}, language = 'en') =>
  renderToStaticMarkup(
    h(
      VeliProvider,
      { language },
      h(
        ToastStateContext.Provider,
        { value: { visibleToasts: [toast], close() {}, add() {}, pauseAll() {}, resumeAll() {} } },
        h(Toast, { toast, ...props }),
      ),
    ),
  );
const render = (content = {}, toastProps = {}) => {
  const queue = createToastQueue();
  queue.add({ title: 'Notification', ...content });
  return renderToast(queue.visibleToasts[0], toastProps);
};

test('Toast renders every intent and appearance using canonical tokens', () => {
  for (const appearance of ['outline', 'subtle', 'emphasis']) {
    for (const [intent, token] of [
      ['neutral', 'neutral'],
      ['info', 'info'],
      ['positive', 'success'],
      ['cautious', 'caution'],
      ['warning', 'warning'],
      ['danger', 'danger'],
    ]) {
      const html = render({ intent, appearance, description: 'Details' });
      assert.match(
        html,
        new RegExp(`border-status-${token}-${appearance === 'emphasis' ? 'emphasis' : 'subtle'}`),
      );
      assert.doesNotMatch(html, /text-text-|text-icon-default-|status-cautious-|bg-gray-alpha-/);
    }
  }
});

test('zero descriptions and optional close buttons preserve the content contract', () => {
  assert.match(render({ description: 0 }), /slot="description"[^>]*>0</);
  assert.match(render(), /aria-label="Close notification"/);
  assert.doesNotMatch(render({ showCloseButton: false }), /aria-label="Close notification"/);
  assert.doesNotMatch(render({ description: false }), /slot="description"/);
});

test('Toast forwards static and callback children, className and style', () => {
  const html = render(
    {},
    {
      className: ({ toast }) => (toast.content.title === 'Notification' ? 'toast-custom' : ''),
      style: () => ({ margin: 3 }),
      children: ({ toast }) => h(ToastContent, { toast, className: 'content-custom' }),
    },
  );
  for (const value of ['toast-custom', 'content-custom', 'margin:3px'])
    assert.ok(html.includes(value), value);
  assert.doesNotMatch(html, /aria-label="Close notification"/);
  assert.match(render({}, { children: h('span', {}, 'Custom content') }), /Custom content/);
});

test('placement movement and progress origin mirror with RTL', () => {
  const queue = createToastQueue();
  queue.add({ title: 'ނޮޓިފިކޭޝަން', showProgress: true }, { timeout: 5000 });
  const html = renderToast(queue.visibleToasts[0], {}, 'dv');
  assert.match(html, /lang="dv" dir="rtl"/);
  assert.match(html, /view-transition-class:toast toast-from-left/);
  assert.match(html, /rtl:origin-right/);
  assert.match(html, /aria-label="ނޮޓިފިކޭޝަން ބަންދުކުރޭ"/);
});

test('duplicate labels, element labels and accent actions preserve rendered content', () => {
  const html = render({
    actions: [
      { label: 'Retry' },
      { label: 'Retry' },
      { id: 'same', label: h('b', {}, 'Later') },
      { id: 'same', label: 'Dismiss' },
      { intent: 'accent', appearance: 'ghost', label: 'Accent' },
    ],
  });
  assert.equal((html.match(/>Retry</g) ?? []).length, 2);
  assert.match(html, /bg-button-accent/);
});

test('progress is decorative and only rendered for timed toasts', () => {
  assert.doesNotMatch(render({ showProgress: true }), /bg-toast-progress-track/);
  const queue = createToastQueue();
  queue.add({ title: 'Saved', showProgress: true, appearance: 'emphasis' }, { timeout: 5000 });
  const html = renderToast(queue.visibleToasts[0]);
  assert.match(html, /aria-hidden="true"[^>]*class="[^"]*bg-toast-progress-track-emphasis/);
  assert.match(html, /bg-toast-progress-fill-emphasis/);
});

function withViewTransitions(run, reduce = false) {
  const descriptors = new Map(
    ['document', 'window', 'CSS'].map((name) => [
      name,
      Object.getOwnPropertyDescriptor(globalThis, name),
    ]),
  );
  const callbacks = [];
  const transitions = [];
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      startViewTransition(fn) {
        callbacks.push(fn);
        const transition = {
          skipTransition() {
            this.skipped = true;
          },
          updateCallbackDone: Promise.resolve(),
          ready: Promise.resolve(),
          finished: Promise.resolve(),
        };
        transitions.push(transition);
        return transition;
      },
    },
  });
  Object.defineProperty(globalThis, 'CSS', { configurable: true, value: { supports: () => true } });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { matchMedia: () => ({ matches: reduce }) },
  });
  try {
    run({ callbacks, transitions });
  } finally {
    for (const [name, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
}

test('rapid add, close and clear notify once per update despite delayed transition callbacks', () => {
  withViewTransitions(({ callbacks, transitions }) => {
    const queue = createToastQueue({ maxVisibleToasts: 2 });
    let updates = 0;
    const snapshots = [];
    queue.subscribe(() => {
      updates++;
      snapshots.push(queue.visibleToasts.map((toast) => toast.content.title));
    });
    const key = queue.add({ title: 'First' });
    queue.add({ title: 'Second' });
    assert.equal(updates, 1);
    queue.close(key);
    queue.clear();
    assert.equal(queue.visibleToasts.length, 0);
    callbacks.forEach((fn) => fn());
    assert.equal(updates, 4);
    assert.deepEqual(snapshots, [['First'], ['Second', 'First'], ['Second'], []]);
    assert.ok(transitions.slice(0, -1).every((t) => t.skipped));
  });
});

test('caller wrapUpdate is preserved, receives actions and never starts a default transition', () => {
  withViewTransitions(({ callbacks }) => {
    const actions = [];
    const queue = createToastQueue({
      wrapUpdate(fn, action) {
        actions.push(action);
        fn();
      },
    });
    const key = queue.add('Hello');
    queue.close(key);
    queue.clear();
    assert.deepEqual(actions, ['add', 'remove', 'clear']);
    assert.equal(callbacks.length, 0);
  });
});

test('reduced motion delivers updates immediately without view transitions', () => {
  withViewTransitions(({ callbacks }) => {
    const queue = createToastQueue();
    let updates = 0;
    queue.subscribe(() => updates++);
    queue.add('Hello');
    queue.clear();
    assert.equal(updates, 2);
    assert.equal(callbacks.length, 0);
  }, true);
  const css = readFileSync(new URL('../tailwind.css', import.meta.url), 'utf8');
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*::view-transition-new\(\.toast\)[\s\S]*animation: none/,
  );
});

test('failed transition startup still delivers its update once', () => {
  withViewTransitions(() => {
    globalThis.document.startViewTransition = () => {
      throw new Error('Unavailable');
    };
    const queue = createToastQueue();
    let updates = 0;
    queue.subscribe(() => updates++);
    queue.add('Hello');
    assert.equal(updates, 1);
    assert.equal(queue.visibleToasts.length, 1);
  });
});

test('browsers without view-transition classes update immediately', () => {
  withViewTransitions(({ callbacks }) => {
    globalThis.CSS.supports = () => false;
    const queue = createToastQueue();
    let updates = 0;
    queue.subscribe(() => updates++);
    queue.add('Hello');
    assert.equal(updates, 1);
    assert.equal(callbacks.length, 0);
  });
});
