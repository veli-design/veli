import type { DocsSearchSource } from './remark-docs-search';

export type DocsSearchCategory = 'Foundations' | 'Components' | 'Blocks' | 'Blocks';

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

  if (
    relevantHeadings.length !== source.sections.length ||
    relevantHeadings.some((heading, index) => heading.depth !== source.sections[index]?.depth)
  ) {
    throw new Error(`Docs search heading mismatch for ${slug}`);
  }

  return {
    preamble: source.preamble,
    sections: source.sections.map(
      (section, index): ParsedSection => ({
        heading: relevantHeadings[index]!,
        content: section.content,
      }),
    ),
  };
}

export async function buildCollectionSearchItems({
  category,
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
      id: `${category.toLowerCase()}:${entry.slug}`,
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
        id: `${category.toLowerCase()}:${entry.slug}:${section.heading.slug}`,
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
