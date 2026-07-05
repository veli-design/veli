import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Normalize the generated tailwind-theme.css
const tailwindThemePath = join(__dirname, 'dist', 'tailwind-theme.css');
const tokensCssPath = join(__dirname, 'dist', 'tokens.css');
const sourceTokensPath = join(__dirname, 'src', 'design.tokens.json');
const normalizedTokensPath = join(__dirname, '.cache', 'design.tokens.normalized.json');
let tailwindTheme = readFileSync(tailwindThemePath, 'utf-8');
let tokensCss = readFileSync(tokensCssPath, 'utf-8');
const sourceTokens = JSON.parse(readFileSync(sourceTokensPath, 'utf-8'));
const normalizedTokens = JSON.parse(readFileSync(normalizedTokensPath, 'utf-8'));

// Remove the @import "tailwindcss"; line since consuming apps will import it
tailwindTheme = tailwindTheme.replace('@import "tailwindcss";\n\n', '');
tailwindTheme = tailwindTheme.replace('@theme {\n', '@theme {\n  --spacing: 4px;\n');
tailwindTheme = tailwindTheme.replace(
  /^@theme \{/,
  `@custom-variant dark (&:where(.dark, .dark *));\n\n@layer base {
  :root {
    color-scheme: light;
  }

  :where(.dark, .dark *) {
    color-scheme: dark;
  }
}\n\n@theme {`,
);

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
function fixSelfReferentialDefaultColorAliases(css) {
  const colorDefaultVariables = new Set(
    css
      .split('\n')
      .map((line) => line.trim().match(/^(--color-[^:]+-DEFAULT):/)?.[1])
      .filter(Boolean),
  );

  return css.replace(/(--color-[^:]+)-default:\s*var\(\1-default\);/g, (match, prefix) => {
    const defaultVariable = `${prefix}-DEFAULT`;
    return colorDefaultVariables.has(defaultVariable)
      ? `${prefix}-default: var(${defaultVariable});`
      : match;
  });
}

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

function cssVariableNameForTokenPath(path) {
  return `--${path.replace(/\./g, '-').replace(/-DEFAULT$/g, '-default')}`;
}

function cssValueForTokenValue(value) {
  const alias = typeof value === 'string' ? value.trim().match(/^\{([^}]+)\}$/)?.[1] : undefined;
  return alias ? `var(${cssVariableNameForTokenPath(alias)})` : value;
}

