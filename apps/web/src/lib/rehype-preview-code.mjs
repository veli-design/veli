import { createShikiHighlighter } from '@astrojs/markdown-remark';
import { previewCodeGroups } from './docs-preview-examples.mjs';

let highlighter;
function findGroup(node) {
  if (previewCodeGroups[node.name]) return previewCodeGroups[node.name];
  for (const child of node.children ?? []) {
    const group = findGroup(child);
    if (group) return group;
  }
}
function isPreview(node) {
  return (
    node.type === 'mdxJsxFlowElement' &&
    node.name === 'div' &&
    node.attributes?.some(
      (attribute) =>
        attribute.name === 'className' &&
        typeof attribute.value === 'string' &&
        attribute.value.split(/\s+/).includes('preview'),
    )
  );
}

export default function rehypePreviewCode() {
  return async function transform(tree) {
    async function visit(parent) {
      let group;
      for (const node of parent.children ?? []) {
        if (isPreview(node)) group = findGroup(node);
        else if (node.type === 'element' && node.tagName === 'pre') {
          if (group) {
            highlighter ??= createShikiHighlighter({
              themes: { light: 'github-light', dark: 'github-dark' },
            });
            const highlight = await highlighter;
            const variants = await Promise.all(
              Object.entries(group.variants).map(async ([key, source]) => {
                const highlighted = await highlight.codeToHast(source, 'tsx');
                return { key, pre: highlighted.children.find((child) => child.tagName === 'pre') };
              }),
            );
            const initial = variants.find((variant) => variant.key === group.defaultKey).pre;
            node.children = initial.children;
            node.properties = { ...node.properties, ...initial.properties };
            node.data = { ...node.data, previewCodes: variants };
          }
          group = undefined;
        } else if (node.type === 'element' && /^h[1-6]$/.test(node.tagName)) group = undefined;
        await visit(node);
      }
    }
    await visit(tree);
  };
}
