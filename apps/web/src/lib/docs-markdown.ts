import { blockPages } from './blocks';
import { getCollection, type CollectionEntry } from 'astro:content';
import { docArea, docAreas, pageHref, pageId, pageMarkdownPath } from './doc-areas.mjs';
import {
  componentGroups,
  docsOverview,
  externalResources,
  foundations,
  foundationsOverview,
  inventoryItems,
} from './site';

const docsMarkdownFrontmatterKey = '__docsMarkdown';

export type DocsSection = (typeof docAreas)[number]['id'];

type ProseEntry =
  | CollectionEntry<'docs'>
  | CollectionEntry<'foundations'>
  | CollectionEntry<'patterns'>;

type EntrySource = {
  kind: 'entry';
  entry: ProseEntry;
};

type OverviewAreaId = Extract<(typeof docAreas)[number], { catalogOverview: true }>['id'];

type OverviewSource = {
  kind: 'overview';
  areaId: OverviewAreaId;
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

function requireDescription(entry: ProseEntry) {
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

type InventoryArea = Extract<(typeof docAreas)[number], { membership: 'inventory' }>;

async function orderedInventoryEntries(area: InventoryArea) {
  const items = inventoryItems(area.id);
  switch (area.collection) {
    case 'foundations':
      return orderCollectionEntries('foundations', await getCollection('foundations'), items);
    case 'docs':
      return orderCollectionEntries('docs', await getCollection('docs'), items);
    case 'patterns':
      return orderCollectionEntries('patterns', await getCollection('patterns'), items);
    default: {
      const unexpected: never = area;
      throw new Error(`[docs-markdown] no collection for ${String(unexpected)}`);
    }
  }
}

function overviewPage(area: Extract<(typeof docAreas)[number], { catalogOverview: true }>) {
  if (area.id !== 'foundations' && area.id !== 'components') {
    const unexpected: never = area;
    throw new Error(`[docs-markdown] no overview copy for ${String(unexpected)}`);
  }
  const copy = area.id === 'foundations' ? foundationsOverview : docsOverview;
  const page: DocsCatalogPage = {
    id: pageId(area),
    section: area.id,
    label: copy.label,
    title: copy.title,
    description: copy.description,
    htmlPath: pageHref(area),
    markdownPath: pageMarkdownPath(area),
    source: { kind: 'overview', areaId: area.id },
  };
  return page;
}

export async function getDocsCatalog(): Promise<DocsCatalogPage[]> {
  const componentGroupBySlug = new Map(
    componentGroups.flatMap((group) =>
      group.items.map((item) => [item.slug, group.title] as const),
    ),
  );
  const pages: DocsCatalogPage[] = [];

  for (const area of docAreas) {
    if (area.membership === 'inventory') {
      const ordered = await orderedInventoryEntries(area);
      if (area.catalogOverview) pages.push(overviewPage(area));
      for (const entry of ordered) {
        const group = area.id === 'components' ? componentGroupBySlug.get(entry.slug) : undefined;
        pages.push({
          id: pageId(area, entry.slug),
          section: area.id,
          ...(group ? { group } : {}),
          label: entry.data.title,
          title: entry.data.title,
          description: requireDescription(entry),
          htmlPath: pageHref(area, entry.slug),
          markdownPath: pageMarkdownPath(area, entry.slug),
          source: { kind: 'entry', entry },
        });
      }
      continue;
    }

    if (area.membership === 'blocks') {
      for (const blockPage of blockPages) {
        const slug =
          blockPage.id === area.segment ? null : blockPage.id.slice(area.segment.length + 1);
        pages.push({
          id: blockPage.id,
          section: area.id,
          label: blockPage.title,
          title: blockPage.title,
          description: blockPage.description,
          htmlPath: pageHref(area, slug),
          markdownPath: pageMarkdownPath(area, slug),
          source: { kind: 'block', markdown: blockPage.markdown },
        });
      }
      continue;
    }

    const unexpected: never = area;
    throw new Error(`[docs-markdown] unsupported area ${String(unexpected)}`);
  }

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

  if (page.source.areaId === 'foundations') {
    lines.push(
      `## ${docArea('foundations').title}`,
      '',
      ...foundations.map((item) => markdownListItem(item.title, item.href, item.description)),
    );
  } else {
    const components = docArea('components');
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
          markdownListItem(item.title, pageHref(components, item.slug), item.description),
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
  const foundationsArea = docArea('foundations');
  const componentsArea = docArea('components');
  const foundationPages = pages.filter(
    (page) => page.section === foundationsArea.id && page.source.kind === 'entry',
  );
  const componentPages = pages.filter(
    (page) => page.section === componentsArea.id && page.source.kind === 'entry',
  );
  const foundationOverviewPage = pages.find((page) => page.id === pageId(foundationsArea));
  const docsOverviewPage = pages.find((page) => page.id === pageId(componentsArea));

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
    `## ${foundationsArea.title}`,
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

  for (const area of docAreas) {
    if (area.id === foundationsArea.id || area.id === componentsArea.id) continue;
    const areaPages = pages.filter((page) => {
      if (page.section !== area.id) return false;
      return area.membership === 'blocks' || page.source.kind === 'entry';
    });
    if (areaPages.length === 0) continue;
    lines.push(
      `## ${area.title}`,
      '',
      ...areaPages.map((page) =>
        markdownListItem(page.label, artifactUrl(page.markdownPath, origin), page.description),
      ),
      '',
    );
  }

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
