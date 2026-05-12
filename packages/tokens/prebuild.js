import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceTokensPath = join(__dirname, 'src', 'design.tokens.json');
const normalizedDir = join(__dirname, '.cache');
const normalizedTokensPath = join(normalizedDir, 'design.tokens.normalized.json');

const tokens = JSON.parse(readFileSync(sourceTokensPath, 'utf-8'));

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeTokenAliases(value) {
  if (typeof value === 'string') {
    return value
      .replaceAll('{typography.font.sans}', '{font.sans}')
      .replaceAll('{typography.font.mono}', '{font.mono}')
      .replaceAll('{typography.font.dhivehi}', '{font.dhivehi}');
  }

  if (Array.isArray(value)) {
    return value.map(normalizeTokenAliases);
  }

  if (isPlainObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      value[key] = normalizeTokenAliases(child);
    }
  }

  return value;
}

normalizeTokenAliases(tokens);

const fontFamilyByAlias = {
  '{font.sans}': tokens.font?.sans?.$value,
  '{font.mono}': tokens.font?.mono?.$value,
  '{font.dhivehi}': tokens.font?.dhivehi?.$value,
};

function normalizeTypographyComposites(value) {
  if (!isPlainObject(value)) return;

  if (value.$type === 'typography' && isPlainObject(value.$value)) {
    const fontFamily = value.$value.fontFamily;
    if (fontFamilyByAlias[fontFamily]) {
      value.$value.fontFamily = fontFamilyByAlias[fontFamily];
    }
    return;
  }

  for (const child of Object.values(value)) {
    normalizeTypographyComposites(child);
  }
}

normalizeTypographyComposites(tokens);

mkdirSync(normalizedDir, { recursive: true });
writeFileSync(normalizedTokensPath, JSON.stringify(tokens, null, 2), 'utf-8');

console.log('✓ Normalized DTCG source for Terrazzo');
