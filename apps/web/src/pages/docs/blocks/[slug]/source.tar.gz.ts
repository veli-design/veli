import type { APIRoute } from 'astro';
import { archive, getBlocks } from '@tradenetcorp/veli-blocks/catalog';
export const prerender = true;
export function getStaticPaths() {
  return getBlocks().map((block) => ({ params: { slug: block.manifest.id }, props: { block } }));
}
export const GET: APIRoute = ({ props }) =>
  new Response(new Uint8Array(archive(props.block)), {
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${props.block.manifest.id}-${props.block.manifest.version}.tar.gz"`,
    },
  });
