import type { DocsSearchSource } from './remark-docs-search';
import { docAreas, pageHref } from './doc-areas.mjs';

export type DocsSearchCategory = (typeof docAreas)[number]['title'] | 'Overview';

export type DocsSearchItem = {
  id: string;
  href: string;
  category: DocsSearchCategory;
  kind: 'page' | 'section';
  pageTitle: string;
  title: string;
  description: string;
  content: string;
  order: number;
};

type SearchHeading = {
  depth: number;
  slug: string;
  text: string;
};

type SearchableContentEntry = {
  id: string;
  data: {
    title: string;
    description?: string;
  };
};

type SearchRenderResult = {
  headings: SearchHeading[];
  remarkPluginFrontmatter: Record<string, unknown> & { __docsSearch?: DocsSearchSource };
};

type SearchIdPrefix = (typeof docAreas)[number]['id'] | 'overview';

type BuildCollectionSearchItemsOptions<T extends SearchableContentEntry> = {
  category: DocsSearchCategory;
  idPrefix: SearchIdPrefix;
  basePath: string;
  entries: T[];
  renderEntry: (entry: T) => Promise<SearchRenderResult>;
  orderedSlugs: readonly string[];
  orderOffset?: number;
  hrefForSlug?: (slug: string) => string;
};

type ParsedSection = {
  heading: SearchHeading;
  content: string;
};

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function makeExcerpt(value: string, maxLength = 168) {
  const normalized = collapseWhitespace(value);
  if (normalized.length <= maxLength) return normalized;

  const shortened = normalized.slice(0, maxLength + 1);
  const finalSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, finalSpace > maxLength * 0.65 ? finalSpace : maxLength).trim()}…`;
}

function getDocsSearchContent(
  slug: string,
  frontmatter: Record<string, unknown> & { __docsSearch?: DocsSearchSource },
  renderedHeadings: SearchHeading[],
) {
  const source = frontmatter.__docsSearch;
  if (!source) throw new Error(`Missing docs search metadata for ${slug}`);

  const relevantHeadings = renderedHeadings.filter(
    (heading) => heading.depth >= 2 && heading.depth <= 3,
  );

  const availableHeadings = [...relevantHeadings];
  const matchedHeadings = source.sections.map((section) => {
    const index = availableHeadings.findIndex(
      (heading) => heading.depth === section.depth && heading.text === section.title,
    );
    if (index < 0) return undefined;
    return availableHeadings.splice(index, 1)[0];
  });

  if (
    relevantHeadings.length !== source.sections.length ||
    matchedHeadings.some((heading) => !heading)
  ) {
    throw new Error(`Docs search heading mismatch for ${slug}`);
  }

  return {
    preamble: source.preamble,
    sections: source.sections.map(
      (section, index): ParsedSection => ({
        heading: matchedHeadings[index]!,
        content: section.content,
      }),
    ),
  };
}

export async function buildCollectionSearchItems<T extends SearchableContentEntry>({
  category,
  idPrefix,
  basePath,
  entries,
  renderEntry,
  orderedSlugs,
  orderOffset = 0,
  hrefForSlug,
}: BuildCollectionSearchItemsOptions<T>): Promise<DocsSearchItem[]> {
  const entryBySlug = new Map(entries.map((entry) => [entry.id, entry]));
  const orderedEntries = [
    ...orderedSlugs.flatMap((slug) => {
      const entry = entryBySlug.get(slug);
      return entry ? [entry] : [];
    }),
    ...entries
      .filter((entry) => !orderedSlugs.includes(entry.id))
      .sort((first, second) => first.data.title.localeCompare(second.data.title)),
  ];
  const records: DocsSearchItem[] = [];

  for (const [pageIndex, entry] of orderedEntries.entries()) {
    const { headings, remarkPluginFrontmatter } = await renderEntry(entry);
    const { preamble, sections } = getDocsSearchContent(
      entry.id,
      remarkPluginFrontmatter,
      headings,
    );
    const href = hrefForSlug?.(entry.id) ?? `${basePath}${entry.id}/`;
    const pageOrder = orderOffset + pageIndex * 100;
    const description = entry.data.description ?? makeExcerpt(preamble);

    records.push({
      id: `${idPrefix}:${entry.id}`,
      href,
      category,
      kind: 'page',
      pageTitle: entry.data.title,
      title: entry.data.title,
      description,
      content: preamble,
      order: pageOrder,
    });

    for (const [sectionIndex, section] of sections.entries()) {
      records.push({
        id: `${idPrefix}:${entry.id}:${section.heading.slug}`,
        href: `${href}#${section.heading.slug}`,
        category,
        kind: 'section',
        pageTitle: entry.data.title,
        title: section.heading.text,
        description: makeExcerpt(section.content),
        content: section.content,
        order: pageOrder + sectionIndex + 1,
      });
    }
  }

  return records;
}

