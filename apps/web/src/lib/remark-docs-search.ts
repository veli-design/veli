export const docsSearchFrontmatterKey = '__docsSearch' as const;

export type DocsSearchSource = {
  preamble: string;
  sections: Array<{ depth: 2 | 3; title: string; content: string }>;
};

type MdastNode = {
  type: string;
  depth?: number;
  value?: unknown;
  alt?: unknown;
  children?: MdastNode[];
};

type MdastRoot = MdastNode & {
  type: 'root';
  children: MdastNode[];
};

type RemarkFile = {
  data: {
    astro?: {
      frontmatter?: Record<string, unknown>;
    };
  };
};

const ignoredNodeTypes = new Set([
  'mdxjsEsm',
  'mdxFlowExpression',
  'mdxTextExpression',
  'html',
  'yaml',
]);
const inlineNodeTypes = new Set([
  'paragraph',
  'heading',
  'emphasis',
  'strong',
  'delete',
  'link',
  'mdxJsxTextElement',
]);

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function nodeText(node: MdastNode): string {
  if (ignoredNodeTypes.has(node.type)) return '';

  if (node.type === 'image') return typeof node.alt === 'string' ? node.alt : '';
  if (
    (node.type === 'text' || node.type === 'inlineCode' || node.type === 'code') &&
    typeof node.value === 'string'
  ) {
    return node.value;
  }

  return node.children?.map(nodeText).join(inlineNodeTypes.has(node.type) ? '' : ' ') ?? '';
}

function nodesText(nodes: MdastNode[]) {
  return collapseWhitespace(nodes.map(nodeText).join('\n'));
}

export function remarkDocsSearch() {
  return (tree: MdastRoot, file: RemarkFile) => {
    const preamble: MdastNode[] = [];
    const sections: Array<{
      depth: 2 | 3;
      title: string;
      nodes: MdastNode[];
    }> = [];
    let currentSection: (typeof sections)[number] | undefined;

    for (const node of tree.children) {
      if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
        currentSection = {
          depth: node.depth,
          title: collapseWhitespace(nodeText(node)),
          nodes: [],
        };
        sections.push(currentSection);
      } else if (currentSection) {
        currentSection.nodes.push(node);
      } else {
        preamble.push(node);
      }
    }

    const astro = (file.data.astro ??= {});
    const frontmatter = (astro.frontmatter ??= {});
    frontmatter[docsSearchFrontmatterKey] = {
      preamble: nodesText(preamble),
      sections: sections.map(({ depth, title, nodes }) => ({
        depth,
        title,
        content: nodesText(nodes),
      })),
    } satisfies DocsSearchSource;
  };
}
