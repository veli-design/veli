import assert from 'node:assert/strict';
import test from 'node:test';

import { getErrorMessages, toErrorMessage } from '../src/form-shared.ts';

test('getErrorMessages flattens strings, { message } objects, and arrays', () => {
  assert.deepEqual(getErrorMessages(undefined), []);
  assert.deepEqual(getErrorMessages('Required'), ['Required']);
  assert.deepEqual(getErrorMessages({ type: 'required', message: 'Required' }), ['Required']);
  assert.deepEqual(
    getErrorMessages([
      'Too short',
      undefined,
      { message: 'Too short', path: ['title'] },
      [{ message: 'Invalid email' }, ''],
      { type: 'custom' },
    ]),
    ['Too short', 'Invalid email'],
  );

  assert.equal(toErrorMessage([{ message: 'First' }, 'Second']), 'First');
  assert.equal(toErrorMessage([]), undefined);
});
