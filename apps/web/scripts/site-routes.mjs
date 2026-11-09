import { readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const directories = {
  components: '../src/content/docs/',
  foundations: '../src/content/foundations/',
  patterns: '../src/content/patterns/',
  blocks: '../../../packages/blocks/src/',
};
export const legacyRedirects = {};
for (const [section, directory] of Object.entries(directories)) {
  const legacy = section === 'components' ? 'docs' : section;
  const target = `/docs/${section}`;
  if (legacy !== 'docs') {
    legacyRedirects[`/${legacy}`] = `${target}/`;
    legacyRedirects[`/${legacy}/`] = `${target}/`;
    legacyRedirects[`/${legacy}/index.md`] = `${target}/index.md`;
  }
  const slugs = readdirSync(fileURLToPath(new URL(directory, import.meta.url)), {
    withFileTypes: true,
  })
    .filter((entry) => (section === 'blocks' ? entry.isDirectory() : entry.name.endsWith('.mdx')))
    .map((entry) => entry.name.replace(/\.mdx$/, ''));
  for (const slug of slugs) {
    legacyRedirects[`/${legacy}/${slug}`] = `${target}/${slug}/`;
    legacyRedirects[`/${legacy}/${slug}/`] = `${target}/${slug}/`;
    legacyRedirects[`/${legacy}/${slug}/index.md`] = `${target}/${slug}/index.md`;
    if (section === 'blocks')
      legacyRedirects[`/${legacy}/${slug}/source.tar.gz`] = `${target}/${slug}/source.tar.gz`;
  }
}
