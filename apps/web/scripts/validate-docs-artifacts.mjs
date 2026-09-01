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

const markdownFiles = [
  ...collectFiles(resolve(distRoot, 'docs'), '.md'),
  ...collectFiles(resolve(distRoot, 'foundations'), '.md'),
].sort();

if (markdownFiles.length !== 43) {
  fail(`expected 43 Markdown pages, found ${markdownFiles.length}`);
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

if (llmsLinks.length !== 43 || new Set(llmsLinks).size !== llmsLinks.length) {
  fail('llms.txt must link to 43 unique Markdown pages');
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

console.log('Validated 43 Markdown pages and llms.txt.');
