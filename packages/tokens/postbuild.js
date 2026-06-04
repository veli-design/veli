import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Normalize the generated tailwind-theme.css
const tailwindThemePath = join(__dirname, 'dist', 'tailwind-theme.css');
const tokensCssPath = join(__dirname, 'dist', 'tokens.css');
const sourceTokensPath = join(__dirname, 'src', 'design.tokens.json');
let tailwindTheme = readFileSync(tailwindThemePath, 'utf-8');
let tokensCss = readFileSync(tokensCssPath, 'utf-8');
const sourceTokens = JSON.parse(readFileSync(sourceTokensPath, 'utf-8'));

// Remove the @import "tailwindcss"; line since consuming apps will import it
tailwindTheme = tailwindTheme.replace('@import "tailwindcss";\n\n', '');
tailwindTheme = tailwindTheme.replace('@theme {\n', '@theme {\n  --spacing: 4px;\n');

// Terrazzo maps grouped DTCG tokens literally, e.g. text.sm.font-size becomes
// --text-sm-font-size. Tailwind v4 expects --text-sm and the paired
// --text-sm--line-height variable.
tailwindTheme = tailwindTheme.replace(/--text-([a-z0-9]+(?:xl)?)-font-size:/g, '--text-$1:');
tailwindTheme = tailwindTheme.replace(
  /--text-([a-z0-9]+(?:xl)?)-line-height:/g,
  '--text-$1--line-height:',
);

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
  0.16: '0.01em',
  0.4: '0.025em',
  0.8: '0.05em',
  1: '0.01em',
  1.6: '0.1em',
};

// Figma stores semantic leading as percentage-style numbers and fixed leading
// as px values. Tailwind expects the semantic named scale to be unitless while
// numeric leading values stay spacing-derived px values.
tailwindTheme = tailwindTheme.replace(
  /(--leading-([^:]+):\s*)(-?\d+(?:\.\d+)?)(?:px|%)?;/g,
  (match, property, name, value) => {
    if (tailwindLeadingByName[name]) {
      return `${property}${tailwindLeadingByName[name]};`;
    }
    return `${property}${value}px;`;
  },
);
tailwindTheme = tailwindTheme.replace(/(--font-weight-[^:]+:\s*)(-?\d+(?:\.\d+)?)px;/g, '$1$2;');
tailwindTheme = tailwindTheme.replace(
  /(--tracking-[^:]+:\s*)(-?\d+(?:\.\d+)?)(?:px)?;/g,
  (match, property, value) => {
    return `${property}${tailwindTrackingByFigmaPx[value] ?? `${value}em`};`;
  },
);
tailwindTheme = tailwindTheme.replace(
  /(--tracking-caption:\s*)1%;/g,
  (_match, property) => `${property}0.01em;`,
);

