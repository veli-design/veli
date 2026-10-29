import assert from 'node:assert/strict';
import semver from 'semver';

export function fixtureDependencies(blocks) {
  const dependencies = {};
  for (const { manifest } of blocks) {
    for (const name of Object.keys({ ...manifest.dependencies, ...manifest.setupDependencies })) {
      const version = manifest.testedDependencies[name];
      assert.ok(semver.valid(version), `${manifest.id}: missing exact tested version for ${name}`);
      assert.ok(
        !dependencies[name] || dependencies[name] === version,
        `Conflicting fixture versions for ${name}`,
      );
      dependencies[name] = version;
    }
  }
  return dependencies;
}

export function assertBlockDependencies(blocks, installed) {
  for (const { manifest } of blocks) {
    for (const requirements of [manifest.dependencies, manifest.setupDependencies]) {
      for (const [name, range] of Object.entries(requirements)) {
        const version = installed[name];
        assert.ok(semver.valid(version), `${manifest.id}: missing installed version for ${name}`);
        assert.ok(
          semver.validRange(range) && semver.satisfies(version, range),
          `${manifest.id}: installed ${name}@${version} does not satisfy ${range}`,
        );
        assert.equal(
          version,
          manifest.testedDependencies[name],
          `${manifest.id}: refresh testedDependencies for ${name} to the rehearsed version`,
        );
      }
    }
  }
}

export function assertCliDependencyReport(report, id) {
  assert.deepEqual(report.added, [id], `${id}: unexpected CLI installation report`);
  assert.deepEqual(report.dependencies?.missing, [], `${id}: missing CLI dependencies`);
  assert.deepEqual(report.dependencies?.incompatible, [], `${id}: incompatible CLI dependencies`);
}
