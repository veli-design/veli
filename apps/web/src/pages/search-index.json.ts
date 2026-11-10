import { buildDocsSearchIndex } from '../lib/docs-search';

export const prerender = true;

export async function GET() {
  return new Response(JSON.stringify(await buildDocsSearchIndex()), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
