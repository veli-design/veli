import type { DocsSearchSource } from './remark-docs-search';
import { getCollection } from 'astro:content';
import { blockPages } from './blocks';
import { docAreas, pageHref } from './doc-areas.mjs';
import { renderPackageGuide } from './package-guide-render';
import { componentGroups, getComponentGroupSlug, inventoryItems } from './site';

export type DocsSearchCategory = (typeof docAreas)[number]['title'];

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
  slug: string;
  data: {
    title: string;
    description?: string;
  };
  render: () => Promise<{
    headings: SearchHeading[];
    remarkPluginFrontmatter: Record<string, unknown> & {
      __docsSearch?: DocsSearchSource;
    };
  }>;
};

type BuildCollectionSearchItemsOptions = {
  category: DocsSearchCategory;
  idPrefix: (typeof docAreas)[number]['id'];
  basePath: string;
  entries: SearchableContentEntry[];
  orderedSlugs: readonly string[];
  orderOffset?: number;
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

export async function buildCollectionSearchItems({
  category,
  idPrefix,
  basePath,
  entries,
  orderedSlugs,
  orderOffset = 0,
}: BuildCollectionSearchItemsOptions): Promise<DocsSearchItem[]> {
  const entryBySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const orderedEntries = [
    ...orderedSlugs.flatMap((slug) => {
      const entry = entryBySlug.get(slug);
      return entry ? [entry] : [];
    }),
    ...entries
      .filter((entry) => !orderedSlugs.includes(entry.slug))
      .sort((first, second) => first.data.title.localeCompare(second.data.title)),
  ];
  const records: DocsSearchItem[] = [];

  for (const [pageIndex, entry] of orderedEntries.entries()) {
    const { headings, remarkPluginFrontmatter } = await entry.render();
    const { preamble, sections } = getDocsSearchContent(
      entry.slug,
      remarkPluginFrontmatter,
      headings,
    );
    const href = `${basePath}${entry.slug}/`;
    const pageOrder = orderOffset + pageIndex * 100;
    const description = entry.data.description ?? makeExcerpt(preamble);

    records.push({
      id: `${idPrefix}:${entry.slug}`,
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
        id: `${idPrefix}:${entry.slug}:${section.heading.slug}`,
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
} as const;

export async function buildDocsSearchIndex(): Promise<DocsSearchItem[]> {
  const items: DocsSearchItem[] = [];
  const areas = [...docAreas].sort((first, second) => first.searchBand - second.searchBand);

  for (const area of areas) {
    const band = area.searchBand * 10_000;

    if (area.membership === 'files') {
      const records = await fileSearchEntries(area);
      if (area.catalogOverview) {
        items.push(
          createOverviewSearchItem({
            id: `${area.id}:overview`,
            href: pageHref(area),
            category: area.title,
            title: area.title,
            description: area.intro,
            content: records
              .map((entry) => `${entry.data.title} ${entry.data.description ?? ''}`)
              .join(' '),
            order: band,
          }),
        );
      }
      items.push(
        ...(await buildCollectionSearchItems({
          category: area.title,
          idPrefix: area.id,
          basePath: pageHref(area),
          entries: records,
          orderedSlugs: records.map((entry) => entry.slug),
          orderOffset: area.catalogOverview ? band + 100 : band,
        })),
      );
      continue;
    }

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
        area.id === 'foundations' || area.id === 'components'
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

    const entries = await loadSearchEntries(area.collection);
    items.push(
      ...(await buildCollectionSearchItems({
        category: area.title,
        idPrefix: area.id,
        basePath: pageHref(area),
        entries,
        orderedSlugs: inventoryItems(area.id).map((item) => item.slug),
        orderOffset: area.catalogOverview ? band + 100 : band,
      })),
    );
  }

  return items;
}

async function fileSearchEntries(
  area: Extract<(typeof docAreas)[number], { membership: 'files' }>,
): Promise<SearchableContentEntry[]> {
  switch (area.collection) {
    case 'getting-started': {
      const entries = await getCollection('getting-started');
      const authored = entries.map((entry) => ({
        order: entry.data.order,
        record: {
          slug: entry.slug,
          data: entry.data,
          render: () => entry.render(),
        } satisfies SearchableContentEntry,
      }));
      const projected = await Promise.all(
        area.projections.map(async (projection) => {
          const guide = await renderPackageGuide(projection);
          return {
            order: projection.order,
            record: {
              slug: projection.slug,
              data: { title: guide.title, description: guide.description },
              render: async () => ({
                headings: guide.headings,
                remarkPluginFrontmatter: guide.frontmatter,
              }),
            } satisfies SearchableContentEntry,
          };
        }),
      );
      return [...authored, ...projected]
        .sort((first, second) => first.order - second.order)
        .map((item) => item.record);
    }
    default: {
      const unexpected: never = area.collection;
      throw new Error(`[docs-search] no files collection for ${String(unexpected)}`);
    }
  }
}

function loadSearchEntries(collection: 'docs' | 'foundations' | 'patterns') {
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
