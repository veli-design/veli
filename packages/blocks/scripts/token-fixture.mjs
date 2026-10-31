import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
/** @param {string} target */
export async function tokenFixture(target) {
  const consumerRequire = createRequire(resolve(target, 'package.json'));
  const tokenPath = consumerRequire.resolve('@veli-design/tokens/css');
  const css = readFileSync(tokenPath, 'utf8');
  const theme = readFileSync(consumerRequire.resolve('@veli-design/tokens/tailwind'), 'utf8');
  const { compile } = consumerRequire('tailwindcss');
  const compiler = await compile(
    theme.replace("@import './tokens.css';", '') + '\n@tailwind utilities;',
  );
  const utilities = compiler.build([
    'bg-surface-base',
    'text-base-strong',
    'border-base-subtle',
    'type-display-1-regular',
    'type-body-sm-regular',
    'grid-style-xs',
    'md:grid-style-md',
    'duration-fast',
    'ease-linear',
  ]);
  const directory = resolve(target, 'public/token-tests');
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, 'tokens.css'), css);
  writeFileSync(resolve(directory, 'theme.css'), css + '\n' + utilities);
  for (const type of ['plain', 'tailwind'])
    writeFileSync(
      resolve(directory, `${type}.html`),
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="/token-tests/${type === 'plain' ? 'tokens' : 'theme'}.css"><style>
    body { margin:0; font-family: sans-serif; }
    #sample { padding:16px; border-width:1px; border-style:solid; ${type === 'plain' ? 'background:var(--veli-color-bg-surface-base);color:var(--veli-color-text-base-strong);border-color:var(--veli-color-border-base-subtle);' : ''} }
    #type { ${type === 'plain' ? 'font-size:var(--veli-typography-en-display-lg-regular-font-size);line-height:var(--veli-typography-en-display-lg-regular-line-height);letter-spacing:var(--veli-typography-en-display-lg-regular-letter-spacing);' : ''} }
    #grid > div { min-height:24px; }
  </style></head><body><main id="sample" class="bg-surface-base text-base-strong border-base-subtle"><h1 id="type" class="type-display-1-regular">Veli tokens</h1><p class="type-body-sm-regular">Release consumer</p><div id="grid" class="grid-style-xs md:grid-style-md"><div>A</div><div>B</div></div></main></body></html>`,
    );
}
