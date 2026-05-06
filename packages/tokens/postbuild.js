import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Normalize the generated tailwind-theme.css
const tailwindThemePath = join(__dirname, 'dist', 'tailwind-theme.css');
let tailwindTheme = readFileSync(tailwindThemePath, 'utf-8');

// Remove the @import "tailwindcss"; line since consuming apps will import it
tailwindTheme = tailwindTheme.replace('@import "tailwindcss";\n\n', '');
tailwindTheme = tailwindTheme.replace('@theme {\n', '@theme {\n  --spacing: 4px;\n');

// Terrazzo maps grouped DTCG tokens literally, e.g. text.sm.font-size becomes
// --text-sm-font-size. Tailwind v4 expects --text-sm and the paired
// --text-sm--line-height variable.
tailwindTheme = tailwindTheme.replace(/--text-([a-z0-9]+(?:xl)?)-font-size:/g, '--text-$1:');
tailwindTheme = tailwindTheme.replace(/--text-([a-z0-9]+(?:xl)?)-line-height:/g, '--text-$1--line-height:');

const tailwindLeadingByName = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

const tailwindTrackingByFigmaPx = {
  '-0.8': '-0.05em',
  '-0.4': '-0.025em',
  0: '0em',
  0.4: '0.025em',
  0.8: '0.05em',
  1.6: '0.1em',
};

// Figma stores semantic leading as percentage-style numbers and fixed leading
// as px values. Tailwind expects the semantic named scale to be unitless while
// numeric leading values stay spacing-derived px values.
tailwindTheme = tailwindTheme.replace(/(--leading-([^:]+):\s*)(-?\d+(?:\.\d+)?)(?:px|%)?;/g, (match, property, name, value) => {
  if (tailwindLeadingByName[name]) {
    return `${property}${tailwindLeadingByName[name]};`;
  }
  return `${property}${value}px;`;
});
tailwindTheme = tailwindTheme.replace(/(--font-weight-[^:]+:\s*)(-?\d+(?:\.\d+)?)px;/g, '$1$2;');
tailwindTheme = tailwindTheme.replace(/(--tracking-[^:]+:\s*)(-?\d+(?:\.\d+)?)(?:px)?;/g, (match, property, value) => {
  return `${property}${tailwindTrackingByFigmaPx[value] ?? `${value}em`};`;
});

// Quote multi-word font family names so var(--font-mono) remains valid when
// consumed by Tailwind's font-family utilities.
tailwindTheme = tailwindTheme.replace(/(--font-(?:mono|dhivehi):\s*)([^";\n]+ [^;\n]+);/g, '$1"$2";');

writeFileSync(tailwindThemePath, tailwindTheme, 'utf-8');

console.log('✓ Normalized tailwind-theme.css (@import removed, base spacing set, typography namespaces mapped)');
