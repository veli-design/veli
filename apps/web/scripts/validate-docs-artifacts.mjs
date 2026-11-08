import { archive, getBlocks } from '../../../packages/blocks/scripts/catalog.mjs';
import console from 'node:console';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = resolve(appRoot, 'dist');

function fail(message) {
  throw new Error(`[docs-artifacts] ${message}`);
}

function collectFiles(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(entryPath, extension);
    return entry.isFile() && entry.name.endsWith(extension) ? [entryPath] : [];
  });
}

function validateFontNotices() {
  const files = [
    'Inter-OFL.txt',
    'IBM-Plex-Mono-OFL.txt',
    'inter-latin.woff2',
    'inter-latin-ext.woff2',
    'ibm-plex-mono-latin-400.woff2',
    'ibm-plex-mono-latin-500.woff2',
    'ibm-plex-mono-latin-600.woff2',
  ];
  for (const file of files) {
    const source = resolve(appRoot, 'public/fonts', file);
    const output = resolve(distRoot, 'fonts', file);
    if (!existsSync(output) || !readFileSync(source).equals(readFileSync(output))) {
      fail(`fonts/${file} must be distributed unchanged with its accompanying OFL notice`);
    }
  }
}

function validateMarkdown(filePath) {
  const markdown = readFileSync(filePath, 'utf8');
  const displayPath = relative(distRoot, filePath);
  let fenceCharacter;
  let fenceLength = 0;
  let headingCount = 0;

  if (!markdown.endsWith('\n') || markdown.endsWith('\n\n')) {
    fail(`${displayPath} must end with exactly one newline`);
  }
  if (!markdown.startsWith('# ')) {
    fail(`${displayPath} must start with its H1`);
  }

  for (const [index, line] of markdown.split('\n').entries()) {
    const fence = line.match(/^(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1];
      if (!fenceCharacter) {
        fenceCharacter = marker[0];
        fenceLength = marker.length;
      } else if (marker[0] === fenceCharacter && marker.length >= fenceLength) {
        fenceCharacter = undefined;
        fenceLength = 0;
      }
      continue;
    }

    if (fenceCharacter) continue;
    if (line.startsWith('# ')) headingCount += 1;
    if (
      /^(?:import|export)\s/.test(line) ||
      /client:[a-z]+|data-docs-markdown/.test(line) ||
      /^\s*<[A-Za-z][^>]*>/.test(line)
    ) {
      fail(`${displayPath}:${index + 1} contains MDX implementation syntax`);
    }
  }

  if (fenceCharacter) fail(`${displayPath} contains an unclosed code fence`);
  if (headingCount !== 1) fail(`${displayPath} must contain exactly one H1`);
}

if (!existsSync(distRoot)) fail('dist does not exist; run the Astro build first');
validateFontNotices();

const markdownFiles = [
  ...collectFiles(resolve(distRoot, 'docs'), '.md'),
  ...collectFiles(resolve(distRoot, 'foundations'), '.md'),
  ...collectFiles(resolve(distRoot, 'patterns'), '.md'),
  ...collectFiles(resolve(distRoot, 'blocks'), '.md'),
].sort();

const catalogPaths = JSON.parse(readFileSync(resolve(distRoot, 'docs-catalog.json'), 'utf8'));
const actualPaths = markdownFiles.map(
  (file) => `/${relative(distRoot, file).split('\\').join('/')}`,
);
if (JSON.stringify([...catalogPaths].sort()) !== JSON.stringify(actualPaths.sort())) {
  fail('Markdown artifacts differ from the documentation catalog');
}

for (const filePath of markdownFiles) validateMarkdown(filePath);

const llmsPath = resolve(distRoot, 'llms.txt');
const llms = readFileSync(llmsPath, 'utf8');
const llmsLinks = [...llms.matchAll(/\[[^\]]+\]\(([^)]+\.md)\)/g)].map((match) => {
  const url = new URL(match[1], 'https://docs.invalid');
  return url.pathname;
});
const expectedLinks = markdownFiles.map(
  (filePath) => `/${relative(distRoot, filePath).split('\\').join('/')}`,
);

if (llmsLinks.length !== catalogPaths.length || new Set(llmsLinks).size !== llmsLinks.length) {
  fail('llms.txt must link to every catalog page exactly once');
}
for (const expectedLink of expectedLinks) {
  if (!llmsLinks.includes(expectedLink)) fail(`llms.txt is missing ${expectedLink}`);
}
if (!llms.startsWith('# Veli Design System\n\n> ') || llms.length > 50_000) {
  fail('llms.txt must have the expected title and stay below 50 KB');
}

for (const markdownPath of expectedLinks) {
  const htmlPath = resolve(distRoot, markdownPath.slice(1).replace(/index\.md$/, 'index.html'));
  const html = readFileSync(htmlPath, 'utf8');
  if (
    !html.includes(`rel="alternate" type="text/markdown" href="${markdownPath}"`) ||
    !html.includes('rel="describedby" href="/llms.txt"')
  ) {
    fail(`${relative(distRoot, htmlPath)} has incomplete Markdown discovery links`);
  }
}

const headers = readFileSync(resolve(distRoot, '_headers'), 'utf8');
if (
  !headers.includes('Content-Type: text/plain; charset=utf-8') ||
  !headers.includes('Content-Type: text/markdown; charset=utf-8')
) {
  fail('_headers does not declare the expected Markdown MIME types');
}

console.log(`Validated ${markdownFiles.length} Markdown pages and llms.txt.`);

for (const block of getBlocks()) {
  const directory = resolve(distRoot, 'blocks', block.manifest.id);
  const downloaded = readFileSync(resolve(directory, 'source.tar.gz'));
  if (!downloaded.equals(archive(block)))
    fail(`${block.manifest.id}: archive differs from canonical source`);
  const markdown = readFileSync(resolve(directory, 'index.md'), 'utf8');
  for (const file of block.files) {
    if (!markdown.includes(file.bytes.toString('utf8').trimEnd()))
      fail(`${block.manifest.id}: Markdown source differs from download`);
  }
}
