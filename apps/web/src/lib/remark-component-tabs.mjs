import { docArea, matchContentPath } from './doc-areas.mjs';

export const docsTabIds = ['overview', 'design', 'code', 'accessibility'];

const organizedDocSlugs = new Set(['accordion', 'menu', 'radio']);

const designHeadingPattern =
  /(?:anatomy|appearance|variant|variation|size|state|elevation|spacing|intent|icon|layout|visual|style|shape|counter mode|status dot)/i;
const accessibilityHeadingPattern =
  /(?:accessibility|right-to-left|\brtl\b|language|motion|direction contract|typography)/i;

function collapseWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function nodeText(node) {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? '';
  return node.children?.map(nodeText).join('') ?? '';
}

export function getDocsTabForHeading(heading) {
  const normalized = collapseWhitespace(heading).toLowerCase();

  if (normalized === 'usage') return 'overview';
  if (accessibilityHeadingPattern.test(normalized)) return 'accessibility';
  if (designHeadingPattern.test(normalized)) return 'design';
  return 'code';
}

function attribute(name, value) {
  return { type: 'mdxJsxAttribute', name, value };
}

function animationNode(frontmatter) {
  const title = typeof frontmatter.title === 'string' ? frontmatter.title : 'Component';
  const animation = frontmatter.animation;
  const hasAnimation =
    animation && typeof animation === 'object' && typeof animation.src === 'string';
  const label =
    hasAnimation && typeof animation.label === 'string'
      ? animation.label
      : `${title} component animation`;

  const content = hasAnimation
    ? {
        type: 'mdxJsxFlowElement',
        name: 'iframe',
        attributes: [
          attribute('className', 'docs-component-animation__frame'),
          attribute('src', animation.src),
          attribute('title', label),
          attribute('loading', 'lazy'),
          attribute('sandbox', 'allow-scripts'),
        ],
        children: [],
      }
    : {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [
          attribute('className', 'docs-component-animation__placeholder'),
          attribute('aria-hidden', 'true'),
        ],
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: title }],
          },
        ],
      };

  return {
    type: 'mdxJsxFlowElement',
    name: 'div',
    attributes: [
      attribute('className', 'docs-component-animation'),
      attribute('data-docs-markdown', 'omit'),
    ],
    children: [
      content,
      {
        type: 'mdxJsxFlowElement',
        name: 'span',
        attributes: [attribute('className', 'docs-component-animation__label')],
        children: [
          {
            type: 'text',
            value: hasAnimation
              ? 'HTML · component animation'
              : 'Component animation · Coming soon',
          },
        ],
      },
    ],
  };
}

function panelNode(tab, children) {
  const content =
    children.length > 0
      ? children
      : [
          {
            type: 'paragraph',
            data: { hProperties: { className: ['docs-tab-empty'] } },
            children: [{ type: 'text', value: 'Documentation for this tab is to be organized.' }],
          },
        ];

  return {
    type: 'mdxJsxFlowElement',
    name: 'section',
    attributes: [
      attribute('id', `tabpanel-${tab}`),
      attribute('className', 'docs-tab-panel'),
      attribute('role', 'tabpanel'),
      attribute('aria-labelledby', `tab-${tab}`),
      attribute('data-doc-tab-panel', tab),
      ...(tab === 'overview' ? [] : [attribute('hidden', null)]),
    ],
    children: content,
  };
}

function storybookLinkNode(slug) {
  return {
    type: 'mdxJsxFlowElement',
    name: 'DocsStorybookLink',
    attributes: [attribute('slug', slug)],
    children: [],
  };
}

function appendStorybookLink(nodes, slug) {
  if (!slug) return;

  const apiHeadingIndex = nodes.findIndex(
    (node) => node.type === 'heading' && node.depth === 2 && nodeText(node) === 'API Reference',
  );

  if (apiHeadingIndex < 0) return;

  const nextSectionIndex = nodes.findIndex(
    (node, index) => index > apiHeadingIndex && node.type === 'heading' && node.depth === 2,
  );
  const sectionEnd = nextSectionIndex < 0 ? nodes.length : nextSectionIndex;
  let lastTableIndex = -1;

  for (let index = apiHeadingIndex + 1; index < sectionEnd; index += 1) {
    if (nodes[index].type === 'table') lastTableIndex = index;
  }

  if (lastTableIndex >= 0) nodes.splice(lastTableIndex + 1, 0, storybookLinkNode(slug));
}

export function partitionDocsTabNodes(
  nodes,
  frontmatter = {},
  { preserveTabOrganization = false, slug } = {},
) {
  const imports = [];
  const panels = Object.fromEntries(docsTabIds.map((tab) => [tab, []]));
  let currentTab = 'overview';
  let reachedFirstSection = false;

  for (const node of nodes) {
    if (node.type === 'mdxjsEsm') {
      imports.push(node);
      continue;
    }

    if (node.type === 'heading' && node.depth === 2) {
      reachedFirstSection = true;
      currentTab = preserveTabOrganization ? getDocsTabForHeading(nodeText(node)) : 'code';
    } else if (!preserveTabOrganization && reachedFirstSection) {
      currentTab = 'code';
    }

    panels[currentTab].push(node);
  }

  const overview = panels.overview;
  const firstSectionIndex = overview.findIndex(
    (node) => node.type === 'heading' && node.depth === 2,
  );
  overview.splice(
    firstSectionIndex < 0 ? overview.length : firstSectionIndex,
    0,
    animationNode(frontmatter),
  );

  appendStorybookLink(panels.code, slug);

  return [...imports, ...docsTabIds.map((tab) => panelNode(tab, panels[tab]))];
}

export function remarkComponentTabs() {
  return (tree, file) => {
    const matched = matchContentPath(String(file.path ?? file.history?.at(-1) ?? ''));
    if (!matched || matched.collection !== docArea('components').collection) return;

    const slug = matched.slug;

    tree.children = partitionDocsTabNodes(tree.children, file.data.astro?.frontmatter ?? {}, {
      preserveTabOrganization: organizedDocSlugs.has(slug),
      slug,
    });
  };
}
