const collapsibleLineCount = 24;

const languageNames = {
  bash: 'Bash',
  css: 'CSS',
  html: 'HTML',
  javascript: 'JavaScript',
  js: 'JavaScript',
  json: 'JSON',
  jsx: 'JSX',
  md: 'Markdown',
  markdown: 'Markdown',
  shell: 'Shell',
  sh: 'Shell',
  ts: 'TypeScript',
  tsx: 'TSX',
  typescript: 'TypeScript',
};

function element(tagName, properties = {}, children = []) {
  return { type: 'element', tagName, properties, children };
}

function text(value) {
  return { type: 'text', value };
}

function nodeText(node) {
  if (node.type === 'text') return node.value;
  if (!node.children) return '';
  return node.children.map(nodeText).join('');
}

function getLanguage(pre, code) {
  const dataLanguage = pre.properties?.dataLanguage;
  if (typeof dataLanguage === 'string') return dataLanguage.toLowerCase();

  const classNames = code.properties?.className;
  const languageClass = Array.isArray(classNames)
    ? classNames.find((className) => String(className).startsWith('language-'))
    : undefined;
  return languageClass ? String(languageClass).slice('language-'.length).toLowerCase() : 'text';
}

function icon(paths) {
  return element(
    'svg',
    { viewBox: '0 0 20 20', ariaHidden: 'true', focusable: 'false' },
    paths.map((path) => element('path', { d: path })),
  );
}

function copyIcon() {
  return icon([
    'M7.5 6.5h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z',
    'M4.5 12.5h-1a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1',
  ]);
}

function enhanceCodeBlocks(tree) {
  let codeBlockIndex = 0;

  function visit(parent) {
    if (!parent.children) return;

    parent.children = parent.children.map((node, index) => {
      if (node.type !== 'element' || node.tagName !== 'pre') {
        visit(node);
        return node;
      }

      const code = node.children?.find(
        (child) => child.type === 'element' && child.tagName === 'code',
      );
      if (!code) return node;

      codeBlockIndex += 1;
      const language = getLanguage(node, code);
      const languageLabel = languageNames[language] || language.toUpperCase();
      const source = nodeText(code).replace(/\n$/, '');
      const lineCount = source.split('\n').length;
      const fileTitle = node.properties?.dataCodeTitle;
      const installPackages = ['bash', 'sh', 'shell'].includes(language)
        ? source.match(/^pnpm add ([^\n]+)$/)?.[1]
        : undefined;
      let previousIndex = index - 1;
      while (
        parent.children[previousIndex]?.type === 'text' &&
        !parent.children[previousIndex].value.trim()
      )
        previousIndex -= 1;
      const previewClasses = parent.children[previousIndex]?.attributes?.find(
        (attribute) => attribute.name === 'className',
      )?.value;
      const previewFlags = typeof previewClasses === 'string' ? previewClasses.split(/\s+/) : [];
      const isCollapsible =
        (lineCount >= collapsibleLineCount && !previewFlags.includes('preview--expanded')) ||
        previewFlags.includes('preview--collapsible');
      const preId = `docs-code-block-${codeBlockIndex}`;
      const wrapperClasses = ['docs-code-block'];
      if (lineCount > 1) wrapperClasses.push('is-multiline');

      if (isCollapsible || node.data?.previewCodes) {
        if (isCollapsible) wrapperClasses.push('is-collapsible');
        node.properties = { ...node.properties, id: preId };
      }

      const toolbar = element('div', { className: ['docs-code-block__toolbar'] }, [
        element('span', { className: ['docs-code-block__language'] }, [text(languageLabel)]),
        element(
          'button',
          {
            className: ['docs-code-block__copy'],
            type: 'button',
            ariaLabel: `Copy ${languageLabel} code`,
          },
          [copyIcon(), element('span', {}, [text('Copy')])],
        ),
        element(
          'span',
          {
            className: ['sr-only', 'docs-code-block__status'],
            role: 'status',
            ariaLive: 'polite',
            ariaAtomic: 'true',
          },
          [],
        ),
      ]);

      const children = [toolbar, node];
      if (typeof fileTitle === 'string') {
        wrapperClasses.push('docs-code-file');
        toolbar.children.unshift(
          element('span', { className: ['docs-code-file__icon'], ariaHidden: 'true' }),
          element('span', { className: ['docs-code-file__name'] }, [text(fileTitle)]),
        );
      }
      if (installPackages) {
        wrapperClasses.push('docs-code-command');
        const managers = ['pnpm', 'npm', 'yarn', 'bun'];
        node.properties = {
          ...node.properties,
          id: preId,
          role: 'tabpanel',
          tabIndex: 0,
          ariaLabelledBy: `${preId}-pnpm`,
        };
        code.children = [text(source)];
        toolbar.children.unshift(
          element('span', { className: ['docs-code-command__icon'], ariaHidden: 'true' }),
          element(
            'div',
            { role: 'tablist', ariaLabel: 'Package manager' },
            managers.map((manager) =>
              element(
                'button',
                {
                  type: 'button',
                  role: 'tab',
                  id: `${preId}-${manager}`,
                  ariaControls: preId,
                  ariaSelected: manager === 'pnpm' ? 'true' : 'false',
                  tabIndex: manager === 'pnpm' ? 0 : -1,
                  dataCommand: `${manager} ${manager === 'npm' ? 'install' : 'add'} ${installPackages}`,
                },
                [text(manager)],
              ),
            ),
          ),
        );
      }
      if (isCollapsible || node.data?.previewCodes) {
        children.push(
          element('div', {
            className: ['docs-code-block__expand'],
            dataLineCount: lineCount,
          }),
        );
      }

      for (const { key, pre } of node.data?.previewCodes ?? []) {
        children.push(element('template', { dataDocsPreviewCode: key }, [pre]));
      }

      return element(
        'div',
        {
          className: wrapperClasses,
        },
        children,
      );
    });

    // Keep authored demos and highlighted code together without changing MDX content.
    for (let index = 0; index < parent.children.length - 1; index += 1) {
      const preview = parent.children[index];
      const className = preview.attributes?.find(
        (attribute) => attribute.name === 'className',
      )?.value;
      if (
        preview.type !== 'mdxJsxFlowElement' ||
        preview.name !== 'div' ||
        typeof className !== 'string' ||
        !className.split(/\s+/).includes('preview')
      )
        continue;

      let codeIndex = index + 1;
      while (
        parent.children[codeIndex]?.type === 'text' &&
        !parent.children[codeIndex].value.trim()
      )
        codeIndex += 1;
      const codeBlock = parent.children[codeIndex];
      if (!codeBlock?.properties?.className?.includes('docs-code-block')) continue;

      parent.children.splice(
        index,
        codeIndex - index + 1,
        element('div', { className: ['docs-example'] }, [preview, codeBlock]),
      );
    }
  }

  visit(tree);
}

export default function rehypeCodeBlocks() {
  return enhanceCodeBlocks;
}
