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
  0.16: '0.01em',
  0.4: '0.025em',
  0.8: '0.05em',
  1: '0.01em',
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
tailwindTheme = tailwindTheme.replace(/(--tracking-caption:\s*)1%;/g, (_match, property) => `${property}0.01em;`);

// Quote multi-word font family names so var(--font-mono) remains valid when
// consumed by Tailwind's font-family utilities.
tailwindTheme = tailwindTheme.replace(/(--font-(?:mono|dhivehi):\s*)([^";\n]+ [^;\n]+);/g, '$1"$2";');

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
    out.push({ path, value: group.$value });
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
  if (letterSpacing === '0%' || letterSpacing === '0px' || letterSpacing === 0 || letterSpacing === '0') {
    return 'normal';
  }
  if (letterSpacing === '1%' || letterSpacing === '0.01em') {
    return 'caption';
  }
  const numeric = Number.parseFloat(String(letterSpacing));
  if (Number.isFinite(numeric) && Math.abs(numeric - 0.12) < 0.01) {
    return 'caption';
  }
  return 'normal';
}

function generateTypeUtilities(tokens) {
  const typographyTokens = [
    ...collectTypographyTokens(tokens.Type),
    ...collectTypographyTokens(tokens['Typography-styles']),
  ];
  const seen = new Set();
  const utilities = [];

  for (const token of typographyTokens) {
    const className = `type-${canonicalTypePath(token.path).join('-')}`;
    if (seen.has(className)) continue;

    const textStep = textStepByFontSize[token.value.fontSize];
    const weightName = fontWeightByValue[token.value.fontWeight];
    if (!textStep || !weightName) continue;

    seen.add(className);
    utilities.push(`@utility ${className} {
  font-family: var(--font-sans);
  font-size: var(--text-${textStep});
  line-height: var(--text-${textStep}--line-height);
  font-weight: var(--font-weight-${weightName});
  letter-spacing: var(--tracking-${trackingName(token.value.letterSpacing)});
}`);
  }

  return utilities.length ? `\n\n${utilities.join('\n\n')}\n` : '';
}

tailwindTheme = `${tailwindTheme.trimEnd()}${generateTypeUtilities(sourceTokens)}`;

tokensCss = tokensCss.replace(/(--font-weight-[^:]+:\s*)(-?\d+(?:\.\d+)?)px;/g, '$1$2;');
tokensCss = tokensCss.replace(/(--tracking-caption:\s*)(?:0\.16px|1px|1%);/g, (_match, property) => `${property}0.01em;`);

writeFileSync(tailwindThemePath, tailwindTheme, 'utf-8');
writeFileSync(tokensCssPath, tokensCss, 'utf-8');

console.log('✓ Normalized token CSS and generated Coral type utilities');
