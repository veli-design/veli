import { blockPages } from './blocks';
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import {
  componentGroups,
  docsOverview,
  externalResources,
  foundations,
  foundationsOverview,
  patterns,
} from './site';

const docsMarkdownFrontmatterKey = '__docsMarkdown';

export type DocsSection = 'Overview' | 'Foundations' | 'Components' | 'Patterns' | 'Blocks';

type EntrySource =
  | { kind: 'entry'; entry: CollectionEntry<'docs'> }
  | { kind: 'entry'; entry: CollectionEntry<'foundations'> }
  | { kind: 'entry'; entry: CollectionEntry<'patterns'> }
  | { kind: 'entry'; entry: CollectionEntry<'guides'> };

type OverviewSource = {
  kind: 'overview';
  overview: 'documentation' | 'docs' | 'foundations' | 'patterns';
};

export type DocsCatalogPage = {
  id: string;
  section: DocsSection;
  group?: string;
  label: string;
  title: string;
  description: string;
  htmlPath: string;
  markdownPath: string;
  source: EntrySource | OverviewSource | { kind: 'block'; markdown: string };
};

export type RenderedDocsPage = Omit<DocsCatalogPage, 'source'> & {
  markdown: string;
};

type NavigationItem = {
  title: string;
  slug: string;
  description: string;
};

export function toMarkdownPath(htmlPath: string) {
  if (!htmlPath.startsWith('/') || !htmlPath.endsWith('/')) {
    throw new Error(
      `[docs-markdown] expected a root-relative directory URL, received "${htmlPath}"`,
    );
  }

  return `${htmlPath}index.md`;
}

function requireDescription(entry: CollectionEntry<'docs' | 'foundations' | 'patterns'>) {
  const description = entry.data.description?.trim();
  if (!description) {
    throw new Error(`[docs-markdown] ${entry.collection}/${entry.slug} is missing a description`);
  }

  return description;
}

function orderCollectionEntries<T extends 'docs' | 'foundations' | 'patterns'>(
  collection: T,
  entries: CollectionEntry<T>[],
  navigationItems: readonly NavigationItem[],
) {
  const entryBySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const navigationSlugs = new Set(navigationItems.map((item) => item.slug));
  const unexpectedEntries = entries.filter((entry) => !navigationSlugs.has(entry.slug));
  const missingEntries = navigationItems.filter((item) => !entryBySlug.has(item.slug));

  if (missingEntries.length > 0 || unexpectedEntries.length > 0) {
    const details = [
      missingEntries.length > 0
        ? `missing: ${missingEntries.map((item) => item.slug).join(', ')}`
        : '',
      unexpectedEntries.length > 0
        ? `unlisted: ${unexpectedEntries.map((entry) => entry.slug).join(', ')}`
        : '',
    ]
      .filter(Boolean)
      .join('; ');
    throw new Error(`[docs-markdown] ${collection} navigation and collection differ (${details})`);
  }

  return navigationItems.map((item) => {
    const entry = entryBySlug.get(item.slug)!;
    if (entry.data.title !== item.title) {
      throw new Error(
        `[docs-markdown] ${collection}/${item.slug} title differs between navigation and frontmatter`,
      );
    }
    requireDescription(entry);
    return entry;
  });
}

function validateCatalog(pages: readonly DocsCatalogPage[]) {
  const uniqueFields: Array<keyof Pick<DocsCatalogPage, 'id' | 'htmlPath' | 'markdownPath'>> = [
    'id',
    'htmlPath',
    'markdownPath',
  ];

  for (const field of uniqueFields) {
    const values = pages.map((page) => page[field]);
    if (new Set(values).size !== values.length) {
      throw new Error(`[docs-markdown] duplicate catalog ${field}`);
    }
  }
}