// Quote multi-word font family names so var(--font-mono) remains valid when
// consumed by Tailwind's font-family utilities.
tailwindTheme = tailwindTheme.replace(
  /(--font-(?:mono|dhivehi):\s*)([^";\n]+ [^;\n]+);/g,
  '$1"$2";',
);

const dhivehiFontFamilyVariables = {
  'MV A Waheed': '--font-dhivehi-waheed',
  'MV Faseyha': '--font-dhivehi-faseyha',
  'MV Aaamu FK': '--font-dhivehi-aaamu',
};

function quoteFontFamily(value) {
  if (value.startsWith('var(')) return value;
  if (
    /^(?:serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-sans-serif|ui-serif|ui-monospace)$/.test(
      value,
    )
  ) {
    return value;
  }
  return /[\s"'(),]/.test(value) ? `"${value.replaceAll('"', '\\"')}"` : value;
}

function dhivehiFontStack(family) {
  return [family, 'var(--font-dhivehi)', 'sans-serif'].map(quoteFontFamily).join(', ');
}

function addDhivehiFontVariables(css) {
  if (css.includes('--font-dhivehi-waheed:')) return css;

  const match = css.match(/\n(\s*)--font-dhivehi:\s*[^;]+;/);
  if (!match) return css;

  const indent = match[1];
  const declarations = Object.entries(dhivehiFontFamilyVariables)
    .map(([family, variable]) => `${indent}${variable}: ${dhivehiFontStack(family)};`)
    .join('\n');

  return css.replace(/(\n\s*--font-dhivehi:\s*[^;]+;)/, `$1\n${declarations}`);
}

tailwindTheme = addDhivehiFontVariables(tailwindTheme);
tailwindTheme = tailwindTheme.replace(/--color-([a-z0-9-]+)-DEFAULT:/g, '--color-$1-default:');
tailwindTheme = tailwindTheme.replace(
  /@variant dark\s*\{\n([\s\S]*?)\n\}/,
  (_match, declarations) => {
    const body = declarations
      .split('\n')
      .map((line) => (line.trim() ? `    ${line.trim()}` : ''))
      .join('\n');

    return `@layer theme {
  :where(.dark, .dark *) {
${body}
  }
}`;
  },
);

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function slugify(value) {
  return String(value)
    .replace(/([a-z])([0-9])/gi, '$1-$2')
    .replace(/semi\s*bold/gi, 'semibold')
    .replace(/reguar/gi, 'regular')
    .replace(/regular/gi, 'regular')
    .replace(/medium/gi, 'medium')
    .replace(/bold/gi, 'bold')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function canonicalTypePath(path) {
  if (path[0] === 'Type') {
    return canonicalTypePath(path.slice(1));
  }

  const joined = path.join('/');
  const weight = slugify(path.at(-1));

  if (/^Display \d+\//.test(joined)) {
    const [, level] = path[0].match(/^Display (\d+)$/);
    return ['display', level, weight];
  }
  if (/^Heading \d+\//.test(joined)) {
    const [, level] = path[0].match(/^Heading (\d+)$/);
    return ['heading', level, weight];
  }
  if (/^Title ?\d+\//.test(joined)) {
    const [, level] = path[0].match(/^Title ?(\d+)$/);
    return ['title', level, weight];
  }
  if (/^Subtitle\//.test(joined)) {
    return ['subtitle', weight];
  }
  if (/^Body\//.test(joined)) {
    return ['body', slugify(path[1]), weight];
  }
  if (/^Caption 12\//.test(joined)) {
    return ['caption', '12', weight];
  }

  return path.map(slugify);
}

function collectTypographyTokens(group, path = [], out = []) {
  if (!isPlainObject(group)) return out;
  if (group.$type === 'typography' && isPlainObject(group.$value)) {
    out.push({ path, value: group.$value, description: group.$description ?? '' });
    return out;
  }
  for (const [key, value] of Object.entries(group)) {
    collectTypographyTokens(value, [...path, key], out);
  }
  return out;
}

const textStepByFontSize = {
  '12px': 'xs',
  '14px': 'sm',
  '16px': 'base',
  '18px': 'lg',
  '20px': 'xl',
  '24px': '2xl',
  '28px': '3xl',
  '32px': '4xl',
  '36px': '5xl',
  '40px': '6xl',
  '48px': '7xl',
  '56px': '8xl',
  '64px': '9xl',
};

const fontWeightByValue = {
  400: 'regular',
  500: 'medium',
  600: 'semibold',
  700: 'bold',
};

function trackingName(letterSpacing) {
  if (
    letterSpacing === '0%' ||
    letterSpacing === '0px' ||
    letterSpacing === 0 ||
    letterSpacing === '0'
  ) {
    return 'normal';
  }
  if (letterSpacing === '1%' || letterSpacing === '0.01em') {
    return 'caption';
  }
  const numeric = Number.parseFloat(String(letterSpacing));
  if (String(letterSpacing).trim().endsWith('%') && numeric > 0 && numeric <= 2) {
    return 'caption';
  }
  if (Number.isFinite(numeric) && Math.abs(numeric - 0.12) < 0.01) {
    return 'caption';
  }
  return 'normal';
}

function lookupTokenValue(tokens, aliasPath) {
  const token = aliasPath.split('.').reduce((current, segment) => {
    if (!isPlainObject(current)) return undefined;
    return current[segment];
  }, tokens);

  return isPlainObject(token) && '$value' in token ? token.$value : undefined;
}

function resolveTokenValue(tokens, value) {
  if (typeof value !== 'string') return value;

  const alias = value.trim().match(/^\{([^}]+)\}$/)?.[1];
  if (!alias) return value;

  const resolved = lookupTokenValue(tokens, alias);
  return resolved === undefined ? value : resolveTokenValue(tokens, resolved);
}

function normalizeTypographyValue(tokens, value) {
  return {
    ...value,
    fontFamily: resolveTokenValue(tokens, value.fontFamily),
    fontSize: resolveTokenValue(tokens, value.fontSize),
    fontWeight: resolveTokenValue(tokens, value.fontWeight),
    letterSpacing: resolveTokenValue(tokens, value.letterSpacing),
    lineHeight: resolveTokenValue(tokens, value.lineHeight),
  };
}

function classNameFromDescription(description) {
  return String(description).match(/\bTailwind:\s*(type-[a-z0-9-]+)/i)?.[1];
}

function classNameForTypeToken(token) {
  return (
    classNameFromDescription(token.description) ?? `type-${canonicalTypePath(token.path).join('-')}`
  );
}

function stripTypographyRoot(path) {
  return path[0] === 'Type' || path[0] === 'Dhivehi' ? path.slice(1) : path;
}

function typographyLookupKey(path) {
  return stripTypographyRoot(path).map(slugify).join('/');
}

function englishTypographyTokens(tokens) {
  return [
    ...collectTypographyTokens(tokens.Type),
    ...collectTypographyTokens(tokens['Typography-styles']?.Type, ['Type']),
  ];
}

function dhivehiTypographyTokens(tokens) {
  return collectTypographyTokens(tokens['Typography-styles']?.Dhivehi, ['Dhivehi']);
}

function generateTypeUtilities(tokens) {
  const typographyTokens = englishTypographyTokens(tokens);
  const seen = new Set();
  const utilities = [];

  for (const token of typographyTokens) {
    const className = classNameForTypeToken(token);
    if (seen.has(className)) continue;

    const value = normalizeTypographyValue(tokens, token.value);
    const textStep = textStepByFontSize[value.fontSize];
    const weightName = fontWeightByValue[value.fontWeight];
    if (!textStep || !weightName) continue;

    seen.add(className);
    utilities.push(`@utility ${className} {
  font-family: var(--font-sans);
  font-size: var(--text-${textStep});
  line-height: var(--text-${textStep}--line-height);
  font-weight: var(--font-weight-${weightName});
  letter-spacing: var(--tracking-${trackingName(value.letterSpacing)});
}`);
  }

  return utilities.length ? `\n\n${utilities.join('\n\n')}\n` : '';
}

function dhivehiTargetPathForEnglishToken(token) {
  const path = stripTypographyRoot(token.path);
  const [category] = path;
  const weight = slugify(path.at(-1));

  if (category === 'Display') {
    const displaySize = slugify(path[1]);
    const level = displaySize === 'lg' ? '1' : displaySize === 'md' ? '2' : path[1];
    return ['Display', level, weight === 'bold' ? 'Bold' : 'Medium'];
  }

  if (category === 'Heading') {
    return ['Heading', path[1], 'Medium'];
  }

  if (category === 'Title') {
    return ['Title', path[1], 'Medium'];
  }

  if (category === 'Subtitle') {
    return ['Subtitle', 'Medium'];
  }

  if (category === 'Body') {
    return ['Body', path[1], weight === 'regular' ? 'Regular' : 'Medium'];
  }

  if (category === 'Caption' || category === 'Caption 12') {
    return ['Caption', weight === 'regular' ? 'Regular' : 'Medium'];
  }

  return undefined;
}

function cssNumber(value) {
  const number = Number.parseFloat(String(value));
  return Number.isFinite(number) ? Number(number.toFixed(4)).toString() : String(value);
}

function cssLineHeight(value) {
  const stringValue = String(value).trim();
  if (stringValue.endsWith('%')) {
    return cssNumber(Number.parseFloat(stringValue) / 100);
  }
  return stringValue;
}

function cssLetterSpacing(value) {
  const stringValue = String(value).trim();
  if (stringValue === '0' || stringValue === '0px' || stringValue === '0%') return '0em';
  if (stringValue.endsWith('%')) {
    return `${cssNumber(Number.parseFloat(stringValue) / 100)}em`;
  }
  return stringValue;
}

function cssFontFamily(value) {
  const variable = dhivehiFontFamilyVariables[value];
  return variable ? `var(${variable})` : quoteFontFamily(String(value));
}

function cssTypographyDeclarations(tokens, value) {
  const normalizedValue = normalizeTypographyValue(tokens, value);

  return `  font-family: ${cssFontFamily(normalizedValue.fontFamily)};
  font-size: ${normalizedValue.fontSize};
  line-height: ${cssLineHeight(normalizedValue.lineHeight)};
  font-weight: ${normalizedValue.fontWeight};
  letter-spacing: ${cssLetterSpacing(normalizedValue.letterSpacing)};`;
}

function generateDhivehiTypeOverrides(tokens) {
  const dhivehiTokensByPath = new Map(
    dhivehiTypographyTokens(tokens).map((token) => [typographyLookupKey(token.path), token]),
  );
  const seen = new Set();
  const overrides = [];

  for (const englishToken of englishTypographyTokens(tokens)) {
    const className = classNameForTypeToken(englishToken);
    if (seen.has(className)) continue;

    const dhivehiTargetPath = dhivehiTargetPathForEnglishToken(englishToken);
    if (!dhivehiTargetPath) continue;

    const dhivehiToken = dhivehiTokensByPath.get(typographyLookupKey(dhivehiTargetPath));
    if (!dhivehiToken) continue;

    seen.add(className);
    overrides.push(`.${className}:lang(dv) {
${cssTypographyDeclarations(tokens, dhivehiToken.value)}
}`);
  }

  return overrides.length
    ? `\n\n@layer utilities {\n${overrides.map((block) => block.replace(/^/gm, '  ')).join('\n\n')}\n}\n`
    : '';
}

tailwindTheme = `${tailwindTheme.trimEnd()}${generateTypeUtilities(sourceTokens)}${generateDhivehiTypeOverrides(sourceTokens)}`;

tokensCss = tokensCss.replace(/(--font-weight-[^:]+:\s*)(-?\d+(?:\.\d+)?)px;/g, '$1$2;');
tokensCss = tokensCss.replace(
  /(--tracking-caption:\s*)(?:0\.16px|1px|1%);/g,
  (_match, property) => `${property}0.01em;`,
);
tokensCss = addDhivehiFontVariables(tokensCss);

function assertOklchColorOutput(filename, css) {
  const colorDeclarations = css
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^--color-[^:]+:/.test(line));

  const invalidNames = colorDeclarations.filter((line) => /^--color-[^:]*\s[^:]*:/.test(line));
  const invalidReferences = css.match(/var\(--color-[^)]*\s[^)]*\)/g) ?? [];
  const invalidValues = colorDeclarations.filter((line) =>
    /(?:color\(srgb|#[0-9a-f]{3,8}\b)/i.test(line),
  );

  if (invalidNames.length || invalidReferences.length) {
    throw new Error(
      `${filename} contains color token names with whitespace:\n${[
        ...invalidNames,
        ...invalidReferences,
      ]
        .slice(0, 20)
        .map((line) => `- ${line}`)
        .join('\n')}${
        invalidNames.length + invalidReferences.length > 20
          ? `\n- ...and ${invalidNames.length + invalidReferences.length - 20} more`
          : ''
      }`,
    );
  }

  if (invalidValues.length) {
    throw new Error(
      `${filename} contains non-OKLCH color token output:\n${invalidValues
        .slice(0, 20)
        .map((line) => `- ${line}`)
        .join(
          '\n',
        )}${invalidValues.length > 20 ? `\n- ...and ${invalidValues.length - 20} more` : ''}`,
    );
  }
}

assertOklchColorOutput('tailwind-theme.css', tailwindTheme);
assertOklchColorOutput('tokens.css', tokensCss);

function assertTypographyOutput(css) {
  const requiredSnippets = [
    '@utility type-caption-medium',
    '.type-subtitle-medium:lang(dv)',
    'font-family: var(--font-dhivehi-waheed);',
    'font-size: 24px;',
    'line-height: 1.35;',
    'letter-spacing: 0.01em;',
  ];
  const missingSnippets = requiredSnippets.filter((snippet) => !css.includes(snippet));

  if (missingSnippets.length) {
    throw new Error(
      `tailwind-theme.css is missing expected typography output:\n${missingSnippets
        .map((snippet) => `- ${snippet}`)
        .join('\n')}`,
    );
  }

  if (css.includes('@utility type-dhivehi-')) {
    throw new Error(
      'tailwind-theme.css should emit Dhivehi as :lang(dv) overrides, not type-dhivehi-* utilities.',
    );
  }
}

assertTypographyOutput(tailwindTheme);

writeFileSync(tailwindThemePath, tailwindTheme, 'utf-8');
writeFileSync(tokensCssPath, tokensCss, 'utf-8');

console.log('✓ Normalized token CSS and generated Veli type utilities with Dhivehi overrides');
