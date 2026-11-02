import assert from 'node:assert/strict';
import test from 'node:test';

import {
  alphabetSpec,
  composeOTPValidate,
  createOTPDocument,
  otpIncompleteMessages,
  planOTPClipboard,
  projectOTPTrack,
  reduceOTPDocument,
  resolveOTPLayout,
  sanitizeOTPText,
  selectionForDocument,
} from '../src/otp-input-model.ts';

const six = resolveOTPLayout({});
const doc = (text, gap = text.length) => ({ text, gap });
const reduce = (prev, event, alphabet = 'digits', layout = six) =>
  reduceOTPDocument(prev, event, layout, alphabet);
const value = (raw) => ({ type: 'value', raw });

test('sanitize strips separators and foreign characters, applies case, and truncates', () => {
  assert.equal(sanitizeOTPText('123-456', six, 'digits'), '123456');
  assert.equal(sanitizeOTPText(' 1 2a3\t4b56 78', six, 'digits'), '123456');
  assert.equal(sanitizeOTPText('ab-CD 12', six, 'alphanumeric'), 'abCD12');
  assert.equal(sanitizeOTPText('ab-cd 12!', six, 'alphanumeric-upper'), 'ABCD12');
  assert.equal(sanitizeOTPText('١٢٣', six, 'digits'), '');
  for (const alphabet of ['digits', 'alphanumeric', 'alphanumeric-upper']) {
    const once = sanitizeOTPText('aB-3 c9xyz12', six, alphabet);
    assert.equal(sanitizeOTPText(once, six, alphabet), once, alphabet);
  }
});

test('alphabet spec drives keyboard and autocorrect attributes', () => {
  assert.equal(alphabetSpec('digits').inputMode, 'numeric');
  assert.equal(alphabetSpec('alphanumeric').inputMode, 'text');
  assert.equal(alphabetSpec('alphanumeric-upper').autoCapitalize, 'characters');
  assert.equal(alphabetSpec('digits').spellCheck, false);
  assert.equal(alphabetSpec('digits').autoCorrect, 'off');
});

test('layout is length xor groups, and the slot count is the group sum', () => {
  assert.deepEqual(resolveOTPLayout({}), { slotCount: 6, groupSizes: [6] });
  assert.deepEqual(resolveOTPLayout({ length: 4 }), { slotCount: 4, groupSizes: [4] });
  assert.deepEqual(resolveOTPLayout({ groups: [3, 3] }), { slotCount: 6, groupSizes: [3, 3] });
  assert.deepEqual(resolveOTPLayout({ groups: [4, 4, 2] }).slotCount, 10);
  for (const shape of [{ length: 0 }, { length: 2.5 }, { groups: [3, 0] }, { groups: [-1] }]) {
    assert.throws(() => resolveOTPLayout(shape), RangeError);
  }
});

test('typing at the end appends and typing on a filled slot replaces and moves right', () => {
  assert.deepEqual(reduce(doc('12'), value('123')).document, doc('123', 3));
  assert.deepEqual(reduce(doc('123', 1), value('193')).document, doc('193', 2));
  assert.deepEqual(reduce(doc('112', 0), value('312')).document, doc('312', 1));
  assert.deepEqual(reduce(doc('AB'), value('ABc'), 'alphanumeric-upper').document, doc('ABC', 3));
});

test('backspace deletes before an end gap and deletes the selected filled slot', () => {
  assert.deepEqual(reduce(doc('123'), value('12')).document, doc('12', 2));
  assert.deepEqual(reduce(doc('123', 1), value('13')).document, doc('13', 1));
  assert.deepEqual(reduce(doc('122', 1), value('12')).document, doc('12', 1));
});

test('rejected characters and overflow leave the document untouched', () => {
  const partial = doc('123', 1);
  assert.equal(reduce(partial, value('1a3')).document, partial);
  assert.equal(reduce(partial, value('1 3')).document, partial);
  const full = doc('123456');
  assert.equal(reduce(full, value('1234567')).document, full);
  assert.equal(reduce(full, value('123456')).document, full);
});

test('short paste inserts at the gap and SMS autofill parks the gap at the end', () => {
  assert.deepEqual(reduce(doc('123', 1), value('14-53')).document, doc('1453', 3));
  assert.deepEqual(reduce(doc('12'), value('123-456')).document, doc('123456', 6));
  assert.deepEqual(reduce(doc('98'), value('123 456')).document, doc('123456', 6));
});

test('same-character overtype advances the gap without changing the text', () => {
  const prev = doc('123', 1);
  assert.deepEqual(reduce(prev, { type: 'insert', data: '2' }), {
    document: doc('123', 2),
    completed: false,
  });
  assert.deepEqual(
    reduce(doc('ABC', 0), { type: 'insert', data: 'a' }, 'alphanumeric-upper').document,
    doc('ABC', 1),
  );
  assert.equal(reduce(prev, { type: 'insert', data: '9' }).document, prev);
  const atEnd = doc('123');
  assert.equal(reduce(atEnd, { type: 'insert', data: '3' }).document, atEnd);
});

test('completed is true only for a user edit that fills an incomplete code', () => {
  assert.equal(reduce(doc('12345'), value('123456')).completed, true);
  assert.equal(reduce(doc(''), value('123456')).completed, true);
  assert.equal(reduce(doc('1234'), value('12345')).completed, false);
  assert.equal(reduce(doc('123456', 2), value('129456')).completed, false);
  assert.equal(reduce(doc('123456'), value('12345')).completed, false);
  assert.equal(reduce(doc('12345'), { type: 'external', raw: '123456' }).completed, false);
  assert.equal(reduce(doc('12'), { type: 'replace', raw: '123456' }).completed, true);
  assert.equal(reduce(doc('999999'), { type: 'replace', raw: '123456' }).completed, false);
});

