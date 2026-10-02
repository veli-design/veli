import type { APIRoute } from 'astro';
import { blocksCatalog } from '@tradenetcorp/veli-blocks/catalog';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(JSON.stringify(blocksCatalog()), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
