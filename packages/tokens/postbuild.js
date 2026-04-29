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

writeFileSync(tailwindThemePath, tailwindTheme, 'utf-8');

console.log('✓ Normalized tailwind-theme.css (@import removed, base spacing set)');
