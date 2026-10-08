import { expect, test } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
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
