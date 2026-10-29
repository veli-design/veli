import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createToastQueue, Toast, ToastContent } from '@tradenetcorp/veli-ui/toast';
import { UNSTABLE_ToastStateContext as ToastStateContext } from 'react-aria-components';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

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

test('Toast renders subtle and emphasis with Alert surfaces', () => {
  const intents = ['neutral', 'info', 'positive', 'cautious', 'warning', 'danger'];
  for (const intent of intents) {
    const subtle = render({ intent, appearance: 'subtle', description: 'Details' });
    assert.match(subtle, new RegExp(`bg-alert-light-${intent}-bg`));
    assert.match(subtle, new RegExp(`text-alert-light-${intent}-icon`));
    assert.match(subtle, /border border-base-subtle/);
    assert.match(subtle, /rounded-3xl/);
    assert.match(subtle, /type-body-sm-semibold/);
    assert.match(subtle, /text-base-emphasis/);
    assert.match(subtle, /text-base-strong/);
    assert.match(subtle, /data-slot="toast-icon"/);
    assert.match(subtle, /h-9 w-9/);
    assert.match(subtle, /max-w-none/);
    assert.doesNotMatch(subtle, /text-base-muted|border-status-|bg-status-/);

    const emphasis = render({ intent, appearance: 'emphasis', description: 'Details' });
    assert.match(emphasis, new RegExp(`bg-alert-high-contrast-${intent}-bg`));
    assert.match(emphasis, new RegExp(`text-alert-high-contrast-${intent}-foreground`));
    assert.match(emphasis, new RegExp(`text-alert-high-contrast-${intent}-description`));
    assert.match(emphasis, /rounded-3xl/);
    assert.match(emphasis, /data-slot="toast-icon"/);
    assert.match(emphasis, /data-\[hovered\]:bg-toast-interactive-hover-emphasis/);
    assert.doesNotMatch(
      emphasis,
      /border border-base-subtle|text-base-muted|border-status-|bg-status-|data-\[hovered\]:text-base-strong/,
    );
  }

  const fallback = render({ description: 'Details' });
  assert.match(fallback, /bg-alert-light-neutral-bg/);
  assert.match(fallback, /data-slot="toast-icon"/);
});

test('leading icons follow the content contract', () => {
  assert.doesNotMatch(render({ showLeadingIcon: false }), /data-slot="toast-icon"/);
  const custom = render({
    leadingIcon: h('span', {}, 'Mark'),
    showLeadingIcon: false,
  });
  assert.match(custom, /data-slot="toast-icon"/);
  assert.match(custom, />Mark</);
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
  const subtleQueue = createToastQueue();
  subtleQueue.add({ title: 'Saved', showProgress: true, appearance: 'subtle' }, { timeout: 5000 });
  assert.match(renderToast(subtleQueue.visibleToasts[0]), /bg-toast-progress-track-subtle/);
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
