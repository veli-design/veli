import { gfmTableToMarkdown } from 'mdast-util-gfm-table';
import { toMarkdown } from 'mdast-util-to-markdown';

export const docsMarkdownFrontmatterKey = '__docsMarkdown';

const supportedNodeTypes = new Set([
  'code',
  'emphasis',
  'heading',
  'inlineCode',
  'link',
  'list',
  'listItem',
  'paragraph',
  'strong',
  'table',
  'tableCell',
  'tableRow',
  'text',
]);

function documentName(file) {
  return file.path || file.history?.at(-1) || 'unknown documentation page';
}

function markdownError(file, message, node) {
  const location = node?.position?.start?.line ? `:${node.position.start.line}` : '';
  return new Error(`[docs-markdown] ${documentName(file)}${location}: ${message}`);
}

function getStaticAttribute(node, name) {
  const attribute = node.attributes?.find(
    (candidate) => candidate.type === 'mdxJsxAttribute' && candidate.name === name,
  );

  return typeof attribute?.value === 'string' ? attribute.value : undefined;
}

function hasBooleanAttribute(node, name) {
  return node.attributes?.some(
    (attribute) =>
      attribute.type === 'mdxJsxAttribute' && attribute.name === name && attribute.value === null,
  );
}

function hasClass(node, className) {
  return getStaticAttribute(node, 'className')?.split(/\s+/).includes(className) ?? false;
}

function collectImportedNames(tree, file) {
  const importedNames = new Set();

  for (const node of tree.children) {
    if (node.type !== 'mdxjsEsm') continue;

    const statements = node.data?.estree?.body;
    if (
      !Array.isArray(statements) ||
      statements.length === 0 ||
      statements.some((statement) => statement.type !== 'ImportDeclaration')
    ) {
      throw markdownError(file, 'only top-level imports may be omitted from Markdown', node);
    }

    for (const statement of statements) {
      for (const specifier of statement.specifiers ?? []) {
        if (specifier.local?.name) importedNames.add(specifier.local.name);
      }
    }
  }

  return importedNames;
}

function isInteractivePreview(node, importedNames, file) {
  if (!hasClass(node, 'preview')) return false;

  const child = node.children?.[0];
  const isValid =
    node.name === 'div' &&
    node.attributes?.length === 1 &&
    node.children?.length === 1 &&
    child?.type === 'mdxJsxFlowElement' &&
    typeof child.name === 'string' &&
    child.name.endsWith('Demo') &&
    importedNames.has(child.name) &&
    child.attributes?.length === 1 &&
    (hasBooleanAttribute(child, 'client:visible') || hasBooleanAttribute(child, 'client:load')) &&
    child.children?.length === 0;

  if (!isValid) {
    throw markdownError(
      file,
      'preview JSX must contain one imported *Demo component with client:visible or client:load',
      node,
    );
  }

  return true;
}

function getDocumentPath(file) {
  const path = documentName(file).replaceAll('\\', '/');
  const match = path.match(/(?:^|\/)src\/content\/(docs|foundations)\/(.+)\.mdx?$/);

  if (!match) {
    throw markdownError(file, 'could not derive the rendered documentation URL');
  }

  return `/${match[1]}/${match[2]}/`;
}

function interactivePreviewLink(url) {
  return {
    type: 'paragraph',
    children: [
      {
        type: 'link',
        url,
        children: [{ type: 'text', value: 'View the interactive example in the rendered page.' }],
      },
    ],
  };
}

function cloneSupportedNode(node, context) {
  if (node.type === 'mdxJsxFlowElement') {
    const markdownBehavior = getStaticAttribute(node, 'data-docs-markdown');

    if (markdownBehavior === 'omit') return undefined;
    if (markdownBehavior === 'interactive-example') {
      return interactivePreviewLink(context.documentPath);
    }
    if (markdownBehavior) {
      throw markdownError(
        context.file,
        `unsupported data-docs-markdown value "${markdownBehavior}"`,
        node,
      );
    }
    if (isInteractivePreview(node, context.importedNames, context.file)) {
      return interactivePreviewLink(context.documentPath);
    }

    throw markdownError(
      context.file,
      `unsupported MDX JSX element${node.name ? ` <${node.name}>` : ''}`,
      node,
    );
  }

  if (!supportedNodeTypes.has(node.type)) {
    throw markdownError(context.file, `unsupported Markdown node "${node.type}"`, node);
  }

  const clone = globalThis.structuredClone(node);
  if (Array.isArray(node.children)) {
    clone.children = node.children.flatMap((child) => {
      const sanitized = cloneSupportedNode(child, context);
      return sanitized ? [sanitized] : [];
    });
  }

  return clone;
}

function headingText(node, file) {
  const text = node.children
    .map((child) => {
      if (child.type === 'text' || child.type === 'inlineCode') return child.value;
      throw markdownError(file, `unsupported node "${child.type}" in the page title`, child);
    })
    .join('');

  return text.replace(/\s+/g, ' ').trim();
}

export function createCanonicalMarkdown(tree, file) {
  const frontmatter = file.data.astro?.frontmatter;
  const title = frontmatter?.title;
  const description = frontmatter?.description;

  if (typeof title !== 'string' || title.trim() === '') {
    throw markdownError(file, 'frontmatter.title must be a non-empty string');
  }
  if (typeof description !== 'string' || description.trim() === '') {
    throw markdownError(file, 'frontmatter.description must be a non-empty string');
  }

  const importedNames = collectImportedNames(tree, file);
  const context = {
    documentPath: getDocumentPath(file),
    file,
    importedNames,
  };
  let sourceTitleCount = 0;
  const content = [];

  for (const node of tree.children) {
    if (node.type === 'mdxjsEsm') continue;

    if (node.type === 'heading' && node.depth === 1) {
      sourceTitleCount += 1;
      if (sourceTitleCount > 1) {
        throw markdownError(file, 'documentation pages may contain at most one H1', node);
      }
      if (headingText(node, file) !== title.trim()) {
        throw markdownError(file, 'the authored H1 must match frontmatter.title', node);
      }
      continue;
    }

    const sanitized = cloneSupportedNode(node, context);
    if (sanitized) content.push(sanitized);
  }

  const canonicalTree = {
    type: 'root',
    children: [
      { type: 'heading', depth: 1, children: [{ type: 'text', value: title.trim() }] },
      { type: 'paragraph', children: [{ type: 'text', value: description.trim() }] },
      ...content,
    ],
  };
  const markdown = toMarkdown(canonicalTree, {
    bullet: '-',
    extensions: [gfmTableToMarkdown()],
    fences: true,
    listItemIndent: 'one',
  });

  return `${markdown.replace(/\n+$/, '')}\n`;
}

export function remarkDocsMarkdown() {
  return (tree, file) => {
    const astro = (file.data.astro ??= {});
    const frontmatter = (astro.frontmatter ??= {});
    frontmatter[docsMarkdownFrontmatterKey] = createCanonicalMarkdown(tree, file);
  };
}
