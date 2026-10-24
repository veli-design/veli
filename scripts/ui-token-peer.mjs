import assert from 'node:assert/strict';
import semver from 'semver';

const tokensName = '@veli-design/tokens';

export function assertCompatibleTokensPeer(uiPackage, tokensVersion) {
  const range = uiPackage?.peerDependencies?.[tokensName];
  assert.ok(
    typeof range === 'string' && range.trim() !== '' && semver.validRange(range) !== null,
    `UI must declare a valid ${tokensName} peer range`,
  );
  assert.ok(
    typeof tokensVersion === 'string' && semver.valid(tokensVersion) !== null,
    'Tokens package must declare a valid exact version',
  );
  assert.ok(
    semver.satisfies(tokensVersion, range),
    `Tokens ${tokensVersion} must satisfy UI peer ${range}`,
  );
}
