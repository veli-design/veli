import { expect, test, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { VeliProvider, useVeliColorScheme } from '@tradenetcorp/veli-ui/provider';
import { Input } from '@tradenetcorp/veli-ui/input';
import { PasswordInput } from '@tradenetcorp/veli-ui/password-input';
import { Sheet } from '@tradenetcorp/veli-ui/sheet';
import { Modal } from '@tradenetcorp/veli-ui/modal';
import { createToastQueue, ToastRegion } from '@tradenetcorp/veli-ui/toast';
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
          React.createElement(Sheet, { title: 'Details', isOpen: false }, 'Content'),
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