export function createOverviewSearchItem(
  item: Omit<DocsSearchItem, 'id' | 'kind' | 'pageTitle'> & { id: string },
): DocsSearchItem {
  return {
    ...item,
    kind: 'page',
    pageTitle: item.title,
  };
}

export function createOverviewSectionSearchItem(
  item: Omit<DocsSearchItem, 'kind' | 'pageTitle'> & { pageTitle: string },
): DocsSearchItem {
  return {
    ...item,
    kind: 'section',
  };
}

const overviewSearchDescription = {
  foundations: 'Principles, color, typography, spacing, motion, accessibility, and language.',
  components: 'Accessible Veli components for building consistent public services.',
  patterns: 'Reusable approaches for recurring service interactions and content flows.',
} as const;

type SearchCollection = 'docs' | 'foundations' | 'patterns';
type SearchCollectionEntry = import('astro:content').CollectionEntry<SearchCollection>;

export async function buildDocsSearchIndex(): Promise<DocsSearchItem[]> {
  const { getCollection, getEntry, render } = await import('astro:content');
  const { blockPages } = await import('./blocks');
  const { componentGroups, getComponentGroupSlug, inventoryItems } = await import('./site');
  const items: DocsSearchItem[] = [];
  const areas = [...docAreas].sort((first, second) => first.searchBand - second.searchBand);

  const getStarted = await getEntry('guides', 'get-started');
  if (!getStarted) throw new Error('[docs-search] Get Started guide is missing');
  items.push(
    ...(
      await buildCollectionSearchItems({
        renderEntry: (entry) => render(entry),
        category: 'Overview',
        idPrefix: 'overview',
        basePath: '/docs/',
        entries: [getStarted],
        orderedSlugs: ['get-started'],
        orderOffset: -100,
        hrefForSlug: () => '/docs/',
      })
    ).map((item) => (item.kind === 'page' ? { ...item, id: 'documentation:overview' } : item)),
  );

  for (const area of areas) {
    const band = area.searchBand * 10_000;

    if (area.membership === 'blocks') {
      items.push(
        ...blockPages.map((page, index) => {
          const slug = page.id === area.segment ? null : page.id.slice(area.segment.length + 1);
          return createOverviewSearchItem({
            id: page.id,
            href: pageHref(area, slug),
            category: area.title,
            title: page.title,
            description: page.description,
            content: page.markdown,
            order: band + index,
          });
        }),
      );
      continue;
    }

    if (area.catalogOverview) {
      const description =
        area.id === 'foundations' || area.id === 'components' || area.id === 'patterns'
          ? overviewSearchDescription[area.id]
          : undefined;
      if (!description) {
        throw new Error(`[docs-search] ${area.id} overview has no search description`);
      }
      const children = inventoryItems(area.id);
      items.push(
        createOverviewSearchItem({
          id: `${area.id}:overview`,
          href: pageHref(area),
          category: area.title,
          title: area.title,
          description,
          content: children.map((item) => `${item.title} ${item.description}`).join(' '),
          order: band,
        }),
      );
      if (area.id === 'components') {
        items.push(
          ...componentGroups.map((group, index) => {
            const slug = getComponentGroupSlug(group.title);
            return createOverviewSectionSearchItem({
              id: `${area.id}:overview:${slug}`,
              href: `${pageHref(area)}#${slug}`,
              category: area.title,
              pageTitle: area.title,
              title: group.title,
              description: group.items.map((item) => item.title).join(', '),
              content: group.items.map((item) => `${item.title} ${item.description}`).join(' '),
              order: band + 1 + index,
            });
          }),
        );
      }
    }

    const entries = await loadSearchEntries(area.collection, getCollection);
    items.push(
      ...(await buildCollectionSearchItems({
        category: area.title,
        idPrefix: area.id,
        basePath: pageHref(area),
        entries,
        renderEntry: (entry) => render(entry),
        orderedSlugs: inventoryItems(area.id).map((item) => item.slug),
        orderOffset: area.catalogOverview ? band + 100 : band,
      })),
    );
  }

  return items;
}

async function loadSearchEntries(
  collection: SearchCollection,
  getCollection: typeof import('astro:content').getCollection,
): Promise<SearchCollectionEntry[]> {
  switch (collection) {
    case 'docs':
      return getCollection('docs');
    case 'foundations':
      return getCollection('foundations');
    case 'patterns':
      return getCollection('patterns');
    default: {
      const unexpected: never = collection;
      throw new Error(`[docs-search] no collection for ${String(unexpected)}`);
    }
  }
}
