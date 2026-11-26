import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const source = ts.transpileModule(
  readFileSync(new URL('../src/site-header/app-switcher-search.ts', import.meta.url), 'utf8'),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;

const {
  isDhivehiLanguage,
  matchesSwitcherQuery,
  normalizeSearchText,
  resolveSwitcherSearchCandidates,
  translateThaanaInput,
  translateThaanaKey,
} = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

const bilingualLocker = {
  name: 'Locker',
  searchNames: {
    en: 'Locker',
    dv: 'ލޮކަރ',
  },
};

const bilingualApplications = {
  name: 'My Applications',
  searchNames: {
    en: ['My Applications', 'Applications'],
    dv: 'ހުށަހެޅުންތައް',
  },
};

const intentionalLatin = {
  name: 'Gov.mv',
  searchNames: {
    en: 'Gov.mv',
    dv: 'Gov.mv',
  },
};

const missingDhivehi = {
  name: 'Wallet',
  searchNames: {
    en: 'Wallet',
  },
};

const englishOnlyNoMap = {
  name: 'Inbox',
};

test('isDhivehiLanguage accepts dv and BCP-47 variants', () => {
  assert.equal(isDhivehiLanguage('dv'), true);
  assert.equal(isDhivehiLanguage('dv-MV'), true);
  assert.equal(isDhivehiLanguage('DV'), true);
  assert.equal(isDhivehiLanguage('en'), false);
  assert.equal(isDhivehiLanguage('en-US'), false);
  assert.equal(isDhivehiLanguage(''), false);
  assert.equal(isDhivehiLanguage(undefined), false);
});

test('normalizeSearchText trims, lowercases, and NFC-normalizes', () => {
  assert.equal(normalizeSearchText('  Locker  '), 'locker');
  assert.equal(normalizeSearchText('ލޮކަރ'), 'ލޮކަރ');
});

test('Dhivehi mode matches full and partial Thaana queries', () => {
  assert.equal(matchesSwitcherQuery(bilingualLocker, 'ލޮކަރ', 'dv'), true);
  assert.equal(matchesSwitcherQuery(bilingualLocker, 'ލޮ', 'dv'), true);
  assert.equal(matchesSwitcherQuery(bilingualApplications, 'ހުށަ', 'dv'), true);
  assert.equal(matchesSwitcherQuery(bilingualApplications, 'ހުށަހެޅުންތައް', 'dv-MV'), true);
});

test('Dhivehi mode rejects English-only names and aliases', () => {
  assert.equal(matchesSwitcherQuery(bilingualLocker, 'Locker', 'dv'), false);
  assert.equal(matchesSwitcherQuery(bilingualLocker, 'lock', 'dv'), false);
  assert.equal(matchesSwitcherQuery(bilingualApplications, 'Applications', 'dv'), false);
  assert.equal(matchesSwitcherQuery(bilingualApplications, 'My Applications', 'dv'), false);
});

test('intentional Latin text in a Dhivehi localized label still matches', () => {
  assert.equal(matchesSwitcherQuery(intentionalLatin, 'Gov.mv', 'dv'), true);
  assert.equal(matchesSwitcherQuery(intentionalLatin, 'gov', 'dv'), true);
});

test('missing Dhivehi search data never falls back to the English name', () => {
  assert.deepEqual(resolveSwitcherSearchCandidates(missingDhivehi, 'dv'), []);
  assert.equal(matchesSwitcherQuery(missingDhivehi, 'Wallet', 'dv'), false);
  assert.equal(matchesSwitcherQuery(missingDhivehi, 'wallet', 'dv'), false);

  assert.deepEqual(resolveSwitcherSearchCandidates(englishOnlyNoMap, 'dv'), []);
  assert.equal(matchesSwitcherQuery(englishOnlyNoMap, 'Inbox', 'dv'), false);

  const emptyDv = {
    name: 'Services',
    searchNames: { en: 'Services', dv: '' },
  };
  assert.deepEqual(resolveSwitcherSearchCandidates(emptyDv, 'dv'), []);
  assert.equal(matchesSwitcherQuery(emptyDv, 'Services', 'dv'), false);
});

test('English mode matches English names and ignores Thaana-only queries', () => {
  assert.equal(matchesSwitcherQuery(bilingualLocker, 'Locker', 'en'), true);
  assert.equal(matchesSwitcherQuery(bilingualLocker, 'lock', 'en-US'), true);
  assert.equal(matchesSwitcherQuery(bilingualApplications, 'Applications', 'en'), true);
  assert.equal(matchesSwitcherQuery(bilingualLocker, 'ލޮކަރ', 'en'), false);
  assert.equal(matchesSwitcherQuery(englishOnlyNoMap, 'Inbox', 'en'), true);
  assert.equal(matchesSwitcherQuery(englishOnlyNoMap, 'inb', 'en'), true);
});

test('empty queries match every item in both languages', () => {
  assert.equal(matchesSwitcherQuery(bilingualLocker, '', 'dv'), true);
  assert.equal(matchesSwitcherQuery(bilingualLocker, '   ', 'en'), true);
  assert.equal(matchesSwitcherQuery(missingDhivehi, '', 'dv'), true);
});

test('language switch changes candidates without remounting item data', () => {
  assert.equal(matchesSwitcherQuery(bilingualLocker, 'ލޮ', 'dv'), true);
  assert.equal(matchesSwitcherQuery(bilingualLocker, 'ލޮ', 'en'), false);
  assert.equal(matchesSwitcherQuery(bilingualLocker, 'Lock', 'en'), true);
  assert.equal(matchesSwitcherQuery(bilingualLocker, 'Lock', 'dv'), false);
});

test('Thaana phonetic key translation maps QWERTY to Thaana', () => {
  assert.equal(translateThaanaInput('lokar'), 'ލޮކަރ');
  assert.equal(translateThaanaInput('huSahe'), 'ހުށަހެ');
  assert.equal(translateThaanaKey('l'), 'ލ');
  assert.equal(translateThaanaKey('o'), 'ޮ');
  assert.equal(translateThaanaKey('S'), 'ށ');
});

test('Thaana translation passes through native Thaana, digits, spaces, and punctuation', () => {
  assert.equal(translateThaanaInput('ލޮކަރ'), 'ލޮކަރ');
  assert.equal(translateThaanaInput('Gov.mv'), 'ޣޮވ.މވ');
  assert.equal(translateThaanaInput('gov.mv'), 'ގޮވ.މވ');
  assert.equal(translateThaanaInput('12 34'), '12 34');
  assert.equal(translateThaanaKey('1'), null);
  assert.equal(translateThaanaKey(' '), null);
  assert.equal(translateThaanaKey('Enter'), null);
});
