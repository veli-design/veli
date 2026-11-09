import type { APIRoute } from 'astro';
import { getRenderedDocsCatalog, type RenderedDocsPage } from '../../lib/docs-markdown';

export const prerender = true;

export async function getStaticPaths() {
  const pages = await getRenderedDocsCatalog();

  return pages.map((page) => ({
    params: { path: page.markdownPath.slice(1).replace(/\/index\.md$/, '') },
    props: { page },
  }));
}

export const GET = (({ props }) => {
  const { page } = props as { page: RenderedDocsPage };

  return new Response(page.markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}) satisfies APIRoute;