export async function getDocsCatalog(): Promise<DocsCatalogPage[]> {
  const getStarted = await getEntry('guides', 'get-started');
  if (!getStarted) throw new Error('[docs-markdown] Get Started guide is missing');
  const [docsEntries, foundationEntries, patternEntries] = await Promise.all([
    getCollection('docs'),
    getCollection('foundations'),
    getCollection('patterns'),
  ]);
  const componentItems = componentGroups.flatMap((group) => group.items);
  const orderedFoundations = orderCollectionEntries('foundations', foundationEntries, foundations);
  const orderedComponents = orderCollectionEntries('docs', docsEntries, componentItems);
  const orderedPatterns = orderCollectionEntries('patterns', patternEntries, patterns);
  const componentGroupBySlug = new Map(
    componentGroups.flatMap((group) =>
      group.items.map((item) => [item.slug, group.title] as const),
    ),
  );
  const pages: DocsCatalogPage[] = [
    {
      id: 'documentation',
      section: 'Overview',
      label: getStarted.data.title,
      title: getStarted.data.title,
      description: getStarted.data.description!,
      htmlPath: '/docs/',
      markdownPath: '/docs/index.md',
      source: { kind: 'entry', entry: getStarted },
    },
    {
      id: 'foundations',
      section: 'Foundations',
      label: foundationsOverview.label,
      title: foundationsOverview.title,
      description: foundationsOverview.description,
      htmlPath: foundationsOverview.htmlPath,
      markdownPath: foundationsOverview.markdownPath,
      source: { kind: 'overview', overview: 'foundations' },
    },
    ...orderedFoundations.map(
      (entry): DocsCatalogPage => ({
        id: `foundations/${entry.slug}`,
        section: 'Foundations',
        label: entry.data.title,
        title: entry.data.title,
        description: requireDescription(entry),
        htmlPath: `/docs/foundations/${entry.slug}/`,
        markdownPath: `/docs/foundations/${entry.slug}/index.md`,
        source: { kind: 'entry', entry },
      }),
    ),
    {
      id: 'docs',
      section: 'Components',
      label: docsOverview.label,
      title: docsOverview.title,
      description: docsOverview.description,
      htmlPath: docsOverview.htmlPath,
      markdownPath: docsOverview.markdownPath,
      source: { kind: 'overview', overview: 'docs' },
    },
    ...orderedComponents.map(
      (entry): DocsCatalogPage => ({
        id: `docs/${entry.slug}`,
        section: 'Components',
        group: componentGroupBySlug.get(entry.slug),
        label: entry.data.title,
        title: entry.data.title,
        description: requireDescription(entry),
        htmlPath: `/docs/components/${entry.slug}/`,
        markdownPath: `/docs/components/${entry.slug}/index.md`,
        source: { kind: 'entry', entry },
      }),
    ),
    {
      id: 'patterns',
      section: 'Patterns',
      label: 'Patterns overview',
      title: 'Veli Patterns',
      description: 'Reusable approaches for recurring service interactions and content flows.',
      htmlPath: '/docs/patterns/',
      markdownPath: '/docs/patterns/index.md',
      source: { kind: 'overview', overview: 'patterns' },
    },
    ...orderedPatterns.map(
      (entry): DocsCatalogPage => ({
        id: `patterns/${entry.slug}`,
        section: 'Patterns',
        label: entry.data.title,
        title: entry.data.title,
        description: requireDescription(entry),
        htmlPath: `/docs/patterns/${entry.slug}/`,
        markdownPath: `/docs/patterns/${entry.slug}/index.md`,
        source: { kind: 'entry', entry },
      }),
    ),
  ];

  pages.push(
    ...blockPages.map(
      (page): DocsCatalogPage => ({
        ...page,
        section: 'Blocks',
        label: page.title,
        htmlPath: `/docs/${page.id}/`,
        markdownPath: `/docs/${page.id}/index.md`,
        source: { kind: 'block', markdown: page.markdown },
      }),
    ),
  );

  validateCatalog(pages);
  return pages;
}

