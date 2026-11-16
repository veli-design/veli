import { writeFileSync } from 'node:fs';
import { URL } from 'node:url';
import { legacyRedirects } from './site-routes.mjs';

/** @returns {import('astro').AstroIntegration} */
export function redirectsIntegration() {
  return {
    name: 'veli-legacy-redirects',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const rules = Object.entries(legacyRedirects).map(([from, to]) => `${from} ${to} 301`);
        writeFileSync(new URL('_redirects', dir), `${rules.join('\n')}\n`);
      },
    },
  };
}
