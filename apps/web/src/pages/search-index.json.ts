import { blockPages } from '../lib/blocks';
import { getCollection, getEntry } from 'astro:content';
import {
  buildCollectionSearchItems,
  createOverviewSearchItem,
  createOverviewSectionSearchItem,
  type DocsSearchItem,
} from '../lib/docs-search';
import { componentGroups, foundations, patterns } from '../lib/site';

export const prerender = true;

export async function GET() {
  const getStarted = await getEntry('guides', 'get-started');
  if (!getStarted) throw new Error('Get Started guide is missing');
  const getStartedItems = await buildCollectionSearchItems({
    category: 'Overview',
    basePath: '/docs/',
    entries: [getStarted],
    orderedSlugs: ['get-started'],
    orderOffset: -100,
    hrefForSlug: () => '/docs/',
  });
  const [docsEntries, foundationEntries, patternEntries] = await Promise.all([
    getCollection('docs'),
    getCollection('foundations'),
    getCollection('patterns'),
  ]);
  const componentItems = componentGroups.flatMap((group) => group.items);
  const foundationOverview = createOverviewSearchItem({
    id: 'foundations:overview',
    href: '/docs/foundations/',
    category: 'Foundations',
    title: 'Foundations',
    description: 'Principles, color, typography, spacing, motion, accessibility, and language.',
    content: foundations
      .map((foundation) => `${foundation.title} ${foundation.description}`)
      .join(' '),
    order: 10_000,
  });
  const componentOverview = createOverviewSearchItem({
    id: 'components:overview',
    href: '/docs/components/',
    category: 'Components',
    title: 'Components',
    description: 'Accessible Veli components for building consistent public services.',
    content: componentItems.map((item) => `${item.title} ${item.description}`).join(' '),
    order: 0,
  });
  const componentOverviewSections = componentGroups.map((group, index) => {
    const slug = group.title.toLowerCase().replaceAll(' ', '-').replace('&', 'and');

    return createOverviewSectionSearchItem({
      id: `components:overview:${slug}`,
      href: `/docs/components/#${slug}`,
      category: 'Components',
      pageTitle: 'Components',
      title: group.title,
      description: group.items.map((item) => item.title).join(', '),
      content: group.items.map((item) => `${item.title} ${item.description}`).join(' '),
      order: 1 + index,
    });
  });
  const [foundationItems, docsItems, patternItems] = await Promise.all([
    buildCollectionSearchItems({
      category: 'Foundations',
      basePath: '/docs/foundations/',
      entries: foundationEntries,
      orderedSlugs: foundations.map((foundation) => foundation.slug),
      orderOffset: 10_100,
    }),
    buildCollectionSearchItems({
      category: 'Components',
      basePath: '/docs/components/',
      entries: docsEntries,
      orderedSlugs: componentItems.map((item) => item.slug),
      orderOffset: 100,
    }),
    buildCollectionSearchItems({
      category: 'Patterns',
      basePath: '/docs/patterns/',
      entries: patternEntries,
      orderedSlugs: patterns.map((pattern) => pattern.slug),
      orderOffset: 20_000,
    }),
  ]);
  const index: DocsSearchItem[] = [
    ...getStartedItems.map((item) =>
      item.kind === 'page' ? { ...item, id: 'documentation:overview' } : item,
    ),
    createOverviewSearchItem({
      id: 'patterns:overview',
      href: '/docs/patterns/',
      category: 'Patterns',
      title: 'Patterns',
      description: 'Reusable approaches for recurring service interactions and content flows.',
      content: patterns.map((pattern) => `${pattern.title} ${pattern.description}`).join(' '),
      order: 19_999,
    }),
    componentOverview,
    ...componentOverviewSections,
    ...docsItems,
    foundationOverview,
    ...foundationItems,
    ...patternItems,
    ...blockPages.map((page, index) =>
      createOverviewSearchItem({
        id: page.id,
        href: `/docs/${page.id}/`,
        category: 'Blocks',
        title: page.title,
        description: page.description,
        content: page.markdown,
        order: 30_000 + index,
      }),
    ),
  ];

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