function normalizeLine(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function markdownListItem(label: string, href: string, description: string) {
  const safeLabel = label.replaceAll('\\', '\\\\').replaceAll('[', '\\[').replaceAll(']', '\\]');
  return `- [${safeLabel}](${href}): ${normalizeLine(description)}`;
}

function buildOverviewMarkdown(page: DocsCatalogPage) {
  const lines = [`# ${page.title}`, '', page.description, ''];

  if (page.source.kind !== 'overview') {
    throw new Error(`[docs-markdown] ${page.id} is not an overview page`);
  }

  if (page.source.overview === 'documentation') {
    lines.push(
      '## Explore the system',
      '',
      markdownListItem('Foundations', '/docs/foundations/', foundationsOverview.description),
      markdownListItem('Components', '/docs/components/', docsOverview.description),
      markdownListItem(
        'Patterns',
        '/docs/patterns/',
        'Recurring service interactions and content flows.',
      ),
      markdownListItem(
        'Blocks',
        '/docs/blocks/',
        'Editable compositions built from Veli primitives.',
      ),
    );
  } else if (page.source.overview === 'patterns') {
    lines.push(
      '## Patterns',
      '',
      ...patterns.map((item) => markdownListItem(item.title, item.href, item.description)),
    );
  } else if (page.source.overview === 'foundations') {
    lines.push(
      '## Foundations',
      '',
      ...foundations.map((item) => markdownListItem(item.title, item.href, item.description)),
    );
  } else {
    lines.push(
      docsOverview.packageGuidance,
      '',
      markdownListItem(
        'Foundations',
        foundationsOverview.htmlPath,
        'Principles, color, type, spacing, accessibility, and language.',
      ),
      '',
    );

    for (const group of componentGroups) {
      lines.push(
        `## ${group.title}`,
        '',
        ...group.items.map((item) =>
          markdownListItem(item.title, `/docs/components/${item.slug}/`, item.description),
        ),
        '',
      );
    }
  }

  return `${lines.join('\n').replace(/\n+$/, '')}\n`;
}

async function renderDocsPage(page: DocsCatalogPage): Promise<RenderedDocsPage> {
  let markdown: string;

  if (page.source.kind === 'block') {
    markdown = page.source.markdown;
  } else if (page.source.kind === 'overview') {
    markdown = buildOverviewMarkdown(page);
  } else {
    const rendered = await page.source.entry.render();
    const generated = rendered.remarkPluginFrontmatter[docsMarkdownFrontmatterKey];
    if (typeof generated !== 'string' || generated.length === 0) {
      throw new Error(`[docs-markdown] no canonical Markdown was generated for ${page.id}`);
    }
    markdown = generated;
  }

  const { id, section, group, label, title, description, htmlPath, markdownPath } = page;
  return { id, section, group, label, title, description, htmlPath, markdownPath, markdown };
}

export async function getRenderedDocsCatalog(): Promise<RenderedDocsPage[]> {
  const pages = await getDocsCatalog();
  return Promise.all(pages.map((page) => renderDocsPage(page)));
}

function artifactUrl(path: string, origin?: URL) {
  return origin ? new URL(path, origin).href : path;
}

export function buildLlmsTxt(pages: readonly DocsCatalogPage[], origin?: URL) {
  const foundationPages = pages.filter(
    (page) => page.section === 'Foundations' && page.source.kind === 'entry',
  );
  const componentPages = pages.filter(
    (page) => page.section === 'Components' && page.source.kind === 'entry',
  );
  const patternPages = pages.filter(
    (page) => page.section === 'Patterns' && page.source.kind === 'entry',
  );
  const foundationOverviewPage = pages.find((page) => page.id === 'foundations');
  const docsOverviewPage = pages.find((page) => page.id === 'docs');

  if (!foundationOverviewPage || !docsOverviewPage) {
    throw new Error('[docs-markdown] the llms.txt index requires both overview pages');
  }

  const lines = [
    '# Veli Design System',
    '',
    '> Veli gives every Maldivian service one accessible, bilingual system to build from.',
    '',
    'Use these clean Markdown resources for Veli foundations and component implementation guidance.',
    '',
    '## Start here',
    '',
    ...pages
      .filter((page) => ['documentation', 'patterns'].includes(page.id))
      .map((page) =>
        markdownListItem(page.label, artifactUrl(page.markdownPath, origin), page.description),
      ),
    markdownListItem(
      docsOverviewPage.label,
      artifactUrl(docsOverviewPage.markdownPath, origin),
      docsOverviewPage.description,
    ),
    markdownListItem(
      foundationOverviewPage.label,
      artifactUrl(foundationOverviewPage.markdownPath, origin),
      foundationOverviewPage.description,
    ),
    '',
    '## Foundations',
    '',
    ...foundationPages.map((page) =>
      markdownListItem(page.label, artifactUrl(page.markdownPath, origin), page.description),
    ),
    '',
  ];

  for (const group of componentGroups) {
    const groupPages = componentPages.filter((page) => page.group === group.title);
    if (groupPages.length !== group.items.length) {
      throw new Error(`[docs-markdown] incomplete llms.txt component group "${group.title}"`);
    }

    lines.push(
      `## ${group.title}`,
      '',
      ...groupPages.map((page) =>
        markdownListItem(page.label, artifactUrl(page.markdownPath, origin), page.description),
      ),
      '',
    );
  }

  const patternList = patternPages.map((page) =>
    markdownListItem(page.label, artifactUrl(page.markdownPath, origin), page.description),
  );
  if (patternList.length > 0) {
    lines.push('## Patterns', '', ...patternList, '');
  }

  lines.push(
    '## Blocks',
    '',
    ...pages
      .filter((page) => page.section === 'Blocks')
      .map((page) =>
        markdownListItem(page.label, artifactUrl(page.markdownPath, origin), page.description),
      ),
    '',
  );

  const optionalDescriptions = {
    Figma: 'Design source for Veli components and foundations.',
    GitHub: 'Source repository for the Veli Design System.',
    npm: 'Published Veli UI package.',
  } as const;
  lines.push(
    '## Optional',
    '',
    ...externalResources.flatMap((resource) =>
      resource.href
        ? [markdownListItem(resource.label, resource.href, optionalDescriptions[resource.label])]
        : [],
    ),
  );

  return `${lines.join('\n').replace(/\n+$/, '')}\n`;
}
