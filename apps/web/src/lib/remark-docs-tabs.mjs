import { docsTabIds } from './remark-component-tabs.mjs';

// Run before Markdown/search extraction. Keep headings at the root so Astro's
// heading IDs, search links and the existing tab-specific TOC stay in agreement.
export function remarkDocsTabs() {
  return (tree, file) => {
    const path = String(file.path ?? file.history?.at(-1) ?? '').replaceAll('\\', '/');
    if (!path.includes('/src/content/docs/')) return;
    if (!tree.children.some((node) => node.name === 'DocsTab')) return;

    const seen = new Set();
    const fail = (message) => {
      throw new Error(`[docs-tabs] ${path}: ${message}`);
    };
    const containsTab = (node) => node.name === 'DocsTab' || node.children?.some(containsTab);
    tree.children = tree.children.flatMap((node) => {
      if (node.type === 'mdxjsEsm' || (node.type === 'heading' && node.depth === 1)) return [node];
      if (node.type !== 'mdxJsxFlowElement' || node.name !== 'DocsTab') {
        fail('all content must be inside a DocsTab when explicit tabs are used');
      }
      const id = node.attributes?.find((attribute) => attribute.name === 'id')?.value;
      if (!docsTabIds.includes(id) || node.attributes.length !== 1) {
        fail('DocsTab requires one static id: overview, design, code or accessibility');
      }
      if (seen.has(id)) fail(`duplicate tab "${id}"`);
      if (node.children.some(containsTab)) fail('DocsTab cannot be nested');
      seen.add(id);
      return node.children.map((child) => ({ ...child, data: { ...child.data, docsTab: id } }));
    });
    const frontmatter = ((file.data.astro ??= {}).frontmatter ??= {});
    frontmatter.__docsExplicitTabs = true;
  };
}
