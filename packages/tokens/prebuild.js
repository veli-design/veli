import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceTokensPath = join(__dirname, 'src', 'design.tokens.json');
const normalizedDir = join(__dirname, '.cache');
const normalizedTokensPath = join(normalizedDir, 'design.tokens.normalized.json');
const distDir = join(__dirname, 'dist');

const tokens = JSON.parse(readFileSync(sourceTokensPath, 'utf-8'));
const motionTokens = JSON.parse(
  readFileSync(join(__dirname, 'src', 'motion.tokens.json'), 'utf-8'),
);

// Keep the Tokens Bruecke export intact. These Figma annotation colours and
// exporter-specific grid composites are not product tokens or DTCG CSS types.
delete tokens._docs;
delete tokens['Grid-styles'];

// Motion primitives are maintained in code until Figma owns their variables.
// A fresh variable/style export must not erase the existing motion contract.
for (const [group, values] of Object.entries(motionTokens)) {
  tokens[group] = { ...values, ...tokens[group] };
}

rmSync(distDir, { recursive: true, force: true });

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function isAlias(value) {
  return typeof value === 'string' && /^\{[^}]+\}$/.test(value.trim());
}

function isLiteralColor(value) {
  return typeof value === 'string' && value.trim() !== '' && !isAlias(value);
}

function tokenPath(path) {
  return path.length ? path.join('.') : '<root>';
}

const colorStructuralGroups = new Set(['primitives', 'brand', 'semantics', 'components']);

function normalizeColorPathSegments(path) {
  const segments = path.split('.');

  if (colorStructuralGroups.has(segments[0])) {
    segments.shift();
  }

  return segments.map((segment) => (segment === 'highContrast' ? 'high-contrast' : segment));
}

function normalizeColorAlias(value) {
  return value.replace(/\{color\.([^}]+)\}/g, (_match, path) => {
    return `{color.${normalizeColorPathSegments(path).join('.')}}`;
  });
}

function assertCanonicalColorPaths(value, path = ['color'], errors = []) {
  if (!isPlainObject(value)) return errors;
  if ('$value' in value) {
    const serialized = JSON.stringify(value);
    const aliasMatches = serialized.matchAll(/\{color\.([^}]+)\}/g);

    for (const match of aliasMatches) {
      if (/\s/.test(match[1])) {
        errors.push(
          `${tokenPath(path)} references a color alias containing whitespace: ${match[0]}`,
        );
      }
    }

    return errors;
  }

  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith('$')) continue;
    if (/\s/.test(key)) {
      errors.push(`${tokenPath([...path, key])} contains whitespace`);
    }
    assertCanonicalColorPaths(child, [...path, key], errors);
  }

  return errors;
}

const colorPathErrors = assertCanonicalColorPaths(tokens.color);
if (colorPathErrors.length) {
  throw new Error(
    `Color token paths must use canonical hyphenated segments:\n${colorPathErrors
      .slice(0, 40)
      .map((error) => `- ${error}`)
      .join('\n')}`,
  );
}

function normalizeDtcgDimensionObjects(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeDtcgDimensionObjects);
  }

  if (!isPlainObject(value)) return value;

  if (
    Object.keys(value).length === 2 &&
    typeof value.value === 'number' &&
    typeof value.unit === 'string'
  ) {
    return `${value.value}${value.unit}`;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, normalizeDtcgDimensionObjects(child)]),
  );
}

Object.assign(tokens, normalizeDtcgDimensionObjects(tokens));

const oklchDescriptionPattern = /OKLCH\s+(light|dark)\s*:\s*(oklch\([^)]*\))/gi;

function extractOklchDescriptions(description) {
  const values = {};
  if (typeof description !== 'string') return values;

  for (const match of description.matchAll(oklchDescriptionPattern)) {
    values[match[1].toLowerCase()] = match[2].trim();
  }

  return values;
}