test('external values keep the gap for the same text and park it at the new end', () => {
  const prev = doc('123', 1);
  assert.equal(reduce(prev, { type: 'external', raw: '1-2-3' }).document, prev);
  assert.deepEqual(reduce(prev, { type: 'external', raw: '98765' }).document, doc('98765', 5));
  assert.deepEqual(reduce(prev, { type: 'external', raw: '' }).document, doc('', 0));
});

test('motion moves the gap inside the text and never past it', () => {
  const prev = doc('123', 1);
  const move = (from, motion) => reduce(from, { type: 'motion', motion }).document;
  assert.deepEqual(move(prev, 'left'), doc('123', 0));
  assert.deepEqual(move(prev, 'right'), doc('123', 2));
  assert.deepEqual(move(prev, 'start'), doc('123', 0));
  assert.deepEqual(move(prev, 'end'), doc('123', 3));
  const atStart = doc('123', 0);
  assert.equal(move(atStart, 'left'), atStart);
  const atEnd = doc('123');
  assert.equal(move(atEnd, 'right'), atEnd);
});

test('pointing at a filled slot overtypes it and an empty slot parks at the append gap', () => {
  const prev = doc('123');
  const point = (slotIndex) => reduce(prev, { type: 'point', slotIndex }).document;
  assert.deepEqual(point(1), doc('123', 1));
  assert.deepEqual(point(5), doc('123', 3));
  assert.equal(point(3), prev);
});

test('paste plan replaces on a full code, ignores nothing usable, and defers otherwise', () => {
  assert.deepEqual(planOTPClipboard('123-456', six, 'digits'), { kind: 'replace', raw: '123-456' });
  assert.deepEqual(planOTPClipboard('Code: 123 456 ', six, 'digits'), {
    kind: 'replace',
    raw: 'Code: 123 456 ',
  });
  assert.deepEqual(planOTPClipboard(' - ', six, 'digits'), { kind: 'ignore' });
  assert.deepEqual(planOTPClipboard('abc', six, 'digits'), { kind: 'ignore' });
  assert.deepEqual(planOTPClipboard('12', six, 'digits'), { kind: 'browser' });
  assert.deepEqual(reduce(doc('456'), { type: 'replace', raw: '123-456' }).document, doc('123456'));
});

test('native selection covers the overtyped character and collapses otherwise', () => {
  assert.deepEqual(selectionForDocument(doc('123', 1)), { start: 1, end: 2 });
  assert.deepEqual(selectionForDocument(doc('123')), { start: 3, end: 3 });
  assert.deepEqual(selectionForDocument(doc('123456')), { start: 6, end: 6 });
});

test('track projection derives slots from groups and draws one caret while focused', () => {
  const layout = resolveOTPLayout({ groups: [3, 3] });
  const track = projectOTPTrack(doc('1234', 4), layout, true);
  assert.deepEqual(
    track.groups.map((group) => group.slots.map((slot) => slot.index)),
    [
      [0, 1, 2],
      [3, 4, 5],
    ],
  );
  const slots = track.groups.flatMap((group) => group.slots);
  assert.deepEqual(
    slots.map((slot) => slot.char),
    ['1', '2', '3', '4', null, null],
  );
  const carets = (d, focused = true) =>
    projectOTPTrack(d, layout, focused)
      .groups.flatMap((group) => group.slots)
      .map((slot) => slot.caret);
  assert.deepEqual(carets(doc('1234', 4)), ['none', 'none', 'none', 'none', 'append', 'none']);
  assert.deepEqual(carets(doc('1234', 1)), ['none', 'overtype', 'none', 'none', 'none', 'none']);
  assert.deepEqual(carets(doc('123456')), ['none', 'none', 'none', 'none', 'none', 'trailing']);
  assert.deepEqual(carets(doc('1234', 1), false), Array(6).fill('none'));
});

test('completeness validation leaves empty to isRequired and lets consumer errors win', () => {
  const validate = composeOTPValidate(six, 'en', undefined);
  assert.equal(validate(''), null);
  assert.equal(validate('123'), otpIncompleteMessages.en(6));
  assert.match(validate('123'), /6/);
  assert.equal(validate('123456'), null);
  assert.equal(composeOTPValidate(six, 'dv', undefined)('1'), otpIncompleteMessages.dv(6));
  assert.notEqual(otpIncompleteMessages.dv(6), otpIncompleteMessages.en(6));

  const consumer = (code) => (code === '000000' ? 'Code expired.' : null);
  const withConsumer = composeOTPValidate(six, 'en', consumer);
  assert.equal(withConsumer('000000'), 'Code expired.');
  assert.equal(withConsumer('123'), otpIncompleteMessages.en(6));
  assert.equal(composeOTPValidate(six, 'en', () => true)('12'), otpIncompleteMessages.en(6));
  assert.deepEqual(composeOTPValidate(six, 'en', () => ['A', 'B'])('12'), ['A', 'B']);
});

test('createOTPDocument seeds a sanitized document with the gap at the end', () => {
  assert.deepEqual(createOTPDocument('12-3', six, 'digits'), doc('123', 3));
  assert.deepEqual(createOTPDocument(undefined, six, 'digits'), doc('', 0));
});
