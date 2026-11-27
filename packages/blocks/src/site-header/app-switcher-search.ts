/**
 * App switcher search matching and Thaana phonetic input helpers.
 */

/** Item fields the matcher needs. */
export type SwitcherSearchItem = {
  name: string;
  /** See `SiteHeaderSwitcherItem.searchNames`. */
  searchNames?: Partial<Record<string, string | readonly string[]>>;
};

/** Thaana Phonetic keyboard layout by Jawish Hameed (MIT). */
const THAANA_ASCII_KEYS =
  'qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?()';

const THAANA_PHONETIC = 'ްއެރތޔުިޮޕ][\\ަސދފގހޖކލ؛\'ޒ×ޗވބނމ،./ޤޢޭޜޓޠޫީޯ÷}{|ާށޑﷲޣޙޛޚޅ:"ޡޘޝޥޞޏޟ><؟)(';

export function isDhivehiLanguage(language: string | undefined | null): boolean {
  if (!language) return false;
  const base = language.trim().toLowerCase().split(/[-_]/)[0] ?? '';
  return base === 'dv';
}

export function normalizeSearchText(value: string): string {
  return value.normalize('NFC').trim().toLowerCase();
}

function languageLookupKeys(language: string): string[] {
  const trimmed = language.trim();
  if (!trimmed) return [];
  const lower = trimmed.toLowerCase();
  const base = lower.split(/[-_]/)[0] ?? lower;
  const keys = [trimmed, lower];
  if (base && base !== lower) keys.push(base);
  return keys;
}

function asCandidateList(value: string | readonly string[] | undefined): string[] {
  if (value == null) return [];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return value.map((entry) => entry.trim()).filter((entry) => entry.length > 0);
}

/**
 * Resolve the searchable strings for the active language.
 * When `searchNames` is set, only that map is used (no `name` fallback).
 * When it is omitted, English-compatible hosts still match on `name`; Dhivehi
 * mode returns an empty list so English names never silently match.
 */
export function resolveSwitcherSearchCandidates(
  item: SwitcherSearchItem,
  language: string,
): string[] {
  if (item.searchNames) {
    for (const key of languageLookupKeys(language)) {
      if (Object.prototype.hasOwnProperty.call(item.searchNames, key)) {
        return asCandidateList(item.searchNames[key]);
      }
    }
    return [];
  }
  if (isDhivehiLanguage(language)) return [];
  return item.name.trim() ? [item.name] : [];
}

export function matchesSwitcherQuery(
  item: SwitcherSearchItem,
  query: string,
  language: string,
): boolean {
  const needle = normalizeSearchText(query);
  if (!needle) return true;
  return resolveSwitcherSearchCandidates(item, language).some((candidate) =>
    normalizeSearchText(candidate).includes(needle),
  );
}

/** Map a single ASCII key to Thaana. Non-mapped keys return null. */
export function translateThaanaKey(key: string): string | null {
  if (key.length !== 1) return null;
  const index = THAANA_ASCII_KEYS.indexOf(key);
  if (index < 0) return null;
  const mapped = THAANA_PHONETIC.charAt(index);
  return mapped === '' ? null : mapped;
}

/**
 * Translate a string of typed characters through the Thaana phonetic layout.
 * Existing Thaana, digits, spaces, and unmapped characters pass through.
 */
export function translateThaanaInput(text: string): string {
  let result = '';
  for (const char of text) {
    result += translateThaanaKey(char) ?? char;
  }
  return result;
}
