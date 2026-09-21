import { getDocsCatalog } from '../lib/docs-markdown';
export const prerender = true;
export async function GET() {
  return new Response(
    JSON.stringify((await getDocsCatalog()).map(({ markdownPath }) => markdownPath)),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
