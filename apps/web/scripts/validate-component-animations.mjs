import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import process from 'node:process';
import { Console } from 'node:console';
import { URL, fileURLToPath } from 'node:url';
import assets from '../src/lib/component-animation-assets.json' with { type: 'json' };
import {
  componentAnimationSlugs,
  retainedAnimationSlugs,
  getComponentAnimation,
  missingComponentAnimations,
} from '../src/lib/component-animations.mjs';

// Read central-directory sizes, including files that use ZIP data descriptors.
function zipEntries(buffer) {
  let end = buffer.length - 22;
  while (end >= Math.max(0, buffer.length - 65557) && buffer.readUInt32LE(end) !== 0x06054b50)
    end--;
  assert.ok(end >= 0, 'Missing ZIP directory');
  const entries = new Map();
  let cursor = buffer.readUInt32LE(end + 16);
  for (let index = 0; index < buffer.readUInt16LE(end + 10); index++) {
    assert.equal(buffer.readUInt32LE(cursor), 0x02014b50);
    const method = buffer.readUInt16LE(cursor + 10);
    const length = buffer.readUInt32LE(cursor + 20);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const name = buffer.subarray(cursor + 46, cursor + 46 + nameLength).toString();
    const local = buffer.readUInt32LE(cursor + 42);
    assert.equal(buffer.readUInt32LE(local), 0x04034b50);
    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    const compressed = buffer.subarray(start, start + length);
    assert.ok(method === 0 || method === 8, `${name}: unsupported ZIP compression`);
    entries.set(name, method === 8 ? inflateRawSync(compressed) : compressed);
    cursor += 46 + nameLength + buffer.readUInt16LE(cursor + 30) + buffer.readUInt16LE(cursor + 32);
  }
  return entries;
}

export function validateComponentAnimations({ requireComplete = false } = {}) {
  assert.equal(componentAnimationSlugs.length, 37);
  assert.equal(new Set(componentAnimationSlugs).size, 37);
  assert.equal(assets.length, 156, 'Unexpected number of animation files');
  const keys = new Set();
  const sources = new Set();
  for (const asset of assets) {
    const key = `${asset.slug}/${asset.locale}/${asset.theme}`;
    assert.ok(!keys.has(key), `Duplicate mapping: ${key}`);
    assert.ok(!sources.has(asset.source), `Duplicate source: ${asset.source}`);
    keys.add(key);
    sources.add(asset.source);
    assert.ok([...componentAnimationSlugs, ...retainedAnimationSlugs].includes(asset.slug));
    assert.ok(['en', 'dv'].includes(asset.locale));
    assert.ok(['light', 'dark'].includes(asset.theme));
    assert.equal(
      asset.path,
      `/animations/components/${asset.slug}/${asset.locale}-${asset.theme}.lottie`,
    );
    const bytes = readFileSync(new URL(`../public${asset.path}`, import.meta.url));
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      asset.sha256,
      `${key}: changed source bytes`,
    );
    const archive = zipEntries(bytes);
    const manifest = JSON.parse(archive.get('manifest.json').toString());
    assert.ok(manifest.animations.length > 0, `${key}: no animations`);
    for (const entry of manifest.animations) {
      const data = archive.get(`a/${entry.id}.json`) ?? archive.get(`animations/${entry.id}.json`);
      assert.ok(data, `${key}: missing animation ${entry.id}`);
      const animation = JSON.parse(data.toString());
      assert.deepEqual([animation.w, animation.h], [805, 476], key);
      assert.deepEqual([asset.width, asset.height], [animation.w, animation.h]);
      assert.equal(asset.frames, animation.op - animation.ip);
      assert.equal(asset.frameRate, animation.fr);
      assert.ok(asset.posterFrame >= 0 && asset.posterFrame < asset.frames);
      for (const resource of animation.assets ?? []) {
        if (resource.p && !resource.e && !resource.p.startsWith('data:')) {
          const path = `${resource.u ?? ''}${resource.p}`.replace(/^\//, '');
          assert.ok(archive.has(path), `${key}: unpackaged resource ${path}`);
        }
      }
    }
    if (asset.locale === 'en' && getComponentAnimation(asset.slug)?.status === 'available') {
      const poster = readFileSync(
        new URL(`../public${asset.path.replace('.lottie', '.webp')}`, import.meta.url),
      );
      assert.ok(poster.length > 100, `${key}: empty poster`);
      assert.equal(poster.subarray(0, 4).toString(), 'RIFF');
      assert.equal(poster.subarray(8, 12).toString(), 'WEBP');
    }
  }
  for (const slug of new Set(assets.map((asset) => asset.slug))) {
    for (const locale of ['en', 'dv'])
      for (const theme of ['light', 'dark']) {
        assert.ok(keys.has(`${slug}/${locale}/${theme}`), `${slug}: missing ${locale}/${theme}`);
      }
  }
  assert.deepEqual(
    missingComponentAnimations,
    ['loading-text', 'sheet', 'spinner'],
    'Unexpected coverage change: update the completion audit',
  );
  assert.equal(getComponentAnimation('provider'), undefined);
  for (const slug of retainedAnimationSlugs) assert.equal(getComponentAnimation(slug), undefined);
  assert.ok(getComponentAnimation('textarea').sources.en.light.src.includes('/textarea/'));
  if (requireComplete)
    assert.deepEqual(
      missingComponentAnimations,
      [],
      `Missing animations: ${missingComponentAnimations.join(', ')}`,
    );
  return {
    supplied: assets.length,
    available: componentAnimationSlugs.length - missingComponentAnimations.length,
    missing: missingComponentAnimations,
  };
}

const console = new Console(process.stdout, process.stderr);

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = validateComponentAnimations({
    requireComplete: process.argv.includes('--require-complete'),
  });
  console.log(
    `Validated ${result.supplied} source files; ${result.available}/37 component animations available.`,
  );
  if (result.missing.length) console.log(`Missing animations: ${result.missing.join(', ')}.`);
}
