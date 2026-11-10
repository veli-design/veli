/**
 * Section registry. Array order is sidebar order.
 * `searchBand` is not that index: search still lists Components before Foundations.
 * `id` is the section key. `title` is the catalog and search label.
 * `navTitle` is the sidebar label when it differs from `title`.
 *
 * @typedef {'inventory' | 'files' | 'blocks'} Membership
 * @typedef {{ pattern: string, headers: Readonly<Record<string, string>> }} AssetRule
 * @typedef {{
 *   slug: string,
 *   navTitle: string,
 *   order: number,
 *   markdownFile: string,
 *   versionFile: string,
 * }} Projection
 */

const memberships = new Set(['inventory', 'files', 'blocks']);

/**
 * @param {Record<string, unknown>} area
 */
function validateFilesArea(area) {
  if (typeof area.intro !== 'string' || area.intro.length === 0) {
    throw new Error(`[doc-areas] ${area.id} files area needs an intro`);
  }
  if (!Array.isArray(area.projections)) {
    throw new Error(`[doc-areas] ${area.id} files area needs projections`);
  }
  if (area.frameworkGuides !== undefined && !Array.isArray(area.frameworkGuides)) {
    throw new Error(`[doc-areas] ${area.id} frameworkGuides must be an array`);
  }

  const slugs = new Set();
  const orders = new Set();
  for (const projection of area.projections) {
    if (typeof projection?.slug !== 'string' || !/^[a-z0-9-]+$/.test(projection.slug)) {
      throw new Error(`[doc-areas] ${area.id} has a projection with an invalid slug`);
    }
    if (slugs.has(projection.slug)) {
      throw new Error(`[doc-areas] ${area.id} has a duplicate projection slug "${projection.slug}"`);
    }
    slugs.add(projection.slug);
    if (!Number.isInteger(projection.order) || projection.order <= 0) {
      throw new Error(`[doc-areas] ${area.id} projection "${projection.slug}" needs an order`);
    }
    if (orders.has(projection.order)) {
      throw new Error(`[doc-areas] ${area.id} has a duplicate projection order ${projection.order}`);
    }
    orders.add(projection.order);
    if (typeof projection.navTitle !== 'string' || projection.navTitle.length === 0) {
      throw new Error(`[doc-areas] ${area.id} projection "${projection.slug}" needs a navTitle`);
    }
    if (typeof projection.markdownFile !== 'string' || !projection.markdownFile.endsWith('.md')) {
      throw new Error(`[doc-areas] ${area.id} projection "${projection.slug}" needs a markdown file`);
    }
    if (typeof projection.versionFile !== 'string' || !projection.versionFile.endsWith('package.json')) {
      throw new Error(`[doc-areas] ${area.id} projection "${projection.slug}" needs a version file`);
    }
  }

  for (const slug of area.frameworkGuides ?? []) {
    if (typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(`[doc-areas] ${area.id} has an invalid framework guide slug`);
    }
    if (slugs.has(slug)) {
      throw new Error(`[doc-areas] ${area.id} framework guide "${slug}" collides with a projection`);
    }
    slugs.add(slug);
  }
}

/**
 * Framework tabs on `/getting-started/frameworks/`.
 * `id` matches the Astro heading slug (github-slugger) so `#vite` / `#nextjs` keep working.
 * H2 contract is the `label` list; step detail lives in H3s.
 */
export const frameworkGuideTabs = [
  { id: 'vite', label: 'Vite' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'react-router', label: 'React Router' },
  { id: 'tanstack-start', label: 'TanStack Start' },
  { id: 'astro', label: 'Astro' },
];

/** H2 text contract derived from frameworkGuideTabs. */
export const frameworkGuideHeadings = frameworkGuideTabs.map((tab) => tab.label);

/**
 * @param {readonly Record<string, unknown>[]} areas
 */
