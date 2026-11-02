import type { TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import type { VeliLanguage } from './provider-shared.js';

declare const otpTextBrand: unique symbol;
declare const otpSlotViewBrand: unique symbol;

/**
 * Sanitized dense prefix. Slot `i` is filled iff `i < text.length`.
 * Only `sanitizeOTPText` creates one.
 */
export type OTPText = string & { readonly [otpTextBrand]: true };

const otpAlphabets = {
  digits: {
    disallowed: /[^0-9]/g,
    upperCase: false,
    inputMode: 'numeric',
    pattern: '[0-9]*',
    autoCapitalize: 'none',
  },
  alphanumeric: {
    disallowed: /[^A-Za-z0-9]/g,
    upperCase: false,
    inputMode: 'text',
    pattern: '[A-Za-z0-9]*',
    autoCapitalize: 'none',
  },
  'alphanumeric-upper': {
    disallowed: /[^A-Z0-9]/g,
    upperCase: true,
    inputMode: 'text',
    pattern: '[A-Z0-9]*',
    autoCapitalize: 'characters',
  },
} as const;

export type OTPAlphabet = keyof typeof otpAlphabets;

export interface OTPAlphabetSpec {
  readonly inputMode: 'numeric' | 'text';
  readonly pattern: string;
  readonly autoCapitalize: 'none' | 'characters';
  readonly autoCorrect: 'off';
  readonly spellCheck: false;
}

export function alphabetSpec(alphabet: OTPAlphabet): OTPAlphabetSpec {
  const { inputMode, pattern, autoCapitalize } = otpAlphabets[alphabet];
  return { inputMode, pattern, autoCapitalize, autoCorrect: 'off', spellCheck: false };
}

/** `length` xor `groups`. Omitted, the field is 6 slots in one group. */
export type OTPLayoutProps =
  | { length?: number; groups?: never }
  | { groups: readonly [number, ...number[]]; length?: never };

export interface OTPLayout {
  readonly slotCount: number;
  readonly groupSizes: readonly [number, ...number[]];
}

export function resolveOTPLayout(shape: OTPLayoutProps): OTPLayout {
  const groupSizes: readonly [number, ...number[]] = shape.groups ?? [shape.length ?? 6];

  for (const size of groupSizes) {
    if (!Number.isInteger(size) || size < 1) {
      throw new RangeError(
        `OTPInput slot counts must be integers of at least 1. Received ${size}.`,
      );
    }
  }

  return { slotCount: groupSizes.reduce((total, size) => total + size, 0), groupSizes };
}

export function sanitizeOTPText(raw: string, layout: OTPLayout, alphabet: OTPAlphabet): OTPText {
  const { disallowed, upperCase } = otpAlphabets[alphabet];
  const cased = upperCase ? raw.toUpperCase() : raw;
  return cased.replace(disallowed, '').slice(0, layout.slotCount) as OTPText;
}

/**
 * The only stored domain value. `0 <= gap <= text.length`.
 * `gap < text.length` overtypes `text[gap]`; `gap === text.length` appends,
 * or sits after the last slot when the code is full.
 */
export interface OTPDocument {
  readonly text: OTPText;
  readonly gap: number;
}

export function createOTPDocument(
  raw: string | undefined,
  layout: OTPLayout,
  alphabet: OTPAlphabet,
): OTPDocument {
  const text = sanitizeOTPText(raw ?? '', layout, alphabet);
  return { text, gap: text.length };
}

export type OTPMotion = 'left' | 'right' | 'start' | 'end';

/**
 * - `value`: whatever the input now holds after a browser edit (typing,
 *   deletion, short paste, SMS autofill).
 * - `insert`: a character about to be typed. Only consumed when it overtypes
 *   the same character, because the browser leaves the value unchanged and
 *   React then reports no change.
 * - `replace`: a user paste of a complete code.
 * - `external`: a controlled `value` from the parent.
 */
export type OTPDocumentEvent =
  | { readonly type: 'value'; readonly raw: string }
  | { readonly type: 'insert'; readonly data: string }
  | { readonly type: 'replace'; readonly raw: string }
  | { readonly type: 'external'; readonly raw: string }
  | { readonly type: 'motion'; readonly motion: OTPMotion }
  | { readonly type: 'point'; readonly slotIndex: number };

/** `completed` is true only when a user edit moved the text from incomplete to full. */
export interface OTPReduceResult {
  readonly document: OTPDocument;
  readonly completed: boolean;
}

function unchanged(document: OTPDocument): OTPReduceResult {
  return { document, completed: false };
}

function withGap(prev: OTPDocument, gap: number): OTPDocument {
  return gap === prev.gap ? prev : { text: prev.text, gap };
}

function edited(prev: OTPDocument, text: OTPText, gap: number, layout: OTPLayout): OTPReduceResult {
  if (text === prev.text) return unchanged(prev);
  return {
    document: { text, gap: Math.min(gap, text.length) },
    completed: text.length === layout.slotCount && prev.text.length < layout.slotCount,
  };
}

export function reduceOTPDocument(
  prev: OTPDocument,
  event: OTPDocumentEvent,
  layout: OTPLayout,
  alphabet: OTPAlphabet,
): OTPReduceResult {
  const sanitize = (raw: string) => sanitizeOTPText(raw, layout, alphabet);

  switch (event.type) {
    case 'value': {
      const before = prev.text;
      const raw = event.raw;
      // Edits start at the selection written from `gap`, so capping the shared
      // prefix there keeps repeated characters from shifting the edit point.
      const maxPrefix = Math.min(prev.gap, before.length, raw.length);
      let prefix = 0;
      while (prefix < maxPrefix && before[prefix] === raw[prefix]) prefix++;
      const maxSuffix = Math.min(before.length, raw.length) - prefix;
      let suffix = 0;
      while (
        suffix < maxSuffix &&
        before[before.length - 1 - suffix] === raw[raw.length - 1 - suffix]
      ) {
        suffix++;
      }
      const inserted = raw.slice(prefix, raw.length - suffix);
      const insertedText = sanitize(inserted);
      if (inserted.length > 0 && insertedText.length === 0) return unchanged(prev);
      return edited(prev, sanitize(raw), prefix + insertedText.length, layout);
    }
    case 'insert': {
      const char = sanitize(event.data);
      if (prev.gap < prev.text.length && char === prev.text[prev.gap]) {
        return unchanged(withGap(prev, prev.gap + 1));
      }
      return unchanged(prev);
    }
    case 'replace': {
      const text = sanitize(event.raw);
      return edited(prev, text, text.length, layout);
    }
    case 'external': {
      const text = sanitize(event.raw);
      return unchanged(text === prev.text ? prev : { text, gap: text.length });
    }
    case 'motion': {
      const end = prev.text.length;
      const gaps = {
        left: Math.max(0, prev.gap - 1),
        right: Math.min(end, prev.gap + 1),
        start: 0,
        end,
      } satisfies Record<OTPMotion, number>;
      return unchanged(withGap(prev, gaps[event.motion]));
    }
    case 'point':
      return unchanged(withGap(prev, Math.min(Math.max(0, event.slotIndex), prev.text.length)));
  }
}

/**
 * `replace` takes over a paste that fills the code. `ignore` blocks a paste
 * with nothing usable. `browser` lets the input insert at the written
 * selection, then a `value` event sanitizes it.
 */
export type OTPClipboardPlan =
  | { readonly kind: 'replace'; readonly raw: string }
  | { readonly kind: 'browser' }
  | { readonly kind: 'ignore' };

export function planOTPClipboard(
  clipboard: string,
  layout: OTPLayout,
  alphabet: OTPAlphabet,
): OTPClipboardPlan {
  const length = sanitizeOTPText(clipboard, layout, alphabet).length;
  if (length === 0) return { kind: 'ignore' };
  if (length === layout.slotCount) return { kind: 'replace', raw: clipboard };
  return { kind: 'browser' };
}

export interface OTPNativeSelection {
  readonly start: number;
  readonly end: number;
}

export function selectionForDocument(doc: OTPDocument): OTPNativeSelection {
  return doc.gap < doc.text.length
    ? { start: doc.gap, end: doc.gap + 1 }
    : { start: doc.gap, end: doc.gap };
}

export type OTPSlotCaret = 'none' | 'append' | 'overtype' | 'trailing';

/** One cell handed to `renderSlot`. Only `projectOTPTrack` builds one. `char === null` is empty. */
export interface OTPSlotView {
  readonly index: number;
  readonly char: string | null;
  readonly caret: OTPSlotCaret;
  readonly [otpSlotViewBrand]: true;
}

export interface OTPGroupView {
  readonly groupIndex: number;
  readonly slots: readonly OTPSlotView[];
}

export interface OTPTrackView {
  readonly groups: readonly OTPGroupView[];
}

export function projectOTPTrack(
  doc: OTPDocument,
  layout: OTPLayout,
  focused: boolean,
): OTPTrackView {
  const caretIndex = focused ? Math.min(doc.gap, layout.slotCount - 1) : -1;
  const caret: OTPSlotCaret =
    doc.gap < doc.text.length ? 'overtype' : doc.gap < layout.slotCount ? 'append' : 'trailing';
  let index = 0;

  return {
    groups: layout.groupSizes.map((size, groupIndex) => ({
      groupIndex,
      slots: Array.from({ length: size }, () => {
        const slotIndex = index++;
        return {
          index: slotIndex,
          char: doc.text[slotIndex] ?? null,
          caret: slotIndex === caretIndex ? caret : 'none',
        } as OTPSlotView;
      }),
    })),
  };
}

// Dhivehi copy is a draft pending content-owner review.
export const otpIncompleteMessages = {
  en: (slotCount: number) => `Enter all ${slotCount} characters.`,
  dv: (slotCount: number) => `ހުރިހާ ${slotCount} އަކުރު ލިޔުއްވާ.`,
} as const satisfies Record<VeliLanguage, (slotCount: number) => string>;

/**
 * Consumer `validate` wins when it reports an error. Empty text is left to
 * `isRequired`; a partial code gets the localized completeness message.
 */
export function composeOTPValidate(
  layout: OTPLayout,
  language: VeliLanguage,
  consumer: AriaTextFieldProps['validate'],
): NonNullable<AriaTextFieldProps['validate']> {
  return (value) => {
    const consumerError = consumer?.(value);
    if (consumerError != null && consumerError !== true && consumerError.length > 0) {
      return consumerError;
    }
    return value.length > 0 && value.length < layout.slotCount
      ? otpIncompleteMessages[language](layout.slotCount)
      : null;
  };
}
