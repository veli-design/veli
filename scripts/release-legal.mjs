import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { licensingPackages, packageNotices } from './package-licensing.mjs';

export function assertCompleteLegalText(source, label) {
  assert.ok(
    !/TO BE CONFIRMED|\[YEAR\]|\[CREATOR|\bdraft\s+(?:implementation|inventory|distribution|notice)|\bengineering draft|unresolved[^\n]*block[^\n]*publication/i.test(
      source,
    ),
    `${label}: unresolved legal template; complete distributed copyright and attribution before publication`,
  );
}

// Packing drafts is allowed for review. Npm publication validates the material
// actually shipped; website-only font/brand permissions have separate gates.
export function assertReleaseLegal(root) {
  const mit = readFileSync(resolve(root, 'LICENSE'), 'utf8');
  assertCompleteLegalText(mit, 'LICENSE');
  assert.match(
    mit,
    /Copyright \(c\) \d{4}(?:-\d{4})? [^\n]+/,
    'LICENSE: completed copyright notice required',
  );
  const terms = mit.split('Permission is hereby')[1]?.trim().split(/\s+/).join(' ');
  assert.ok(terms, 'Missing standard MIT grant');
  assert.equal(
    createHash('sha256').update(terms).digest('hex'),
    'c3cca002c5ce1c85dbb5954f864012d9a0ec9c40dc986ba1448fa04b226cd7cd',
  );
  assert.equal(
    createHash('sha256')
      .update(readFileSync(resolve(root, 'LICENSES/CC-BY-4.0.txt')))
      .digest('hex'),
    '2ade8c89b8bbe0d859b124a9e47032c8494022f43091e8278ae8e2554a292196',
  );
  assertCompleteLegalText(
    readFileSync(resolve(root, 'packaging/LICENSING.md'), 'utf8'),
    'packaging/LICENSING.md',
  );
  const notices = readFileSync(resolve(root, 'THIRD_PARTY_NOTICES.md'), 'utf8');
  for (const pkg of licensingPackages) {
    assertCompleteLegalText(
      readFileSync(resolve(root, 'packages', pkg.directory, 'README.md'), 'utf8'),
      `${pkg.name} README`,
    );
    if (pkg.notices)
      assertCompleteLegalText(packageNotices(notices, pkg.directory), `${pkg.name} notices`);
  }
}