export function defineDocAreas(areas) {
  if (!Array.isArray(areas) || areas.length === 0) {
    throw new Error('[doc-areas] expected at least one area');
  }

  const ids = new Set();
  const segments = new Set();
  const collections = new Set();
  const bands = new Set();
  let blocks = 0;

  for (const area of areas) {
    if (typeof area?.id !== 'string' || area.id.length === 0) {
      throw new Error('[doc-areas] every area needs an id');
    }
    if (ids.has(area.id)) throw new Error(`[doc-areas] duplicate id "${area.id}"`);
    ids.add(area.id);

    if (typeof area.title !== 'string' || area.title.length === 0) {
      throw new Error(`[doc-areas] ${area.id} needs a title`);
    }
    if (area.navTitle !== undefined && typeof area.navTitle !== 'string') {
      throw new Error(`[doc-areas] ${area.id} navTitle must be a string`);
    }
    if (typeof area.segment !== 'string' || !/^[a-z0-9-]+$/.test(area.segment)) {
      throw new Error(`[doc-areas] ${area.id} needs a URL segment`);
    }
    if (segments.has(area.segment)) {
      throw new Error(`[doc-areas] duplicate segment "${area.segment}"`);
    }
    segments.add(area.segment);

    if (!memberships.has(area.membership)) {
      throw new Error(`[doc-areas] ${area.id} has unknown membership "${area.membership}"`);
    }
    if (typeof area.catalogOverview !== 'boolean') {
      throw new Error(`[doc-areas] ${area.id} needs catalogOverview`);
    }
    if (!Number.isInteger(area.searchBand) || area.searchBand < 0) {
      throw new Error(`[doc-areas] ${area.id} needs a searchBand`);
    }
    if (bands.has(area.searchBand)) {
      throw new Error(`[doc-areas] duplicate searchBand ${area.searchBand}`);
    }
    bands.add(area.searchBand);

    if (area.membership === 'inventory' || area.membership === 'files') {
      if (typeof area.collection !== 'string' || area.collection !== area.segment) {
        throw new Error(`[doc-areas] ${area.id} collection must equal its segment`);
      }
      if (collections.has(area.collection)) {
        throw new Error(`[doc-areas] duplicate collection "${area.collection}"`);
      }
      collections.add(area.collection);
    } else if (area.collection !== undefined) {
      throw new Error(`[doc-areas] ${area.id} blocks area cannot declare a collection`);
    }

    if (area.membership === 'blocks') blocks += 1;
    if (area.membership === 'files') validateFilesArea(area);
    else if (area.projections !== undefined || area.frameworkGuides !== undefined) {
      throw new Error(`[doc-areas] ${area.id} projections require files membership`);
    }

    if (area.assetRules !== undefined) {
      if (!Array.isArray(area.assetRules)) {
        throw new Error(`[doc-areas] ${area.id} assetRules must be an array`);
      }
      for (const rule of area.assetRules) {
        if (typeof rule?.pattern !== 'string' || rule.pattern.length === 0) {
          throw new Error(`[doc-areas] ${area.id} has an asset rule without a pattern`);
        }
        if (!rule.headers || typeof rule.headers !== 'object') {
          throw new Error(`[doc-areas] ${area.id} asset rule "${rule.pattern}" needs headers`);
        }
      }
    }
  }

  if (blocks !== 1) throw new Error('[doc-areas] expected exactly one blocks area');
  return areas;
}

const areas = /** @type {const} */ ([
  {
    id: 'getting-started',
    title: 'Getting started',
    segment: 'getting-started',
    collection: 'getting-started',
    membership: 'files',
    catalogOverview: true,
    searchBand: 4,
    intro:
      'Install the React and token packages, load the typefaces in your app, and use the CLI only when you want editable Blocks.',
    frameworkGuides: ['frameworks'],
    projections: [
      {
        slug: 'agents',
        navTitle: 'Agents',
        order: 100,
        markdownFile: 'packages/react/AGENT_GUIDE.md',
        versionFile: 'packages/react/package.json',
      },
    ],
  },
  {
    id: 'foundations',
    title: 'Foundations',
    navTitle: 'Foundation',
    segment: 'foundations',
    collection: 'foundations',
    membership: 'inventory',
    catalogOverview: true,
    searchBand: 1,
  },
  {
    id: 'components',
    title: 'Components',
    segment: 'docs',
    collection: 'docs',
    membership: 'inventory',
    catalogOverview: true,
    searchBand: 0,
  },
  {
    id: 'patterns',
    title: 'Patterns',
    segment: 'patterns',
    collection: 'patterns',
    membership: 'inventory',
    catalogOverview: false,
    searchBand: 2,
  },
  {
    id: 'blocks',
    title: 'Blocks',
    segment: 'blocks',
    membership: 'blocks',
    catalogOverview: false,
    searchBand: 3,
    assetRules: [
      {
        pattern: '/blocks/*/source.tar.gz',
        headers: {
          'Content-Type': 'application/gzip',
          'Content-Disposition': 'attachment',
        },
      },
    ],
  },
]);

defineDocAreas(areas);

export const docAreas = areas;

/**
 * @template {typeof docAreas[number]['id']} Id
 * @param {Id} id
 * @returns {Extract<(typeof docAreas)[number], { id: Id }>}
 */
export function docArea(id) {
  const area = docAreas.find((candidate) => candidate.id === id);
  if (!area) throw new Error(`[doc-areas] unknown area "${id}"`);
  return area;
}

/**
 * @param {(typeof docAreas)[number]} area
 */
export function areaNavTitle(area) {
  return 'navTitle' in area ? area.navTitle : area.title;
}

/**
 * @param {(typeof docAreas)[number]} area
 * @param {string | null} [slug]
 * @returns {`/${string}/`}
 */