function fixTokensCssSelfReferentialColorAliases(css) {
  return css.replace(
    /(--color-[^:]+):\s*var\(\1\);\s*\/\*\s*Legacy alias for ([^*]+?)\.\s*\*\//g,
    (match, variableName, targetPath) => {
      const targetValue = lookupTokenValue(normalizedTokens, targetPath.trim());
      const cssValue = cssValueForTokenValue(targetValue);
      return typeof cssValue === 'string' ? `${variableName}: ${cssValue};` : match;
    },
  );
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

const motionPrimitiveUtilities = `

@utility duration-instant {
  transition-duration: var(--duration-instant);
}

@utility duration-fast {
  transition-duration: var(--duration-fast);
}

@utility duration-normal {
  transition-duration: var(--duration-normal);
}

@utility duration-slow {
  transition-duration: var(--duration-slow);
}

@utility duration-slower {
  transition-duration: var(--duration-slower);
}

@utility duration-slowest {
  transition-duration: var(--duration-slowest);
}

@utility delay-none {
  transition-delay: var(--delay-none);
}

@utility delay-fast {
  transition-delay: var(--delay-fast);
}

@utility delay-normal {
  transition-delay: var(--delay-normal);
}

@utility delay-slow {
  transition-delay: var(--delay-slow);
}
`;

function propertyColorNameFromColorVariable(suffix) {
  return suffix.replace(/-(?:DEFAULT|default)$/g, '');
}

function generatePropertyColorVariables(css) {
  const propertyColorVariables = [
    { colorPrefix: '--color-bg-', propertyPrefix: '--background-color-' },
    { colorPrefix: '--color-text-', propertyPrefix: '--text-color-' },
    { colorPrefix: '--color-border-', propertyPrefix: '--border-color-' },
    { colorPrefix: '--color-border-', propertyPrefix: '--ring-color-' },
    { colorPrefix: '--color-border-', propertyPrefix: '--outline-color-' },
  ];
  const declarations = css
    .split('\n')
    .map((line) => line.trim().match(/^(--color-[^:]+):/)?.[1])
    .filter(Boolean);
  const seen = new Set();
  const variables = [];

  for (const variableName of declarations) {
    for (const { colorPrefix, propertyPrefix } of propertyColorVariables) {
      if (!variableName.startsWith(colorPrefix)) continue;

      const suffix = propertyColorNameFromColorVariable(variableName.slice(colorPrefix.length));
      if (!suffix) continue;

      const propertyName = `${propertyPrefix}${suffix}`;
      if (seen.has(propertyName)) continue;

      seen.add(propertyName);
      variables.push(`  ${propertyName}: var(${variableName});`);
    }
  }

  return variables.length ? `\n\n${variables.join('\n')}` : '';
}

function addPropertyColorVariables(css) {
  const propertyVariables = generatePropertyColorVariables(css);
  if (!propertyVariables) return css;

  return css.replace(/\n\}\n\n@layer theme \{/, `${propertyVariables}\n}\n\n@layer theme {`);
}

const primitiveColorFamilies = new Set([
  'slate',
  'ash',
  'stone',
  'sage',
  'blue',
  'emerald',
  'orange',
  'red',
  'teal',
  'indigo',
  'yellow',
  'lime',
  'green',
  'magenta',
  'white',
]);

const brandColorFamilies = new Set([
  'neutral',
  'primary',
  'secondary',
  'accent',
  'success',
  'caution',
  'warning',
  'danger',
  'info',
]);

const semanticColorFamilies = new Set(['bg', 'text', 'icon', 'border', 'status', 'effects']);

const componentColorFamilies = new Set([
  'accordion',
  'avatar',
  'breadcrumbs',
  'button',
  'calendar',
  'checkbox',
  'menu',
  'modal',
  'popover',
  'radio',
  'switch',
  'tabs',
  'text-input',
  'tooltip',
]);

const propertyColorFamilies = new Set([
  'background-color',
  'text-color',
  'border-color',
  'ring-color',
  'outline-color',
]);

function colorFamilyFromVariable(variableName) {
  const prefix = [
    '--background-color-',
    '--text-color-',
    '--border-color-',
    '--ring-color-',
    '--outline-color-',
    '--color-',
  ].find((item) => variableName.startsWith(item));
  if (!prefix) return undefined;

  const suffix = variableName.slice(prefix.length);
  const knownFamilies = [
    ...propertyColorFamilies,
    ...componentColorFamilies,
    ...primitiveColorFamilies,
    ...brandColorFamilies,
    ...semanticColorFamilies,
  ].sort((a, b) => b.length - a.length);

  return knownFamilies.find((family) => suffix === family || suffix.startsWith(`${family}-`));
}

function commentForVariable(variableName) {
  if (variableName.startsWith('--background-color-')) {
    return 'Tailwind property aliases / background';
  }
  if (variableName.startsWith('--text-color-')) return 'Tailwind property aliases / text';
  if (variableName.startsWith('--border-color-')) return 'Tailwind property aliases / border';
  if (variableName.startsWith('--ring-color-')) return 'Tailwind property aliases / ring';
  if (variableName.startsWith('--outline-color-')) return 'Tailwind property aliases / outline';

  const family = colorFamilyFromVariable(variableName);

  if (variableName.startsWith('--color-')) {
    if (primitiveColorFamilies.has(family)) {
      return `Primitive colors / ${family}`;
    }
    if (brandColorFamilies.has(family)) {
      return `Brand theme roles / ${family}`;
    }
    if (semanticColorFamilies.has(family)) {
      return `Semantic colors / ${family}`;
    }
    if (componentColorFamilies.has(family)) {
      return `Component colors / ${family}`;
    }
    return 'Other color tokens';
  }

  if (variableName.startsWith('--font-weight-')) return 'Typography / font weight';
  if (variableName.startsWith('--font-')) return 'Typography / font families';
  if (variableName.startsWith('--text-')) return 'Typography / text scale';
  if (variableName.startsWith('--leading-')) return 'Typography / line height';
  if (variableName.startsWith('--tracking-')) return 'Typography / letter spacing';
  if (variableName.startsWith('--shadow-')) return 'Effects / shadows';
  if (variableName.startsWith('--blur-')) return 'Effects / blur';
  if (variableName.startsWith('--radius-')) return 'Shape / radius';
  if (variableName.startsWith('--spacing')) return 'Layout / spacing';
  if (variableName.startsWith('--breakpoint') || variableName.startsWith('--breakpoints-')) {
    return 'Layout / breakpoints';
  }

  return undefined;
}

const groupOrder = [
  'Layout / spacing',
  'Layout / breakpoints',
  'Primitive colors',
  'Brand theme roles',
  'Semantic colors',
  'Tailwind property aliases',
  'Component colors',
  'Effects',
  'Shape',
  'Typography',
  'Other color tokens',
];

const naturalSort = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

function sortDescriptorForVariable(variableName) {
  const comment = commentForVariable(variableName) ?? 'zz';
  const groupIndex = groupOrder.findIndex((group) => comment.startsWith(group));
  return {
    groupIndex: groupIndex === -1 ? 99 : groupIndex,
    comment,
    variableName,
  };
}

function compareVariableUnits(a, b) {
  const groupComparison =
    a.sort.groupIndex - b.sort.groupIndex || naturalSort.compare(a.sort.comment, b.sort.comment);
  if (groupComparison) return groupComparison;

  if (
    a.sort.comment.startsWith('Primitive colors') ||
    a.sort.comment.startsWith('Brand theme roles')
  ) {
    return naturalSort.compare(a.sort.variableName, b.sort.variableName);
  }

  return a.index - b.index;
}

function sortVariableDeclarationRuns(css) {
  const lines = css.split('\n');
  const output = [];

  for (let index = 0; index < lines.length; ) {
    if (!lines[index].trim().match(/^--[a-z0-9-]+:/)) {
      output.push(lines[index]);
      index += 1;
      continue;
    }

    const units = [];
    let originalIndex = 0;
    while (index < lines.length && lines[index].trim().match(/^--[a-z0-9-]+:/)) {
      const unit = [lines[index]];
      index += 1;

      while (
        index < lines.length &&
        !lines[index].trim().match(/^--[a-z0-9-]+:/) &&
        !lines[index].trim().startsWith('}')
      ) {
        unit.push(lines[index]);
        index += 1;
      }

      const variableName = unit[0].trim().match(/^(--[a-z0-9-]+):/)?.[1] ?? '';
      units.push({
        index: originalIndex,
        sort: sortDescriptorForVariable(variableName),
        lines: unit,
      });
      originalIndex += 1;
    }

    for (const unit of units.sort(compareVariableUnits)) {
      output.push(...unit.lines);
    }
  }

  return output.join('\n');
}

function annotateVariableGroups(css) {
  const lines = css.split('\n');
  const output = [];
  let currentComment;

  for (const line of lines) {
    const variableName = line.trim().match(/^(--[a-z0-9-]+):/)?.[1];
    const nextComment = variableName ? commentForVariable(variableName) : undefined;

    if (nextComment && nextComment !== currentComment) {
      const indent = line.match(/^\s*/)?.[0] ?? '';
      const previousLine = output.at(-1);
      if (previousLine?.trim() && !previousLine.trim().endsWith('{')) {
        output.push('');
      }
      output.push(`${indent}/* ${nextComment} */`);
      currentComment = nextComment;
    }

    if (!variableName && line.trim().startsWith('}')) {
      currentComment = undefined;
    }

    output.push(line);
  }

  return output.join('\n');
}

tailwindTheme = addPropertyColorVariables(tailwindTheme);
tailwindTheme = `${tailwindTheme.trimEnd()}${motionPrimitiveUtilities}${generateTypeUtilities(sourceTokens)}${generateDhivehiTypeOverrides(sourceTokens)}`;

tokensCss = tokensCss.replace(/(--font-weight-[^:]+:\s*)(-?\d+(?:\.\d+)?)px;/g, '$1$2;');
tokensCss = tokensCss.replace(
  /(--tracking-caption:\s*)(?:0\.16px|1px|1%);/g,
  (_match, property) => `${property}0.01em;`,
);
tokensCss = addDhivehiFontVariables(tokensCss);
tailwindTheme = fixSelfReferentialDefaultColorAliases(tailwindTheme);
tokensCss = fixSelfReferentialDefaultColorAliases(tokensCss);
tokensCss = fixTokensCssSelfReferentialColorAliases(tokensCss);
tailwindTheme = sortVariableDeclarationRuns(tailwindTheme);
tokensCss = sortVariableDeclarationRuns(tokensCss);
tailwindTheme = annotateVariableGroups(tailwindTheme);
tokensCss = annotateVariableGroups(tokensCss);

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

function assertMotionPrimitiveOutput(css) {
  const requiredSnippets = [
    '--ease-out: cubic-bezier(0, 0, 0.2, 1);',
    '--ease-in: cubic-bezier(0.4, 0, 1, 1);',
    '--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);',
    '--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);',
    '--ease-linear: linear;',
    '--duration-instant: 0ms;',
    '--duration-fast: 80ms;',
    '--duration-normal: 200ms;',
    '--duration-slow: 350ms;',
    '--duration-slower: 500ms;',
    '--duration-slowest: 1200ms;',
    '--delay-none: 0ms;',
    '--delay-fast: 40ms;',
    '--delay-normal: 80ms;',
    '--delay-slow: 120ms;',
    '@utility duration-fast',
    '@utility delay-slow',
  ];
  const missingSnippets = requiredSnippets.filter((snippet) => !css.includes(snippet));

  if (missingSnippets.length) {
    throw new Error(
      `tailwind-theme.css is missing expected motion primitive output:\n${missingSnippets
        .map((snippet) => `- ${snippet}`)
        .join('\n')}`,
    );
  }

  if (css.includes('--animate-') || css.includes('@keyframes veli-')) {
    throw new Error(
      'tailwind-theme.css must not emit composite animation tokens while motion aliases are unsettled.',
    );
  }
}

assertMotionPrimitiveOutput(tailwindTheme);

const SHADOW_SCALES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

function assertShadowOutput(themeCss, rawTokensCss) {
  const missing = SHADOW_SCALES.filter((scale) => !themeCss.includes(`--shadow-${scale}:`));

  if (missing.length) {
    throw new Error(`tailwind-theme.css is missing shadow theme variables: ${missing.join(', ')}`);
  }

  for (const [filename, css] of [
    ['tailwind-theme.css', themeCss],
    ['tokens.css', rawTokensCss],
  ]) {
    if (css.includes('--effect-styles-')) {
      throw new Error(`${filename} must not contain --effect-styles-* variables`);
    }
  }
}

assertShadowOutput(tailwindTheme, tokensCss);

writeFileSync(tailwindThemePath, tailwindTheme, 'utf-8');
writeFileSync(tokensCssPath, tokensCss, 'utf-8');

console.log(
  '✓ Normalized token CSS and generated Veli motion primitive/type utilities with Dhivehi overrides',
);
