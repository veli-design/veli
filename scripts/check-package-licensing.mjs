import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertCompleteLegalText } from './release-legal.mjs';
import { licensingPackages, repositoryRoot, packageNotices } from './package-licensing.mjs';

// Read entries to stdout only; never extract an archive into the filesystem.
export function checkPackageLicensingArtifacts(candidate, { release = false } = {}) {
  for (const pkg of licensingPackages) {
    const archive = resolve(candidate, pkg.tarball);
    const files = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split('\n');
    assert.equal(new Set(files).size, files.length, `${pkg.name}: duplicate archive paths`);
    assert.ok(
      files.every(
        (p) => p.startsWith('package/') && !p.includes('\\') && !p.split('/').includes('..'),
      ),
    );
    const get = (path) => {
      assert.ok(files.includes(`package/${path}`), `${pkg.name}: missing ${path}`);
      return execFileSync('tar', ['-xOf', archive, `package/${path}`], {
        maxBuffer: 10 * 1024 * 1024,
      });
    };
    assert.deepEqual(
      get('LICENSE'),
      readFileSync(resolve(repositoryRoot, 'LICENSE')),
      `${pkg.name}: pnpm must inherit the canonical root MIT licence`,
    );
    assert.deepEqual(
      get('licensing/CC-BY-4.0.txt'),
      readFileSync(resolve(repositoryRoot, 'LICENSES/CC-BY-4.0.txt')),
    );
    if (release) {
      for (const path of [
        'LICENSE',
        'licensing/LICENSING.md',
        'README.md',
        ...(pkg.notices ? ['licensing/THIRD_PARTY_NOTICES.md'] : []),
      ]) {
        assertCompleteLegalText(get(path).toString(), `${pkg.name} ${path}`);
      }
    }
    const manifest = JSON.parse(get('package.json'));
    assert.equal(manifest.name, pkg.name);
    assert.equal(manifest.license, '(MIT AND CC-BY-4.0)');
    const scope = get('licensing/LICENSING.md').toString();
    assert.ok(
      scope.includes(pkg.productName) &&
        scope.includes(pkg.name) &&
        scope.includes(manifest.homepage),
    );
    assert.match(scope, /software.*code examples.*MIT/s);
    assert.match(scope, /non-software documentation.*CC BY 4\.0/s);
    assert.match(scope, /## Documentation attribution[\s\S]*(?:Copyright )?©[\s\S]*Source:/);
    assert.match(scope, /Exclusion alone grants no permission/);
    assert.ok(!/\{\{/.test(scope), 'Staging tokens must be resolved');
    if (pkg.notices) {
      assert.equal(
        get('licensing/THIRD_PARTY_NOTICES.md').toString(),
        packageNotices(
          readFileSync(resolve(repositoryRoot, 'THIRD_PARTY_NOTICES.md'), 'utf8'),
          pkg.directory,
        ),
      );
    } else {
      assert.ok(!files.includes('package/licensing/THIRD_PARTY_NOTICES.md'));
    }
    // Only shipped documents may use relative links. Root policy links are absolute
    // and disclose private-repository access instead of pointing outside the tarball.
    for (const path of [
      'README.md',
      'licensing/LICENSING.md',
      ...(pkg.notices ? ['licensing/THIRD_PARTY_NOTICES.md'] : []),
    ]) {
      for (const match of get(path)
        .toString()
        .matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
        const target = match[1];
        if (/^https:\/\/|^#|^mailto:/.test(target)) continue;
        const resolved = posix.normalize(posix.join(posix.dirname(path), target.split('#')[0]));
        assert.ok(
          !resolved.startsWith('../') && files.includes(`package/${resolved}`),
          `${pkg.name}: dangling ${path} reference ${target}`,
        );
      }
    }
    assert.ok(
      !files.some((p) => /\.(?:svg|png|jpe?g|webp|ico|ttf|otf|woff2?|lottie)$/.test(p)),
      `${pkg.name}: excluded asset in npm archive`,
    );
    assert.ok(
      !files.some((p) =>
        /(?:^|\/)(?:BRAND_POLICY\.md|ASSET_LICENSES\.md|\.npmrc|\.env[^/]*)(?:\/|$)/.test(p),
      ),
      `${pkg.name}: governance-only or sensitive file in npm archive`,
    );
    assert.ok(
      !files.some((p) => p.startsWith('package/LICENSES/')),
      'Extra notices must not suppress pnpm root LICENSE inheritance',
    );
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv[2], 'Expected candidate tarball directory');
  checkPackageLicensingArtifacts(process.argv[2], { release: process.argv.includes('--release') });
  console.log('All three package licence/notice/reference checks passed.');
}
