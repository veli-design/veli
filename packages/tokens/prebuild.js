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

function isAlias(value) {
  return typeof value === 'string' && /^\{[^}]+\}$/.test(value.trim());
}

function isLiteralColor(value) {
  return typeof value === 'string' && value.trim() !== '' && !isAlias(value);
}

function tokenPath(path) {
  return path.length ? path.join('.') : '<root>';
}

function normalizePathSegment(value) {
  return String(value).replace(/\s+/g, '-');
}

function normalizeColorAlias(value) {
  return value.replace(/\{color\.([^}]+)\}/g, (_match, path) => {
    return `{color.${path.split('.').map(normalizePathSegment).join('.')}}`;
  });
}

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
    const alpha = alphaRaw.endsWith('%') ? Number.parseFloat(alphaRaw) / 100 : Number.parseFloat(alphaRaw);
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

    errors.push(`${tokenPath(path)} ${mode}: missing "OKLCH ${mode.toLowerCase()}: oklch(...)" in $description`);
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

function normalizeObjectKeys(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeObjectKeys);
  }

  if (!isPlainObject(value)) return value;

  const normalized = {};
  for (const [key, child] of Object.entries(value)) {
    normalized[normalizePathSegment(key)] = normalizeObjectKeys(child);
  }

  return normalized;
}

if (isPlainObject(tokens.color)) {
  tokens.color = normalizeObjectKeys(tokens.color);
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
      const light = needsLight ? requireOklchValue(oklchByMode, 'Light', path, errors, lightFallback) : undefined;
      const dark = needsDark ? requireOklchValue(oklchByMode, 'Dark', path, errors, darkFallback) : undefined;

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
  const shownErrors = colorErrors.slice(0, 40).map((error) => `- ${error}`).join('\n');
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

mkdirSync(normalizedDir, { recursive: true });
writeFileSync(normalizedTokensPath, JSON.stringify(tokens, null, 2), 'utf-8');

console.log('✓ Normalized DTCG source for Terrazzo');
