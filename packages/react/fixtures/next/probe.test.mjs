import { expect, test, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { VeliProvider, useVeliColorScheme } from '@veli-design/react/provider';
import { Input } from '@veli-design/react/input';
import { PasswordInput } from '@veli-design/react/password-input';
import { Sheet } from '@veli-design/react/sheet';
import { Modal } from '@veli-design/react/modal';
import { createToastQueue, ToastRegion } from '@veli-design/react/toast';
test('published UI resolves and renders without dependency inlining', async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => {
      root.render(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(Input, { label: 'Name' }),
          React.createElement(PasswordInput, { label: 'Password' }),
          React.createElement(Modal, { isOpen: false }, 'Hello'),
          React.createElement(
            Sheet,
            { isOpen: false },
            React.createElement(Sheet.Title, null, 'Details'),
            React.createElement(Sheet.Body, null, 'Content'),
          ),
        ),
      );
    });
    expect(host.querySelectorAll('input')).toHaveLength(2);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

test('system theme changes synchronize the Provider, document and portal inheritance', async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const previousMatchMedia = window.matchMedia;
  const listeners = new Set();
  let dark = false;
  window.matchMedia = () => ({
    get matches() {
      return dark;
    },
    addEventListener(_type, listener) {
      listeners.add(listener);
    },
    removeEventListener(_type, listener) {
      listeners.delete(listener);
    },
  });
  localStorage.clear();
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  function PortalProbe() {
    const { resolvedColorScheme } = useVeliColorScheme();
    return createPortal(
      React.createElement('span', { 'data-portal-theme': resolvedColorScheme }),
      document.body,
    );
  }
  try {
    await act(async () => {
      root.render(
        React.createElement(
          VeliProvider,
          { colorScheme: 'system' },
          React.createElement(PortalProbe),
        ),
      );
    });
    for (const next of ['dark', 'light', 'dark']) {
      await act(async () => {
        dark = next === 'dark';
        for (const listener of listeners) listener({ matches: dark });
      });
      expect(host.querySelector('[data-theme]').dataset.theme).toBe(next);
      expect(document.querySelector('[data-portal-theme]').dataset.portalTheme).toBe(next);
      expect(document.documentElement.dataset.theme).toBe(next);
      expect(document.documentElement.classList.contains('dark')).toBe(dark);
      expect(document.documentElement.style.colorScheme).toBe(next);
    }
  } finally {
    await act(async () => root.unmount());
    host.remove();
    window.matchMedia = previousMatchMedia;
    document.documentElement.classList.remove('dark');
    delete document.documentElement.dataset.theme;
    document.documentElement.style.colorScheme = '';
  }
});

test.each([
  ['dark system preference', true, null, 'dark'],
  ['stored dark preference on a light system', false, 'dark', 'dark'],
  ['stored light preference on a dark system', true, 'light', 'light'],
])(
  'system-theme hydration preserves the initialized document theme: %s',
  async (_label, systemDark, storedTheme, expectedTheme) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const previousMatchMedia = window.matchMedia;
    window.matchMedia = () => ({
      matches: systemDark,
      addEventListener() {},
      removeEventListener() {},
    });
    const storageKey = 'veli-color-scheme';
    const previousStoredTheme = localStorage.getItem(storageKey);
    if (storedTheme == null) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, storedTheme);
    const documentRoot = document.documentElement;
    const previousClass = documentRoot.getAttribute('class');
    const previousTheme = documentRoot.getAttribute('data-theme');
    const previousColorScheme = documentRoot.style.colorScheme;
    const passiveThemes = [];
    function HydrationProbe() {
      React.useEffect(() => {
        passiveThemes.push(documentRoot.dataset.theme);
      }, []);
      return React.createElement('span', null, 'Hydrated content');
    }
    const app = React.createElement(
      VeliProvider,
      { colorScheme: 'system' },
      React.createElement(HydrationProbe),
    );
    const host = document.createElement('div');
    document.body.append(host);
    let root;
    let themeWrites;
    try {
      host.innerHTML = renderToString(app);
      // Execute the emitted parser initializer before React hydrates the server markup.
      Function(host.querySelector('script').textContent)();
      expect(documentRoot.dataset.theme).toBe(expectedTheme);
      themeWrites = vi.spyOn(documentRoot, 'setAttribute');
      await act(async () => {
        root = hydrateRoot(host, app);
      });
      const writtenThemes = themeWrites.mock.calls
        .filter(([attribute]) => attribute === 'data-theme')
        .map(([, value]) => value);
      expect(writtenThemes.every((theme) => theme === expectedTheme)).toBe(true);
      expect(passiveThemes).toEqual([expectedTheme]);
      expect(documentRoot.dataset.theme).toBe(expectedTheme);
      expect(documentRoot.classList.contains('dark')).toBe(expectedTheme === 'dark');
      expect(documentRoot.style.colorScheme).toBe(expectedTheme);
      expect(host.querySelector('[data-theme]').dataset.theme).toBe(expectedTheme);
    } finally {
      if (root) await act(async () => root.unmount());
      themeWrites?.mockRestore();
      host.remove();
      window.matchMedia = previousMatchMedia;
      if (previousStoredTheme == null) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, previousStoredTheme);
      if (previousClass == null) documentRoot.removeAttribute('class');
      else documentRoot.setAttribute('class', previousClass);
      if (previousTheme == null) documentRoot.removeAttribute('data-theme');
      else documentRoot.setAttribute('data-theme', previousTheme);
      documentRoot.style.colorScheme = previousColorScheme;
    }
  },
);

