import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the generated tailwind-theme.css
const filePath = join(__dirname, 'dist', 'tailwind-theme.css');
let content = readFileSync(filePath, 'utf-8');

// Remove the @import "tailwindcss"; line since consuming apps will import it
content = content.replace('@import "tailwindcss";\n\n', '');

// Normalize token reference prefixes so Tailwind utility vars resolve correctly.
// Terrazzo emits aliases like `var(--colors-*)` inside `--color-*` definitions,
// but Tailwind utilities reference `--color-*` variables.
content = content.replace(/var\(--colors-/g, 'var(--color-');
content = content.replace(/var\(--base-sizes-/g, 'var(--spacing-');

// Write back
writeFileSync(filePath, content, 'utf-8');

console.log(
  '✓ Normalized tailwind-theme.css (@import removed, refs rewritten to --color/--spacing)'
);
