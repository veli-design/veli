import type { APIRoute } from 'astro';
import { buildLlmsTxt, getDocsCatalog } from '../lib/docs-markdown';

export const prerender = true;

export const GET = (async ({ site }) => {
  const pages = await getDocsCatalog();

  return new Response(buildLlmsTxt(pages, site), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}) satisfies APIRoute;
