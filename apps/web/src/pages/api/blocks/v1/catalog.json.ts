import type { APIRoute } from 'astro';
import { blocksCatalog } from '@tradenetcorp/veli-blocks/catalog';

export const prerender = true;

export const GET: APIRoute = () => {
  const catalog = blocksCatalog();
  return new Response(
    JSON.stringify({
      ...catalog,
      blocks: catalog.blocks.map((block) => ({
        ...block,
        documentationUrl: block.documentationUrl.replace('/blocks/', '/docs/blocks/'),
      })),
    }),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    },
  );
};
