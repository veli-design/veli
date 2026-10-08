import { format } from 'prettier';
import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build, defineConfig, parse } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import { transformCSSValue } from '@terrazzo/token-tools/css';
import { normalize, META, entries } from './normalize.mjs';
import veliAdapter, { variableName } from './adapter.mjs';

export const root = new URL('../', import.meta.url);
export const serialize = (data) => `${JSON.stringify(data, null, 2)}\n`;
export const serializeCanonical = (data) => format(serialize(data), { parser: 'json' });
export const readJSON = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
export async function normalizedInput() {
  const canonical = normalize(
    await readJSON('src/figma.tokens.json'),
    await readJSON('src/motion.tokens.json'),
  );
  await parse({ src: serialize(canonical), filename: new URL('src/design.tokens.json', root) });
  return canonical;
}
function partialAliases(value) {
  if (typeof value === 'string' && /^\{[^}]+\}$/.test(value)) return value.slice(1, -1);
  if (Array.isArray(value)) return value.map(partialAliases);
  if (value && typeof value === 'object') {
    const result = Object.fromEntries(
      Object.entries(value)
        .map(([key, child]) => [key, partialAliases(child)])
        .filter(([, child]) => child !== undefined),
    );
    return Object.keys(result).length ? result : undefined;
  }
  return undefined;
}
export function cssTransform(canonical) {
  const graph = new Map(entries(canonical));
  return (token, options) => {
    const source = graph.get(token.id);
    const dark = options.permutation?.tzMode === 'Dark';
    const value = dark ? (source.$extensions?.mode?.Dark ?? source.$value) : source.$value;
    if (typeof value === 'string' && /^\{[^}]+\}$/.test(value))
      return `var(${variableName({ id: value.slice(1, -1) })})`;
    const metadata = source.$extensions?.[META];
    if (metadata?.cssValue) return metadata.cssValue;
    if (token.$type === 'color') {
      const authored = metadata?.authoredColors?.[dark ? 'dark' : 'light'];
      if (authored) return authored;
      const { components, alpha } = token.$value;
      return `oklch(${components.join(' ')}${alpha < 1 ? ` / ${alpha}` : ''})`;
    }
    const transformed = transformCSSValue(
      { ...token, partialAliasOf: partialAliases(value) },
      options,
    );
    if (token.$type === 'typography' && metadata?.letterSpacing)
      return { ...transformed, 'letter-spacing': metadata.letterSpacing };
    return transformed;
  };
}
export function configFor(canonical, outDir = new URL('dist/', root)) {
  const names = new Set();
  for (const [id] of entries(canonical)) {
    const name = variableName({ id });
    if (names.has(name)) throw new Error(`Canonical CSS naming collision: ${name}`);
    names.add(name);
  }
  return defineConfig(
    {
      tokens: [new URL('src/design.tokens.json', root)],
      outDir,
      lint: { rules: { 'core/consistent-naming': 'off' } },
      plugins: [
        css({
          filename: 'tokens.css',
          variableName,
          omitTypographyShorthand: true,
          transform: cssTransform(canonical),
          permutations: [
            {
              input: { tzMode: '.' },
              prepare: (contents) =>
                `:root:not(.dark), :host:not(.dark), .light {\n  color-scheme: light;\n${contents}\n}`,
            },
            {
              input: { tzMode: 'Dark' },
              prepare: (contents) => `.dark {\n  color-scheme: dark;\n${contents}\n}`,
            },
          ],
        }),
        veliAdapter(canonical),
      ],
    },
    { cwd: root },
  );
}
export async function generate(canonical) {
  const config = configFor(canonical);
  const parsed = await parse(
    { src: serialize(canonical), filename: new URL('src/design.tokens.json', root) },
    { config },
  );
  const result = await build(parsed.tokens, { ...parsed, config });
  return result;
}
export async function writeArtifacts(outDir, result) {
  await rm(outDir, { force: true, recursive: true });
  await mkdir(outDir, { recursive: true });
  for (const { filename, contents } of result.outputFiles) {
    if (contents === undefined) throw new Error(`Missing artifact content: ${filename}`);
    await writeFile(new URL(filename, outDir), contents);
  }
}
export { fileURLToPath };
