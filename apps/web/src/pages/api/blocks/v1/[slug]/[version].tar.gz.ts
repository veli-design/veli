import type { APIRoute } from 'astro';
import { getBlocks, getBlockVersions, sourceArchive } from '@tradenetcorp/veli-blocks/catalog';

export const prerender = true;

export function getStaticPaths() {
  return getBlocks().flatMap((block) =>
    getBlockVersions(block).map((release) => ({
      params: { slug: release.block.manifest.id, version: release.block.manifest.version },
      props: release,
    })),
  );
}

export const GET: APIRoute = ({ props }) =>
  new Response(new Uint8Array(sourceArchive(props.block, props.provenance)), {
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${props.block.manifest.id}-${props.block.manifest.version}.tar.gz"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
