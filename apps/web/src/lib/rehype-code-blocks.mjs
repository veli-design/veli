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

function getThemeProperties(style) {
  if (typeof style !== 'string') return '';

  const declarations = new Map(
    style
      .split(';')
      .map((declaration) => declaration.split(':', 2).map((part) => part.trim()))
      .filter(([property, value]) => property && value),
  );
  const properties = [];
  const background = declarations.get('background-color');
  const color = declarations.get('color');

  if (background) properties.push(`--docs-code-block-background:${background}`);
  if (color) properties.push(`--docs-code-block-color:${color}`);
  return properties.join(';');
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

function caretIcon() {
  return icon(['m5.5 7.5 4.5 4.5 4.5-4.5']);
}

function enhanceCodeBlocks(tree) {
  let codeBlockIndex = 0;

  function visit(parent) {
    if (!parent.children) return;

    parent.children = parent.children.map((node) => {
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
      const isCollapsible = source.split('\n').length >= collapsibleLineCount;
      const preId = `docs-code-block-${codeBlockIndex}`;
      const wrapperClasses = ['docs-code-block'];
      const wrapperStyle = getThemeProperties(node.properties?.style);

      if (isCollapsible) {
        wrapperClasses.push('is-collapsible');
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
      if (isCollapsible) {
        children.push(
          element('div', { className: ['docs-code-block__expand'] }, [
            element(
              'button',
              {
                className: ['docs-code-block__expand-button'],
                type: 'button',
                ariaControls: preId,
                ariaExpanded: 'false',
              },
              [caretIcon(), element('span', {}, [text('Expand code')])],
            ),
          ]),
        );
      }

      return element(
        'div',
        {
          className: wrapperClasses,
          ...(wrapperStyle ? { style: wrapperStyle } : {}),
        },
        children,
      );
    });
  }

  visit(tree);
}

export default function rehypeCodeBlocks() {
  return enhanceCodeBlocks;
}