export function pageHref(area, slug = null) {
  if (!area || typeof area.segment !== 'string' || area.segment.length === 0) {
    throw new Error('[doc-areas] pageHref requires an area');
  }
  if (slug === null) return `/${area.segment}/`;
  if (typeof slug !== 'string' || slug.length === 0 || slug.includes('/')) {
    throw new Error(`[doc-areas] invalid slug "${slug}"`);
  }
  return `/${area.segment}/${slug}/`;
}

/**
 * Overview ids use the URL segment, so Components is `docs`, not `components`.
 * @param {(typeof docAreas)[number]} area
 * @param {string | null} [slug]
 */
export function pageId(area, slug = null) {
  if (!area || typeof area.segment !== 'string') {
    throw new Error('[doc-areas] pageId requires an area');
  }
  if (slug === null) return area.segment;
  if (typeof slug !== 'string' || slug.length === 0 || slug.includes('/')) {
    throw new Error(`[doc-areas] invalid slug "${slug}"`);
  }
  return `${area.segment}/${slug}`;
}

/**
 * @param {(typeof docAreas)[number]} area
 * @param {string | null} [slug]
 */
export function pageMarkdownPath(area, slug = null) {
  return `${pageHref(area, slug)}index.md`;
}

/** Prose collection names, in registry order. */
export function proseCollections() {
  return docAreas.flatMap((area) => ('collection' in area ? [area.collection] : []));
}

/**
 * @param {string} filePath
 * @returns {{ collection: string, slug: string } | null}
 */
export function matchContentPath(filePath) {
  const path = String(filePath ?? '').replaceAll('\\', '/');
  for (const area of docAreas) {
    if (!('projections' in area)) continue;
    for (const projection of area.projections) {
      const marker = `/${projection.markdownFile}`;
      if (path.endsWith(marker)) {
        return { collection: area.collection, slug: projection.slug };
      }
    }
  }
  const collections = proseCollections();
  if (collections.length === 0) return null;
  const match = path.match(
    new RegExp(`(?:^|/)src/content/(${collections.join('|')})/(.+)\\.mdx?$`),
  );
  if (!match?.[1] || !match[2]) return null;
  return { collection: match[1], slug: match[2] };
}

/**
 * @param {string} filePath
 */
export function documentHref(filePath) {
  const matched = matchContentPath(filePath);
  if (!matched) return null;
  const area = docAreas.find(
    (candidate) => 'collection' in candidate && candidate.collection === matched.collection,
  );
  if (!area) return null;
  return pageHref(area, matched.slug);
}

const markdownContentType = 'text/markdown; charset=utf-8';

/**
 * Workers static-assets `_headers`. `*` matches any characters, including slashes.
 * @param {readonly typeof docAreas[number][]} [source]
 */
export function renderHeaders(source = docAreas) {
  const blocks = [];

  for (const area of source) {
    blocks.push(`/${area.segment}/*.md\n  Content-Type: ${markdownContentType}`);
  }

  for (const area of source) {
    if (!('assetRules' in area) || !area.assetRules) continue;
    for (const rule of area.assetRules) {
      const lines = [rule.pattern];
      for (const [name, value] of Object.entries(rule.headers)) {
        lines.push(`  ${name}: ${value}`);
      }
      blocks.push(lines.join('\n'));
    }
  }

  blocks.push('/llms.txt\n  Content-Type: text/plain; charset=utf-8');
  return `${blocks.join('\n\n')}\n`;
}

/**
 * @param {string} headersFile
 */
export function parseHeaderRules(headersFile) {
  /** @type {{ pattern: string, headers: Record<string, string> }[]} */
  const rules = [];
  /** @type {{ pattern: string, headers: Record<string, string> } | null} */
  let current = null;

  for (const line of headersFile.split(/\r?\n/)) {
    if (line.trim() === '') {
      current = null;
      continue;
    }
    if (/^\s/.test(line)) {
      if (!current) throw new Error('[doc-areas] header directive without a path');
      const match = line.match(/^\s+([^:]+):\s*(.*)$/);
      if (!match?.[1]) throw new Error(`[doc-areas] invalid header directive "${line.trim()}"`);
      current.headers[match[1]] = match[2] ?? '';
      continue;
    }
    current = { pattern: line.trim(), headers: {} };
    rules.push(current);
  }

  return rules;
}

/**
 * @param {string} pattern
 * @param {string} path
 */
export function headerRuleMatches(pattern, path) {
  const expression = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
  return new RegExp(`^${expression}$`).test(path);
}

/**
 * @param {string} headersFile
 * @param {readonly string[]} markdownPaths
 */
export function assertHeadersCover(headersFile, markdownPaths) {
  const rules = parseHeaderRules(headersFile);
  const uncovered = markdownPaths.filter((path) => {
    return !rules.some(
      (rule) =>
        rule.pattern.endsWith('.md') &&
        rule.headers['Content-Type'] === markdownContentType &&
        headerRuleMatches(rule.pattern, path),
    );
  });
  if (uncovered.length > 0) {
    throw new Error(`[doc-areas] _headers does not cover ${uncovered.join(', ')}`);
  }
}