test('Toast actions avoid duplicate client keys for repeated labels and ids', async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  const duplicateKeyWarnings = () =>
    errors.mock.calls.filter((args) =>
      args.some((value) => typeof value === 'string' && value.includes('same key')),
    );
  try {
    await act(async () => {
      root.render(
        React.createElement('div', null, [
          React.createElement('span', { key: 'duplicate' }, 'First'),
          React.createElement('span', { key: 'duplicate' }, 'Second'),
        ]),
      );
    });
    // React's development client renderer must detect the deliberate duplicate control.
    expect(duplicateKeyWarnings().length).toBeGreaterThan(0);
    errors.mockClear();
    const queue = createToastQueue();
    queue.add({
      title: 'Duplicate actions',
      showCloseButton: false,
      actions: [
        { label: 'Retry' },
        { label: 'Retry' },
        { id: 'same', label: React.createElement('b', null, 'Later') },
        { id: 'same', label: 'Dismiss' },
      ],
    });
    await act(async () => {
      root.render(React.createElement(ToastRegion, { queue }));
    });
    const toast = document.querySelector('[role="alertdialog"]');
    expect(Array.from(toast.querySelectorAll('button'), (button) => button.textContent)).toEqual([
      'Retry',
      'Retry',
      'Later',
      'Dismiss',
    ]);
    expect(duplicateKeyWarnings()).toHaveLength(0);
  } finally {
    await act(async () => root.unmount());
    errors.mockRestore();
    host.remove();
  }
});

// Reuse the installed-package DOM suite for Sheet composition. jsdom has no
// layout observers or scrolling; native gestures and focus still need a browser.
async function withComposedSheet(language, verify) {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const previousAttributes = ['class', 'data-theme', 'data-color-scheme', 'style'].map((name) => [
    name,
    document.documentElement.getAttribute(name),
  ]);
  const previousScrollTo = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTo');
  class LayoutObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', LayoutObserver);
  vi.stubGlobal('ResizeObserver', LayoutObserver);
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));
  Element.prototype.scrollTo = () => {};
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const render = async (children, props = {}) => {
    await act(async () => {
      root.render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(
            VeliProvider,
            { language, colorScheme: 'light' },
            React.createElement(Sheet, { isOpen: true, ...props }, children),
          ),
        ),
      );
    });
    return document.querySelector('[role="dialog"]');
  };
  try {
    await verify(render);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
    if (previousScrollTo) Object.defineProperty(Element.prototype, 'scrollTo', previousScrollTo);
    else delete Element.prototype.scrollTo;
    for (const [name, value] of previousAttributes) {
      if (value == null) document.documentElement.removeAttribute(name);
      else document.documentElement.setAttribute(name, value);
    }
  }
}