function parseOklchValue(value) {
  const match = /^oklch\(\s*(.*?)\s*\)$/i.exec(value);
  if (!match) {
    return { valid: false, reason: 'expected oklch(...) syntax' };
  }

  const [componentsPart, alphaPart] = match[1].split(/\s+\/\s+/);
  const components = componentsPart.trim().split(/\s+/);
  if (components.length !== 3) {
    return { valid: false, reason: 'expected lightness, chroma, and hue components' };
  }

  const [lightnessRaw, chromaRaw, hueRaw] = components;
  const lightness = lightnessRaw.endsWith('%')
    ? Number.parseFloat(lightnessRaw) / 100
    : Number.parseFloat(lightnessRaw);
  const chroma = Number.parseFloat(chromaRaw);
  const hue = hueRaw.toLowerCase() === 'none' ? 0 : Number.parseFloat(hueRaw);

  if (!Number.isFinite(lightness) || lightness < 0 || lightness > 1) {
    return { valid: false, reason: 'lightness must be between 0 and 1 or 0% and 100%' };
  }
  if (!Number.isFinite(chroma) || chroma < 0 || chroma > 0.4) {
    return { valid: false, reason: 'chroma must be between 0 and 0.4' };
  }
  if (!Number.isFinite(hue) || hue < 0 || hue > 360) {
    return { valid: false, reason: 'hue must be "none" or between 0 and 360' };
  }

  if (alphaPart !== undefined) {
    const alphaRaw = alphaPart.trim();
    const alpha = alphaRaw.endsWith('%')
      ? Number.parseFloat(alphaRaw) / 100
      : Number.parseFloat(alphaRaw);
    if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
      return { valid: false, reason: 'alpha must be between 0 and 1 or 0% and 100%' };
    }
  }

  return { valid: true };
}

function validateOklchValue(value, mode, path, errors) {
  const result = parseOklchValue(value);
  if (!result.valid) {
    errors.push(`${tokenPath(path)} ${mode}: invalid OKLCH value "${value}" (${result.reason})`);
  }
}

function alphaToCssValue(alpha) {
  return Number(alpha.toFixed(4)).toString();
}

function hexPair(value) {
  return value.length === 1 ? `${value}${value}` : value;
}

function achromaticHexToOklch(value) {
  if (typeof value !== 'string') return undefined;

  const match = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value.trim());
  if (!match) return undefined;

  const hex = match[1];
  const hasShortSyntax = hex.length === 3 || hex.length === 4;
  const red = Number.parseInt(hexPair(hasShortSyntax ? hex[0] : hex.slice(0, 2)), 16);
  const green = Number.parseInt(hexPair(hasShortSyntax ? hex[1] : hex.slice(2, 4)), 16);
  const blue = Number.parseInt(hexPair(hasShortSyntax ? hex[2] : hex.slice(4, 6)), 16);
  const alphaHex = hasShortSyntax ? hex[3] : hex.slice(6, 8);

  if (red !== green || green !== blue) return undefined;

  const lightness = alphaToCssValue((red / 255) * 100);
  const alpha = alphaHex ? Number.parseInt(hexPair(alphaHex), 16) / 255 : 1;
  const alphaSuffix = alpha < 1 ? ` / ${alphaToCssValue(alpha)}` : '';

  return `oklch(${lightness}% 0 none${alphaSuffix})`;
}

function requireOklchValue(values, mode, path, errors, fallbackColor) {
  const value = values[mode.toLowerCase()];
  if (!value) {
    const fallback = achromaticHexToOklch(fallbackColor);
    if (fallback) {
      return fallback;
    }

    errors.push(
      `${tokenPath(path)} ${mode}: missing "OKLCH ${mode.toLowerCase()}: oklch(...)" in $description`,
    );
    return undefined;
  }

  validateOklchValue(value, mode, path, errors);
  return value;
}

function normalizeTokenAliases(value) {
  if (typeof value === 'string') {
    const normalizedValue = value
      .replaceAll('{typography.font.sans}', '{font.sans}')
      .replaceAll('{typography.font.mono}', '{font.mono}')
      .replaceAll('{typography.font.dhivehi}', '{font.dhivehi}')
      .replaceAll('{typography.font-weight.regular}', 'normal')
      .replaceAll('{colors.fg.border.focus}', '{color.border.focus}')
      .replaceAll('{colors.bg.surface.surface-raised}', '{color.bg.surface.raised}');

    return normalizeColorAlias(normalizedValue);
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

function createColorAliasToken(targetPath) {
  return {
    $type: 'color',
    $value: `{color.${targetPath}}`,
    $description: `Legacy alias for color.${targetPath}.`,
    $extensions: {
      mode: {
        Dark: `{color.${targetPath}}`,
        Light: `{color.${targetPath}}`,
      },
    },
  };
}

function createColorAliasGroupFromSource(source, targetPath) {
  if (!isPlainObject(source)) return source;

  if ('$type' in source && source.$type === 'color') {
    return createColorAliasToken(targetPath);
  }

  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      createColorAliasGroupFromSource(value, `${targetPath}.${key}`),
    ]),
  );
}

function normalizeColorOutputKeys(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeColorOutputKeys);
  }

  if (!isPlainObject(value) || '$type' in value) return value;

  const normalized = {};
  for (const [key, child] of Object.entries(value)) {
    const normalizedKey =
      key === 'default' && isPlainObject(child) && child.$type === 'color'
        ? 'DEFAULT'
        : key === 'highContrast'
          ? 'high-contrast'
          : key;
    normalized[normalizedKey] = normalizeColorOutputKeys(child);
  }

  return normalized;
}

