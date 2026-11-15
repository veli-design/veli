import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';
import console from 'node:console';
import process from 'node:process';
import sharp from 'sharp';

// Run after importing design assets. Only replace a PNG when the decoded RGBA
// pixels match exactly and the lossless WebP is smaller. Never resize artwork.
const root = fileURLToPath(new URL('../', import.meta.url));
const docs = path.join(root, 'src/content/docs');
const documents = await Promise.all(
  (await readdir(docs))
    .filter((name) => name.endsWith('.mdx'))
    .map(async (name) => ({
      file: path.join(docs, name),
      source: await readFile(path.join(docs, name), 'utf8'),
    })),
);
const sources = [
  ...new Set(
    documents.flatMap(({ source }) =>
      [...source.matchAll(/\/images\/docs\/[^\s"'()<>]+\.png/g)].map((match) => match[0]),
    ),
  ),
].sort();
const replacements = new Map();
const results = [];
sharp.cache(false);
sharp.concurrency(1);
let next = 0;
await Promise.all(
  Array.from({ length: 2 }, async () => {
    while (next < sources.length) {
      const source = sources[next++];
      const file = path.join(root, 'public', source);
      const input = await readFile(file);
      const metadata = await sharp(input).metadata();
      if (metadata.depth !== 'uchar' || metadata.space !== 'srgb') {
        results.push({
          source,
          before: input.length,
          after: input.length,
          replaced: false,
          identical: false,
          reason: 'Keep original bit depth and colour space',
        });
        continue;
      }
      const encoded = await sharp(input)
        .keepMetadata()
        .webp({ lossless: true, effort: 6 })
        .toBuffer();
      const original = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const decoded = await sharp(encoded)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const identical =
        original.info.width === decoded.info.width &&
        original.info.height === decoded.info.height &&
        original.data.equals(decoded.data);
      const replace = identical && encoded.length < input.length;
      if (replace) {
        const target = source.replace(/\.png$/, '.webp');
        await writeFile(path.join(root, 'public', target), encoded);
        replacements.set(source, target);
      }
      results.push({
        source,
        before: input.length,
        after: replace ? encoded.length : input.length,
        replaced: replace,
        identical,
      });
      if (results.length % 50 === 0)
        console.log(`Checked ${results.length}/${sources.length} images`);
    }
  }),
);

// Publish references before removing the superseded, losslessly preserved PNGs.
for (const { file, source } of documents) {
  let updated = source;
  for (const [from, to] of replacements) updated = updated.replaceAll(from, to);
  if (updated !== source) await writeFile(file, updated);
}
for (const source of replacements.keys()) await unlink(path.join(root, 'public', source));
const summary = {
  checked: results.length,
  converted: replacements.size,
  retained: results.filter((result) => !result.replaced),
  beforeBytes: results.reduce((sum, result) => sum + result.before, 0),
  afterBytes: results.reduce((sum, result) => sum + result.after, 0),
};
console.log(JSON.stringify(summary, null, 2));
if (process.env.DOCS_IMAGE_REPORT) {
  await writeFile(process.env.DOCS_IMAGE_REPORT, JSON.stringify({ summary, results }, null, 2));
}
