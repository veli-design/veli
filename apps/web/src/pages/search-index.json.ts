import { blockPages } from '../lib/blocks';
import { getCollection } from 'astro:content';
import {
  buildCollectionSearchItems,
  createOverviewSearchItem,
  createOverviewSectionSearchItem,
  type DocsSearchItem,
} from '../lib/docs-search';
import { componentGroups, foundations } from '../lib/site';

export const prerender = true;

export async function GET() {
  const [docsEntries, foundationEntries] = await Promise.all([
    getCollection('docs'),
    getCollection('foundations'),
  ]);
  const componentItems = componentGroups.flatMap((group) => group.items);
  const foundationOverview = createOverviewSearchItem({
    id: 'foundations:overview',
    href: '/foundations/',
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
    href: '/docs/',
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
      href: `/docs/#${slug}`,
      category: 'Components',
      pageTitle: 'Components',
      title: group.title,
      description: group.items.map((item) => item.title).join(', '),
      content: group.items.map((item) => `${item.title} ${item.description}`).join(' '),
      order: 1 + index,
    });
  });
  const [foundationItems, docsItems] = await Promise.all([
    buildCollectionSearchItems({
      category: 'Foundations',
      basePath: '/foundations/',
      entries: foundationEntries,
      orderedSlugs: foundations.map((foundation) => foundation.slug),
      orderOffset: 10_100,
    }),
    buildCollectionSearchItems({
      category: 'Components',
      basePath: '/docs/',
      entries: docsEntries,
      orderedSlugs: componentItems.map((item) => item.slug),
      orderOffset: 100,
    }),
  ]);
  const index: DocsSearchItem[] = [
    componentOverview,
    ...componentOverviewSections,
    ...docsItems,
    foundationOverview,
    ...foundationItems,
    ...blockPages.map((page, index) =>
      createOverviewSearchItem({
        id: page.id,
        href: `/${page.id}/`,
        category: 'Blocks',
        title: page.title,
        description: page.description,
        content: page.markdown,
        order: 20_000 + index,
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
