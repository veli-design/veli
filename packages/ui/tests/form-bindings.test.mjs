import assert from 'node:assert/strict';
import test from 'node:test';

import {
  dateValueToIsoDate,
  getErrorMessages,
  isoDateToDateValue,
  toErrorMessage,
} from '../src/form-shared.ts';

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

test('isoDateToDateValue and dateValueToIsoDate round-trip', () => {
  assert.equal(isoDateToDateValue(null), null);
  assert.equal(isoDateToDateValue(''), null);
  assert.equal(isoDateToDateValue('not-a-date'), null);

  const parsed = isoDateToDateValue('2024-06-15');
  assert.ok(parsed);
  assert.equal(dateValueToIsoDate(parsed), '2024-06-15');
  assert.equal(dateValueToIsoDate(null), null);
});
