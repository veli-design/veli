import { docArea, frameworkGuideTabs, matchContentPath } from './doc-areas.mjs';

function attribute(name, value) {
  return { type: 'mdxJsxAttribute', name, value };
}

function nodeText(node) {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? '';
  return node.children?.map(nodeText).join('') ?? '';
}

function collapseWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function panelNode(tab, children, isFirst) {
  return {
    type: 'mdxJsxFlowElement',
    name: 'section',
    attributes: [
      attribute('id', `framework-panel-${tab.id}`),
      attribute('className', 'docs-framework-panel'),
      attribute('role', 'tabpanel'),
      attribute('aria-labelledby', `framework-tab-${tab.id}`),
      attribute('data-framework-tab-panel', tab.id),
      ...(isFirst ? [] : [attribute('hidden', null)]),
    ],
    children,
  };
}

function tabsChromeNode() {
  return {
    type: 'mdxJsxFlowElement',
    name: 'DocsFrameworkTabs',
    attributes: [],
    children: [],
  };
}

function markFrameworkHeading(node) {
  if (node.type !== 'heading' || node.depth !== 2) return node;
  return {
    ...node,
    data: {
      ...node.data,
      hProperties: {
        ...node.data?.hProperties,
        className: ['docs-framework-panel__title'],
      },
    },
  };
}

export function partitionFrameworkTabNodes(nodes) {
  const imports = [];
  const intro = [];
  /** @type {Map<string, import('mdast').RootContent[]>} */
  const panels = new Map(frameworkGuideTabs.map((tab) => [tab.id, []]));
  let currentTab = null;
  let reachedFirstSection = false;

  const labelToId = new Map(frameworkGuideTabs.map((tab) => [tab.label, tab.id]));

  for (const node of nodes) {
    if (node.type === 'mdxjsEsm') {
      imports.push(node);
      continue;
    }

    if (node.type === 'heading' && node.depth === 2) {
      reachedFirstSection = true;
      const label = collapseWhitespace(nodeText(node));
      const tabId = labelToId.get(label);
      if (!tabId) {
        throw new Error(
          `[remark-framework-tabs] unexpected framework heading "${label}"; expected ${frameworkGuideTabs
            .map((tab) => tab.label)
            .join(', ')}`,
        );
      }
      currentTab = tabId;
      panels.get(tabId).push(markFrameworkHeading(node));
      continue;
    }

    if (!reachedFirstSection) {
      intro.push(node);
      continue;
    }

    if (!currentTab) {
      throw new Error('[remark-framework-tabs] content appeared before a framework heading');
    }
    panels.get(currentTab).push(node);
  }

  const missing = frameworkGuideTabs.filter((tab) => (panels.get(tab.id) ?? []).length === 0);
  if (missing.length > 0) {
    throw new Error(
      `[remark-framework-tabs] missing framework sections: ${missing.map((tab) => tab.label).join(', ')}`,
    );
  }

  return [
    ...imports,
    ...intro,
    tabsChromeNode(),
    ...frameworkGuideTabs.map((tab, index) =>
      panelNode(tab, panels.get(tab.id) ?? [], index === 0),
    ),
  ];
}

export function remarkFrameworkTabs() {
  return (tree, file) => {
    const matched = matchContentPath(String(file.path ?? file.history?.at(-1) ?? ''));
    if (
      !matched ||
      matched.collection !== docArea('getting-started').collection ||
      matched.slug !== 'frameworks'
    ) {
      return;
    }

    tree.children = partitionFrameworkTabNodes(tree.children);
  };
}
