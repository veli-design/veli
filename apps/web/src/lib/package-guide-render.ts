import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import type { MarkdownHeading } from '@astrojs/markdown-remark';
import { readPackageGuide } from './package-guide.mjs';
import rehypeCodeBlocks from './rehype-code-blocks.mjs';
import rehypeDocTables from './rehype-doc-tables.mjs';
import { remarkDocsMarkdown } from './remark-docs-markdown.mjs';
import { remarkDocsSearch, type DocsSearchSource } from './remark-docs-search';

type PackageProjection = {
  markdownFile: string;
  versionFile: string;
};

export type RenderedPackageGuide = ReturnType<typeof readPackageGuide> & {
  html: string;
  headings: MarkdownHeading[];
  frontmatter: Record<string, unknown> & { __docsSearch?: DocsSearchSource };
};

const renderedGuides = new Map<string, Promise<RenderedPackageGuide>>();

function rehypeDropFirstH1() {
  return (tree: { children?: Array<{ type?: string; tagName?: string }> }) => {
    const index = tree.children?.findIndex(
      (node) => node.type === 'element' && node.tagName === 'h1',
    );
    if (index !== undefined && index >= 0) tree.children?.splice(index, 1);
  };
}

export function renderPackageGuide(projection: PackageProjection) {
  const cached = renderedGuides.get(projection.markdownFile);
  if (cached) return cached;

  const pending = renderPackageGuideOnce(projection);
  renderedGuides.set(projection.markdownFile, pending);
  return pending;
}

async function renderPackageGuideOnce(projection: PackageProjection) {
  const guide = readPackageGuide(projection);
  const processor = await createMarkdownProcessor({
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
    remarkPlugins: [remarkDocsMarkdown, remarkDocsSearch],
    rehypePlugins: [rehypeCodeBlocks, rehypeDocTables, rehypeDropFirstH1],
  });
  // The processor reads `fileURL` onto the vfile path. The published type omits it.
  const rendered = await processor.render(guide.markdown, {
    frontmatter: { title: guide.title, description: guide.description },
    fileURL: guide.absolutePath,
  } as { frontmatter: { title: string; description: string } });

  return {
    ...guide,
    html: rendered.code,
    headings: rendered.metadata.headings,
    frontmatter: rendered.metadata.frontmatter,
  };
}