function addDefaultColorAliases(value, path = []) {
  if (!isPlainObject(value) || '$type' in value) return;

  for (const [key, child] of Object.entries(value)) {
    addDefaultColorAliases(child, [...path, key]);

    if (key === 'DEFAULT' && value.default === undefined) {
      value.default = createColorAliasGroupFromSource(child, [...path, key].join('.'));
    }
  }
}

function mergeColorGroups(existing, incoming) {
  if (
    !isPlainObject(existing) ||
    !isPlainObject(incoming) ||
    '$type' in existing ||
    '$type' in incoming
  ) {
    return incoming;
  }

  const merged = { ...existing };
  for (const [key, value] of Object.entries(incoming)) {
    merged[key] = key in merged ? mergeColorGroups(merged[key], value) : value;
  }

  return merged;
}

function collapseColorStructuralGroups(colorTokens) {
  const collapsed = {};

  for (const [key, value] of Object.entries(colorTokens)) {
    if (!colorStructuralGroups.has(key)) {
      collapsed[key] = value;
    }
  }

  for (const group of colorStructuralGroups) {
    const groupTokens = colorTokens[group];
    if (!isPlainObject(groupTokens)) continue;

    for (const [key, value] of Object.entries(groupTokens)) {
      collapsed[key] = key in collapsed ? mergeColorGroups(collapsed[key], value) : value;
    }
  }

  const normalized = normalizeColorOutputKeys(collapsed);

  addDefaultColorAliases(normalized);

  return normalized;
}

if (isPlainObject(tokens.color)) {
  tokens.color = collapseColorStructuralGroups(tokens.color);
}

function normalizeColorTokens(value, path = [], errors = []) {
  if (!isPlainObject(value)) return errors;

  if (value.$type === 'color') {
    const modeValues = value.$extensions?.mode;
    const hasModeValues = isPlainObject(modeValues);
    const needsLight = isLiteralColor(value.$value) || isLiteralColor(modeValues?.Light);
    const needsDark = isLiteralColor(modeValues?.Dark);

    if (needsLight || needsDark) {
      const oklchByMode = extractOklchDescriptions(value.$description);
      const lightFallback = modeValues?.Light ?? value.$value;
      const darkFallback = modeValues?.Dark ?? value.$value;
      const light = needsLight
        ? requireOklchValue(oklchByMode, 'Light', path, errors, lightFallback)
        : undefined;
      const dark = needsDark
        ? requireOklchValue(oklchByMode, 'Dark', path, errors, darkFallback)
        : undefined;

      if (light && isLiteralColor(value.$value)) {
        value.$value = light;
      }
      if (hasModeValues && light && isLiteralColor(modeValues.Light)) {
        modeValues.Light = light;
      }
      if (hasModeValues && dark && isLiteralColor(modeValues.Dark)) {
        modeValues.Dark = dark;
      }
    }

    return errors;
  }

  for (const [key, child] of Object.entries(value)) {
    normalizeColorTokens(child, [...path, key], errors);
  }

  return errors;
}

const colorErrors = normalizeColorTokens(tokens);
if (colorErrors.length) {
  const shownErrors = colorErrors
    .slice(0, 40)
    .map((error) => `- ${error}`)
    .join('\n');
  const hiddenErrorCount = colorErrors.length - 40;
  throw new Error(
    `Invalid OKLCH color descriptions:\n${shownErrors}${hiddenErrorCount > 0 ? `\n- ...and ${hiddenErrorCount} more` : ''}`,
  );
}

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

function hoistShadowTokens(value) {
  const effectStyles = value['Effect-styles'];
  if (!isPlainObject(effectStyles) || !isPlainObject(effectStyles.Shadow)) {
    return;
  }

  value.shadow = effectStyles.Shadow;
  delete value['Effect-styles'];
}

hoistShadowTokens(tokens);

// Figma exports fractional spacing keys with commas (e.g. "0,5"). CSS custom
// properties cannot contain commas; rename to Tailwind dotted form ("0.5").
function renameDecimalCommaKeys(value) {
  if (!isPlainObject(value)) return value;

  const next = {};
  for (const [key, child] of Object.entries(value)) {
    const renamedKey = /^\d+,\d+$/.test(key) ? key.replace(',', '.') : key;
    next[renamedKey] = renameDecimalCommaKeys(child);
  }
  return next;
}

if (isPlainObject(tokens.spacing)) {
  tokens.spacing = renameDecimalCommaKeys(tokens.spacing);
}

mkdirSync(normalizedDir, { recursive: true });
writeFileSync(normalizedTokensPath, JSON.stringify(tokens, null, 2), 'utf-8');

console.log('✓ Normalized DTCG source for Terrazzo');
