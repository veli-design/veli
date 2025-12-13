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

// Write back
writeFileSync(filePath, content, 'utf-8');

console.log('✓ Removed @import "tailwindcss" from tailwind-theme.css');
