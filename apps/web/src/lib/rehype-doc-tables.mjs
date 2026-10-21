function textContent(node) {
  return node.type === 'text' ? node.value : (node.children ?? []).map(textContent).join('');
}

// Scrollable API tables must be keyboard reachable in browsers that do not
// automatically focus scroll containers (including WebKit).
export default function rehypeDocTables() {
  return (tree, file) => {
    const path = String(file.path ?? file.history?.at(-1) ?? '').replaceAll('\\', '/');
    if (!/\/src\/content\/(docs|foundations)\//.test(path)) return;

    function visit(parent, heading = 'API reference') {
      for (const [index, node] of (parent.children ?? []).entries()) {
        if (node.type === 'element' && /^h[1-6]$/.test(node.tagName)) {
          heading = textContent(node);
        }
        if (node.type === 'element' && node.tagName === 'table') {
          const head = node.children.find((child) => child.tagName === 'thead');
          const row = head?.children.find((child) => child.tagName === 'tr');
          const columns = row?.children.filter((child) => child.tagName === 'th').length;
          if (columns === 3 || columns === 4) {
            parent.children[index] = {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['docs-table-scroll'],
                tabIndex: 0,
                role: 'region',
                ...(node.properties?.ariaLabelledBy
                  ? { ariaLabelledBy: node.properties.ariaLabelledBy }
                  : { ariaLabel: node.properties?.ariaLabel ?? `${heading} table` }),
              },
              children: [node],
            };
          }
        } else visit(node, heading);
      }
    }
    visit(tree);
  };
}
