import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';
import {
  validateBootstrapSnapshot,
  verifyBootstrapSource,
  verifyPublishedBootstrap,
} from './verify-bootstrap-release.mjs';
const recorded = JSON.parse(
  await readFile(new URL('../releases/npm-bootstrap-2026-11-01.json', import.meta.url)),
);
function fixture() {
  const snapshot = structuredClone(recorded);
  const payload = Buffer.from('reviewed bytes');
  for (const item of Object.values(snapshot.packages)) {
    item.sha256 = createHash('sha256').update(payload).digest('hex');
    item.integrity = `sha512-${createHash('sha512').update(payload).digest('base64')}`;
  }
  const request = async (url, options) => {
    assert.equal(options.redirect, 'error');
    if (url.endsWith('.tgz')) return { status: 200, arrayBuffer: async () => payload };
    const [, name, version] = url.match(
      /^https:\/\/registry.npmjs.org\/(@veli-design\/[^/]+)\/(.+)$/,
    );
    return {
      status: 200,
      json: async () => ({
        name,
        version,
        dist: {
          integrity: snapshot.packages[name].integrity,
          tarball: `https://registry.npmjs.org/${name}/-/${name.split('/')[1]}-${version}.tgz`,
        },
      }),
    };
  };
  return { snapshot, request };
}
test('snapshot confines deployment to the three reviewed packages and safe artifact paths', () => {
  assert.equal(validateBootstrapSnapshot(recorded), recorded);
  for (const change of [
    (s) => {
      s.packages['@fazofazaal/react'] = s.packages['@veli-design/react'];
    },
    (s) => {
      s.packages['@veli-design/react'].file = '../ui.tgz';
    },
    (s) => {
      s.packages['@veli-design/react'].version = '^0.18.0';
    },
    (s) => {
      s.sourceCommit = 'main';
    },
  ]) {
    const s = structuredClone(recorded);
    change(s);
    assert.throws(() => validateBootstrapSnapshot(s));
  }
});
test('reject a different release source before consulting any checkout or registry', async () => {
  await assert.rejects(
    verifyBootstrapSource(recorded, 'd'.repeat(40), '/does-not-exist'),
    /reviewed bootstrap source/,
  );
});
test('public reads verify all exact versions and downloaded bytes without authentication', async () => {
  const { snapshot, request } = fixture();
  const artifacts = await verifyPublishedBootstrap(snapshot, request);
  assert.equal(artifacts.length, 3);
  assert.deepEqual(
    artifacts.map((a) => a.file),
    ['ui.tgz', 'tokens.tgz', 'cli.tgz'],
  );
});
test('changed registry identity, integrity, URL or payload cannot authorize deployment', async () => {
  for (const tamper of [
    (j) => {
      j.name = '@fazofazaal/react';
    },
    (j) => {
      j.version = '0.19.0';
    },
    (j) => {
      j.dist.integrity = 'sha512-wrong';
    },
    (j) => {
      j.dist.tarball = 'https://other.example/payload.tgz';
    },
  ]) {
    const { snapshot, request } = fixture();
    await assert.rejects(
      verifyPublishedBootstrap(snapshot, async (url, options) => {
        const response = await request(url, options);
        if (!url.endsWith('.tgz')) {
          const j = await response.json();
          tamper(j);
          return { status: 200, json: async () => j };
        }
        return response;
      }),
    );
  }
  const { snapshot, request } = fixture();
  await assert.rejects(
    verifyPublishedBootstrap(snapshot, (url, options) =>
      url.endsWith('.tgz')
        ? { status: 200, arrayBuffer: async () => Buffer.from('tampered') }
        : request(url, options),
    ),
    /changed bytes/,
  );
  await assert.rejects(
    verifyPublishedBootstrap(snapshot, async () => ({ status: 404 })),
    /Public npm read failed/,
  );
});
test('bootstrap can validate without deployment; explicit deployment cannot bypass the existing gate', async () => {
  const text = await readFile(
    new URL('../.github/workflows/deploy-bootstrap-sites.yml', import.meta.url),
    'utf8',
  );
  const workflow = parse(text);
  assert.equal(workflow.on.push, undefined);
  assert.equal(workflow.on.workflow_dispatch.inputs['deploy-sites'].default, false);
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.match(workflow.jobs.bootstrap.if, /refs\/heads\/main/);
  const steps = workflow.jobs.bootstrap.steps;
  const verify = steps.findIndex(
    (s) => s.name === 'Verify exact source and anonymously download approved npm artifacts',
  );
  assert.ok(verify < steps.findIndex((s) => s.uses === 'pnpm/action-setup@v6'));
  const gate = steps.findIndex((s) => s.name === 'Require explicit internal deployment approval');
  assert.match(steps[gate].env.REGISTRY_TRANSITION_APPROVED, /VELI_REGISTRY_TRANSITION_APPROVED/);
  assert.match(steps[gate].run, /= 'true'/);
  for (const s of steps.filter((s) => s.uses === 'cloudflare/wrangler-action@v3')) {
    assert.ok(steps.indexOf(s) > gate);
    assert.equal(s.if, 'inputs.deploy-sites');
    assert.equal(s.with.environment, 'production');
    assert.equal(s.with.command, 'deploy');
  }
  assert.equal(steps.filter((s) => s.uses === 'cloudflare/wrangler-action@v3').length, 2);
  assert.ok(steps.findIndex((s) => s.name === 'Build packaged Web and Storybook') < gate);
  assert.ok(
    !/npm publish|pnpm release|changesets\/action|id-token:|NODE_AUTH_TOKEN|NPM_TOKEN/.test(text),
  );
  const stage = steps.find((s) => s.name === 'Stage sites against the verified public tarballs');
  assert.match(stage.env.VELI_TARBALLS, /bootstrap-release\/ui.tgz/);
  assert.match(stage.env.VELI_TARBALLS, /bootstrap-release\/tokens.tgz/);
});
