function findCodeBlock(preview) {
  const grouped = preview.closest('.docs-example')?.querySelector('.docs-code-block');
  if (grouped) return grouped;
  let sibling = preview.closest('.preview')?.nextElementSibling;
  while (sibling && !/^H[1-6]$/.test(sibling.tagName) && !sibling.matches('.preview')) {
    if (sibling.matches('.docs-code-block')) return sibling;
    sibling = sibling.nextElementSibling;
  }
}

export function syncDocsPreviewCode(preview) {
  const key = preview.dataset.docsPreviewCode;
  const wrapper = findCodeBlock(preview);
  const template = Array.from(
    wrapper?.querySelectorAll('template[data-docs-preview-code]') ?? [],
  ).find((item) => item.dataset.docsPreviewCode === key);
  const nextCode = template?.content.querySelector('code');
  const code = wrapper?.querySelector('pre > code');
  if (!nextCode || !code) return false;

  // Retain the code element: the Copy handler reads this same live node.
  code.replaceChildren(...Array.from(nextCode.childNodes, (node) => node.cloneNode(true)));
  const lineCount = code.textContent.split('\n').length;
  wrapper.classList.toggle('is-multiline', lineCount > 1);
  wrapper.classList.toggle('is-collapsible', lineCount >= 24);
  const expandControl = wrapper.querySelector('.docs-code-block__expand');
  if (expandControl) expandControl.dataset.lineCount = String(lineCount);
  wrapper.dispatchEvent(new globalThis.CustomEvent('docs:code-change', { detail: { lineCount } }));
  return true;
}

export function observeDocsPreviewCode(root) {
  const selector = '[data-docs-preview="options"][data-docs-preview-code]';
  root.querySelectorAll(selector).forEach(syncDocsPreviewCode);
  const observer = new globalThis.MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') syncDocsPreviewCode(mutation.target);
      else
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.matches(selector)) syncDocsPreviewCode(node);
          node.querySelectorAll(selector).forEach(syncDocsPreviewCode);
        }
    }
  });
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['data-docs-preview-code'],
  });
  return () => observer.disconnect();
}
