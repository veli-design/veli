import { expect, test } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { VeliProvider, useVeliColorScheme } from '@tradenetcorp/veli-ui/provider';
import { Input } from '@tradenetcorp/veli-ui/input';
import { PasswordInput } from '@tradenetcorp/veli-ui/password-input';
import { Modal } from '@tradenetcorp/veli-ui/modal';
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