test.each([
  ['en', 'Close sheet'],
  ['dv', 'ލައްޕާ'],
])('Sheet retains its optional close label and cleans up refs (%s)', async (language, label) => {
  await withComposedSheet(language, async (render) => {
    const attached = new Map();
    const cleaned = new Set();
    const refs = Object.fromEntries(
      ['Header', 'Title', 'Description', 'Body', 'Footer', 'Handle', 'Close'].map((part) => [
        part,
        (node) => {
          if (!node) return;
          attached.set(part, node);
          return () => {
            attached.delete(part);
            cleaned.add(part);
          };
        },
      ]),
    );
    const onPress = vi.fn();
    const onOpenChange = vi.fn();
    const props = { onOpenChange, isDismissable: false };
    const content = (closeLabel) => [
      React.createElement(Sheet.Handle, { key: 'handle', ref: refs.Handle }),
      React.createElement(
        Sheet.Header,
        { key: 'header', ref: refs.Header },
        React.createElement(Sheet.Title, { ref: refs.Title }, 'Details'),
        React.createElement(Sheet.Description, { ref: refs.Description }, 'Supporting text'),
        React.createElement(Sheet.Close, { ref: refs.Close, 'aria-label': closeLabel, onPress }),
      ),
      React.createElement(Sheet.Body, { key: 'body', ref: refs.Body }, 'Task content'),
      React.createElement(Sheet.Footer, { key: 'footer', ref: refs.Footer }, 'Actions'),
    ];
    let dialog = await render(content(undefined), props);
    expect(dialog.getAttribute('lang')).toBe(language);
    expect(dialog.getAttribute('dir')).toBe(language === 'dv' ? 'rtl' : 'ltr');
    expect(attached.size).toBe(7);
    expect(dialog.querySelector('button[slot="close"]').getAttribute('aria-label')).toBe(label);
    dialog = await render(content('Dismiss details'), props);
    expect(dialog.querySelector('button[slot="close"]').getAttribute('aria-label')).toBe(
      'Dismiss details',
    );
    dialog = await render(content(undefined), props);
    const close = dialog.querySelector('button[slot="close"]');
    expect(close.getAttribute('aria-label')).toBe(label);
    await act(async () => close.click());
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await render(content(undefined), { isOpen: false });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(attached.size).toBe(0);
    expect(cleaned.size).toBe(7);
  });
});

test('Sheet descriptions follow DOM order after remounts, memoized moves and ID changes', async () => {
  await withComposedSheet('en', async (render) => {
    function Descriptions({ first, reverse, revision }) {
      const nodes = React.useMemo(
        () => ({
          first: React.createElement(
            Sheet.Description,
            { key: 'first', id: `first-${revision}` },
            'First paragraph.',
          ),
          second: React.createElement(
            Sheet.Description,
            { key: 'second', id: `second-${revision}` },
            'Second paragraph.',
          ),
        }),
        [revision],
      );
      const order = reverse ? ['second', 'first'] : ['first', 'second'];
      return order.map((part) => (part === 'first' && !first ? null : nodes[part]));
    }
    const content = ({ first = true, reverse = false, revision = 0, descriptions = true } = {}) => [
      React.createElement(Sheet.Title, { key: 'title', id: `title-${revision}` }, 'Details'),
      descriptions &&
        React.createElement(Descriptions, { key: 'descriptions', first, reverse, revision }),
      React.createElement(Sheet.Body, { key: 'body' }, 'Task content'),
    ];
    const expectDescription = (dialog, ids, text) => {
      expect(dialog.getAttribute('aria-describedby')).toBe(ids);
      const description = ids
        ?.split(' ')
        .map((id) => document.getElementById(id).textContent)
        .join(' ');
      expect(description).toBe(text);
    };
    expectDescription(
      await render(content()),
      'first-0 second-0',
      'First paragraph. Second paragraph.',
    );
    expectDescription(await render(content({ first: false })), 'second-0', 'Second paragraph.');
    expectDescription(
      await render(content()),
      'first-0 second-0',
      'First paragraph. Second paragraph.',
    );
    expectDescription(
      await render(content({ reverse: true })),
      'second-0 first-0',
      'Second paragraph. First paragraph.',
    );
    const dialog = await render(content({ reverse: true, revision: 1 }));
    expectDescription(dialog, 'second-1 first-1', 'Second paragraph. First paragraph.');
    expect(dialog.getAttribute('aria-labelledby')).toBe('title-1');
    expect(dialog.querySelector('[role="region"]').getAttribute('aria-labelledby')).toBe('title-1');
    expect((await render(content({ descriptions: false }))).hasAttribute('aria-describedby')).toBe(
      false,
    );
  });
});

test('Sheet supports conditional parts and custom body labels', async () => {
  await withComposedSheet('en', async (render) => {
    const content = (footer, bodyLabel) => [
      React.createElement(Sheet.Handle, { key: 'handle', 'data-handle': true }),
      React.createElement(Sheet.Title, { key: 'title' }, 'Details'),
      React.createElement(Sheet.Body, { key: 'body', 'aria-label': bodyLabel }, 'Task content'),
      footer && React.createElement(Sheet.Footer, { key: 'footer' }, 'Actions'),
    ];
    let dialog = await render(content(true, 'Task content'));
    expect(dialog.querySelector('[role="region"]').getAttribute('aria-label')).toBe('Task content');
    expect(dialog.querySelector('[role="region"]').hasAttribute('aria-labelledby')).toBe(false);
    expect(dialog.querySelector('footer')).not.toBeNull();
    dialog = await render(content(false));
    expect(dialog.querySelector('footer')).toBeNull();
    dialog = await render(content(true), { position: 'end' });
    expect(dialog.querySelector('footer')).not.toBeNull();
    expect(dialog.querySelector('[data-handle]')).toBeNull();
  });
});
