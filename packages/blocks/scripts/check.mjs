import { execFileSync } from 'node:child_process';
import { getBlocks, packageRoot } from './catalog.mjs';

const blocks = getBlocks();
const base = process.env.BLOCKS_BASE_REF;
if (base) {
  for (const { manifest } of blocks) {
    const path = `packages/blocks/src/${manifest.id}`;
    const exists = execFileSync('git', ['ls-tree', base, '--', `${path}/manifest.json`], {
      cwd: packageRoot,
      encoding: 'utf8',
    }).trim();
    if (!exists) continue;
    const old = JSON.parse(
      execFileSync('git', ['show', `${base}:${path}/manifest.json`], {
        cwd: packageRoot,
        encoding: 'utf8',
      }),
    );
    const changed = execFileSync('git', ['diff', base, '--', path], {
      cwd: packageRoot,
      encoding: 'utf8',
    }).trim();
    if (changed) {
      const a = manifest.version.split('.').map(Number),
        b = old.version.split('.').map(Number);
      const first = a.findIndex((value, i) => value !== b[i]);
      if (first < 0 || a[first] < b[first])
        throw new Error(
          `${manifest.id}: increment version and add changelog when changing a block`,
        );
    }
  }
}
console.log(`Validated ${blocks.length} blocks${base ? ` against ${base}` : ''}.`);
